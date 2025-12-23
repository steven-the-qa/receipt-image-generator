# API Testing Guide for Playwright

This guide documents our Playwright API testing framework and provides prescriptive patterns so new tests “just work” with minimal edits. It is optimized for AI-assisted generation and mirrors how our existing suite is written.

## Framework Overview

-   `test` fixture: `import { test, expect } from "test/playwright/api/utils/fixtures"` exposes `{ api, testData }` fixtures.
-   `api` fixture: Chainable `RequestHandler` wrapper over Playwright's `APIRequestContext` for making API calls.
-   `testData` fixture: `TestDataManager` for managing test data lifecycle (automatic cleanup).
-   `RequestHandler` methods: `.url(base) .path(path) .params(obj) .headers(obj) .body(obj)` and terminal calls: `.getRequest(status) .postRequest(status) .putRequest(status) .deleteRequest(status)`.
-   Expected-status required: every terminal call validates status and throws with rich logs (via `APILogger`) if it doesn't match.
-   Base URLs: Default is `http://localhost:3000/api` (or `http://localhost:8888/api` for Netlify dev). Use `.url()` to override.
-   Auth: Session-based authentication via cookies. Login with `/api/auth-login` to receive session cookie automatically stored by `RequestHandler`.
-   **Data strategy: Create test data via DB using `testData` fixture (fast, reliable). Use API calls only for authentication and testing endpoints. Cleanup is automatic.**

## Core Conventions

