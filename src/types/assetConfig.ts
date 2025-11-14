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
    color: "#5F4B8B",
  },
  { category: "investment_funds", label: "Fundusze", color: "#6667AB" },
  { category: "bonds", label: "Obligacje", color: "#BB2649" },
  { category: "ike_ikze", label: "IKE/IKZE", color: "#FF6F61" },
  { category: "ppk", label: "PPK", color: "#FFBE98" },
  { category: "gold", label: "Złoto", color: "#F5DF4D" },
  { category: "currencies", label: "Waluty", color: "#ffb937ff" },
  { category: "cash", label: "Gotówka", color: "#A47864" },
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
