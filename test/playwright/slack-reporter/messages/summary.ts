import type { ShardState } from "../types";
import { formatBrowserName } from "../utils";

interface MessageBuilder {
    branch: string | undefined;
    author: string | undefined;
    jobUrl: string | undefined;
    getSlackUserMention: (githubUsername: string) => string;
}

export function buildSummaryMessages(state: ShardState, builder: MessageBuilder) {
    const { browser, shardIndex } = state.aggregatedFailures;
    const browserName = formatBrowserName(browser);
    const shardContext = browser === "none" || shardIndex === "0" ? browserName : `${browserName} Shard ${shardIndex}`;

    // Group failures by type
    const apiFailures = state.aggregatedFailures.failures
        .filter((f) => f.api > 0)
        .map((f) => `• ${f.fileName}: ${f.api} failure${f.api > 1 ? "s" : ""}`);
    const uiFailures = state.aggregatedFailures.failures
        .filter((f) => f.ui > 0)
        .map((f) => `• ${f.fileName}: ${f.ui} failure${f.ui > 1 ? "s" : ""}`);

    const mainMessage = {
        channel: "#playwright-test-failures",
        text: `📊 Test Failure Summary (${shardContext})`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `📊 Test Failure Summary (${shardContext})`,
                    emoji: true,
                },
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Branch:*\n${builder.branch}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*Author:*\n${builder.author ? builder.getSlackUserMention(builder.author) : "Unknown"}`,
                    },
                ],
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Total Failures:*\n${state.testState.failureCount}`,
                    },
                ],
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "🔍 View Test Run",
                            emoji: true,
                        },
                        style: "danger",
                        url: builder.jobUrl,
                    },
                ],
            },
        ],
    };

    const apiFailuresMessage =
        apiFailures.length > 0
            ? {
                  channel: "#playwright-test-failures",
                  text: "API Test Failures",
                  blocks: [
                      {
                          type: "section",
                          text: {
                              type: "mrkdwn",
                              text: "*API Tests:*\n" + apiFailures.join("\n"),
                          },
                      },
                  ],
              }
            : null;

    const uiFailuresMessage =
        uiFailures.length > 0
            ? {
                  channel: "#playwright-test-failures",
                  text: "UI Test Failures",
                  blocks: [
                      {
                          type: "section",
                          text: {
                              type: "mrkdwn",
                              text: "*UI Tests:*\n" + uiFailures.join("\n"),
                          },
                      },
                  ],
              }
            : null;

    return { mainMessage, apiFailuresMessage, uiFailuresMessage };
}
