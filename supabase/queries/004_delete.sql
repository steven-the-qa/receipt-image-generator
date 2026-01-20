-- Removes orphaned sessions and receipts where the referenced user no longer exists.
--
-- This cleanup query performs two operations:
-- - Deletes sessions that reference non-existent users and are older than 30 days
-- - Deletes receipts that reference non-existent users and are older than 30 days
--
-- Implementation details:
-- - Uses NOT EXISTS subqueries to identify orphaned records (more efficient than NOT IN)
-- - Filters by created_at timestamp to only delete records older than 30 days
-- - Deletes sessions first, then receipts (respects foreign key relationships)
-- - Returns counts of deleted records using CTEs with RETURNING clause

-- Delete orphaned sessions
WITH deleted_sessions AS (
    DELETE FROM sessions
    WHERE 
        NOT EXISTS (SELECT 1 FROM users WHERE users.id = sessions.user_id)
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    RETURNING session_id
)
SELECT COUNT(*) AS deleted_sessions_count FROM deleted_sessions;

-- Delete orphaned receipts
WITH deleted_receipts AS (
    DELETE FROM receipts
    WHERE 
        NOT EXISTS (SELECT 1 FROM users WHERE users.id = receipts.user_id)
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    RETURNING id
)
SELECT COUNT(*) AS deleted_receipts_count FROM deleted_receipts;
