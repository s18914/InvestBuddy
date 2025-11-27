import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { SafetyCushionStep } from "@/components/onboarding/SafetyCushionStep";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { QuestionnaireAnswers } from "@/services/questionnaireService";

type OnboardingStep = "mifid" | "basic-info" | "safety-cushion" | "complete";

interface BasicInfo {
  age: number;
  monthlyLivingCosts: number;
}

interface SafetyCushionAllocation {
  deposits: number;
  savingsAccounts: number;
  inflationBonds: number;
}

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("mifid");
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    age: 0,
    monthlyLivingCosts: 0,
  });
  const [cushionAllocation, setCushionAllocation] =
    useState<SafetyCushionAllocation>({
      deposits: 12.5,
      savingsAccounts: 12.5,
      inflationBonds: 75,
    });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mifidAnswers, setMifidAnswers] = useState<QuestionnaireAnswers | null>(
    null
  );

  const targetCushionAmount = basicInfo.monthlyLivingCosts * 6;

  const handleMiFIDComplete = async (answers: QuestionnaireAnswers) => {
    if (!user) return;

    try {
      setMifidAnswers(answers);

      const { error } = await supabase.from("mifid_responses").insert({
        user_id: user.id,
        question_1_answer: answers.question_1,
        question_2_answer: answers.question_2,
        question_3_answer: answers.question_3,
        question_4_answer: answers.question_4,
        question_5_answer: answers.question_5,
        question_6_answer: answers.question_6,
        total_score: 0,
        investor_profile: "balanced",
      });

      if (error) {
        console.error("Error saving MiFID responses:", error);
        alert("Błąd podczas zapisywania ankiety. Spróbuj ponownie.");
        return;
      }

      setCurrentStep("basic-info");
    } catch (error) {
      console.error("Unexpected error in MiFID:", error);
      alert("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    }
  };

  const handleBasicInfoSubmit = (info: BasicInfo) => {
    setBasicInfo(info);
    setCurrentStep("safety-cushion");
  };

  const handleSafetyCushionSubmit = async (
    allocation: SafetyCushionAllocation
  ) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save safety cushion portfolio to database
      const cushionAssets = [];

      if (allocation.deposits > 0) {
        cushionAssets.push({
          user_id: user.id,
          name: "Lokaty",
          category: "deposits",
          current_value: (targetCushionAmount * allocation.deposits) / 100,
          target_allocation: allocation.deposits,
          color: "#3b82f6",
          is_safety_cushion: true,
        });
      }

      if (allocation.savingsAccounts > 0) {
        cushionAssets.push({
          user_id: user.id,
          name: "Konta oszczędnościowe",
          category: "savings_accounts",
          current_value:
            (targetCushionAmount * allocation.savingsAccounts) / 100,
          target_allocation: allocation.savingsAccounts,
          color: "#10b981",
          is_safety_cushion: true,
        });
      }

      if (allocation.inflationBonds > 0) {
        cushionAssets.push({
          user_id: user.id,
          name: "Obligacje indeksowane inflacją",
          category: "bonds",
          current_value:
            (targetCushionAmount * allocation.inflationBonds) / 100,
          target_allocation: allocation.inflationBonds,
          color: "#f59e0b",
          is_safety_cushion: true,
        });
      }

      // Insert assets into database
      const { error: assetsError } = await supabase
        .from("assets")
        .insert(cushionAssets);

      if (assetsError) {
        console.error("Error saving safety cushion:", assetsError);
        alert(
          "Błąd podczas zapisywania poduszki finansowej. Spróbuj ponownie."
        );
        return;
      }

      // Save user settings with cushion target amount
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          safety_cushion_target: targetCushionAmount,
          safety_cushion_achieved: false,
        });

      if (settingsError) {
        console.error("Error saving user settings:", settingsError);
      }

      // Update profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      setCurrentStep("complete");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Unexpected error during onboarding:", error);
      alert("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">🎉 Gratulacje!</CardTitle>
            <CardDescription className="text-lg mt-4">
              Twoja poduszka finansowa została skonfigurowana. Za chwilę
              zostaniesz przekierowany do strony głównej.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Witaj w InvestBuddy!
          </h1>
          <p className="mt-2 text-gray-600">
            Pomożemy Ci skonfigurować Twoją poduszką finansową
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            <div
              className={`flex items-center flex-shrink-0 ${
                currentStep === "mifid" ? "text-blue-600" : "text-green-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "mifid"
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium text-sm">MiFID</span>
            </div>
            <div className="w-8 h-1 bg-gray-300 flex-shrink-0"></div>
            <div
              className={`flex items-center flex-shrink-0 ${
                currentStep === "basic-info"
                  ? "text-blue-600"
                  : currentStep === "mifid"
                  ? "text-gray-400"
                  : "text-green-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "basic-info"
                    ? "bg-blue-600 text-white"
                    : currentStep === "mifid"
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-600 text-white"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium text-sm">Dane</span>
            </div>
            <div className="w-8 h-1 bg-gray-300 flex-shrink-0"></div>
            <div
              className={`flex items-center flex-shrink-0 ${
                currentStep === "safety-cushion"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "safety-cushion"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium text-sm">Poduszka</span>
            </div>
          </div>
        </div>

        {currentStep === "mifid" && (
          <QuestionnaireForm
            onComplete={handleMiFIDComplete}
            onBack={() => navigate("/login")}
          />
        )}

        {currentStep === "basic-info" && (
          <BasicInfoStep onSubmit={handleBasicInfoSubmit} />
        )}

        {currentStep === "safety-cushion" && (
          <SafetyCushionStep
            monthlyLivingCosts={basicInfo.monthlyLivingCosts}
            targetAmount={targetCushionAmount}
            initialAllocation={cushionAllocation}
            onSubmit={handleSafetyCushionSubmit}
            onBack={() => setCurrentStep("basic-info")}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
