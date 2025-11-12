import { AssetCategory } from "./database.types";

export interface AssetTypeConfig {
  category: AssetCategory;
  label: string;
  color: string;
}

export const PREDEFINED_ASSETS: AssetTypeConfig[] = [
  { category: "bonds", label: "Obligacje", color: "#A200D6" },
  { category: "deposits", label: "Lokaty", color: "#00f2ffff" },
  {
    category: "savings_accounts",
    label: "Konto oszczędnościowe",
    color: "#5401D7",
  },
  { category: "investment_funds", label: "Fundusze", color: "#0077ffff" },
  { category: "ike_ikze", label: "IKE/IKZE", color: "#ff0059ff" },
  { category: "ppk", label: "PPK", color: "#66ff00ff" },
  { category: "gold", label: "Złoto", color: "#fff700ff" },
  { category: "currencies", label: "Waluty", color: "#ffa600ff" },
  { category: "cash", label: "Gotówka", color: "#00ff88ff" },
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
  color: "#ACA9A7",
};
