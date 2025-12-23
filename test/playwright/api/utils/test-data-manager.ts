import type { TestUser, TestReceiptData } from "./helpers";
import type { Receipt } from "../../../../src/types/receipt";
import {
  createUserInDB,
  createReceiptInDB,
  deleteUserFromDB,
  deleteReceiptFromDB
} from "./db-setup";

interface TrackedUser {
  userId: string;
  user: TestUser;
}

/**
 * Manages test data lifecycle - tracks created entities and cleans them up automatically
 * Uses DB setup for fast, reliable test data creation
 */
export class TestDataManager {
  private receipts: string[] = [];
  private users: TrackedUser[] = [];

  /**
   * Creates a user in the database (for test setup)
   * Returns the created user with ID
   */
  async createUser(user: TestUser): Promise<{ id: string; email: string; username: string }> {
    const createdUser = await createUserInDB(user);
    
    // Track user for cleanup
    this.trackUser(createdUser.id, user);
    
    return createdUser;
  }

  /**
   * Creates a receipt in the database (for test setup)
   * Returns the created receipt
   */
  async createReceipt(
    userId: string,
    receiptData: TestReceiptData
  ): Promise<Receipt> {
    const receipt = await createReceiptInDB(userId, receiptData);
    
    // Always track for cleanup
    if (receipt.id) {
      this.trackReceipt(receipt.id);
    }
    
    return receipt;
  }

  /**
   * Track a user for automatic cleanup
   */
  private trackUser(userId: string, user: TestUser): void {
    this.users.push({ userId, user });
  }

  /**
   * Track a receipt for automatic cleanup
   */
  private trackReceipt(receiptId: string): void {
    this.receipts.push(receiptId);
  }

  /**
   * Clean up all tracked test data
   * Order: Delete receipts, then delete users (cascades to delete sessions)
   * Note: Deleting users automatically deletes their sessions via ON DELETE CASCADE
   */
  async cleanup(): Promise<void> {
    if (this.receipts.length === 0 && this.users.length === 0) {
      return; // Nothing to clean up
    }

    // Delete receipts first (explicit cleanup)
    const receiptPromises = this.receipts.map(receiptId => deleteReceiptFromDB(receiptId));
    await Promise.all(receiptPromises);
    this.receipts = [];

    // Delete users (this cascades to delete their sessions via ON DELETE CASCADE)
    // Sessions are automatically cleaned up when users are deleted
    const userPromises = this.users.map(({ userId }) => deleteUserFromDB(userId));
    await Promise.all(userPromises);
    this.users = [];
  }
}

