import type { GithubSlackMap } from "./types";
import githubSlackUserMap from "./github-slack-user-map.json";

const userMap: GithubSlackMap = githubSlackUserMap;

export function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 3) + "...";
}

export function stripAnsiCodes(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b[^m]*m/g, "");
}

export function getSlackUserMention(githubUsername: string): string {
    const slackUserId = userMap[githubUsername];
    return slackUserId ? `<@${slackUserId}>` : githubUsername;
}

export function formatBrowserName(browser: string): string {
    if (browser === "none") {
        return "API";
    }
    return browser.charAt(0).toUpperCase() + browser.slice(1).toLowerCase();
}

export function getShardContext(): string {
    const browser = process.env.BROWSER || "none";
    const shardIndex = process.env.SHARD_INDEX || "0";
    const browserName = formatBrowserName(browser);

    // For none browser type, show minimal context
    if (browser === "none") {
        return "API";
    }

    // For shard index 0, don't show shard number (indicates non-sharded)
    if (shardIndex === "0") {
        return browserName;
    }

    return `${browserName} ${shardIndex}`;
}
