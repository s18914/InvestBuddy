import { useState } from "react";
import { Calendar, Plus, CheckCircle } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { AssetCategory } from "@/types/database.types";
import AssetTypeSelector from "@/components/AssetTypeSelector";
import AssetDetailsWizard from "@/components/AssetDetailsWizard";
import PortfolioUpdateForm from "@/components/PortfolioUpdateForm";
import { AssetWithDetails } from "@/types/assetForms.types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MonthSnapshot {
  id: string;
  snapshot_date: string;
  total_value: number;
  asset_breakdown: any;
  created_at: string;
}

type Step =
  | "month-select"
  | "update-form"
  | "add-new-selector"
  | "add-new-details";

export default function PortfolioUpdate() {
  const { assets, addAsset, refetch } = useAssets();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("month-select");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<AssetCategory[]>([]);
  const [snapshots, setSnapshots] = useState<MonthSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const displayName = date.toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
      });
      months.push({ value: monthStr, label: displayName });
    }

    return months;
  };

  const loadSnapshots = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_date", { ascending: false });

      if (error) throw error;
      setSnapshots(data || []);
    } catch (err: any) {
      console.error("Error loading snapshots:", err);
    }
  };

  const handleMonthSelect = async (month: string) => {
    setSelectedMonth(month);
    await loadSnapshots();
    setStep("update-form");
  };

  const handleAssetTypesSelected = (types: AssetCategory[]) => {
    setSelectedTypes(types);
    setStep("add-new-details");
  };

  const handleBack = () => {
    if (step === "add-new-details") {
      setStep("add-new-selector");
    } else if (step === "add-new-selector") {
      setStep("update-form");
    } else if (step === "update-form") {
      setStep("month-select");
    }
  };

  const handleAddNew = () => {
    setStep("add-new-selector");
  };

  const saveSnapshot = async (totalValue: number, assetBreakdown: any) => {
    if (!user || !selectedMonth) return;

    try {
      const snapshotDate = `${selectedMonth}-01`;

      const { data: existing } = await supabase
        .from("portfolio_snapshots")
        .select("id")
        .eq("user_id", user.id)
        .eq("snapshot_date", snapshotDate)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("portfolio_snapshots")
          .update({
            total_value: totalValue,
            asset_breakdown: assetBreakdown,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_snapshots").insert([
          {
            user_id: user.id,
            snapshot_date: snapshotDate,
            total_value: totalValue,
            asset_breakdown: assetBreakdown,
          },
        ]);

        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Error saving snapshot:", err);
      throw err;
    }
  };

  const handleUpdateSave = async (updates: any[]) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let totalValue = 0;
      const assetBreakdown: any = {};

      for (const update of updates) {
        await supabase
          .from("assets")
          .update({ current_value: update.new_value })
          .eq("id", update.id);

        totalValue += update.new_value;

        if (assetBreakdown[update.category]) {
          assetBreakdown[update.category] += update.new_value;
        } else {
          assetBreakdown[update.category] = update.new_value;
        }
      }

      await saveSnapshot(totalValue, assetBreakdown);
      await refetch();
      await loadSnapshots();

      setSuccess(
        `Aktualizacja portfela za ${
          generateMonthOptions().find((m) => m.value === selectedMonth)?.label
        } została zapisana!`
      );
      setStep("month-select");
      setSelectedMonth("");
    } catch (err: any) {
      setError(err.message || "Nie udało się zapisać aktualizacji portfela");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAssets = async (assetsToSave: AssetWithDetails[]) => {
    setLoading(true);
    setError("");

    try {
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
      setSuccess("Nowe aktywa zostały dodane!");
      setStep("update-form");
      setSelectedTypes([]);
    } catch (err: any) {
      setError(err.message || "Nie udało się dodać nowych aktywów");
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = generateMonthOptions();
  const isMonthCompleted = (month: string) => {
    return snapshots.some((s) => s.snapshot_date.startsWith(month));
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Aktualizacja portfela
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {step === "month-select" && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Wybierz miesiąc aktualizacji
            </h2>
            <p className="text-gray-600 text-sm">
              Wybierz miesiąc, dla którego chcesz dodać lub zaktualizować dane
              portfela. Możesz dodać wiele aktualizacji dla różnych miesięcy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthOptions.map((month) => {
              const completed = isMonthCompleted(month.value);

              return (
                <button
                  key={month.value}
                  onClick={() => handleMonthSelect(month.value)}
                  className={`relative p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    completed
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar
                        className={`h-5 w-5 ${
                          completed ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {month.label}
                        </p>
                        {completed && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Zaktualizowano
                          </p>
                        )}
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === "update-form" && (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Wróć do wyboru miesiąca
          </button>
          <PortfolioUpdateForm
            assets={assets}
            selectedMonth={selectedMonth}
            onSave={handleUpdateSave}
            onAddNew={handleAddNew}
          />
        </div>
      )}

      {step === "add-new-selector" && (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Wróć do aktualizacji
          </button>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Dodaj nowe aktywa
              </h2>
              <p className="text-gray-600 text-sm">
                Wybierz typy aktywów, które chcesz dodać do portfela.
              </p>
            </div>
            <AssetTypeSelector onContinue={handleAssetTypesSelected} />
          </div>
        </div>
      )}

      {step === "add-new-details" && (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Wróć do wyboru aktywów
          </button>
          <AssetDetailsWizard
            selectedTypes={selectedTypes}
            onBack={handleBack}
            onSave={handleAddNewAssets}
          />
        </div>
      )}
    </div>
  );
}
