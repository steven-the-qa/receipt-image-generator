/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { RequestHandler } from "../../utils/request-handler";
import { APILogger } from "../../utils/logger";

type TestOptions = {
    api: RequestHandler;
};

export const test = base.extend<TestOptions>({
    api: async ({ request }, use) => {
        const logger = new APILogger();
        const requestHandler = new RequestHandler(request, logger);
        await use(requestHandler);
    },
});
