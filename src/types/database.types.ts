export type AssetCategory =
  | "bonds"
  | "deposits"
  | "savings_accounts"
  | "investment_funds"
  | "ike_ikze"
  | "ppk"
  | "gold"
  | "currencies"
  | "cash"
  | "custom";

export type TransactionType = "buy" | "sell";

export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface MifidResponse {
  id: string;
  user_id: string;
  risk_tolerance: string;
  investment_horizon: string;
  financial_goals: string[];
  sector_preferences: string[];
  completed_at: string;
}

export interface TargetPortfolio {
  id: string;
  user_id: string;
  asset_name: string;
  asset_type: string;
  target_percentage: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory;
  color: string;
  current_value: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface BondDetails {
  id: string;
  asset_id: string;
  bond_type: string;
  is_inflation_linked: boolean;
  inflation_rate: number | null;
  interest_rate: number;
  purchase_date: string;
  created_at: string;
}

export interface DepositDetails {
  id: string;
  asset_id: string;
  bank_name: string;
  interest_rate: number;
  start_date: string;
  duration_months: number;
  maturity_date: string;
  alert_sent: boolean;
  created_at: string;
}

export interface SavingsAccountDetails {
  id: string;
  asset_id: string;
  account_name: string | null;
  interest_rate: number;
  last_interest_calculation: string | null;
  created_at: string;
}

export interface RetirementAccountDetails {
  asset_id: string;
  account_type: "IKE" | "IKZE";
  annual_limit: number;
  contributed_this_year: number;
  year: number;
  created_at: string;
}

export interface FundDetails {
  id: string;
  asset_id: string;
  fund_name: string;
  fund_category: "equity" | "mixed" | "absolute_return" | "bonds" | "other";
  created_at: string;
}

export interface GoldDetails {
  asset_id: string;
  ounces: number;
  created_at: string;
}

export interface CurrencyDetails {
  id: string;
  asset_id: string;
  currency_code: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  asset_id: string;
  transaction_type: TransactionType;
  quantity: number | null;
  price_per_unit: number | null;
  total_amount: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value: number;
  asset_breakdown: Record<string, any>;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  minimum_cash_level: number;
  monthly_savings_amount: number;
  default_allocation: Record<string, any> | null;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_asset_id: string | null;
  created_at: string;
}