-   Always write tests as `test("METHOD /path ...", async ({ api, testData }) => { ... })`.
-   Always pass an expected status to request methods.
-   Prefer type-safe responses: import the response type from app code and annotate the call result.
-   **Test data setup: Use `testData.createUser()` and `testData.createReceipt()` for DB-based setup (fast, reliable).**
-   **Authentication: Use `loginUser(api, userData)` helper for API-based authentication.**
-   **Testing: Use API calls only for testing endpoints (what we're actually testing).**
-   Validate filters by creating all relevant variants; assert every returned item.
-   Focus access control on denials (401) rather than duplicating 200s.
-   Avoid defensive programming in tests: no `if` checks or `try/catch` in bodies.
-   **No manual cleanup needed - `testData` fixture handles cleanup automatically.**

## Getting Started

```ts
import { test, expect } from "test/playwright/api/utils/fixtures";
import { createTestUser, loginUser } from "./utils/helpers";

test("GET /api/auth-me returns 401 without session", async ({ api }) => {
    await api.path("/auth-me").getRequest(401);
});

test("GET /api/auth-me returns 200 with session", async ({ api, testData }) => {
    // Setup: Create user in DB
    const userData = createTestUser();
    await testData.createUser(userData);
    
    // Login via API (for authentication)
    await loginUser(api, userData);
    
    // Test: Get current user
    const user = await api.path("/auth-me").getRequest(200);
    expect(user.email).toBe(userData.email);
});
```

## Base URLs

Default base URL is `http://localhost:3000/api`. For Netlify dev server (port 8888), override with:

```ts
test("uses custom base URL", async ({ api }) => {
    await api
        .url("http://localhost:8888/api")
        .path("/auth-me")
        .getRequest(401);
});
```

## Authentication Pattern

```ts
import { createTestUser, loginUser } from "./utils/helpers";

test("authenticated endpoint", async ({ api, testData }) => {
    // Setup: Create user in DB (fast, reliable)
    const userData = createTestUser();
    await testData.createUser(userData);

    // Login via API (for authentication - needed for session cookie)
    await loginUser(api, userData);

    // Now authenticated requests work
    const user = await api.path("/auth-me").getRequest(200);
    expect(user.email).toBe(userData.email);
});
```

## RequestHandler Cheat Sheet

```ts
// GET - List receipts
const receipts = await api
    .path("/receipts")
    .params({ favorite: "true" }) // Optional filter
    .getRequest(200);

// GET - Single receipt
const receipt = await api
    .path(`/receipts/${receiptId}`)
    .getRequest(200);

// POST - Create receipt
const created = await api
    .path("/receipts")
    .body({
        store_name: "Walmart",
        purchase_date: "2024-01-15",
        purchase_time: "14:30",
        receipt_items: [["Item 1", 10.99, 1]],
        subtotal: 10.99,
        tax: 0.88,
        total: 11.87,
        // ... other required fields
    })
    .postRequest(200);

// PUT - Update receipt
await api
    .path(`/receipts/${receiptId}`)
    .body({ receipt_name: "Updated Name", is_favorite: true })
    .putRequest(200);

// DELETE
await api.path(`/receipts/${receiptId}`).deleteRequest(204);
```

## Type Safety

Import types from app code and annotate responses:

```ts
import type { Receipt } from "../../../src/types/receipt";

const receipts: Receipt[] = await api
    .path("/receipts")
    .getRequest(200);

const receipt: Receipt = await api
    .path(`/receipts/${receiptId}`)
    .getRequest(200);
```

## Data Management

**CRITICAL: Separation of Concerns**

-   **Test Data Setup = DB Queries** (via `testData` fixture) - fast, reliable, resilient to API failures
-   **Authentication = API Calls** (via `loginUser` helper) - needed for session cookies
-   **Testing = API Calls** (via `api` fixture) - what we're actually testing

**Pattern:**
```ts
import { createTestUser, createTestReceiptData, loginUser } from "./utils/helpers";

test("my test", async ({ api, testData }) => {
    // 1. Setup: Create test data in DB (fast, reliable)
    const userData = createTestUser();
    const user = await testData.createUser(userData);
    const receipt = await testData.createReceipt(user.id, createTestReceiptData());
    
    // 2. Authentication: Login via API (needed for auth)
    await loginUser(api, userData);
    
    // 3. Testing: Test the endpoint via API (what we're testing)
    const receipts = await api.path("/receipts").getRequest(200);
    expect(receipts).toContainEqual(expect.objectContaining({ id: receipt.id }));
    
    // 4. Cleanup: Automatic via testData fixture - no manual cleanup needed!
});
```

**Why this approach:**
-   **Faster tests** - No HTTP overhead for setup
-   **More reliable** - Setup doesn't depend on API health
-   **Better isolation** - Setup failures don't mask test failures
-   **Clear separation** - Setup = infrastructure, Testing = business logic
-   **Automatic cleanup** - `testData` fixture handles cleanup automatically

**Never:**
-   ❌ Create test data via API calls (except when testing those endpoints)
-   ❌ Use API calls for cleanup
-   ❌ Mix setup and testing concerns
-   ❌ Manual cleanup in `afterEach` hooks

## Standard Test Recipes

### 1) Authentication

```ts
import { createTestUser, loginUser } from "./utils/helpers";

test.describe("GET /api/auth-me", () => {
    test("401 without session", async ({ api }) => {
        await api.path("/auth-me").getRequest(401);
    });

    test("200 with session", async ({ api, testData }) => {
        // Setup: Create user in DB
        const userData = createTestUser();
        await testData.createUser(userData);
        
        // Login via API (for authentication)
        await loginUser(api, userData);

        // Test: Get current user
        const user = await api.path("/auth-me").getRequest(200);
        expect(user.email).toBe(userData.email);
    });
});
```

### 2) Validation (400)

```ts
import { createTestUser, loginUser } from "./utils/helpers";

test("POST /api/auth-register validates required fields", async ({ api }) => {
    // Test validation - no setup needed for 400 cases
    await api.path("/auth-register").body({}).postRequest(400);
    await api.path("/auth-register").body({ email: "invalid" }).postRequest(400);
    await api.path("/auth-register").body({
        email: "valid@example.com",
        username: "testuser",
        password: "password123"
    }).postRequest(201);
});

test("POST /api/receipts validates required fields", async ({ api, testData }) => {
    // Setup: Create user in DB
    const userData = createTestUser();
    await testData.createUser(userData);
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Test validation
    await api.path("/receipts").body({}).postRequest(400);
    await api.path("/receipts").body({
        store_name: "Walmart"
        // Missing required fields
    }).postRequest(400);
});
```

### 3) Filtering (create ALL variants)

```ts
import { createTestUser, createTestReceiptData, loginUser } from "./utils/helpers";

// Create receipts with different favorite statuses, then assert filter works
test("GET /api/receipts filters by favorite", async ({ api, testData }) => {
    // Setup: Create user and receipts in DB
    const userData = createTestUser();
    const user = await testData.createUser(userData);
    const favoriteReceipt = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: true }));
    const regularReceipt = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: false }));
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Test: Filter by favorite
    const favorites = await api
        .path("/receipts")
        .params({ favorite: "true" })
        .getRequest(200);

    // Assert all returned receipts are favorites
    expect(Array.isArray(favorites)).toBe(true);
    for (const receipt of favorites) {
        expect(receipt.is_favorite).toBe(true);
    }
    
    // Verify favorite receipt is included, regular is not
    const favoriteIds = favorites.map(r => r.id);
    expect(favoriteIds).toContain(favoriteReceipt.id);
    expect(favoriteIds).not.toContain(regularReceipt.id);
});
```

### 4) List Operations

```ts
import { createTestUser, createTestReceiptData, loginUser } from "./utils/helpers";

test("GET /api/receipts returns all user receipts", async ({ api, testData }) => {
    // Setup: Create user and receipts in DB
    const userData = createTestUser();
    const user = await testData.createUser(userData);
    await testData.createReceipt(user.id, createTestReceiptData({ store_name: "Walmart" }));
    await testData.createReceipt(user.id, createTestReceiptData({ store_name: "Target" }));
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Test: Get all receipts
    const receipts = await api.path("/receipts").getRequest(200);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBeGreaterThanOrEqual(2);
    expect(receipts.every(r => r.user_id)).toBeTruthy();
});
```

### 5) Access Control (401)

```ts
import { createTestUser, createTestReceiptData, loginUser, logoutUser } from "./utils/helpers";

test("GET /api/receipts requires authentication", async ({ api }) => {
    // No login - should fail
    await api.path("/receipts").getRequest(401);
});

test("users can only access their own receipts", async ({ api, testData }) => {
    // Setup: Create user 1 and receipt in DB
    const user1Data = createTestUser();
    const user1 = await testData.createUser(user1Data);
    const receipt1 = await testData.createReceipt(user1.id, createTestReceiptData());
    
    // Login as user 1 via API
    await loginUser(api, user1Data);

    // Logout
    await logoutUser(api);

    // Setup: Create user 2 in DB
    const user2Data = createTestUser();
    await testData.createUser(user2Data);
    
    // Login as user 2 via API
    await loginUser(api, user2Data);

    // Test: User 2 cannot access user 1's receipt
    await api.path(`/receipts/${receipt1.id}`).getRequest(404);
});
```

### 6) 404 / Not Found

```ts
import { createTestUser, loginUser } from "./utils/helpers";

test("GET /api/receipts/{id} returns 404 for non-existent receipt", async ({ api, testData }) => {
    // Setup: Create user in DB
    const userData = createTestUser();
    await testData.createUser(userData);
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Test: Use a non-existent UUID
    await api.path("/receipts/00000000-0000-0000-0000-000000000000").getRequest(404);
});
```

## Organization & Naming

-   Name tests with HTTP method and endpoint, e.g., `"GET /api/receipts returns user receipts"`.
-   Separate scenarios: authentication, validation, filtering, access control, CRUD operations.
-   Prefer focused tests (one behavior per test).

## Avoiding Redundant Tests

Before finalizing tests, scan for:

-   **Duplicate test cases**: Multiple tests covering the exact same scenario with the same inputs
-   **Redundant assertions**: Multiple tests asserting the same behavior in different ways
-   **Overlapping validation**: Separate tests that could be combined into a single validation matrix
-   **Repeated setup**: Identical fixture creation that could be extracted to `beforeEach`
-   **Similar error cases**: Multiple 400/403/404 tests that differ only slightly

**Example:**

```ts
// ❌ Don't: Redundant tests
test("returns 400 when store_name is missing", async ({ api }) => {
    await api.path("/receipts").body({ purchase_date: "2024-01-15" }).postRequest(400);
});
test("returns 400 when purchase_date is missing", async ({ api }) => {
    await api.path("/receipts").body({ store_name: "Walmart" }).postRequest(400);
});
test("returns 400 for invalid payload", async ({ api }) => {
    await api.path("/receipts").body({}).postRequest(400);
});

// ✅ Do: Combine into validation matrix
test("POST /api/receipts validates required fields", async ({ api }) => {
    // Login first
    await api.path("/auth-login").body({
        email: "test@example.com",
        password: "password123"
    }).postRequest(200);

    await api.path("/receipts").body({}).postRequest(400);
    await api.path("/receipts").body({ store_name: "Walmart" }).postRequest(400);
    await api.path("/receipts").body({
        store_name: "Walmart",
        purchase_date: "2024-01-15",
        purchase_time: "14:30",
        receipt_items: [],
        subtotal: 10.99,
        tax: 0.88,
        total: 11.87,
        // ... other required fields
    }).postRequest(200);
});
```

## Quick Checklist

-   [ ] Use `{ api, testData }` fixtures and expected status
-   [ ] Import response types and annotate variables
-   [ ] Use `.url()` to override base URL if needed (default: `http://localhost:3000/api`)
-   [ ] **Use `testData.createUser()` and `testData.createReceipt()` for test data setup (DB-based)**
-   [ ] **Use `loginUser(api, userData)` for authentication (API-based)**
-   [ ] **Use API calls only for testing endpoints (what we're testing)**
-   [ ] **No manual cleanup needed - automatic via `testData` fixture**
-   [ ] Create ALL variants for filter scenarios; assert all items
-   [ ] Authentication: test 401 and 200
-   [ ] Validation: test 400 and success
-   [ ] Access control: test 401 for unauthenticated, 404 for unauthorized access
-   [ ] No defensive branches in test bodies
-   [ ] **Scan for redundant tests and assertions before finalizing**

## Examples in Repo

-   `test/playwright/api/placeholder.spec.ts` – template for new API tests
-   See `netlify/functions/` for available endpoints:
    -   `/api/auth-register` – user registration
    -   `/api/auth-login` – user login (sets session cookie)
    -   `/api/auth-logout` – user logout
    -   `/api/auth-me` – get current user
    -   `/api/receipts` – list/create receipts
    -   `/api/receipts/{id}` – get/update/delete receipt
