-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  custom_store_name VARCHAR(255),
  use_custom_store_name BOOLEAN DEFAULT FALSE,
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(50),
  zip VARCHAR(20),
  phone VARCHAR(50),
  purchase_date VARCHAR(20) NOT NULL,
  purchase_time VARCHAR(20) NOT NULL,
  receipt_items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 4) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  european_format BOOLEAN DEFAULT FALSE,
  suppress_dollar_sign BOOLEAN DEFAULT TRUE,
  blurry_receipt BOOLEAN DEFAULT FALSE,
  current_typeface VARCHAR(50) DEFAULT 'font-sans',
  is_restaurant BOOLEAN DEFAULT FALSE,
  store_name_box BOOLEAN DEFAULT TRUE,
  store_address_box BOOLEAN DEFAULT TRUE,
  store_phone_box BOOLEAN DEFAULT TRUE,
  store_box BOOLEAN DEFAULT TRUE,
  purchase_date_box BOOLEAN DEFAULT TRUE,
  total_spent_box BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_is_favorite ON receipts(user_id, is_favorite);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to read their own data (we'll handle auth via custom sessions in app layer)
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

-- Allow inserts for registration (we'll validate in application layer)
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

-- Allow updates to own profile (we'll validate user_id in application layer)
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- RLS Policies for sessions table
-- Allow all operations (we'll handle auth in application layer)
CREATE POLICY "Allow session operations" ON sessions
  FOR ALL USING (true);

-- RLS Policies for receipts table
-- Allow all operations (we'll validate user_id in application layer)
CREATE POLICY "Users can manage their receipts" ON receipts
  FOR ALL USING (true);
