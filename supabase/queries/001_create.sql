-- SQL PRACTICE (for my project portfolio)
--
-- Challenge 1: CREATE - Test Data Setup
-- 
-- Scenario: Create 50 test receipts for a user.
--
-- Requirements:
-- - Use a single INSERT with a subquery to get the user_id
-- - Store names: "walgreens", "kwiktrip", "target" (rotate evenly, must match retailerInfo.json keys)
-- - Totals between $15.00 and $150.00
-- - Purchase dates spread over the last 3 months
-- - At least 20% marked as favorites
-- - Use nested SELECT to ensure the user exists before inserting
-- 
-- Constraints: One INSERT statement. No loops or functions.

INSERT INTO receipts (store_name, user_id, total, purchase_date, purchase_time, receipt_items, subtotal, tax, is_favorite)
SELECT
    (ARRAY['walgreens', 'kwiktrip', 'target'])[(row_num % 3) + 1],
    (SELECT id FROM users WHERE email = 'boutchersj@gmail.com' LIMIT 1),
    total_val,
    substring(purchase_ts::text, 1, 10),
    substring(purchase_ts::text, 12, 8),
    '[]'::jsonb,
    ROUND(CAST(total_val / (1 + tax_rate) AS numeric), 2),
    ROUND(CAST(total_val - (total_val / (1 + tax_rate)) AS numeric), 2),
    CASE WHEN row_num % 5 < 1 THEN true ELSE false END
FROM (
    SELECT 
        row_num,
        ROUND(CAST(RANDOM() * (150 - 15) + 15 AS numeric), 2) AS total_val,
        (0.05 + RANDOM() * 0.05) AS tax_rate,
        CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '90 days') AS purchase_ts
    FROM generate_series(1, 50) AS row_num
) AS calc
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'boutchersj@gmail.com')
