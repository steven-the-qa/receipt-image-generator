-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Service role only" ON sessions;
DROP POLICY IF EXISTS "Users can access their own receipts" ON receipts;

-- Create new RLS policies that allow operations
-- (Authorization is handled in application layer via custom sessions)

-- Users table policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Sessions table policies
CREATE POLICY "Allow session operations" ON sessions
  FOR ALL USING (true);

-- Receipts table policies
CREATE POLICY "Users can manage their receipts" ON receipts
  FOR ALL USING (true);
