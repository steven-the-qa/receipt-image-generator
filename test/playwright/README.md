## Playwright tests

A compact test stack covering UI E2E, AI-assisted flows, API testing utilities, Slack reporting, and reusable CI.

### Normal Playwright tests
- **What**: Standard UI E2E across Chrome/WebKit/Firefox with per-browser projects and sensible defaults (trace on failure, `baseURL`, permissions).
- **Where**: Specs under `test/playwright/*.spec.ts` (non-API). Example: `test/playwright/createKwikTripReceipt.spec.ts`.
- **Run locally**:
 
```bash
npm install
npx playwright install --with-deps
npm run start &
npx playwright test --project=chrome    # or safari, firefox
```
 
- **Notes**:
  - Config: `playwright.config.ts` defines projects `chrome|safari|firefox|api` and launches the dev server on port 3000.

### Stagehand-assisted Playwright tests
- **What**: AI-augmented browser actions via `@browserbasehq/stagehand` for high-level intent steps. See the <a href="https://docs.stagehand.dev/first-steps/introduction" target="_blank" rel="noopener noreferrer">Stagehand docs</a> for more information.
- **Where**: `test/playwright/stagehand/createWalgreensReceipt.spec.ts` (skipped by default to avoid surprise AI spend).
- **Enable and run (manual)**:
 
```bash
export OPENAI_API_KEY=sk-...            # required by Stagehand
sed -i '' 's/test\.skip/test/' test/playwright/stagehand/createWalgreensReceipt.spec.ts
npm run start &
npx playwright test test/playwright/stagehand/createWalgreensReceipt.spec.ts --project=chrome
```
 
- **Notes**: Uses `Stagehand({ env: "LOCAL" })`, then `await stagehand.init()` and `stagehand.page.act("...")` steps.

### Custom Playwright Slack Reporter
- **What**: A robust Slack reporter with retry/backoff, thread replies, and size-aware fallbacks.
- **Where**: `test/playwright/slack-reporter/*` (core: `slack-sender.ts`, messages, utils).
- **Env**:
  - `SLACK_TOKEN`: Bot/User token.
  - `GITHUB_SLACK_USER_MAP`: JSON mapping GitHub usernames to Slack user IDs (used in summaries).
- **Run locally with reporter**:
 
```bash
export SLACK_TOKEN=xoxb-...
export GITHUB_SLACK_USER_MAP='{"octocat":"U123ABC"}'
PLAYWRIGHT_JSON_OUTPUT_NAME=test-results/local.json \
npx --no-save --no playwright test --project=chrome \
  --reporter=list,json,./test/playwright/slack-reporter
```
 
- **Highlights**:
  - Retries on rate limits/timeouts, respects `retry-after`.
  - Threads include stack or gracefully fallback to text if blocks too large.
  - Summaries can aggregate UI/API shards.

### Custom Playwright API test framework
- **What**: Chainable request builder with automatic status validation and rich error context (credit goes to Artem Bondar's <a href="https://www.bondaracademy.com/course/playwright-api-testing-mastery" target="_blank" rel="noopener noreferrer">Playwright API Testing Mastery course</a> for teaching this specific architecture).
- **Where**: `test/playwright/api/utils/request-handler.ts`, `test/playwright/api/utils/logger.ts`.
- **Defaults**: Base URL `http://localhost:3000/api` (override with `.url("https://...")`).
- **Example**:
 
```ts
import { test, expect, request as pwRequest } from '@playwright/test';
import { RequestHandler } from './utils/request-handler';
import { APILogger } from './utils/logger';

test('GET /health is OK', async ({ request }) => {
  const handler = new RequestHandler(request, new APILogger());
  const res = await handler.path('/health').getRequest(200);
  expect(res.status).toBe('ok');
});
```
 
- **Run API tests**:
 
```bash
npm install
npx playwright test --project=api
```

### CI workflows (E2E + API)
- **Reusable workflows**:
  - UI: `.github/workflows/playwright-ui-tests.yml`
    - Matrix across `chrome|safari|firefox` and shards (2), retries per shard, uploads artifacts, posts Slack summary.
    - Installs browsers (`npx playwright install --with-deps`) and runs with reporter `list,json,./test/playwright/slack-reporter`.
  - API: `.github/workflows/playwright-api-tests.yml`
    - Runs `--project=api`, uploads artifacts, posts Slack summary.
    - Provides a `redis` service for aggregation and robust Slack posting.
- **Wiring**:
  - Top-level example: `.github/workflows/ci.yml` calls Jest then UI tests via `uses: ./.github/workflows/playwright-ui-tests.yml`.
  - The API workflow is also reusable via `workflow_call` and can be invoked similarly from your primary CI.
- **Key env in CI**: `SLACK_TOKEN`, `GITHUB_SLACK_USER_MAP`, `OPENAI_API_KEY` (for Stagehand in UI jobs), `REDIS_URL`.

### Quick links
 
- UI spec example: `test/playwright/createKwikTripReceipt.spec.ts`
- Stagehand spec: `test/playwright/stagehand/createWalgreensReceipt.spec.ts`
- Slack reporter: `test/playwright/slack-reporter/slack-sender.ts`
- API handler: `test/playwright/api/utils/request-handler.ts`
- Config: `playwright.config.ts`