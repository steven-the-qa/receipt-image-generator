# API Testing Guide for Playwright

This guide documents our Playwright API testing framework and provides prescriptive patterns so new tests “just work” with minimal edits. It is optimized for AI-assisted generation and mirrors how our existing suite is written.

## Framework Overview

-   `test` fixture: `import { test } from "test/playwright/api/utils/fixtures"` exposes `{ api }`, a chainable `RequestHandler` wrapper over Playwright’s `APIRequestContext`.
-   `RequestHandler` methods: `.url(base) .path(path) .params(obj) .headers(obj) .body(obj)` and terminal calls: `.getRequest(status) .postRequest(status) .putRequest(status) .deleteRequest(status)`.
-   Expected-status required: every terminal call validates status and throws with rich logs (via `APILogger`) if it doesn’t match.
-   Base URLs: Default is `http://localhost:3000/api` (or `http://localhost:8888/api` for Netlify dev). Use `.url()` to override.
-   Auth: Session-based authentication via cookies. Login with `/api/auth-login` to receive session cookie automatically stored by `RequestHandler`.
-   Data strategy: Create test data via API endpoints; clean up created entities in `afterEach` if needed.

## Core Conventions

-   Always write tests as `test("METHOD /path ...", async ({ api }) => { ... })`.
-   Always pass an expected status to request methods.
-   Prefer type-safe responses: import the response type from app code and annotate the call result.
-   Create test data via API endpoints; avoid direct database access in tests.
-   Validate filters by creating all relevant variants; assert every returned item.
-   Focus access control on denials (401) rather than duplicating 200s.
-   Avoid defensive programming in tests: no `if` checks or `try/catch` in bodies.

## Getting Started

```ts
import { test, expect } from "test/playwright/api/utils/fixtures";

test("GET /api/auth-me returns 401 without session", async ({ api }) => {
    await api.path("/auth-me").getRequest(401);
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
test("authenticated endpoint", async ({ api }) => {
    // Register a new user
    const registerResponse = await api
        .path("/auth-register")
        .body({
            email: "test@example.com",
            username: "testuser",
            password: "password123"
        })
        .postRequest(200);

    // Login to get session cookie (automatically stored by RequestHandler)
    await api
        .path("/auth-login")
        .body({
            email: "test@example.com",
            password: "password123"
        })
        .postRequest(200);

    // Now authenticated requests work
    const user = await api.path("/auth-me").getRequest(200);
    expect(user.email).toBe("test@example.com");
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

-   Create test data via API endpoints (e.g., register users, create receipts).
-   Track created entity IDs in test state for cleanup if needed.
-   Clean up created data in `afterEach` when necessary:

```ts
test.describe("receipt management", () => {
    let receiptIds: string[] = [];

    test.afterEach(async ({ api }) => {
        // Clean up created receipts
        for (const id of receiptIds) {
            try {
                await api.path(`/receipts/${id}`).deleteRequest(204);
            } catch {
                // Ignore errors if already deleted
            }
        }
        receiptIds = [];
    });

    test("creates and deletes receipt", async ({ api }) => {
        // Login first
        await api.path("/auth-login").body({
            email: "test@example.com",
            password: "password123"
        }).postRequest(200);

        // Create receipt
        const receipt = await api.path("/receipts").body({
            store_name: "Walmart",
            // ... other fields
        }).postRequest(200);

        receiptIds.push(receipt.id);
        // ... test logic
    });
});
```

## Standard Test Recipes

### 1) Authentication

```ts
test.describe("GET /api/auth-me", () => {
    test("401 without session", async ({ api }) => {
        await api.path("/auth-me").getRequest(401);
    });

    test("200 with session", async ({ api }) => {
        // Register and login
        await api.path("/auth-register").body({
            email: "test@example.com",
            username: "testuser",
            password: "password123"
        }).postRequest(200);

        await api.path("/auth-login").body({
            email: "test@example.com",
            password: "password123"
        }).postRequest(200);

        // Now authenticated
        const user = await api.path("/auth-me").getRequest(200);
        expect(user.email).toBe("test@example.com");
    });
});
```

### 2) Validation (400)

```ts
test("POST /api/auth-register validates required fields", async ({ api }) => {
    await api.path("/auth-register").body({}).postRequest(400);
    await api.path("/auth-register").body({ email: "invalid" }).postRequest(400);
    await api.path("/auth-register").body({
        email: "valid@example.com",
        username: "testuser",
        password: "password123"
    }).postRequest(200);
});

