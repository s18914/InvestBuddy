import { useState } from "react";
import { useAssets } from "@/hooks/useAssets";
import { AssetCategory } from "@/types/database.types";
import AssetTypeSelector from "@/components/AssetTypeSelector";
import AssetDetailsWizard from "@/components/AssetDetailsWizard";
import AssetList from "@/components/AssetList";
import PortfolioPieChart from "@/components/PortfolioPieChart";
import { AssetWithDetails } from "@/types/assetForms.types";

type Step = "selector" | "details" | "portfolio";

export default function Profile() {
  const { assets, loading, addAsset, updateAsset, deleteAsset, refetch } =
    useAssets();
  const [step, setStep] = useState<Step>("selector");
  const [selectedTypes, setSelectedTypes] = useState<AssetCategory[]>([]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (assets.length > 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio Management
          </h1>
          <p className="text-gray-600">Manage your investment portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AssetList
              assets={assets}
              onUpdate={updateAsset}
              onDelete={deleteAsset}
            />
          </div>

          <div className="lg:sticky lg:top-6 h-fit">
            <PortfolioPieChart assets={assets} />
          </div>
        </div>
      </div>
    );
  }

  const handleContinue = (types: AssetCategory[]) => {
    setSelectedTypes(types);
    setStep("details");
  };

  const handleBack = () => {
    setStep("selector");
  };

  const handleSave = async (assetsToSave: AssetWithDetails[]) => {
    for (const asset of assetsToSave) {
      await addAsset(
        {
          name: asset.name,
          category: asset.category,
          color: asset.color,
          current_value: asset.current_value,
          currency: asset.currency,
        },
        asset.details
      );
    }
    await refetch();
    setStep("portfolio");
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {step === "selector" && <AssetTypeSelector onContinue={handleContinue} />}

      {step === "details" && (
        <AssetDetailsWizard
          selectedTypes={selectedTypes}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
