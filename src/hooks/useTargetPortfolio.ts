import { useAssets } from "./useAssets";

export function useTargetPortfolio() {
  const {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch,
  } = useAssets("target");

  const totalAllocation = assets.reduce(
    (sum, asset) => sum + Number(asset.target_allocation || 0),
    0
  );

  return {
    targetAssets: assets,
    totalAllocation,
    loading,
    error,
    addTargetAsset: addAsset,
    updateTargetAsset: updateAsset,
    deleteTargetAsset: deleteAsset,
    refetchTarget: refetch,
  };
}
