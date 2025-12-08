import { AssetCategory } from "./database.types";

export interface AssetTypeConfig {
  category: AssetCategory;
  label: string;
  color: string;
}

// Modern, harmonious color palette for financial assets
// Colors are determined by category - NOT stored in database
export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  bonds: "#6366F1", // Indigo - stable, trustworthy
  deposits: "#8B5CF6", // Violet - secure savings
  savings_accounts: "#A855F7", // Purple - liquid savings
  investment_funds: "#3B82F6", // Blue - growth oriented
  foreign_stocks: "#2563EB", // Blue darker - international
  ike_ikze: "#0EA5E9", // Sky blue - retirement
  ppk: "#06B6D4", // Cyan - employer retirement
  gold: "#F59E0B", // Amber - precious metals
  currencies: "#10B981", // Emerald - foreign exchange
  cash: "#22C55E", // Green - liquid cash
};

// Helper function to get color by category
export function getCategoryColor(category: AssetCategory | string): string {
  return CATEGORY_COLORS[category as AssetCategory] || "#6B7280"; // Gray fallback
}

// Helper function to get label by category
export function getCategoryLabel(category: AssetCategory | string): string {
  const config = PREDEFINED_ASSETS.find((a) => a.category === category);
  return config?.label || category;
}

// Modern, harmonious color palette for financial assets
// Based on a cohesive color scheme with good contrast and accessibility
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
