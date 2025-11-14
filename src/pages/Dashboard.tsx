import { useState } from "react";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import {
  QuestionnaireAnswers,
  QuestionnaireResult,
} from "@/services/questionnaireService";
import WelcomeScreen from "@/components/questionnaire/WelcomeScreen";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import ResultScreen from "@/components/questionnaire/ResultScreen";

type QuestionnaireStep = "welcome" | "questionnaire" | "result" | "completed";

export default function Dashboard() {
  const { loading, hasCompleted, submitQuestionnaire } = useQuestionnaire();
  const [step, setStep] = useState<QuestionnaireStep>("welcome");
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">
            Portfolio chart will be displayed here
          </p>
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
