import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../../src/lib/supabase";
import { hashPassword } from "../../../../src/lib/password";
import type { TestUser, TestReceiptData } from "./helpers";
import type { Receipt } from "../../../../src/types/receipt";

/**
 * Get Supabase client with service role key for test cleanup (bypasses RLS)
 * Falls back to anon key if service role key is not available
 */
function getSupabaseForCleanup() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  // Use service role key if available (bypasses RLS), otherwise fall back to anon key
  const key = serviceKey || anonKey;
  if (!key) {
    throw new Error("Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Creates a user directly in the database (for test setup)
 * Returns the created user with ID
 * @internal - Use TestDataManager.createUser() instead for automatic tracking
 */
export async function createUserInDB(user: TestUser): Promise<{ id: string; email: string; username: string }> {
  const passwordHash = await hashPassword(user.password);
  
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: user.username,
      email: user.email,
      password_hash: passwordHash
    })
    .select("id, username, email, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create user in DB: ${error?.message || "Unknown error"}`);
  }

  return {
    id: data.id,
    email: data.email,
    username: data.username
  };
}

/**
 * Creates a receipt directly in the database (for test setup)
 * Returns the created receipt
 * @internal - Use TestDataManager.createReceipt() instead for automatic tracking
 */
export async function createReceiptInDB(
  userId: string,
  receiptData: TestReceiptData
): Promise<Receipt> {
  const receiptId = uuidv4();
  const now = new Date().toISOString();

  const receiptPayload = {
    id: receiptId,
    user_id: userId,
    store_name: receiptData.store_name,
    purchase_date: receiptData.purchase_date,
    purchase_time: receiptData.purchase_time,
    receipt_items: receiptData.receipt_items,
    subtotal: receiptData.subtotal,
    tax: receiptData.tax,
    total: receiptData.total,
    is_favorite: receiptData.is_favorite ?? false,
    // Default values matching schema
    custom_store_name: null,
    use_custom_store_name: false,
    address1: null,
    address2: null,
    city: null,
    state: null,
    zip: null,
    phone: null,
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
    receipt_name: null,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from("receipts")
    .insert(receiptPayload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create receipt in DB: ${error?.message || "Unknown error"}`);
  }

  return data as Receipt;
}

/**
 * Deletes a user from the database (for test cleanup)
 * This cascades to delete sessions and receipts
 * Uses service role key to bypass RLS if available
 */
export async function deleteUserFromDB(userId: string): Promise<void> {
  const client = getSupabaseForCleanup();
  const { error } = await client.from("users").delete().eq("id", userId);
  if (error) {
    // Silently ignore errors - user might already be deleted
  }
}

/**
 * Deletes a receipt from the database (for test cleanup)
 * Uses service role key to bypass RLS if available
 */
export async function deleteReceiptFromDB(receiptId: string): Promise<void> {
  const client = getSupabaseForCleanup();
  const { error } = await client.from("receipts").delete().eq("id", receiptId);
  if (error) {
    // Silently ignore errors - receipt might already be deleted
  }
}

