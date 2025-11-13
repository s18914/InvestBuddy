import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SavingsAccountFormData } from "@/types/assetForms.types";

interface SavingsAccountsFormProps {
  onDataChange: (accounts: SavingsAccountFormData[]) => void;
  initialData?: SavingsAccountFormData[];
}

export default function SavingsAccountsForm({
  onDataChange,
  initialData = [],
}: SavingsAccountsFormProps) {
  const [accounts, setAccounts] = useState<SavingsAccountFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyAccount()]
  );

  function createEmptyAccount(): SavingsAccountFormData {
    return {
      current_value: 0,
      account_name: "",
      interest_rate: 0,
    };
  }

  const updateAccount = (
    index: number,
    field: keyof SavingsAccountFormData,
    value: any
  ) => {
    const newAccounts = [...accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setAccounts(newAccounts);
    onDataChange(newAccounts);
  };

  const addAccount = () => {
    const newAccounts = [...accounts, createEmptyAccount()];
    setAccounts(newAccounts);
    onDataChange(newAccounts);
  };

  const removeAccount = (index: number) => {
    if (accounts.length > 1) {
      const newAccounts = accounts.filter((_, i) => i !== index);
      setAccounts(newAccounts);
      onDataChange(newAccounts);
    }
  };

  return (
    <div className="space-y-6">
      {accounts.map((account, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Konto oszczędnościowe {index + 1}
            </h3>
            {accounts.length > 1 && (
              <button
                type="button"
                onClick={() => removeAccount(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa konta
              </label>
              <input
                type="text"
                value={account.account_name || ""}
                onChange={(e) =>
                  updateAccount(index, "account_name", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="np. Konto Oszczędnościowe PKO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktualna wartość (PLN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={account.current_value || ""}
                onChange={(e) =>
                  updateAccount(
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
                value={account.interest_rate || ""}
                onChange={(e) =>
                  updateAccount(
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
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addAccount}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejne konto oszczędnościowe
      </button>
    </div>
  );
}
