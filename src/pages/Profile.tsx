import { useState } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import { useAuth } from "@/contexts/AuthContext";
import { AssetCategory } from "@/types/database.types";
import AssetTypeSelector from "@/components/AssetTypeSelector";
import AssetDetailsWizard from "@/components/AssetDetailsWizard";
import InvestorProfileCard from "@/components/InvestorProfileCard";
import UserSettingsCard from "@/components/UserSettingsCard";
import ResetProfileButton from "@/components/ResetProfileButton";
import { AssetWithDetails } from "@/types/assetForms.types";
import PortfolioPieChart from "@/components/PortfolioPieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Target, TrendingUp } from "lucide-react";
import { resetUserData } from "@/services/userResetService";

type Step = "selector" | "details" | "portfolio";

export default function Profile() {
  const { user } = useAuth();
  const { assets, loading, addAsset, refetch } = useAssets();
  const { assets: safetyCushionAssets, loading: cushionLoading } =
    useAssets("safety_cushion");
  const { assets: targetAssets, loading: targetLoading } = useAssets("target");
  const { assets: realAssets, loading: realLoading } = useAssets("real");
  const { response: questionnaireResponse, loading: questionnaireLoading } =
    useQuestionnaire();
  const [step, setStep] = useState<Step>("selector");
  const [selectedTypes, setSelectedTypes] = useState<AssetCategory[]>([]);

  const isLoading = loading || cushionLoading || targetLoading || realLoading;

  if (isLoading) {
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

  const safetyCushionTotal = safetyCushionAssets.reduce(
    (sum, a) => sum + a.current_value,
    0
  );
  const realTotal = realAssets.reduce((sum, a) => sum + a.current_value, 0);

  if (assets.length > 0) {
    const handleReset = async () => {
      if (!user) return;
      await resetUserData(user.id);
    };

    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InvestorProfileCard
            response={questionnaireResponse}
            loading={questionnaireLoading}
          />
          <UserSettingsCard />
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Poduszka finansowa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-900">
                {safetyCushionTotal.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                })}{" "}
                PLN
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {safetyCushionAssets.length}{" "}
                {safetyCushionAssets.length === 1 ? "aktywo" : "aktywów"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Portfel modelowy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-900">
                {targetAssets.length}{" "}
                {targetAssets.length === 1 ? "aktywo" : "aktywów"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Docelowa alokacja: 100%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Portfel rzeczywisty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-900">
                {realTotal.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                })}{" "}
                PLN
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {realAssets.length}{" "}
                {realAssets.length === 1 ? "aktywo" : "aktywów"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {safetyCushionAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-600" />
                  Poduszka finansowa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioPieChart assets={safetyCushionAssets} />
              </CardContent>
            </Card>
          )}

          {targetAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Portfel modelowy (alokacja docelowa)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioPieChart
                  assets={targetAssets}
                  showAllocation={true}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <ResetProfileButton onReset={handleReset} />
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
          portfolio_type: "real",
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
