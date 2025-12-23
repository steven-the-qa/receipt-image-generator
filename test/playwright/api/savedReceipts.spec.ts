import { test, expect } from "./utils/fixtures";
import {
  createTestUser,
  createTestReceiptData,
  loginUser,
  logoutUser
} from "./utils/helpers";
import type { Receipt } from "../../../src/types/receipt";

test.describe("GET /api/receipts", () => {

  test("401 without authentication", async ({ api }) => {
    await api.path("/receipts").getRequest(401);
  });

  test("200 with authentication returns empty array when no receipts", async ({ api, testData }) => {
    // Setup: Create user in DB
    const userData = createTestUser();
    await testData.createUser(userData);
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Test: Get receipts
    const receipts = await api.path("/receipts").getRequest(200);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBe(0);
  });

  test("200 returns user's receipts", async ({ api, testData }) => {
    // Setup: Create user and receipts in DB
    const userData = createTestUser();
    const user = await testData.createUser(userData);
    const receipt1 = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: false }));
    const receipt2 = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: true }));
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Get all receipts
    const receipts: Receipt[] = await api.path("/receipts").getRequest(200);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBeGreaterThanOrEqual(2);
    
    // Verify all receipts belong to the user
    expect(receipts.every(r => r.user_id)).toBeTruthy();
    
    // Verify receipts are in the list
    const receiptIds = receipts.map(r => r.id);
    expect(receiptIds).toContain(receipt1.id);
    expect(receiptIds).toContain(receipt2.id);
  });

  test("filtering by favorite returns only favorited receipts", async ({ api, testData }) => {
    // Setup: Create user and receipts in DB
    const userData = createTestUser();
    const user = await testData.createUser(userData);
    const favoriteReceipt = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: true }));
    const regularReceipt = await testData.createReceipt(user.id, createTestReceiptData({ is_favorite: false }));
    
    // Login via API (for authentication)
    await loginUser(api, userData);

    // Filter by favorite
    const favorites: Receipt[] = await api
      .path("/receipts")
      .params({ favorite: "true" })
      .getRequest(200);

    // Assert all returned receipts are favorites
    expect(Array.isArray(favorites)).toBe(true);
    for (const receipt of favorites) {
      expect(receipt.is_favorite).toBe(true);
    }
    
    // Verify favorite receipt is included
    const favoriteIds = favorites.map(r => r.id);
    expect(favoriteIds).toContain(favoriteReceipt.id);
    expect(favoriteIds).not.toContain(regularReceipt.id);
  });

  test("users cannot access other users' receipts", async ({ api, testData }) => {
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

    // User 2 cannot access user 1's receipt
    await api.path(`/receipts/${receipt1.id}`).getRequest(404);

    // User 2's receipt list should be empty
    const receipts: Receipt[] = await api.path("/receipts").getRequest(200);
    expect(receipts.length).toBe(0);
  });
});
