import { useState, useEffect } from "react";
import { Wallet, PiggyBank, Save, Check, Loader2 } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Button } from "@/components/ui/button";

export default function UserSettingsCard() {
  const { settings, loading, updateSettings } = useUserSettings();
  const [monthlySavings, setMonthlySavings] = useState<string>("");
  const [minimumCash, setMinimumCash] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setMonthlySavings(String(settings.monthly_savings_amount || ""));
      setMinimumCash(String(settings.minimum_cash_level || ""));
    }
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    const currentMonthlySavings = settings.monthly_savings_amount || 0;
    const currentMinimumCash = settings.minimum_cash_level || 0;
    const newMonthlySavings = Number(monthlySavings) || 0;
    const newMinimumCash = Number(minimumCash) || 0;

    setHasChanges(
      currentMonthlySavings !== newMonthlySavings ||
        currentMinimumCash !== newMinimumCash
    );
  }, [monthlySavings, minimumCash, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        monthly_savings_amount: Number(monthlySavings) || 0,
        minimum_cash_level: Number(minimumCash) || 0,
      });
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ustawienia portfela
          </h3>
        </div>
        <div className="px-6 py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Ustawienia portfela
        </h3>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-green-600" />
              Miesięczna kwota oszczędności
            </div>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(e.target.value)}
              placeholder="np. 2000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-600 font-medium">PLN</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kwota, którą planujesz odkładać każdego miesiąca. Używana do
            sugestii rebalancingowych.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              Minimalny poziom gotówki
            </div>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={minimumCash}
              onChange={(e) => setMinimumCash(e.target.value)}
              placeholder="np. 5000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-600 font-medium">PLN</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            System wyświetli alert, gdy gotówka spadnie poniżej tej wartości
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Zapisywanie...
              </>
            ) : showSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Zapisano!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Zapisz ustawienia
              </>
            )}
          </Button>
        </div>

        {settings?.safety_cushion_target && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-1">
              Cel poduszki bezpieczeństwa
            </h4>
            <p className="text-lg font-bold text-emerald-700">
              {settings.safety_cushion_target.toLocaleString("pl-PL", {
                minimumFractionDigits: 2,
              })}{" "}
              PLN
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              6-miesięczna rezerwa finansowa na nieprzewidziane wydatki
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
