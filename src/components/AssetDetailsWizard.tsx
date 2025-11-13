import { useState, FormEvent } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { AssetCategory } from "@/types/database.types";
import { PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG } from "@/types/assetConfig";
import { AssetWithDetails } from "@/types/assetForms.types";
import BondsForm from "./assetForms/BondsForm";
import DepositsForm from "./assetForms/DepositsForm";
import SavingsAccountsForm from "./assetForms/SavingsAccountsForm";
import FundsForm from "./assetForms/FundsForm";
import SimpleValueForm from "./assetForms/SimpleValueForm";
import CurrenciesForm from "./assetForms/CurrenciesForm";
import CustomAssetsForm from "./assetForms/CustomAssetsForm";
import RetirementAccountsForm from "./assetForms/RetirementAccountsForm";

interface AssetDetailsWizardProps {
  selectedTypes: AssetCategory[];
  onBack: () => void;
  onSave: (assets: AssetWithDetails[]) => Promise<void>;
}

export default function AssetDetailsWizard({
  selectedTypes,
  onBack,
  onSave,
}: AssetDetailsWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assetData, setAssetData] = useState<Map<AssetCategory, any>>(
    new Map()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentType = selectedTypes[currentIndex];
  const assetConfig = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
    (a) => a.category === currentType
  )!;

  const isLastAsset = currentIndex === selectedTypes.length - 1;

  const handleDataChange = (data: any) => {
    const newData = new Map(assetData);
    newData.set(currentType, data);
    setAssetData(newData);
  };

  const validateCurrentData = (): boolean => {
    const data = assetData.get(currentType);

    if (!data) {
      setError("Proszę uzupełnić wszystkie wymagane pola");
      return false;
    }

    if (currentType === "ike_ikze") {
      if (!data.user_age || data.user_age < 18) {
        setError("Proszę podać prawidłowy wiek użytkownika");
        return false;
      }
      if (!data.ike && !data.ikze) {
        setError("Proszę uzupełnić przynajmniej IKE lub IKZE");
        return false;
      }
      return true;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        setError("Dodaj przynajmniej jeden element");
        return false;
      }

      for (const item of data) {
        if (!item.current_value || item.current_value <= 0) {
          setError("Wartość musi być większa od 0");
          return false;
        }
      }
    } else {
      if (!data.current_value || data.current_value <= 0) {
        setError("Wartość musi być większa od 0");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentData()) {
      return;
    }

    setError("");
    if (currentIndex < selectedTypes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateCurrentData()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const assetsToSave: AssetWithDetails[] = [];

      for (const type of selectedTypes) {
        const data = assetData.get(type);
        const config = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
          (a) => a.category === type
        )!;

        if (type === "ike_ikze") {
          if (data.ike) {
            assetsToSave.push({
              name: "IKE",
              category: type,
              color: config.color,
              current_value: data.ike.current_value,
              currency: "PLN",
              details: {
                account_type: "IKE",
                contributed_this_year: data.ike.contributed_this_year,
                user_age: data.user_age,
              },
            });
          }
          if (data.ikze) {
            assetsToSave.push({
              name: "IKZE",
              category: type,
              color: config.color,
              current_value: data.ikze.current_value,
              currency: "PLN",
              details: {
                account_type: "IKZE",
                contributed_this_year: data.ikze.contributed_this_year,
                user_age: data.user_age,
              },
            });
          }
        } else if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            assetsToSave.push({
              name: item.name || `${config.label} ${i + 1}`,
              category: type,
              color: item.color || config.color,
              current_value: item.current_value,
              currency: "PLN",
              details: item,
            });
          }
        } else {
          assetsToSave.push({
            name: config.label,
            category: type,
            color: config.color,
            current_value: data.current_value,
            currency: "PLN",
            details: data,
          });
        }
      }

      await onSave(assetsToSave);
    } catch (err: any) {
      setError(err.message || "Nie udało się zapisać aktywów");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    const currentData = assetData.get(currentType);

    switch (currentType) {
      case "bonds":
        return (
          <BondsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "deposits":
        return (
          <DepositsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "savings_accounts":
        return (
          <SavingsAccountsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "investment_funds":
        return (
          <FundsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "ike_ikze":
        return (
          <RetirementAccountsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "ppk":
      case "cash":
        return (
          <SimpleValueForm
            onDataChange={handleDataChange}
            initialData={currentData}
            assetType={currentType}
          />
        );

      case "gold":
        return (
          <SimpleValueForm
            onDataChange={handleDataChange}
            initialData={currentData}
            assetType="gold"
          />
        );

      case "currencies":
        return (
          <CurrenciesForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      case "custom":
        return (
          <CustomAssetsForm
            onDataChange={handleDataChange}
            initialData={currentData}
          />
        );

      default:
        return <div>Nieobsługiwany typ aktywa</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {assetConfig.label}
          </h2>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {selectedTypes.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / selectedTypes.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-lg shadow-lg p-6 space-y-6"
      >
        {renderForm()}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Wstecz
          </button>

          {isLastAsset ? (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium inline-flex items-center justify-center"
            >
              {loading ? (
                "Zapisywanie..."
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Zapisz portfel
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center"
            >
              Dalej
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
