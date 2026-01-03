import {
  BaseRepository,
  RepositoryListResult,
  RepositoryResult,
} from "./BaseRepository";
import { supabase } from "@/lib/supabase";

interface PortfolioSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value: number;
  asset_breakdown: Record<string, number>;
  created_at: string;
}

export class SnapshotRepository extends BaseRepository<PortfolioSnapshot> {
  constructor() {
    super("portfolio_snapshots");
  }

  async findByUserId(
    userId: string
  ): Promise<RepositoryListResult<PortfolioSnapshot>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .order("snapshot_date", { ascending: false });

      return { data: (data as PortfolioSnapshot[]) || [], error };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async findByDate(
    userId: string,
    snapshotDate: string
  ): Promise<RepositoryResult<PortfolioSnapshot>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .eq("snapshot_date", snapshotDate)
        .single();

      return { data: data as PortfolioSnapshot, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async saveOrUpdate(
    userId: string,
    snapshotDate: string,
    totalValue: number,
    assetBreakdown: Record<string, number>
  ): Promise<RepositoryResult<PortfolioSnapshot>> {
    try {
      const existing = await this.findByDate(userId, snapshotDate);

      if (existing.data) {
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            total_value: totalValue,
            asset_breakdown: assetBreakdown,
          })
          .eq("id", existing.data.id)
          .select()
          .single();

        return { data: data as PortfolioSnapshot, error };
      } else {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert([
            {
              user_id: userId,
              snapshot_date: snapshotDate,
              total_value: totalValue,
              asset_breakdown: assetBreakdown,
            },
          ])
          .select()
          .single();

        return { data: data as PortfolioSnapshot, error };
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
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
}
