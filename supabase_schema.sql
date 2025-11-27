-- InvestBuddy Database Schema for Supabase

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MiFID questionnaire responses
CREATE TABLE mifid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_1_answer TEXT NOT NULL,
  question_2_answer TEXT NOT NULL,
  question_3_answer TEXT NOT NULL,
  question_4_answer TEXT NOT NULL,
  question_5_answer TEXT NOT NULL,
  question_6_answer TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  investor_profile TEXT NOT NULL CHECK (investor_profile IN ('cautious', 'stable', 'balanced', 'dynamic')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Target portfolio configuration
CREATE TABLE target_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  target_percentage DECIMAL(5,2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, asset_name)
);

-- Asset types enum
CREATE TYPE asset_category AS ENUM (
  'bonds',
  'deposits',
  'savings_accounts',
  'investment_funds',
  'foreign_stocks',
  'ike_ikze',
  'ppk',
  'gold',
  'currencies',
  'cash',
  'custom'
);

-- Portfolio types enum
CREATE TYPE portfolio_type AS ENUM (
  'safety_cushion',
  'target',
  'real'
);

-- Assets (actual holdings)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category asset_category NOT NULL,
  color TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_allocation DECIMAL(5,2) DEFAULT 0,
  currency TEXT DEFAULT 'PLN',
  portfolio_type portfolio_type DEFAULT 'real',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for bonds
CREATE TABLE bond_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  bond_type TEXT NOT NULL,
  is_inflation_linked BOOLEAN DEFAULT FALSE,
  inflation_rate DECIMAL(5,2),
  interest_rate DECIMAL(5,2) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for deposits
CREATE TABLE deposit_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  maturity_date DATE NOT NULL,
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for savings accounts
CREATE TABLE savings_account_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  account_name TEXT,
  interest_rate DECIMAL(5,2) NOT NULL,
  last_interest_calculation DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for IKE/IKZE
CREATE TABLE retirement_account_details (
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('IKE', 'IKZE')),
  annual_limit DECIMAL(12,2) NOT NULL,
  contributed_this_year DECIMAL(12,2) DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for investment funds
CREATE TABLE fund_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  fund_name TEXT NOT NULL,
  fund_category TEXT NOT NULL CHECK (fund_category IN ('equity', 'mixed', 'absolute_return', 'bonds', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for gold
CREATE TABLE gold_details (
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE PRIMARY KEY,
  ounces DECIMAL(12,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for currencies
CREATE TABLE currency_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special asset details for foreign stocks
CREATE TABLE foreign_stock_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  stock_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (purchases and sales)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity DECIMAL(12,4),
  price_per_unit DECIMAL(12,2),
  total_amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly portfolio snapshots
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  asset_breakdown JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- User settings
CREATE TABLE user_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  minimum_cash_level DECIMAL(12,2) DEFAULT 0,
  monthly_savings_amount DECIMAL(12,2) DEFAULT 0,
  default_allocation JSONB,
  safety_cushion_target DECIMAL(12,2) DEFAULT 0,
  safety_cushion_achieved BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts/Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_portfolio_type ON assets(user_id, portfolio_type);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mifid_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bond_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE retirement_account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own mifid" ON mifid_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mifid" ON mifid_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mifid" ON mifid_responses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own target portfolio" ON target_portfolio FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- Policies for asset details tables (join through assets table)
CREATE POLICY "Users can manage own bond details" ON bond_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = bond_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own deposit details" ON deposit_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = deposit_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own savings details" ON savings_account_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = savings_account_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own retirement details" ON retirement_account_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = retirement_account_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own fund details" ON fund_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = fund_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own gold details" ON gold_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = gold_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own currency details" ON currency_details FOR ALL 
  USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = currency_details.asset_id AND assets.user_id = auth.uid()));

CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own snapshots" ON portfolio_snapshots FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_portfolio_updated_at BEFORE UPDATE ON target_portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
