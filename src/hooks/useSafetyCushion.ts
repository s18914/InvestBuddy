import { useAssets } from "./useAssets";

export function useSafetyCushion() {
  const {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch,
  } = useAssets("safety_cushion");

  const totalValue = assets.reduce(
    (sum, asset) => sum + Number(asset.current_value),
    0
  );

  return {
    cushionAssets: assets,
    totalCushionValue: totalValue,
    loading,
    error,
    addCushionAsset: addAsset,
    updateCushionAsset: updateAsset,
    deleteCushionAsset: deleteAsset,
    refetchCushion: refetch,
  };
}
