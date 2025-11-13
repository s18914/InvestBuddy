import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DepositFormData, DEPOSIT_DURATIONS } from "@/types/assetForms.types";

interface DepositsFormProps {
  onDataChange: (deposits: DepositFormData[]) => void;
  initialData?: DepositFormData[];
}

export default function DepositsForm({
  onDataChange,
  initialData = [],
}: DepositsFormProps) {
  const [deposits, setDeposits] = useState<DepositFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyDeposit()]
  );

  function createEmptyDeposit(): DepositFormData {
    return {
      current_value: 0,
      bank_name: "",
      interest_rate: 0,
      start_date: "",
      duration_months: 12,
    };
  }

  const updateDeposit = (
    index: number,
    field: keyof DepositFormData,
    value: any
  ) => {
    const newDeposits = [...deposits];
    newDeposits[index] = { ...newDeposits[index], [field]: value };
    setDeposits(newDeposits);
    onDataChange(newDeposits);
  };

  const addDeposit = () => {
    const newDeposits = [...deposits, createEmptyDeposit()];
    setDeposits(newDeposits);
    onDataChange(newDeposits);
  };

  const removeDeposit = (index: number) => {
    if (deposits.length > 1) {
      const newDeposits = deposits.filter((_, i) => i !== index);
      setDeposits(newDeposits);
      onDataChange(newDeposits);
    }
  };

  return (
    <div className="space-y-6">
      {deposits.map((deposit, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Lokata {index + 1}</h3>
            {deposits.length > 1 && (
              <button
                type="button"
                onClick={() => removeDeposit(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa banku *
              </label>
              <input
                type="text"
                value={deposit.bank_name}
                onChange={(e) =>
                  updateDeposit(index, "bank_name", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. PKO BP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktualna wartość (PLN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={deposit.current_value || ""}
                onChange={(e) =>
                  updateDeposit(
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oprocentowanie (%) *
              </label>
              <input
                type="number"
                step="0.01"
                value={deposit.interest_rate || ""}
                onChange={(e) =>
                  updateDeposit(
                    index,
                    "interest_rate",
                    parseFloat(e.target.value) || 0
                  )
                }
                required
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data rozpoczęcia *
              </label>
              <input
                type="date"
                value={deposit.start_date}
                onChange={(e) =>
                  updateDeposit(index, "start_date", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Czas trwania *
              </label>
              <select
                value={deposit.duration_months}
                onChange={(e) =>
                  updateDeposit(
                    index,
                    "duration_months",
                    parseInt(e.target.value)
                  )
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DEPOSIT_DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDeposit}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejną lokatę
      </button>
    </div>
  );
}
