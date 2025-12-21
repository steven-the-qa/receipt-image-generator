import { test, expect } from "./utils/fixtures";
import { RequestHandler } from "./utils/request-handler";
import { APILogger } from "./utils/logger";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8888/api";

test.describe("Receipts Endpoints", () => {
  let api: RequestHandler;
  let testUser: { username: string; email: string; password: string };
  let userId: string;
  let sessionCookie: string | null = null;

  test.beforeEach(async ({ request }) => {
    const logger = new APILogger();
    api = new RequestHandler(request, logger, API_BASE_URL);
    testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: "TestPassword123!",
    };

    // Register and login
    const registerResponse = await api
      .path("/auth/register")
      .body({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      })
      .postRequest(201);

    userId = registerResponse.id;
  });

  const createTestReceipt = () => ({
    store_name: "test_store",
    purchase_date: "12/25/2023",
    purchase_time: "10:30:00",
    receipt_items: [
      ["Item 1", 10.99, 1],
      ["Item 2", 5.50, 2],
    ],
    subtotal: 21.99,
    tax: 0.051,
    total: 23.11,
    european_format: false,
    suppress_dollar_sign: true,
    blurry_receipt: false,
    current_typeface: "font-sans",
    is_restaurant: false,
    store_name_box: true,
    store_address_box: true,
    store_phone_box: true,
    store_box: true,
    purchase_date_box: true,
    total_spent_box: true,
    is_favorite: false,
  });

  test("POST /api/receipts - should create a new receipt", async () => {
    const receiptData = createTestReceipt();
    const response = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    expect(response).toHaveProperty("id");
    expect(response.store_name).toBe(receiptData.store_name);
    expect(response.user_id).toBe(userId);
    expect(response.receipt_items).toEqual(receiptData.receipt_items);
  });

  test("GET /api/receipts - should list user receipts", async () => {
    // Create a receipt
    const receiptData = createTestReceipt();
    await api.path("/receipts").body(receiptData).postRequest(201);

    // List receipts
    const response = await api.path("/receipts").getRequest(200);

    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0]).toHaveProperty("id");
  });

  test("GET /api/receipts?favorite=true - should list only favorite receipts", async () => {
    // Create two receipts
    const receipt1 = { ...createTestReceipt(), is_favorite: true };
    const receipt2 = { ...createTestReceipt(), is_favorite: false };

    await api.path("/receipts").body(receipt1).postRequest(201);
    await api.path("/receipts").body(receipt2).postRequest(201);

    // Get favorites only
    const response = await api
      .path("/receipts")
      .params({ favorite: "true" })
      .getRequest(200);

    expect(Array.isArray(response)).toBe(true);
    response.forEach((receipt: any) => {
      expect(receipt.is_favorite).toBe(true);
    });
  });

  test("GET /api/receipts/:id - should get a specific receipt", async () => {
    // Create a receipt
    const receiptData = createTestReceipt();
    const createResponse = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    const receiptId = createResponse.id;

    // Get the receipt
    const response = await api.path(`/receipts/${receiptId}`).getRequest(200);

    expect(response.id).toBe(receiptId);
    expect(response.store_name).toBe(receiptData.store_name);
  });

  test("GET /api/receipts/:id - should return 404 for non-existent receipt", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await api.path(`/receipts/${fakeId}`).getRequest(404);

    expect(response).toHaveProperty("error");
  });

  test("PUT /api/receipts/:id - should update a receipt", async () => {
    // Create a receipt
    const receiptData = createTestReceipt();
    const createResponse = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    const receiptId = createResponse.id;

    // Update the receipt
    const updateData = {
      store_name: "updated_store",
      total: 50.00,
    };

    const response = await api
      .path(`/receipts/${receiptId}`)
      .body(updateData)
      .putRequest(200);

    expect(response.store_name).toBe(updateData.store_name);
    expect(response.total).toBe(updateData.total);
  });

  test("DELETE /api/receipts/:id - should delete a receipt", async () => {
    // Create a receipt
    const receiptData = createTestReceipt();
    const createResponse = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    const receiptId = createResponse.id;

    // Delete the receipt
    await api.path(`/receipts/${receiptId}`).deleteRequest(204);

    // Verify it's deleted
    await api.path(`/receipts/${receiptId}`).getRequest(404);
  });

  test("POST /api/receipts/:id/favorite - should mark receipt as favorite", async () => {
    // Create a receipt
    const receiptData = createTestReceipt();
    const createResponse = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    const receiptId = createResponse.id;

    // Mark as favorite
    const response = await api
      .path(`/receipts/${receiptId}/favorite`)
      .postRequest(200);

    expect(response.is_favorite).toBe(true);
  });

  test("DELETE /api/receipts/:id/favorite - should unmark receipt as favorite", async () => {
    // Create a favorite receipt
    const receiptData = { ...createTestReceipt(), is_favorite: true };
    const createResponse = await api
      .path("/receipts")
      .body(receiptData)
      .postRequest(201);

    const receiptId = createResponse.id;

    // Unmark as favorite
    const response = await api
      .path(`/receipts/${receiptId}/favorite`)
      .deleteRequest(200);

    expect(response.is_favorite).toBe(false);
  });

  test("GET /api/receipts/favorites - should list all favorite receipts", async () => {
    // Create favorite and non-favorite receipts
    const receipt1 = { ...createTestReceipt(), is_favorite: true };
    const receipt2 = { ...createTestReceipt(), is_favorite: false };
    const receipt3 = { ...createTestReceipt(), is_favorite: true };

    await api.path("/receipts").body(receipt1).postRequest(201);
    await api.path("/receipts").body(receipt2).postRequest(201);
    await api.path("/receipts").body(receipt3).postRequest(201);

    // Get favorites
    const response = await api.path("/receipts/favorites").getRequest(200);

    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBe(2);
    response.forEach((receipt: any) => {
      expect(receipt.is_favorite).toBe(true);
    });
  });
});
