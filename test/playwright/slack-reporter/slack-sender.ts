import { WebClient } from "@slack/web-api";
import type { TestCase, TestResult } from "@playwright/test/reporter";
import { buildIndividualFailureMessages } from "./messages/individual-failure";
import { buildSummaryMessages } from "./messages/summary";
import type { MessageBuilder, ShardState } from "./types";

export class SlackSender {
    private web: WebClient | null = null;

    constructor(token?: string) {
        if (token) {
            this.web = new WebClient(token);
        }
    }

    private async postMessageWithRetry(payload: any, maxAttempts = 4): Promise<any> {
        if (!this.isInitialized()) {
            throw new Error("Slack client not initialized");
        }

        let attempt = 0;
        // Jittered backoff base delay in ms
        const baseDelayMs = 800;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                return await this.web!.chat.postMessage(payload);
            } catch (error: any) {
                attempt += 1;
                const status = error?.code || error?.data?.error || error?.statusCode || "unknown";
                const retryAfterHeader = Number(error?.data?.retryAfter || error?.headers?.["retry-after"]);
                const isRateLimited = status === 429 || status === "ratelimited" || error?.data?.error === "ratelimited";
                const isTransient = isRateLimited || status === "ETIMEDOUT" || status === "ECONNRESET" || status === "socket hang up";

                if (isTransient && attempt < maxAttempts) {
                    const waitMs = Number.isFinite(retryAfterHeader)
                        ? Math.max(0, Math.floor(retryAfterHeader * 1000))
                        : Math.floor(baseDelayMs * Math.pow(1.6, attempt - 1) + Math.random() * 200);
                    console.warn("[Slack Reporter] Retrying postMessage", {
                        attempt,
                        waitMs,
                        status,
                    });
                    await new Promise((r) => setTimeout(r, waitMs));
                    continue;
                }

                throw error;
            }
        }
    }

    isInitialized(): boolean {
        return this.web !== null;
    }

    async sendIndividualFailure(
        test: TestCase,
        result: TestResult,
        includeAggregationNotice: boolean,
        maxIndividualFailures: number,
        messageBuilder: MessageBuilder
    ): Promise<void> {
        try {
            if (!this.isInitialized()) {
                throw new Error("Slack client not initialized");
            }

            const { mainMessage, errorDetailsMessage } = buildIndividualFailureMessages(
                test,
                result,
                includeAggregationNotice,
                maxIndividualFailures,
                messageBuilder
            );

            const mainResponse = await this.postMessageWithRetry(mainMessage);
            console.log("[Slack Reporter] parent posted", { ts: (mainResponse as any).ts, channel: (mainResponse as any).channel });

            if (mainResponse.ts) {
                try {
                    const stack = result.errors?.[0]?.stack || "No stack trace available";
                    const clean = messageBuilder.stripAnsiCodes(stack);
                    const fenced = "```" + messageBuilder.truncateString(clean, 1800) + "```";
                    console.log("[Slack Reporter] thread payload sizes", { cleanLen: clean.length, fencedLen: fenced.length });
                    await this.postMessageWithRetry({
                        ...errorDetailsMessage,
                        thread_ts: mainResponse.ts,
                    });
                } catch (error: any) {
                    const errCode = error?.data?.error || error?.code;
                    // Fallback for oversized/invalid blocks in free orgs
                    if (errCode === "invalid_blocks" || errCode === "msg_too_long") {
                        const stack = result.errors?.[0]?.stack || "No stack trace available";
                        const clean = messageBuilder.stripAnsiCodes(stack);
                        const fallback = messageBuilder.truncateString(clean, 1800);
                        await this.postMessageWithRetry({
                            channel: (errorDetailsMessage as any).channel,
                            text: "Test Failure Details\n```" + fallback + "```",
                            thread_ts: mainResponse.ts,
                        });
                    } else {
                        console.warn("[Slack Reporter] thread post failed", {
                            code: error?.code,
                            apiError: error?.data?.error,
                            status: error?.status,
                            response_metadata: error?.data?.response_metadata,
                        });
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error("[Slack Reporter] Failed to send Slack message:", {
                testTitle: test.title,
                testStatus: result.status,
                error: error instanceof Error ? error.message : error,
                errorStack: error instanceof Error ? error.stack : undefined,
            });
        }
    }

    async sendSummary(state: ShardState, messageBuilder: MessageBuilder): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error("Slack client not initialized");
        }

        const { mainMessage, apiFailuresMessage, uiFailuresMessage } = buildSummaryMessages(state, messageBuilder);
        const response = await this.postMessageWithRetry(mainMessage);

        if (response.ts) {
            // Send API failures as first reply if they exist
            if (apiFailuresMessage) {
                await this.postMessageWithRetry({
                    ...apiFailuresMessage,
                    thread_ts: response.ts,
                });
            }

            // Send UI failures as second reply if they exist
            if (uiFailuresMessage) {
                await this.postMessageWithRetry({
                    ...uiFailuresMessage,
                    thread_ts: response.ts,
                });
            }
        }
    }
}
