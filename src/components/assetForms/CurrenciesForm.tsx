import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CurrencyFormData, POPULAR_CURRENCIES } from "@/types/assetForms.types";

interface CurrenciesFormProps {
  onDataChange: (currencies: CurrencyFormData[]) => void;
  initialData?: CurrencyFormData[];
}

export default function CurrenciesForm({
  onDataChange,
  initialData = [],
}: CurrenciesFormProps) {
  const [currencies, setCurrencies] = useState<CurrencyFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyCurrency()]
  );

  function createEmptyCurrency(): CurrencyFormData {
    return {
      current_value: 0,
      currency_code: "",
    };
  }

  const updateCurrency = (
    index: number,
    field: keyof CurrencyFormData,
    value: any
  ) => {
    const newCurrencies = [...currencies];
    newCurrencies[index] = { ...newCurrencies[index], [field]: value };
    setCurrencies(newCurrencies);
    onDataChange(newCurrencies);
  };

  const addCurrency = () => {
    const newCurrencies = [...currencies, createEmptyCurrency()];
    setCurrencies(newCurrencies);
    onDataChange(newCurrencies);
  };

  const removeCurrency = (index: number) => {
    if (currencies.length > 1) {
      const newCurrencies = currencies.filter((_, i) => i !== index);
      setCurrencies(newCurrencies);
      onDataChange(newCurrencies);
    }
  };

  return (
    <div className="space-y-6">
      {currencies.map((currency, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Waluta {index + 1}</h3>
            {currencies.length > 1 && (
              <button
                type="button"
                onClick={() => removeCurrency(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waluta *
              </label>
              <select
                value={currency.currency_code}
                onChange={(e) =>
                  updateCurrency(index, "currency_code", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz walutę</option>
                {POPULAR_CURRENCIES.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wartość w PLN *
              </label>
              <input
                type="number"
                step="0.01"
                value={currency.current_value || ""}
                onChange={(e) =>
                  updateCurrency(
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
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCurrency}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejną walutę
      </button>
    </div>
  );
}
