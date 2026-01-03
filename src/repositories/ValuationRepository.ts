import {
  BaseRepository,
  RepositoryListResult,
  RepositoryResult,
} from "./BaseRepository";
import { supabase } from "@/lib/supabase";

interface AssetValuation {
  id: string;
  asset_id: string;
  valuation_date: string;
  value: number;
  quantity?: number;
  exchange_rate?: number;
  source: "manual" | "automatic";
  created_at: string;
}

export class ValuationRepository extends BaseRepository<AssetValuation> {
  constructor() {
    super("asset_valuations");
  }

  async findByAssetId(
    assetId: string
  ): Promise<RepositoryListResult<AssetValuation>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("asset_id", assetId)
        .order("valuation_date", { ascending: true });

      return { data: (data as AssetValuation[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async findByAssetIds(
    assetIds: string[]
  ): Promise<RepositoryListResult<AssetValuation>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .in("asset_id", assetIds)
        .order("valuation_date", { ascending: true });

      return { data: (data as AssetValuation[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async saveValuation(
    assetId: string,
    valuationDate: string,
    value: number,
    source: "manual" | "automatic" = "manual",
    quantity?: number,
    exchangeRate?: number
  ): Promise<RepositoryResult<AssetValuation>> {
    try {
      const valuationData: any = {
        asset_id: assetId,
        valuation_date: valuationDate,
        value: value,
        source: source,
        created_at: new Date().toISOString(),
      };

      if (quantity !== undefined) {
        valuationData.quantity = quantity;
      }

      if (exchangeRate !== undefined) {
        valuationData.exchange_rate = exchangeRate;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(valuationData, { onConflict: "asset_id,valuation_date" })
        .select()
        .single();

      return { data: data as AssetValuation, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteByAssetId(assetId: string): Promise<RepositoryResult<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("asset_id", assetId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
