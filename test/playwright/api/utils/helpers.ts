import { faker } from "@faker-js/faker";
import type { RequestHandler } from "./request-handler";
import type { Receipt } from "../../../../src/types/receipt";
import { supabase } from "../../../../src/lib/supabase";

export interface TestUser {
  email: string;
  username: string;
  password: string;
}

export interface TestReceiptData {
  store_name: string;
  purchase_date: string;
  purchase_time: string;
  receipt_items: [string, number | null, number][];
  subtotal: number;
  tax: number;
  total: number;
  is_favorite?: boolean;
}

/**
 * Creates a test user with randomized data
 */
export function createTestUser(): TestUser {
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password()
  };
}

/**
 * Creates test receipt data with randomized values
 */
export function createTestReceiptData(overrides?: Partial<TestReceiptData>): TestReceiptData {
  return {
    store_name: faker.company.name(),
    purchase_date: faker.date.past().toISOString().split('T')[0],
    purchase_time: faker.date.recent().toTimeString().split(' ')[0].substring(0, 5),
    receipt_items: [[faker.commerce.productName(), parseFloat(faker.commerce.price()), faker.number.int({ min: 1, max: 5 })]],
    subtotal: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
    tax: parseFloat(faker.commerce.price({ min: 0.5, max: 10 })),
    total: parseFloat(faker.commerce.price({ min: 10, max: 110 })),
    is_favorite: false,
    ...overrides
  };
}

/**
 * Registers a new user via API and returns the created user with ID
 */
export async function registerUser(api: RequestHandler, user: TestUser): Promise<{ id: string; email: string; username: string }> {
  return await api.path("/auth-register").body({
    email: user.email,
    username: user.username,
    password: user.password
  }).postRequest(201);
}

/**
 * Logs in a user via API
 */
export async function loginUser(api: RequestHandler, user: TestUser): Promise<void> {
  await api.path("/auth-login").body({
    email: user.email,
    password: user.password
  }).postRequest(200);
}

/**
 * Registers and logs in a user in one step
 * Returns the created user with ID
 */
export async function registerAndLoginUser(api: RequestHandler, user: TestUser): Promise<{ id: string; email: string; username: string }> {
  const createdUser = await registerUser(api, user);
  await loginUser(api, user);
  return createdUser;
}

/**
 * Creates a receipt via API and returns the created receipt
 * Use TestDataManager.createReceipt() for automatic tracking
 */
export async function createReceipt(
  api: RequestHandler,
  receiptData: TestReceiptData
): Promise<Receipt> {
  return await api.path("/receipts").body(receiptData).postRequest(201);
}

/**
 * Deletes a receipt via API
 * If user is provided, logs in as that user first
 */
export async function deleteReceipt(api: RequestHandler, receiptId: string, user?: TestUser): Promise<void> {
  try {
    if (user) {
      await loginUser(api, user);
    }
    await api.path(`/receipts/${receiptId}`).deleteRequest(204);
  } catch (error) {
    // Ignore errors if receipt already deleted or doesn't exist
  }
}

/**
 * Logs out the current user
 */
export async function logoutUser(api: RequestHandler): Promise<void> {
  await api.path("/auth-logout").postRequest(200);
}

/**
 * Deletes a user from the database (for test cleanup)
 * This deletes the user, which cascades to delete sessions and receipts
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await supabase.from("users").delete().eq("id", userId);
  } catch (error) {
    // Ignore errors if user already deleted or doesn't exist
  }
}

