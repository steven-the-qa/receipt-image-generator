import type { Reporter, TestCase, TestResult, FullConfig } from "@playwright/test/reporter";
import { getShardContext, getSlackUserMention, stripAnsiCodes, truncateString } from "./utils";
import { RedisManager } from "./redis-manager";
import { SlackSender } from "./slack-sender";

class SlackReporter implements Reporter {
    private slackSender: SlackSender;
    private redisManager: RedisManager;
    private repo: string | undefined;
    private branch: string | undefined;
    private author: string | undefined;
    private jobUrl: string | undefined;
    private maxRetries: number | undefined;

    // Failure tracking
    private readonly MAX_INDIVIDUAL_FAILURES = 3;
    private isInAggregationMode = false;

    constructor() {
        // Get GitHub info from environment variables
        this.repo = process.env.REPO;
        this.branch = process.env.BRANCH;
        this.author = process.env.AUTHOR;
        const runId = process.env.RUN_ID;
        const jobId = process.env.JOB_ID;
        this.jobUrl = `https://github.com/${this.repo}/actions/runs/${runId}/job/${jobId}`;
        this.maxRetries = process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES, 10) : undefined;

        this.slackSender = new SlackSender();
        this.redisManager = new RedisManager();
    }

    private getMessageBuilder() {
        return {
            branch: this.branch,
            author: this.author,
            jobUrl: this.jobUrl,
            getSlackUserMention,
            getShardContext,
            stripAnsiCodes,
            truncateString,
        };
    }

    async onBegin(_config: FullConfig) {
        const token = process.env.SLACK_TOKEN;
        if (!token) {
            console.warn("SLACK_TOKEN not found in environment variables. Slack reporting will be disabled.");
            return;
        }
        this.slackSender = new SlackSender(token);

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.warn("REDIS_URL not found in environment variables. Slack reporting will be disabled.");
            return;
        }

        await this.redisManager.connect(redisUrl);

        // Initialize state with optional environment variables
        const browser = process.env.BROWSER || "none";
        const shardIndex = process.env.SHARD_INDEX || "0";
        const shardTotal = process.env.SHARD_TOTAL || "0";
        const state = await this.redisManager.getShardState();
        const initializedState = this.redisManager.ensureStateInitialized(state, browser, shardIndex, shardTotal);

        // Set local instance state based on test state
        this.isInAggregationMode = initializedState.testState.isInAggregationMode;
        await this.redisManager.updateShardState(initializedState);
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        const projectName = test.parent.project()?.name;

        // Report if:
        // 1. The test has failed/timedOut OR has cleanup errors
        // 2. We're on the last retry
        // 3. Slack client is initialized
        // 4. Author is not graphite-app[bot]
        if (
            !result.errors.length ||
            !this.slackSender.isInitialized() ||
            result.retry !== this.maxRetries ||
            this.author === "graphite-app[bot]"
        ) {
            return;
        }

        // Get current shard state and ensure it's initialized
        const browser = process.env.BROWSER || "none";
        const shardIndex = process.env.SHARD_INDEX || "0";
        const shardTotal = process.env.SHARD_TOTAL || "0";
        const state = await this.redisManager.getShardState();
        const initializedState = this.redisManager.ensureStateInitialized(state, browser, shardIndex, shardTotal);

        // Increment this shard's failure count
        initializedState.testState.failureCount++;

        const fileName = test.location.file.split("/").pop() || "";
        const isApiTest = projectName === "api";

        // Find existing failure entry for this file or create new one
        let failure = initializedState.aggregatedFailures.failures.find((f) => f.fileName === fileName);
        if (!failure) {
            failure = { fileName, api: 0, ui: 0 };
            initializedState.aggregatedFailures.failures.push(failure);
        }

        // Increment the appropriate counter
        if (isApiTest) {
            failure.api++;
        } else {
            failure.ui++;
        }

        if (initializedState.testState.failureCount > this.MAX_INDIVIDUAL_FAILURES) {
            // If this shard is entering aggregation mode for the first time
            if (!initializedState.testState.isInAggregationMode) {
                initializedState.testState.isInAggregationMode = true;
                this.isInAggregationMode = true;
                await this.slackSender.sendIndividualFailure(
                    test,
                    result,
                    true,
                    this.MAX_INDIVIDUAL_FAILURES,
                    this.getMessageBuilder()
                );
            }
        } else {
            await this.slackSender.sendIndividualFailure(
                test,
                result,
                false,
                this.MAX_INDIVIDUAL_FAILURES,
                this.getMessageBuilder()
            );
        }

        // Update state with latest info
        initializedState.lastUpdate = Date.now();
        await this.redisManager.updateShardState(initializedState);
    }

    async onEnd() {
        const state = await this.redisManager.getShardState();

        // If we were in aggregation mode, make sure that's recorded
        if (this.isInAggregationMode && state.testState) {
            Object.assign(state.testState, {
                failureCount: Math.max(state.testState.failureCount, 0),
                isInAggregationMode: true,
            });
            console.log("[Slack Reporter] Recording aggregation mode for shard:", {
                testState: state.testState,
            });
        }

        // Send summary if:
        // 1. We have failures to report
        // 2. We were in aggregation mode
        const shouldSendSummary = state.testState?.failureCount > 0 && state.testState?.isInAggregationMode;

        if (shouldSendSummary) {
            console.log("[Slack Reporter] Sending summary for completed tests");
            await this.slackSender.sendSummary(state, this.getMessageBuilder());
        } else {
            console.log("[Slack Reporter] Not sending summary, conditions not met:", {
                failureCount: state.testState?.failureCount,
                isInAggregationMode: state.testState?.isInAggregationMode,
            });
        }

        // Update state with latest info
        state.lastUpdate = Date.now();
        await this.redisManager.updateShardState(state);
    }
}

export default SlackReporter;
