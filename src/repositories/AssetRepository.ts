import {
  BaseRepository,
  RepositoryListResult,
  RepositoryResult,
} from "./BaseRepository";
import { Asset, AssetStatus } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

export class AssetRepository extends BaseRepository<Asset> {
  constructor() {
    super("assets");
  }

  async findByUserId(
    userId: string,
    portfolioType?: "safety_cushion" | "target" | "real",
    status: AssetStatus = "active"
  ): Promise<RepositoryListResult<Asset>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("status", status);

      if (portfolioType) {
        query = query.eq("portfolio_type", portfolioType);
      }

      const { data, error } = await query.order("name");
      return { data: (data as Asset[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async findByCategory(
    userId: string,
    category: string,
    status: AssetStatus = "active"
  ): Promise<RepositoryListResult<Asset>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("category", category)
        .eq("status", status)
        .order("name");

      return { data: (data as Asset[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async softDelete(id: string): Promise<RepositoryResult<Asset>> {
    return this.update(id, { status: "closed" } as Partial<Asset>);
  }

  async deleteByUserId(userId: string): Promise<RepositoryResult<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("user_id", userId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getEarliestCreatedDate(
    userId: string,
    portfolioType?: "safety_cushion" | "target" | "real"
  ): Promise<Date | null> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("created_at")
        .eq("user_id", userId);

      if (portfolioType) {
        query = query.eq("portfolio_type", portfolioType);
      }

      const { data, error } = await query
        .order("created_at", { ascending: true })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return new Date(data[0].created_at);
    } catch (error) {
      return null;
    }
  }
}
