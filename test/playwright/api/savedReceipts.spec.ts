import { test, expect } from "./utils/fixtures";
import { faker } from "@faker-js/faker";

test.describe("GET /api/receipts", () => {
  test("401 without authentication", async ({ api }) => {
    await api.path("/receipts").getRequest(401);
  });

  test("200 with authentication returns empty array when no receipts", async ({ api }) => {
    // Generate unique test data
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password();

    // Register and login
    await api.path("/auth-register").body({
      email,
      username,
      password
    }).postRequest(201);

    await api.path("/auth-login").body({
      email,
      password
    }).postRequest(200);

    // Get receipts
    const receipts = await api.path("/receipts").getRequest(200);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBe(0);
  });

  test("200 returns user's receipts", async ({ api }) => {
    // Generate unique test data
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password();

    // Register and login
    await api.path("/auth-register").body({
      email,
      username,
      password
    }).postRequest(201);

    await api.path("/auth-login").body({
      email,
      password
    }).postRequest(200);

    // Create receipts with randomized data
    const receipt1 = await api.path("/receipts").body({
      store_name: faker.company.name(),
      purchase_date: faker.date.past().toISOString().split('T')[0],
      purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
      receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
      subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
      total: parseFloat(faker.commerce.price({ min: 10, max: 110 })),
      is_favorite: false
    }).postRequest(201);

    const receipt2 = await api.path("/receipts").body({
      store_name: faker.company.name(),
      purchase_date: faker.date.past().toISOString().split('T')[0],
      purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
      receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
      subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
      total: parseFloat(faker.commerce.price({ min: 10, max: 110 })),
      is_favorite: true
    }).postRequest(201);

    // Get all receipts
    const receipts = await api.path("/receipts").getRequest(200);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBeGreaterThanOrEqual(2);
    
    // Verify all receipts belong to the user
    expect(receipts.every(r => r.user_id)).toBeTruthy();
    
    // Verify receipts are in the list
    const receiptIds = receipts.map(r => r.id);
    expect(receiptIds).toContain(receipt1.id);
    expect(receiptIds).toContain(receipt2.id);
  });

  test("filtering by favorite returns only favorited receipts", async ({ api }) => {
    // Generate unique test data
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password();

    // Register and login
    await api.path("/auth-register").body({
      email,
      username,
      password
    }).postRequest(201);

    await api.path("/auth-login").body({
      email,
      password
    }).postRequest(200);

    // Create receipts with different favorite statuses
    const favoriteReceipt = await api.path("/receipts").body({
      store_name: faker.company.name(),
      purchase_date: faker.date.past().toISOString().split('T')[0],
      purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
      receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
      subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
      total: parseFloat(faker.commerce.price({ min: 10, max: 110 })),
      is_favorite: true
    }).postRequest(201);

    const regularReceipt = await api.path("/receipts").body({
      store_name: faker.company.name(),
      purchase_date: faker.date.past().toISOString().split('T')[0],
      purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
      receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
      subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
      total: parseFloat(faker.commerce.price({ min: 10, max: 110 })),
      is_favorite: false
    }).postRequest(201);

    // Filter by favorite
    const favorites = await api
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

  test("users cannot access other users' receipts", async ({ api }) => {
    // Generate unique test data for user 1
    const user1Email = faker.internet.email();
    const user1Username = faker.internet.userName();
    const user1Password = faker.internet.password();

    // Register and login as user 1
    await api.path("/auth-register").body({
      email: user1Email,
      username: user1Username,
      password: user1Password
    }).postRequest(201);

    await api.path("/auth-login").body({
      email: user1Email,
      password: user1Password
    }).postRequest(200);

    // Create receipt for user 1
    const receipt1 = await api.path("/receipts").body({
      store_name: faker.company.name(),
      purchase_date: faker.date.past().toISOString().split('T')[0],
      purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
      receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
      subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
      total: parseFloat(faker.commerce.price({ min: 10, max: 110 }))
    }).postRequest(201);

    // Logout
    await api.path("/auth-logout").postRequest(200);

    // Generate unique test data for user 2
    const user2Email = faker.internet.email();
    const user2Username = faker.internet.userName();
    const user2Password = faker.internet.password();

    // Register and login as user 2
    await api.path("/auth-register").body({
      email: user2Email,
      username: user2Username,
      password: user2Password
    }).postRequest(201);

    await api.path("/auth-login").body({
      email: user2Email,
      password: user2Password
    }).postRequest(200);

    // User 2 cannot access user 1's receipt
    await api.path(`/receipts/${receipt1.id}`).getRequest(404);

    // User 2's receipt list should be empty
    const receipts = await api.path("/receipts").getRequest(200);
    expect(receipts.length).toBe(0);
  });
});