test("POST /api/receipts validates required fields", async ({ api }) => {
    // Login first
    await api.path("/auth-login").body({
        email: "test@example.com",
        password: "password123"
    }).postRequest(200);

    await api.path("/receipts").body({}).postRequest(400);
    await api.path("/receipts").body({
        store_name: "Walmart"
        // Missing required fields
    }).postRequest(400);
});
```

### 3) Filtering (create ALL variants)

```ts
// Create receipts with different favorite statuses, then assert filter works
test("GET /api/receipts filters by favorite", async ({ api }) => {
    // Login first
    await api.path("/auth-login").body({
        email: "test@example.com",
        password: "password123"
    }).postRequest(200);

    // Create favorite receipt
    const favoriteReceipt = await api.path("/receipts").body({
        store_name: "Walmart",
        purchase_date: "2024-01-15",
        purchase_time: "14:30",
        receipt_items: [],
        subtotal: 10.99,
        tax: 0.88,
        total: 11.87,
        is_favorite: true,
        // ... other required fields
    }).postRequest(200);

    // Create non-favorite receipt
    const regularReceipt = await api.path("/receipts").body({
        store_name: "Target",
        purchase_date: "2024-01-16",
        purchase_time: "15:00",
        receipt_items: [],
        subtotal: 25.50,
        tax: 2.04,
        total: 27.54,
        is_favorite: false,
        // ... other required fields
    }).postRequest(200);

    // Filter by favorite
    const favorites = await api
        .path("/receipts")
        .params({ favorite: "true" })
        .getRequest(200);

    // Assert all returned receipts are favorites
    for (const receipt of favorites) {
        expect(receipt.is_favorite).toBe(true);
    }
    expect(favorites.some(r => r.id === favoriteReceipt.id)).toBe(true);
    expect(favorites.some(r => r.id === regularReceipt.id)).toBe(false);
});
```

### 4) List Operations

```ts
test("GET /api/receipts returns all user receipts", async ({ api }) => {
    // Login first
    await api.path("/auth-login").body({
        email: "test@example.com",
        password: "password123"
    }).postRequest(200);

    // Create multiple receipts
    await api.path("/receipts").body({
        store_name: "Walmart",
        // ... required fields
    }).postRequest(200);

    await api.path("/receipts").body({
        store_name: "Target",
        // ... required fields
    }).postRequest(200);

    // Get all receipts
    const receipts = await api.path("/receipts").getRequest(200);
    expect(receipts.length).toBeGreaterThanOrEqual(2);
    expect(receipts.every(r => r.user_id)).toBeTruthy();
});
```

### 5) Access Control (401)

```ts
test("GET /api/receipts requires authentication", async ({ api }) => {
    // No login - should fail
    await api.path("/receipts").getRequest(401);
});

test("users can only access their own receipts", async ({ api }) => {
    // Login as user 1
    await api.path("/auth-login").body({
        email: "user1@example.com",
        password: "password123"
    }).postRequest(200);

    const receipt1 = await api.path("/receipts").body({
        store_name: "Walmart",
        // ... required fields
    }).postRequest(200);

    // Logout (clear session)
    await api.path("/auth-logout").postRequest(200);

    // Login as user 2
    await api.path("/auth-login").body({
        email: "user2@example.com",
        password: "password123"
    }).postRequest(200);

    // User 2 cannot access user 1's receipt
    await api.path(`/receipts/${receipt1.id}`).getRequest(404);
});
```

### 6) 404 / Not Found

```ts
test("GET /api/receipts/{id} returns 404 for non-existent receipt", async ({ api }) => {
    // Login first
    await api.path("/auth-login").body({
        email: "test@example.com",
        password: "password123"
    }).postRequest(200);

    // Use a non-existent UUID
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

-   [ ] Use `{ api }` fixture and expected status
-   [ ] Import response types and annotate variables
-   [ ] Use `.url()` to override base URL if needed (default: `http://localhost:3000/api`)
-   [ ] Create ALL variants for filter scenarios; assert all items
-   [ ] Authentication: test 401 and 200
-   [ ] Validation: test 400 and success
-   [ ] Access control: test 401 for unauthenticated, 404 for unauthorized access
-   [ ] Create test data via API endpoints; clean up in `afterEach` if needed
-   [ ] No direct database access in tests; no defensive branches
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
