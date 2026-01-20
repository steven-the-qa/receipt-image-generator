-- Fixes receipts where the total doesn't match (subtotal + tax).
--
-- This query corrects data inconsistencies by:
-- - Finding receipts where the difference between total and (subtotal + tax) exceeds $0.01
-- - Recalculating total as subtotal + tax (rounded to 2 decimal places)
-- - Updating the updated_at timestamp to reflect the correction
-- - Only affecting receipts from users created within the last 6 months
--
-- Implementation details:
-- - Uses ABS() to check for discrepancies regardless of whether total is too high or too low
-- - Uses a subquery in the WHERE clause to filter by user creation date
-- - Updates both total and updated_at in a single statement

UPDATE receipts
SET 
    total = ROUND(CAST(subtotal + tax AS numeric), 2),
    updated_at = CURRENT_TIMESTAMP
WHERE 
    ABS(total - (subtotal + tax)) > 0.01
    AND user_id IN (
        SELECT id FROM users WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '6 months'
    );
