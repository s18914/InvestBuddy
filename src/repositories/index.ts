export { BaseRepository } from "./BaseRepository";
export { AssetRepository } from "./AssetRepository";
export { AssetDetailsRepository } from "./AssetDetailsRepository";
export { SnapshotRepository } from "./SnapshotRepository";
export { ValuationRepository } from "./ValuationRepository";

export const assetRepository = new AssetRepository();
export const assetDetailsRepository = new AssetDetailsRepository();
export const snapshotRepository = new SnapshotRepository();
export const valuationRepository = new ValuationRepository();
