import { AssetCategory } from "./types/database.types";

export const RETIREMENT_LIMITS = {
  IKE: {
    2024: 23681.28,
    2025: 23681.28,
  },
  IKZE: {
    2024: 9472.51,
    2025: 9472.51,
  },
} as const;

export function getRetirementLimit(
  accountType: "IKE" | "IKZE",
  year: number = new Date().getFullYear()
): number {
  const limits = RETIREMENT_LIMITS[accountType];
  return limits[year as keyof typeof limits] || limits[2024];
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

export interface AssetTypeConfig {
  category: AssetCategory;
  label: string;
  color: string;
}

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  bonds: "#6366F1",
  deposits: "#8B5CF6",
  savings_accounts: "#A855F7",
  investment_funds: "#3B82F6",
  foreign_stocks: "#2563EB",
  ike_ikze: "#0EA5E9",
  ppk: "#06B6D4",
  gold: "#F59E0B",
  currencies: "#10B981",
  cash: "#22C55E",
};

export function getCategoryColor(category: AssetCategory | string): string {
  return CATEGORY_COLORS[category as AssetCategory] || "#6B7280";
}

export function getCategoryLabel(category: AssetCategory | string): string {
  const config = PREDEFINED_ASSETS.find((a) => a.category === category);
  return config?.label || category;
}

export const PREDEFINED_ASSETS: AssetTypeConfig[] = [
  { category: "bonds", label: "Obligacje", color: CATEGORY_COLORS.bonds },
  { category: "deposits", label: "Lokaty", color: CATEGORY_COLORS.deposits },
  {
    category: "savings_accounts",
    label: "Konto oszczędnościowe",
    color: CATEGORY_COLORS.savings_accounts,
  },
  {
    category: "investment_funds",
    label: "Fundusze",
    color: CATEGORY_COLORS.investment_funds,
  },
  { category: "ike_ikze", label: "IKE/IKZE", color: CATEGORY_COLORS.ike_ikze },
  { category: "ppk", label: "PPK", color: CATEGORY_COLORS.ppk },
  { category: "gold", label: "Złoto", color: CATEGORY_COLORS.gold },
  {
    category: "currencies",
    label: "Waluty",
    color: CATEGORY_COLORS.currencies,
  },
  { category: "cash", label: "Gotówka", color: CATEGORY_COLORS.cash },
];

export const DEFAULT_CURRENCY = "PLN";

export const PORTFOLIO_UPDATE_DAY = 15;

export const SAFETY_CUSHION_MONTHS = 6;
