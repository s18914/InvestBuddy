import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FundFormData, FUND_CATEGORIES } from "@/types/assetForms.types";

interface FundsFormProps {
  onDataChange: (funds: FundFormData[]) => void;
  initialData?: FundFormData[];
}

export default function FundsForm({
  onDataChange,
  initialData = [],
}: FundsFormProps) {
  const [funds, setFunds] = useState<FundFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyFund()]
  );

  function createEmptyFund(): FundFormData {
    return {
      current_value: 0,
      fund_name: "",
      fund_category: "mixed",
    };
  }

  const updateFund = (index: number, field: keyof FundFormData, value: any) => {
    const newFunds = [...funds];
    newFunds[index] = { ...newFunds[index], [field]: value };
    setFunds(newFunds);
    onDataChange(newFunds);
  };

  const addFund = () => {
    const newFunds = [...funds, createEmptyFund()];
    setFunds(newFunds);
    onDataChange(newFunds);
  };

  const removeFund = (index: number) => {
    if (funds.length > 1) {
      const newFunds = funds.filter((_, i) => i !== index);
      setFunds(newFunds);
      onDataChange(newFunds);
    }
  };

  return (
    <div className="space-y-6">
      {funds.map((fund, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Fundusz {index + 1}</h3>
            {funds.length > 1 && (
              <button
                type="button"
                onClick={() => removeFund(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa funduszu *
              </label>
              <input
                type="text"
                value={fund.fund_name}
                onChange={(e) => updateFund(index, "fund_name", e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. PKO Akcji"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktualna wartość (PLN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={fund.current_value || ""}
                onChange={(e) =>
                  updateFund(
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
                Kategoria funduszu *
              </label>
              <select
                value={fund.fund_category}
                onChange={(e) =>
                  updateFund(index, "fund_category", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FUND_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addFund}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejny fundusz
      </button>
    </div>
  );
}
