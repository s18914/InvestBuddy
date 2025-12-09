import { supabase } from "@/lib/supabase";
import { AssetCategory } from "@/types/database.types";

interface AssetDetailsParams {
  assetId: string;
  category: AssetCategory;
  details: any;
}

export async function saveAssetDetails({
  assetId,
  category,
  details,
}: AssetDetailsParams) {
  try {
    switch (category) {
      case "bonds":
        return await saveBondDetails(assetId, details);

      case "deposits":
        return await saveDepositDetails(assetId, details);

      case "savings_accounts":
        return await saveSavingsAccountDetails(assetId, details);

      case "investment_funds":
        return await saveFundDetails(assetId, details);

      case "ike_ikze":
        return await saveRetirementAccountDetails(assetId, details);

      case "gold":
        return await saveGoldDetails(assetId, details);

      case "currencies":
        return await saveCurrencyDetails(assetId, details);

      default:
        return null;
    }
  } catch (error) {
    console.error("Error saving asset details:", error);
    throw error;
  }
}

async function saveBondDetails(assetId: string, details: any) {
  const bondData = {
    asset_id: assetId,
    bond_type: details.bond_type,
    is_inflation_linked:
      details.inflation_rate !== undefined && details.inflation_rate !== null,
    inflation_rate: details.inflation_rate || null,
    interest_rate: details.interest_rate,
    purchase_date: details.purchase_date,
  };

  const { data, error } = await supabase
    .from("bond_details")
    .insert([bondData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveDepositDetails(assetId: string, details: any) {
  const startDate = new Date(details.start_date);
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + details.duration_months);

  const depositData = {
    asset_id: assetId,
    bank_name: details.bank_name,
    interest_rate: details.interest_rate,
    start_date: details.start_date,
    duration_months: details.duration_months,
    maturity_date: maturityDate.toISOString().split("T")[0],
    alert_sent: false,
  };

  const { data, error } = await supabase
    .from("deposit_details")
    .insert([depositData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveSavingsAccountDetails(assetId: string, details: any) {
  const savingsData = {
    asset_id: assetId,
    account_name: details.account_name || null,
    interest_rate: details.interest_rate,
    last_interest_calculation: null,
  };

  const { data, error } = await supabase
    .from("savings_account_details")
    .insert([savingsData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveFundDetails(assetId: string, details: any) {
  const fundData = {
    asset_id: assetId,
    fund_name: details.fund_name,
    fund_category: details.fund_category,
  };

  const { data, error } = await supabase
    .from("fund_details")
    .insert([fundData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveRetirementAccountDetails(assetId: string, details: any) {
  const currentYear = new Date().getFullYear();

  const accountType = details.account_type as "IKE" | "IKZE";
  const annualLimit = accountType === "IKE" ? 23681.28 : 9472.51;

  const retirementData = {
    asset_id: assetId,
    account_type: accountType,
    annual_limit: annualLimit,
    contributed_this_year: details.contributed_this_year,
    year: currentYear,
  };

  const { data, error } = await supabase
    .from("retirement_account_details")
    .insert([retirementData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveGoldDetails(assetId: string, details: any) {
  const goldData = {
    asset_id: assetId,
    ounces: details.ounces,
    exchange_rate: details.exchange_rate || null,
  };

  const { data, error } = await supabase
    .from("gold_details")
    .insert([goldData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function saveCurrencyDetails(assetId: string, details: any) {
  const currencyData = {
    asset_id: assetId,
    currency_code: details.currency_code,
    amount: details.amount || null,
    exchange_rate: details.exchange_rate || null,
  };

  const { data, error } = await supabase
    .from("currency_details")
    .insert([currencyData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoldDetails(
  assetId: string,
  ounces: number,
  exchangeRate: number
) {
  const { error } = await supabase
    .from("gold_details")
    .update({ ounces, exchange_rate: exchangeRate })
    .eq("asset_id", assetId);

  if (error) throw error;
}

export async function updateCurrencyDetails(
  assetId: string,
  amount: number,
  exchangeRate: number
) {
  const { error } = await supabase
    .from("currency_details")
    .update({ amount, exchange_rate: exchangeRate })
    .eq("asset_id", assetId);

  if (error) throw error;
}

export async function deleteAssetDetails(
  assetId: string,
  category: AssetCategory
) {
  const tableMap: Record<string, string> = {
    bonds: "bond_details",
    deposits: "deposit_details",
    savings_accounts: "savings_account_details",
    investment_funds: "fund_details",
    ike_ikze: "retirement_account_details",
    gold: "gold_details",
    currencies: "currency_details",
  };

  const tableName = tableMap[category];
  if (!tableName) return;

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("asset_id", assetId);

  if (error) throw error;
}

export async function fetchAssetDetails(
  assetId: string,
  category: AssetCategory
) {
  const tableMap: Record<string, string> = {
    bonds: "bond_details",
    deposits: "deposit_details",
    savings_accounts: "savings_account_details",
    investment_funds: "fund_details",
    ike_ikze: "retirement_account_details",
    gold: "gold_details",
    currencies: "currency_details",
  };

  const tableName = tableMap[category];
  if (!tableName) return null;

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("asset_id", assetId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching asset details:", error);
    return null;
  }
  return data;
}

export async function fetchAllAssetDetails(
  assetIds: string[],
  category: AssetCategory
) {
  const tableMap: Record<string, string> = {
    bonds: "bond_details",
    deposits: "deposit_details",
    savings_accounts: "savings_account_details",
    investment_funds: "fund_details",
    ike_ikze: "retirement_account_details",
    gold: "gold_details",
    currencies: "currency_details",
  };

  const tableName = tableMap[category];
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .in("asset_id", assetIds);

  if (error) {
    console.error("Error fetching asset details:", error);
    return [];
  }
  return data || [];
}
