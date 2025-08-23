export interface FailureEntry {
    fileName: string;
    api: number;
    ui: number;
}

export interface TestState {
    failureCount: number;
    isInAggregationMode: boolean;
}

export interface ShardState {
    testState: TestState;
    aggregatedFailures: {
        browser: string;
        shardIndex: string;
        shardTotal: string;
        failures: FailureEntry[];
    };
    lastUpdate: number;
    metadata: {
        runId: string;
        jobId: string;
        browser: string;
        shardIndex: string;
        shardTotal: string;
        startTime: string;
    };
}

export interface MessageBuilder {
    branch: string | undefined;
    author: string | undefined;
    jobUrl: string | undefined;
    getSlackUserMention: (githubUsername: string) => string;
    getShardContext: () => string;
    stripAnsiCodes: (str: string) => string;
    truncateString: (str: string, maxLength: number) => string;
}

export interface GithubSlackMap {
    [username: string]: string;
}

export type ShardBrowser = "chrome" | "safari" | "none";
