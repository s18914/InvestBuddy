import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CustomAssetFormData } from "@/types/assetForms.types";
import { CUSTOM_ASSET_COLORS } from "@/types/assetConfig";

interface CustomAssetsFormProps {
  onDataChange: (assets: CustomAssetFormData[]) => void;
  initialData?: CustomAssetFormData[];
}

export default function CustomAssetsForm({
  onDataChange,
  initialData = [],
}: CustomAssetsFormProps) {
  const [assets, setAssets] = useState<CustomAssetFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyAsset()]
  );

  function createEmptyAsset(): CustomAssetFormData {
    return {
      current_value: 0,
      name: "",
      color: CUSTOM_ASSET_COLORS[0],
    };
  }

  const updateAsset = (
    index: number,
    field: keyof CustomAssetFormData,
    value: any
  ) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
    onDataChange(newAssets);
  };

  const addAsset = () => {
    const newAssets = [...assets, createEmptyAsset()];
    setAssets(newAssets);
    onDataChange(newAssets);
  };

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      const newAssets = assets.filter((_, i) => i !== index);
      setAssets(newAssets);
      onDataChange(newAssets);
    }
  };

  return (
    <div className="space-y-6">
      {assets.map((asset, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Instrument {index + 1}
            </h3>
            {assets.length > 1 && (
              <button
                type="button"
                onClick={() => removeAsset(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa instrumentu *
              </label>
              <input
                type="text"
                value={asset.name}
                onChange={(e) => updateAsset(index, "name", e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. Akcje XYZ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktualna wartość (PLN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={asset.current_value || ""}
                onChange={(e) =>
                  updateAsset(
                    index,
                    "current_value",
                    parseFloat(e.target.value) || 0
                  )
                }
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolor
              </label>
              <div className="flex gap-2 flex-wrap">
                {CUSTOM_ASSET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateAsset(index, "color", color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      asset.color === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAsset}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejny instrument
      </button>
    </div>
  );
}
