import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { AssetCategory } from "@/types/database.types";
import { PREDEFINED_ASSETS } from "@/types/assetConfig";

interface AssetTypeSelectorProps {
  onContinue: (selectedTypes: AssetCategory[]) => void;
}

export default function AssetTypeSelector({
  onContinue,
}: AssetTypeSelectorProps) {
  const [selected, setSelected] = useState<Set<AssetCategory>>(new Set());

  const toggleAsset = (category: AssetCategory) => {
    const newSelected = new Set(selected);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelected(newSelected);
  };

  const handleContinue = () => {
    if (selected.size > 0) {
      onContinue(Array.from(selected));
    }
  };

  const allAssets = PREDEFINED_ASSETS;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Zaczynamy!</h2>
        <p className="text-gray-600">
          Zaznacz wszystkie typy aktywów, które aktualnie posiadasz
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        {allAssets.map((asset) => {
          const isSelected = selected.has(asset.category);
          return (
            <button
              key={asset.category}
              onClick={() => toggleAsset(asset.category)}
              className={`relative p-6 rounded-md border-4 hover:scale-105 transition-all duration-200 ${
                isSelected
                  ? "bg-white shadow-lg scale-105"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              style={{
                borderColor: asset.color,
                opacity: isSelected ? 1 : 0.6,
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-lg font-semibold text-gray-900 text-center">
                  {asset.label}
                </span>
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: asset.color }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
        >
          Dalej
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>

      {selected.size > 0 && (
        <p className="text-center mt-4 text-sm text-gray-600">
          Wybrano: {selected.size}{" "}
          {selected.size === 1 ? "instrument" : "instrumentów"}
        </p>
      )}
    </div>
  );
}
