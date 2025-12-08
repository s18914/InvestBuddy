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
import {
  ModelPortfolioStep,
  ModelPortfolioAsset,
} from "@/components/onboarding/ModelPortfolioStep";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import ResultScreen from "@/components/questionnaire/ResultScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useTestMode } from "@/contexts/TestModeContext";
import { supabase } from "@/lib/supabase";
import {
  QuestionnaireAnswers,
  calculateProfile,
  QuestionnaireResult,
} from "@/services/questionnaireService";
import { saveAssetDetails } from "@/services/assetDetailsService";
import TestModeToggle from "@/components/TestModeToggle";

type OnboardingStep =
  | "mifid"
  | "mifid-summary"
  | "basic-info"
  | "safety-cushion"
  | "model-portfolio"
  | "complete";

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
  const { getCurrentDate } = useTestMode();
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
  const [mifidResult, setMifidResult] = useState<QuestionnaireResult | null>(
    null
  );

  const targetCushionAmount = basicInfo.monthlyLivingCosts * 6;

  const handleMiFIDComplete = async (answers: QuestionnaireAnswers) => {
    if (!user) return;

    try {
      setMifidAnswers(answers);
      const result = calculateProfile(answers);
      setMifidResult(result);

      const { error } = await supabase.from("mifid_responses").insert({
        user_id: user.id,
        question_1_answer: answers.question_1,
        question_2_answer: answers.question_2,
        question_3_answer: answers.question_3,
        question_4_answer: answers.question_4,
        question_5_answer: answers.question_5,
        question_6_answer: answers.question_6,
        total_score: result.totalScore,
        investor_profile: result.profile,
      });

      if (error) {
        console.error("Error saving MiFID responses:", error);
        alert("Błąd podczas zapisywania ankiety. Spróbuj ponownie.");
        return;
      }

      setCurrentStep("mifid-summary");
    } catch (error) {
      console.error("Unexpected error in MiFID:", error);
      alert("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    }
  };

  const handleMiFIDSummaryComplete = () => {
    setCurrentStep("basic-info");
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
      const today = getCurrentDate();

      // Save deposits asset and details
      if (allocation.deposits > 0) {
        const { data: depositAsset, error: depositError } = await supabase
          .from("assets")
          .insert({
            user_id: user.id,
            name: "Lokaty",
            category: "deposits",
            current_value: (targetCushionAmount * allocation.deposits) / 100,
            target_allocation: allocation.deposits,
            portfolio_type: "safety_cushion",
            created_at: today,
          })
          .select()
          .single();

        if (depositError) {
          console.error("Error saving deposit asset:", depositError);
          throw depositError;
        }

        await saveAssetDetails({
          assetId: depositAsset.id,
          category: "deposits",
          details: {
            bank_name: "Nieokreślony",
            interest_rate: 0,
            start_date: today,
            duration_months: 12,
          },
        });
      }

      // Save savings accounts asset and details
      if (allocation.savingsAccounts > 0) {
        const { data: savingsAsset, error: savingsError } = await supabase
          .from("assets")
          .insert({
            user_id: user.id,
            name: "Konta oszczędnościowe",
            category: "savings_accounts",
            current_value:
              (targetCushionAmount * allocation.savingsAccounts) / 100,
            target_allocation: allocation.savingsAccounts,
            portfolio_type: "safety_cushion",
            created_at: today,
          })
          .select()
          .single();

        if (savingsError) {
          console.error("Error saving savings asset:", savingsError);
          throw savingsError;
        }

        await saveAssetDetails({
          assetId: savingsAsset.id,
          category: "savings_accounts",
          details: {
            account_name: "Konto oszczędnościowe",
            interest_rate: 0,
          },
        });
      }

      // Save bonds asset and details (EDO - 10-year inflation-indexed)
      if (allocation.inflationBonds > 0) {
        const { data: bondAsset, error: bondError } = await supabase
          .from("assets")
          .insert({
            user_id: user.id,
            name: "Obligacje EDO (10-letnie)",
            category: "bonds",
            current_value:
              (targetCushionAmount * allocation.inflationBonds) / 100,
            target_allocation: allocation.inflationBonds,
            portfolio_type: "safety_cushion",
            created_at: today,
          })
          .select()
          .single();

        if (bondError) {
          console.error("Error saving bond asset:", bondError);
          throw bondError;
        }

        await saveAssetDetails({
          assetId: bondAsset.id,
          category: "bonds",
          details: {
            bond_type: "EDO",
            interest_rate: 0,
            inflation_rate: 0,
            purchase_date: today,
          },
        });
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

      // Move to model portfolio step
      setCurrentStep("model-portfolio");
    } catch (error) {
      console.error("Unexpected error during onboarding:", error);
      alert("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelPortfolioSubmit = async (assets: ModelPortfolioAsset[]) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const today = getCurrentDate();

      // Save each asset with its details
      for (const asset of assets) {
        const { data: savedAsset, error: assetError } = await supabase
          .from("assets")
          .insert({
            user_id: user.id,
            name: asset.name,
            category: asset.category,
            current_value: 0,
            target_allocation: asset.allocation,
            portfolio_type: "target",
            created_at: today,
          })
          .select()
          .single();

        if (assetError) {
          console.error("Error saving asset:", assetError);
          throw assetError;
        }

        // Save asset details based on category
        if (asset.category === "bonds" && asset.bondType) {
          await saveAssetDetails({
            assetId: savedAsset.id,
            category: "bonds",
            details: {
              bond_type: asset.bondType,
              interest_rate: 0,
              inflation_rate:
                asset.bondType === "EDO" || asset.bondType === "COI" ? 0 : null,
              purchase_date: today,
            },
          });
        } else if (
          asset.category === "investment_funds" &&
          asset.fundCategory
        ) {
          await saveAssetDetails({
            assetId: savedAsset.id,
            category: "investment_funds",
            details: {
              fund_name: asset.name,
              fund_category: asset.fundCategory,
            },
          });
        }
      }

      // Mark onboarding as complete
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
      console.error("Unexpected error during model portfolio setup:", error);
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
              Twój portfel został skonfigurowany! Za chwilę zostaniesz
              przekierowany do strony głównej, gdzie możesz zacząć dodawać swoje
              aktywa.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <TestModeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Witaj w InvestBuddy!
          </h1>
          <p className="mt-2 text-gray-600">
            Pomożemy Ci skonfigurować Twój portfel inwestycyjny
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
                  : currentStep === "mifid" || currentStep === "mifid-summary"
                  ? "text-gray-400"
                  : "text-green-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "basic-info"
                    ? "bg-blue-600 text-white"
                    : currentStep === "mifid" || currentStep === "mifid-summary"
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
                  : currentStep === "mifid" ||
                    currentStep === "mifid-summary" ||
                    currentStep === "basic-info"
                  ? "text-gray-400"
                  : "text-green-600"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "safety-cushion"
                    ? "bg-blue-600 text-white"
                    : currentStep === "mifid" ||
                      currentStep === "mifid-summary" ||
                      currentStep === "basic-info"
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-600 text-white"
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium text-sm">Poduszka</span>
            </div>
            <div className="w-8 h-1 bg-gray-300 flex-shrink-0"></div>
            <div
              className={`flex items-center flex-shrink-0 ${
                currentStep === "model-portfolio"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === "model-portfolio"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                4
              </div>
              <span className="ml-2 font-medium text-sm">Portfel</span>
            </div>
          </div>
        </div>

        {currentStep === "mifid" && (
          <QuestionnaireForm
            onComplete={handleMiFIDComplete}
            onBack={() => navigate("/login")}
          />
        )}

        {currentStep === "mifid-summary" && mifidResult && (
          <ResultScreen
            profile={mifidResult.profile}
            totalScore={mifidResult.totalScore}
            onContinue={handleMiFIDSummaryComplete}
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

        {currentStep === "model-portfolio" && (
          <ModelPortfolioStep
            onSubmit={handleModelPortfolioSubmit}
            onBack={() => setCurrentStep("safety-cushion")}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
