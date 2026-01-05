import * as testResults from '../results.json';

// Summary
// {
//     averageDuration: number (milliseconds)
//     slowestTest: string (test name)
//     fastestTest: string (test name)
// }

interface TestSummary {
    averageDuration: number // (milliseconds)
    slowestTest: string // (test name)
    fastestTest: string // (test name)
}

function summarizeResults(results: any): TestSummary {
    const formatReceiptSuite = results.suites.find(suite => suite.title === 'formatReceipt.spec.ts');
    const summary = formatReceiptSuite.specs.reduce((acc, spec) => {
        const testDuration = spec.tests[0].results[0].duration;
        acc.totalDuration += testDuration;
        acc.testDurations.push({ name: spec.title, duration: testDuration });

        return acc;
    }, { averageDuration: 0, slowestTest: '', fastestTest: '', totalDuration: 0, testDurations: [] } as TestSummary & { totalDuration: number, testDurations: [] });

    summary.averageDuration = Number((summary.totalDuration / formatReceiptSuite.specs.length).toFixed(2));

    summary.fastestTest = summary.testDurations.sort((a, b) => {
        return b.duration - a.duration;
    }).pop().name;

    summary.slowestTest = summary.testDurations.sort((a, b) => {
        return a.duration - b.duration;
    }).pop().name;

    delete summary.totalDuration
    delete summary.testDurations

    return summary;
}

console.log(summarizeResults(testResults));