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

            const mainResponse = await this.web!.chat.postMessage(mainMessage);

            if (mainResponse.ts) {
                await this.web!.chat.postMessage({
                    ...errorDetailsMessage,
                    thread_ts: mainResponse.ts,
                });
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
        const response = await this.web!.chat.postMessage(mainMessage);

        if (response.ts) {
            // Send API failures as first reply if they exist
            if (apiFailuresMessage) {
                await this.web!.chat.postMessage({
                    ...apiFailuresMessage,
                    thread_ts: response.ts,
                });
            }

            // Send UI failures as second reply if they exist
            if (uiFailuresMessage) {
                await this.web!.chat.postMessage({
                    ...uiFailuresMessage,
                    thread_ts: response.ts,
                });
            }
        }
    }
}
