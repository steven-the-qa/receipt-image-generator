import type { TestCase, TestResult } from "@playwright/test/reporter";

interface MessageBuilder {
    branch: string | undefined;
    author: string | undefined;
    jobUrl: string | undefined;
    getSlackUserMention: (githubUsername: string) => string;
    getShardContext: () => string;
    stripAnsiCodes: (str: string) => string;
    truncateString: (str: string, maxLength: number) => string;
}

export function buildIndividualFailureMessages(
    test: TestCase,
    result: TestResult,
    includeAggregationNotice: boolean,
    maxIndividualFailures: number,
    builder: MessageBuilder
) {
    const fileName = test.location.file.split("/").pop() || "";
    const maxTitleLength = 140 - fileName.length;
    const truncatedTitle =
        test.title.length > maxTitleLength ? `${test.title.slice(0, maxTitleLength - 3)}...` : test.title;

    const error = result.errors[0];
    const cleanStack = error ? builder.stripAnsiCodes(error.stack || "") : "";
    const authorMention = builder.author ? builder.getSlackUserMention(builder.author) : "Unknown";
    const testType = test.parent.project()?.name === "api" ? "API" : "UI";
    const shardContext = builder.getShardContext();

    const mainMessage = {
        channel: "#playwright-test-failures",
        text: `🚨 ${fileName} - ${truncatedTitle}`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `🚨 ${fileName} - ${truncatedTitle}`,
                    emoji: true,
                },
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Test Type:*\n${testType}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*Branch:*\n${builder.branch}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*Author:*\n${authorMention}`,
                    },
                    {
                        type: "mrkdwn",
                        text: `*Shard:*\n${shardContext}`,
                    },
                ],
            },
            // Add aggregation notice if needed
            ...(includeAggregationNotice
                ? [
                      {
                          type: "section",
                          text: {
                              type: "mrkdwn",
                              text: `⚠️ *Switching to Aggregated Reporting*\n${maxIndividualFailures} test failures have occurred. Further failures will be aggregated and reported in a final summary when all tests complete.`,
                          },
                      },
                  ]
                : []),
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

    const errorDetailsMessage = {
        channel: "#playwright-test-failures",
        text: "Test Failure Details",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*Stack Trace:*",
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `\`\`\`${builder.truncateString(cleanStack || "No stack trace available", 3000)}\`\`\``,
                },
            },
        ],
    };

    return { mainMessage, errorDetailsMessage };
}
