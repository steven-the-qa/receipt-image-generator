import * as testResults from '../results.json';

// Find the fastest and slowest tests in the `formatReceipt.spec.ts` file
// Also, calculate the average duration of all tests in the file

type TestDuration = {
    name: string,
    duration: number
}

interface TestSummary {
    averageDuration: number // (milliseconds)
    slowestTest: TestDuration
    fastestTest: TestDuration
}

function summarizeResults(results: any): TestSummary {
    const formatReceiptSuite = results.suites.find(suite => suite.title === 'formatReceipt.spec.ts');
    const summary = formatReceiptSuite.specs.reduce((acc, spec) => {
        const testDuration = spec.tests[0].results[0].duration;
        acc.totalDuration += testDuration;
        acc.testDurations.push({ name: spec.title, duration: testDuration });

        return acc;
    }, {
        averageDuration: 0,
        slowestTest: { name: '', duration: 0 },
        fastestTest: { name: '', duration: 0 },
        totalDuration: 0,
        testDurations: []
    } as TestSummary & { totalDuration: number, testDurations: TestDuration[] });

    summary.averageDuration = Number((summary.totalDuration / formatReceiptSuite.specs.length).toFixed(2));

    summary.testDurations.sort((a, b) => {
        return b.duration - a.duration;
    });

    summary.fastestTest = summary.testDurations.pop();
    summary.slowestTest = summary.testDurations.shift();

    delete summary.totalDuration
    delete summary.testDurations

    return summary;
}

console.log(summarizeResults(testResults));