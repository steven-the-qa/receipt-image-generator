-- Creates 50 test receipts for a specified user using a single INSERT statement.
--
-- This query generates test data with the following characteristics:
-- - Rotates evenly through store names: "walgreens", "kwiktrip", "target" (must match retailerInfo.json keys)
-- - Generates random totals between $15.00 and $150.00
-- - Spreads purchase dates randomly over the last 3 months
-- - Marks at least 20% of receipts as favorites
-- - Uses a subquery to fetch the user_id from the users table
-- - Ensures the user exists before inserting via a WHERE EXISTS clause
-- - Calculates subtotal and tax so they sum to total (using a shared tax_rate)
--
-- Implementation details:
-- - Uses generate_series to create 50 rows
-- - Calculates tax_rate once per row and reuses it for both subtotal and tax calculations
-- - Extracts date and time components from a generated timestamp
-- - Sets receipt_items to an empty JSON array

INSERT INTO receipts (
    store_name,
    user_id,
    total,
    purchase_date,
    purchase_time,
    receipt_items,
    subtotal,
    tax,
    is_favorite
)
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
