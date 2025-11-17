import { AssetCategory } from "./database.types";

export interface AssetTypeConfig {
  category: AssetCategory;
  label: string;
  color: string;
}

export const PREDEFINED_ASSETS: AssetTypeConfig[] = [
  { category: "deposits", label: "Lokaty", color: "#0F4C81" },
  {
    category: "savings_accounts",
    label: "Konto oszczędnościowe",
    color: "#6127ddff",
  },
  { category: "investment_funds", label: "Fundusze", color: "#6264daff" },
  { category: "bonds", label: "Obligacje", color: "#e20035ff" },
  { category: "ike_ikze", label: "IKE/IKZE", color: "#FF6F61" },
  { category: "ppk", label: "PPK", color: "#e46600ff" },
  { category: "gold", label: "Złoto", color: "#e2c400ff" },
  { category: "currencies", label: "Waluty", color: "#df9100ff" },
  { category: "cash", label: "Gotówka", color: "#8fdb00ff" },
];

export const CUSTOM_ASSET_COLORS = [
  "#EB9349",
  "#EBD862",
  "#B0EB74",
  "#82EBAF",
  "#7CC3EB",
  "#AD8AEB",
  "#EA74E7",
];

export const CUSTOM_ASSET_CONFIG: AssetTypeConfig = {
  category: "custom",
  label: "Inne",
  color: "#939597",
};
