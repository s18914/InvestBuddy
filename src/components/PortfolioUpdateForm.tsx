import { useState, useEffect } from "react";
import { Save, Plus, Edit2 } from "lucide-react";
import { Asset } from "@/types/database.types";
import { PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG } from "@/types/assetConfig";

interface AssetUpdate {
  id: string;
  name: string;
  category: string;
  color: string;
  current_value: number;
  new_value: number;
  isEditing: boolean;
}

interface PortfolioUpdateFormProps {
  assets: Asset[];
  selectedMonth: string;
  onSave: (updates: AssetUpdate[]) => Promise<void>;
  onAddNew: () => void;
}

export default function PortfolioUpdateForm({
  assets,
  selectedMonth,
  onSave,
  onAddNew,
}: PortfolioUpdateFormProps) {
  const [assetUpdates, setAssetUpdates] = useState<AssetUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updates: AssetUpdate[] = assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      color: asset.color,
      current_value: asset.current_value,
      new_value: asset.current_value,
      isEditing: false,
    }));
    setAssetUpdates(updates);
  }, [assets]);

  const handleValueChange = (id: string, value: string) => {
    setAssetUpdates(
      assetUpdates.map((asset) =>
        asset.id === id
          ? { ...asset, new_value: parseFloat(value) || 0 }
          : asset
      )
    );
  };

  const toggleEdit = (id: string) => {
    setAssetUpdates(
      assetUpdates.map((asset) =>
        asset.id === id ? { ...asset, isEditing: !asset.isEditing } : asset
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(assetUpdates);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const config = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
      (a) => a.category === category
    );
    return config?.label || category;
  };

  const hasChanges = assetUpdates.some(
    (asset) => asset.new_value !== asset.current_value
  );

  const totalCurrentValue = assetUpdates.reduce(
    (sum, asset) => sum + asset.current_value,
    0
  );
  const totalNewValue = assetUpdates.reduce(
    (sum, asset) => sum + asset.new_value,
    0
  );
  const valueDiff = totalNewValue - totalCurrentValue;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Aktualizacja wartości aktywów
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Zaktualizuj wartości swoich aktywów na{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("pl-PL", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dodaj nowe aktywo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Obecna wartość</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalCurrentValue.toFixed(2)} PLN
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Nowa wartość</p>
            <p className="text-lg font-semibold text-blue-600">
              {totalNewValue.toFixed(2)} PLN
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Zmiana</p>
            <p
              className={`text-lg font-semibold ${
                valueDiff >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {valueDiff >= 0 ? "+" : ""}
              {valueDiff.toFixed(2)} PLN
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {assetUpdates.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: asset.color }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{asset.name}</p>
                <p className="text-xs text-gray-500">
                  {getCategoryLabel(asset.category)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-600">Obecna</p>
                  <p className="text-sm font-medium text-gray-900">
                    {asset.current_value.toFixed(2)} PLN
                  </p>
                </div>

                <div className="text-gray-400">→</div>

                {asset.isEditing ? (
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      value={asset.new_value}
                      onChange={(e) =>
                        handleValueChange(asset.id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="text-right w-32">
                    <p className="text-xs text-gray-600">Nowa</p>
                    <p
                      className={`text-sm font-medium ${
                        asset.new_value !== asset.current_value
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {asset.new_value.toFixed(2)} PLN
                    </p>
                  </div>
                )}

                <button
                  onClick={() => toggleEdit(asset.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={asset.isEditing ? "Zatwierdź" : "Edytuj"}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {assetUpdates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Nie masz jeszcze żadnych aktywów w portfelu</p>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Dodaj pierwsze aktywo
            </button>
          </div>
        )}
      </div>

      {assetUpdates.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {hasChanges && (
                <p className="text-sm text-blue-600">Masz niezapisane zmiany</p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Zapisz aktualizację
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
