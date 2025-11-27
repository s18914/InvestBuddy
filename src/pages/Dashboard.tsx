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

type QuestionnaireStep = "welcome" | "questionnaire" | "result" | "completed";

export default function Dashboard() {
  const { loading, hasCompleted, submitQuestionnaire } = useQuestionnaire();
  const { assets, loading: assetsLoading } = useAssets();
  const [step, setStep] = useState<QuestionnaireStep>("welcome");
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  if (hasCompleted && step === "welcome") {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Witaj ponownie 👋
        </h1>

        <div className="space-y-6">
          <PortfolioStackedChart />

          {assets.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                Nie masz jeszcze żadnych aktywów w portfelu.
              </p>
              <a
                href="/profile"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Dodaj swoje pierwsze aktywa
              </a>
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
