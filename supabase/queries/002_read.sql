-- Generates a user activity report showing receipt statistics per user.
--
-- This query returns the following metrics for each user:
-- - User email and username
-- - Total number of receipts created
-- - Average receipt total amount
-- - Most recent receipt purchase date
-- - Store name that appears most frequently in their receipts
--
-- Results are ordered by total receipts (descending) and limited to the top 10 users.
--
-- Implementation details:
-- - Uses LEFT JOIN to include users even if they have no receipts
-- - Groups by user to aggregate receipt data
-- - Uses a correlated subquery to find the most frequent store name per user
-- - Handles ties in store frequency by selecting alphabetically first store name

SELECT
    u.email,
    u.username,
    COUNT(r.id) AS total_receipts,
    ROUND(AVG(r.total), 2) AS avg_receipt_total,
    MAX(r.purchase_date) AS most_recent_receipt_date,
    (
        SELECT store_name
        FROM receipts
        WHERE user_id = u.id
        GROUP BY store_name
        ORDER BY COUNT(*) DESC, store_name ASC
        LIMIT 1
    ) AS most_frequent_store
FROM users u
LEFT JOIN receipts r ON u.id = r.user_id
GROUP BY u.id, u.email, u.username
ORDER BY total_receipts DESC
LIMIT 10;