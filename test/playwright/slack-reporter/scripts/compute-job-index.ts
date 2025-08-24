#!/usr/bin/env node

    type SupportedBrowser = "chrome" | "safari" | "firefox";

function getBrowserIndex(browser: SupportedBrowser): number {
    const order: Record<SupportedBrowser, number> = {
        chrome: 0,
        safari: 1,
        firefox: 2,
    };
    return order[browser];
}

function computeJobIndex(browser: SupportedBrowser, shardIndex: number, shardTotal: number): number {
    if (shardTotal <= 0) {
        throw new Error(`Invalid shardTotal: ${shardTotal}`);
    }
    if (shardIndex < 1 || shardIndex > shardTotal) {
        throw new Error(`Invalid shardIndex: ${shardIndex} (total: ${shardTotal})`);
    }
    const browserIndex = getBrowserIndex(browser);
    return browserIndex * shardTotal + (shardIndex - 1);
}

function main() {
    const [browserArg, shardIndexArg, shardTotalArg] = process.argv.slice(2);
    if (!browserArg || !shardIndexArg || !shardTotalArg) {
        console.error("Usage: compute-job-index <browser> <shardIndex> <shardTotal>");
        process.exit(2);
    }

    const browser = browserArg as SupportedBrowser;
    if (!["chrome", "safari", "firefox"].includes(browser)) {
        console.error(`Unknown browser: ${browser}`);
        process.exit(2);
    }

    const shardIndex = Number(shardIndexArg);
    const shardTotal = Number(shardTotalArg);

    if (Number.isNaN(shardIndex) || Number.isNaN(shardTotal)) {
        console.error(`Shard inputs must be numbers. Got index='${shardIndexArg}', total='${shardTotalArg}'`);
        process.exit(2);
    }

    const index = computeJobIndex(browser, shardIndex, shardTotal);
    process.stdout.write(String(index));
}

main();


