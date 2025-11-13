import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Asset } from "@/types/database.types";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveAssetDetails,
  deleteAssetDetails,
} from "@/services/assetDetailsService";

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAssets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setAssets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const addAsset = async (
    asset: Omit<Asset, "id" | "user_id" | "created_at" | "updated_at">,
    details?: any
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([{ ...asset, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      if (details && data) {
        await saveAssetDetails({
          assetId: data.id,
          category: asset.category,
          details,
        });
      }

      setAssets([...assets, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setAssets(assets.map((a) => (a.id === id ? data : a)));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const asset = assets.find((a) => a.id === id);

      if (asset) {
        await deleteAssetDetails(id, asset.category);
      }

      const { error } = await supabase.from("assets").delete().eq("id", id);

      if (error) throw error;
      setAssets(assets.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: fetchAssets,
  };
}
