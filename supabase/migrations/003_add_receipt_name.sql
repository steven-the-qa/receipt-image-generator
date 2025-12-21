-- Add receipt_name field to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_name VARCHAR(255);
