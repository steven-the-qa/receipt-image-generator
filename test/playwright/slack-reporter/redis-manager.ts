import Redis from "ioredis";
import type { ShardState } from "./types";

export class RedisManager {
    private redis: Redis | null = null;
    private readonly stateKey: string;

    constructor() {
        const jobId = process.env.JOB_ID;
        if (!jobId) {
            throw new Error("JOB_ID environment variable is required");
        }
        this.stateKey = `playwright-report:${jobId}`;
    }

    async connect(redisUrl: string): Promise<void> {
        this.redis = new Redis(redisUrl, {
            retryStrategy(times) {
                if (times > 3) {
                    return null; // Stop retrying after 3 attempts
                }
                const delay = Math.min(times * 100, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            connectTimeout: 5000,
            disconnectTimeout: 2000,
            commandTimeout: 5000,
            lazyConnect: true,
        });

        this.redis.on("error", (error) => {
            console.error("[Slack Reporter] Redis error:", error);
        });

        this.redis.on("connect", () => {
            console.log("[Slack Reporter] Connected to Redis");
        });
    }

    private validateShardState(state: any): state is ShardState {
        return (
            state &&
            typeof state === "object" &&
            "testState" in state &&
            "aggregatedFailures" in state &&
            "lastUpdate" in state &&
            "metadata" in state
        );
    }

    private async getShardStateWithRetry(retries = 3): Promise<ShardState | null> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                if (!this.redis) {
                    throw new Error("Redis client not initialized");
                }

                const state = await this.redis.get(this.stateKey);
                if (!state) {
                    return null;
                }

                const parsedState = JSON.parse(state);
                if (!this.validateShardState(parsedState)) {
                    console.warn("[Slack Reporter] Invalid state structure in Redis");
                    return null;
                }

                return parsedState;
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;
                console.warn(`[Slack Reporter] Failed to read shard state (attempt ${attempt + 1}/${retries}):`, error);
                if (!isLastAttempt) {
                    await new Promise((resolve) => setTimeout(resolve, Math.min((attempt + 1) * 100, 1000)));
                }
            }
        }
        return null;
    }

    async getShardState(): Promise<ShardState> {
        const state = await this.getShardStateWithRetry();
        if (state) {
            return state;
        }

        return {
            testState: {
                failureCount: 0,
                isInAggregationMode: false,
            },
            aggregatedFailures: {
                browser: process.env.BROWSER || "none",
                shardIndex: process.env.SHARD_INDEX || "0",
                shardTotal: process.env.SHARD_TOTAL || "0",
                failures: [],
            },
            lastUpdate: Date.now(),
            metadata: {
                runId: this.stateKey.split(":")[1] || "",
                jobId: "",
                browser: process.env.BROWSER || "none",
                shardIndex: process.env.SHARD_INDEX || "0",
                shardTotal: process.env.SHARD_TOTAL || "0",
                startTime: new Date().toISOString(),
            },
        };
    }

    private async updateShardStateWithRetry(state: ShardState, retries = 3): Promise<boolean> {
        if (!this.redis) {
            throw new Error("Redis client not initialized");
        }

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Start watching the key for changes
                await this.redis.watch(this.stateKey);

                // Get the current state
                const currentState = (await this.getShardStateWithRetry()) || {
                    testState: {
                        failureCount: 0,
                        isInAggregationMode: false,
                    },
                    aggregatedFailures: {
                        browser: process.env.BROWSER || "none",
                        shardIndex: process.env.SHARD_INDEX || "0",
                        shardTotal: process.env.SHARD_TOTAL || "0",
                        failures: [],
                    },
                    lastUpdate: Date.now(),
                    metadata: {
                        runId: this.stateKey.split(":")[1] || "",
                        jobId: "",
                        browser: process.env.BROWSER || "none",
                        shardIndex: process.env.SHARD_INDEX || "0",
                        shardTotal: process.env.SHARD_TOTAL || "0",
                        startTime: new Date().toISOString(),
                    },
                };

                const mergedState = {
                    ...currentState,
                    testState: {
                        ...currentState.testState,
                        ...state.testState,
                        failureCount: Math.max(currentState.testState.failureCount, state.testState.failureCount),
                        isInAggregationMode:
                            currentState.testState.isInAggregationMode || state.testState.isInAggregationMode,
                    },
                    aggregatedFailures: {
                        ...state.aggregatedFailures,
                        failures: currentState.aggregatedFailures.failures
                            .map((existing) => {
                                // Find matching new failure if it exists
                                const newFailure = state.aggregatedFailures.failures.find(
                                    (f) => f.fileName === existing.fileName
                                );
                                if (newFailure) {
                                    // Take the maximum count instead of adding
                                    return {
                                        fileName: existing.fileName,
                                        api: Math.max(existing.api, newFailure.api),
                                        ui: Math.max(existing.ui, newFailure.ui),
                                    };
                                }
                                return existing;
                            })
                            .concat(
                                // Add completely new files
                                state.aggregatedFailures.failures.filter(
                                    (newFailure) =>
                                        !currentState.aggregatedFailures.failures.some(
                                            (existing) => existing.fileName === newFailure.fileName
                                        )
                                )
                            ),
                    },
                    lastUpdate: Date.now(),
                    metadata: { ...currentState.metadata, ...state.metadata },
                };

                // Log the merge results for debugging
                // console.log("[Slack Reporter] Merged state:", {
                //     currentTestState: currentState.testState,
                //     newTestState: state.testState,
                //     mergedTestState: mergedState.testState,
                //     currentFailures: currentState.aggregatedFailures.failures,
                //     newFailures: state.aggregatedFailures.failures,
                //     mergedFailures: mergedState.aggregatedFailures.failures,
                // });

                // Prepare the state for serialization
                const serializedState = {
                    ...mergedState,
                    lastUpdate: Date.now(),
                };

                // Start the transaction
                const multi = this.redis.multi();
                multi.set(this.stateKey, JSON.stringify(serializedState));
                multi.expire(this.stateKey, 60 * 60); // 1 hour expiry

                // Execute the transaction
                const results = await multi.exec();

                if (!results) {
                    console.warn(
                        `[Slack Reporter] Transaction failed due to concurrent modification (attempt ${
                            attempt + 1
                        }/${retries})`
                    );
                    continue; // Retry on concurrent modification
                }

                const [setError] = results[0] || [];
                if (setError) {
                    throw setError;
                }

                return true;
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;
                console.warn(
                    `[Slack Reporter] Failed to write shard state (attempt ${attempt + 1}/${retries}):`,
                    error
                );
                if (!isLastAttempt) {
                    await new Promise((resolve) => setTimeout(resolve, Math.min((attempt + 1) * 100, 1000)));
                }
            } finally {
                // Always unwatch the key
                await this.redis.unwatch();
            }
        }
        return false;
    }

    async updateShardState(state: ShardState): Promise<void> {
        const success = await this.updateShardStateWithRetry(state);
        if (!success) {
            console.error("[Slack Reporter] Failed to update shard state after all retries");
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.redis?.quit?.();
        } catch {
            // Ignore quit failures - they can happen during cleanup
        }
        this.redis = null;
    }

    ensureStateInitialized(
        state: Partial<ShardState>,
        browser: string,
        shardIndex: string,
        shardTotal: string
    ): ShardState {
        if (!state.testState) {
            state.testState = {
                failureCount: 0,
                isInAggregationMode: false,
            };
        }

        if (!state.aggregatedFailures) {
            state.aggregatedFailures = {
                browser,
                shardIndex,
                shardTotal,
                failures: [],
            };
        }

        return state as ShardState;
    }
}
