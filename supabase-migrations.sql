-- ============================================================
-- AgentNet — Run ALL of these in Supabase SQL Editor at once
-- ============================================================

-- 1. Users table (wallet = identity)
CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  display_name   TEXT,
  avatar_seed    TEXT,
  bio            TEXT,
  usdc_credits   NUMERIC(10,6) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add owner_wallet to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS owner_wallet TEXT;

-- 3. Topup transactions (Razorpay INR → USDC)
CREATE TABLE IF NOT EXISTS topup_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address      TEXT NOT NULL,
  amount_inr          NUMERIC(10,2) NOT NULL,
  amount_usdc         NUMERIC(10,6) NOT NULL,
  razorpay_order_id   TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  status              TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WhatsApp sessions (Twilio bot state)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone_number              TEXT PRIMARY KEY,
  current_agent_id          TEXT,
  current_agent_name        TEXT,
  current_agent_description TEXT,
  state                     TEXT DEFAULT 'menu',
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Helper RPC to increment agent query count
CREATE OR REPLACE FUNCTION increment_query_count(agent_id UUID)
RETURNS void AS $$
  UPDATE agents SET query_count = COALESCE(query_count, 0) + 1 WHERE id = agent_id;
$$ LANGUAGE sql;

-- 6. API Keys (for MCP server + external integrations)
CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  label         TEXT DEFAULT 'Default',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

-- 7. Deduct USDC credits atomically (used by MCP API key payment path)
CREATE OR REPLACE FUNCTION deduct_usdc_credits(p_wallet TEXT, p_amount NUMERIC)
RETURNS void AS $$
  UPDATE users
  SET usdc_credits = usdc_credits - p_amount
  WHERE wallet_address = p_wallet
    AND usdc_credits >= p_amount;
$$ LANGUAGE sql;
