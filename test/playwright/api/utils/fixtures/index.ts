/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import { RequestHandler } from "../../utils/request-handler";
import { APILogger } from "../../utils/logger";
import { TestDataManager } from "../test-data-manager";

type TestOptions = {
    api: RequestHandler;
    testData: TestDataManager;
};

export const test = base.extend<TestOptions>({
    api: async ({ request }, use) => {
        const logger = new APILogger();
        const requestHandler = new RequestHandler(request, logger);
        await use(requestHandler);
    },
    testData: async ({ api }, use) => {
        const manager = new TestDataManager();
        await use(manager);
        // Automatic cleanup after each test (no API needed for cleanup)
        await manager.cleanup();
    },
});

export { expect };
