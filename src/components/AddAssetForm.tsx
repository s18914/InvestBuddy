import { useState, FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { AssetCategory } from "@/types/database.types";

interface AddAssetFormProps {
  onAdd: (asset: {
    name: string;
    category: AssetCategory;
    color: string;
    current_value: number;
    currency: string;
  }) => Promise<void>;
}

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: "bonds", label: "Obligacje" },
  { value: "deposits", label: "Lokaty" },
  { value: "savings_accounts", label: "Konta oszczędnościowe" },
  { value: "investment_funds", label: "Fundusze inwestycyjne" },
  { value: "ike_ikze", label: "IKE/IKZE" },
  { value: "ppk", label: "PPK" },
  { value: "gold", label: "Złoto" },
  { value: "currencies", label: "Waluty" },
  { value: "cash", label: "Gotówka" },
];

const PRESET_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

export default function AddAssetForm({ onAdd }: AddAssetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("bonds");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [currentValue, setCurrentValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onAdd({
        name,
        category,
        color,
        current_value: parseFloat(currentValue),
        currency: "PLN",
      });

      setName("");
      setCategory("bonds");
      setColor(PRESET_COLORS[0]);
      setCurrentValue("");
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Asset
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Asset</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Obligacje skarbowe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Value (PLN)
          </label>
          <input
            type="number"
            step="0.01"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-10 h-10 rounded-lg border-2 ${
                  color === presetColor ? "border-gray-900" : "border-gray-300"
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Adding..." : "Add Asset"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
