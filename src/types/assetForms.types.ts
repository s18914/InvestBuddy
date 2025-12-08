import { AssetCategory } from "./database.types";

export interface BaseAssetFormData {
  current_value: number;
}

export interface BondFormData extends BaseAssetFormData {
  bond_type: string;
  interest_rate: number;
  purchase_date: string;
  inflation_rate?: number;
}

export interface DepositFormData extends BaseAssetFormData {
  bank_name: string;
  interest_rate: number;
  start_date: string;
  duration_months: number;
}

export interface SavingsAccountFormData extends BaseAssetFormData {
  account_name?: string;
  interest_rate: number;
}

export interface FundFormData extends BaseAssetFormData {
  fund_name: string;
  fund_category: "equity" | "mixed" | "absolute_return" | "bonds" | "other";
}

export interface GoldFormData extends BaseAssetFormData {
  ounces: number;
  exchange_rate: number;
}

export interface CurrencyFormData extends BaseAssetFormData {
  currency_code: string;
  amount: number;
  exchange_rate: number;
}

export interface RetirementAccountFormData {
  user_age: number;
  ike?: {
    current_value: number;
    contributed_this_year: number;
  };
  ikze?: {
    current_value: number;
    contributed_this_year: number;
  };
}

export type AssetFormData =
  | BondFormData
  | DepositFormData
  | SavingsAccountFormData
  | FundFormData
  | GoldFormData
  | CurrencyFormData
  | RetirementAccountFormData
  | BaseAssetFormData;

export interface AssetWithDetails {
  name: string;
  category: AssetCategory;
  current_value: number;
  currency: string;
  details?: any;
}

export const BOND_TYPES = [
  { value: "OTS", label: "OTS", isInflationLinked: false },
  { value: "ROR", label: "ROR", isInflationLinked: true },
  { value: "DOR", label: "DOR", isInflationLinked: true },
  { value: "COI", label: "COI", isInflationLinked: true },
  { value: "EDO", label: "EDO", isInflationLinked: false },
  { value: "TOS", label: "TOS", isInflationLinked: false },
  { value: "TOZ", label: "TOZ", isInflationLinked: false },
] as const;

export const DEPOSIT_DURATIONS = [
  { value: 1, label: "1 miesiąc" },
  { value: 2, label: "2 miesiące" },
  { value: 3, label: "3 miesiące" },
  { value: 6, label: "6 miesięcy" },
  { value: 9, label: "9 miesięcy" },
  { value: 12, label: "12 miesięcy" },
  { value: 24, label: "24 miesiące" },
  { value: 36, label: "36 miesięcy" },
] as const;

export const FUND_CATEGORIES = [
  { value: "equity", label: "Akcji" },
  { value: "mixed", label: "Mieszane" },
  { value: "absolute_return", label: "Absolute Return" },
  { value: "bonds", label: "Obligacji" },
  { value: "other", label: "Pozostałe" },
] as const;

export const POPULAR_CURRENCIES = [
  { value: "USD", label: "USD - Dolar amerykański" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Funt brytyjski" },
  { value: "CHF", label: "CHF - Frank szwajcarski" },
  { value: "JPY", label: "JPY - Jen japoński" },
  { value: "CZK", label: "CZK - Korona czeska" },
  { value: "NOK", label: "NOK - Korona norweska" },
  { value: "SEK", label: "SEK - Korona szwedzka" },
  { value: "DKK", label: "DKK - Korona duńska" },
  { value: "CAD", label: "CAD - Dolar kanadyjski" },
  { value: "AUD", label: "AUD - Dolar australijski" },
] as const;
