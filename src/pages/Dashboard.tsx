import { useState } from "react";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import { useAssets } from "@/hooks/useAssets";
import {
  QuestionnaireAnswers,
  QuestionnaireResult,
} from "@/services/questionnaireService";
import WelcomeScreen from "@/components/questionnaire/WelcomeScreen";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import ResultScreen from "@/components/questionnaire/ResultScreen";
import PortfolioStackedChart from "@/components/PortfolioStackedChart";
import AssetTypeSelector from "@/components/AssetTypeSelector";
import AssetDetailsWizard from "@/components/AssetDetailsWizard";
import { AssetCategory } from "@/types/database.types";
import { AssetWithDetails } from "@/types/assetForms.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestModeToggle from "@/components/TestModeToggle";
import AlertsSection from "@/components/AlertsSection";

type QuestionnaireStep = "welcome" | "questionnaire" | "result" | "completed";
type AddAssetStep = "idle" | "selector" | "details";

export default function Dashboard() {
  const { loading, hasCompleted, submitQuestionnaire } = useQuestionnaire();
  const {
    assets,
    loading: assetsLoading,
    addAsset,
    refetch,
  } = useAssets("real");
  const [step, setStep] = useState<QuestionnaireStep>("welcome");
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addAssetStep, setAddAssetStep] = useState<AddAssetStep>("idle");
  const [selectedTypes, setSelectedTypes] = useState<AssetCategory[]>([]);

  if (loading || assetsLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAssetTypeContinue = (types: AssetCategory[]) => {
    setSelectedTypes(types);
    setAddAssetStep("details");
  };

  const handleAssetBack = () => {
    setAddAssetStep("selector");
  };

  const handleAssetSave = async (assetsToSave: AssetWithDetails[]) => {
    for (const asset of assetsToSave) {
      await addAsset(
        {
          name: asset.name,
          category: asset.category,
          current_value: asset.current_value,
          currency: asset.currency,
          portfolio_type: "real",
        },
        asset.details
      );
    }
    await refetch();
    setAddAssetStep("idle");
  };

  if (hasCompleted && step === "welcome") {
    if (addAssetStep === "selector") {
      return (
        <div className="px-4 py-6 sm:px-0">
          <TestModeToggle />
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dodaj aktywa</h1>
            <Button variant="outline" onClick={() => setAddAssetStep("idle")}>
              Anuluj
            </Button>
          </div>
          <AssetTypeSelector onContinue={handleAssetTypeContinue} />
        </div>
      );
    }

    if (addAssetStep === "details") {
      return (
        <div className="px-4 py-6 sm:px-0">
          <TestModeToggle />
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dodaj aktywa
          </h1>
          <AssetDetailsWizard
            selectedTypes={selectedTypes}
            onBack={handleAssetBack}
            onSave={handleAssetSave}
          />
        </div>
      );
    }

    return (
      <div className="px-4 py-6 sm:px-0">
        <TestModeToggle />
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Witaj ponownie 👋
        </h1>

        <div className="space-y-6">
          <PortfolioStackedChart />

          <AlertsSection />

          {assets.length === 0 ? (
            <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  Rozpocznij budowę portfela
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Nie masz jeszcze żadnych aktywów w portfelu rzeczywistym.
                  Dodaj swoje pierwsze instrumenty inwestycyjne.
                </p>
                <Button
                  size="lg"
                  onClick={() => setAddAssetStep("selector")}
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj aktywa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button
                onClick={() => setAddAssetStep("selector")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj aktywa
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleStart = () => {
    setStep("questionnaire");
  };

  const handleBack = () => {
    setStep("welcome");
  };

  const handleComplete = async (answers: QuestionnaireAnswers) => {
    try {
      setSubmitting(true);
      const calculatedResult = await submitQuestionnaire(answers);
      setResult(calculatedResult);
      setStep("result");
    } catch (error) {
      console.error("Failed to submit questionnaire:", error);
      alert("Wystąpił błąd podczas zapisywania ankiety. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    setStep("completed");
    window.location.reload();
    window.location.href = "/profile";
  };

  if (submitting) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Zapisywanie wyników...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {step === "welcome" && <WelcomeScreen onStart={handleStart} />}

      {step === "questionnaire" && (
        <QuestionnaireForm onComplete={handleComplete} onBack={handleBack} />
      )}

      {step === "result" && result && (
        <ResultScreen
          profile={result.profile}
          totalScore={result.totalScore}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
