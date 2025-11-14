import { useState } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import { AssetCategory } from "@/types/database.types";
import AssetTypeSelector from "@/components/AssetTypeSelector";
import AssetDetailsWizard from "@/components/AssetDetailsWizard";
import InvestorProfileCard from "@/components/InvestorProfileCard";
import UserSettingsCard from "@/components/UserSettingsCard";
import { AssetWithDetails } from "@/types/assetForms.types";

type Step = "selector" | "details" | "portfolio";

export default function Profile() {
  const { assets, loading, addAsset, refetch } = useAssets();
  const { response: questionnaireResponse, loading: questionnaireLoading } =
    useQuestionnaire();
  const [step, setStep] = useState<Step>("selector");
  const [selectedTypes, setSelectedTypes] = useState<AssetCategory[]>([]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie profilu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (assets.length > 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InvestorProfileCard
            response={questionnaireResponse}
            loading={questionnaireLoading}
          />
          <UserSettingsCard />
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
