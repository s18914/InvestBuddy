import { useState, FormEvent } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { AssetCategory } from "@/types/database.types";
import {
  PREDEFINED_ASSETS,
  CUSTOM_ASSET_CONFIG,
  CUSTOM_ASSET_COLORS,
} from "@/types/assetConfig";

interface AssetDetailsFormProps {
  selectedTypes: AssetCategory[];
  onBack: () => void;
  onSave: (
    assets: Array<{
      name: string;
      category: AssetCategory;
      color: string;
      current_value: number;
      currency: string;
    }>
  ) => Promise<void>;
}

export default function AssetDetailsForm({
  selectedTypes,
  onBack,
  onSave,
}: AssetDetailsFormProps) {
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

  const isCustom = currentType === "custom";
  const currentData = assetData.get(currentType) || {
    name: isCustom ? "" : assetConfig.label,
    value: "",
    color: assetConfig.color,
  };

  const handleNext = () => {
    if (!currentData.value || (isCustom && !currentData.name)) {
      setError("Please fill in all required fields");
      return;
    }

    const newData = new Map(assetData);
    newData.set(currentType, currentData);
    setAssetData(newData);
    setError("");

    if (currentIndex < selectedTypes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentData.value || (isCustom && !currentData.name)) {
      setError("Please fill in all required fields");
      return;
    }

    const newData = new Map(assetData);
    newData.set(currentType, currentData);

    setLoading(true);
    setError("");

    try {
      const assetsToSave = selectedTypes.map((type) => {
        const data = newData.get(type)!;
        const config = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
          (a) => a.category === type
        )!;

        return {
          name: data.name || config.label,
          category: type,
          color: data.color,
          current_value: parseFloat(data.value),
          currency: "PLN",
        };
      });

      await onSave(assetsToSave);
    } catch (err: any) {
      setError(err.message || "Failed to save assets");
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentData = (field: string, value: any) => {
    setAssetData(
      new Map(assetData).set(currentType, {
        ...currentData,
        [field]: value,
      })
    );
  };

  const isLastAsset = currentIndex === selectedTypes.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {isCustom ? "Własny instrument" : assetConfig.label}
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
        {isCustom && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa instrumentu *
            </label>
            <input
              type="text"
              value={currentData.name}
              onChange={(e) => updateCurrentData("name", e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. Akcje spółki XYZ"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktualna wartość (PLN) *
          </label>
          <input
            type="number"
            step="0.01"
            value={currentData.value}
            onChange={(e) => updateCurrentData("value", e.target.value)}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {isCustom && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kolor
            </label>
            <div className="flex gap-2 flex-wrap">
              {CUSTOM_ASSET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateCurrentData("color", color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    currentData.color === color
                      ? "border-gray-900 scale-110"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
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
