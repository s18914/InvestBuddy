import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BondFormData, BOND_TYPES } from "@/types/assetForms.types";

interface BondsFormProps {
  onDataChange: (bonds: BondFormData[]) => void;
  initialData?: BondFormData[];
}

export default function BondsForm({
  onDataChange,
  initialData = [],
}: BondsFormProps) {
  const [bonds, setBonds] = useState<BondFormData[]>(
    initialData.length > 0 ? initialData : [createEmptyBond()]
  );

  function createEmptyBond(): BondFormData {
    return {
      current_value: 0,
      bond_type: "",
      interest_rate: 0,
      purchase_date: "",
      inflation_rate: undefined,
    };
  }

  const updateBond = (index: number, field: keyof BondFormData, value: any) => {
    const newBonds = [...bonds];
    newBonds[index] = { ...newBonds[index], [field]: value };

    if (field === "bond_type") {
      const bondType = BOND_TYPES.find((bt) => bt.value === value);
      if (bondType && !bondType.isInflationLinked) {
        newBonds[index].inflation_rate = undefined;
      }
    }

    setBonds(newBonds);
    onDataChange(newBonds);
  };

  const addBond = () => {
    const newBonds = [...bonds, createEmptyBond()];
    setBonds(newBonds);
    onDataChange(newBonds);
  };

  const removeBond = (index: number) => {
    if (bonds.length > 1) {
      const newBonds = bonds.filter((_, i) => i !== index);
      setBonds(newBonds);
      onDataChange(newBonds);
    }
  };

  const getBondType = (typeValue: string) => {
    return BOND_TYPES.find((bt) => bt.value === typeValue);
  };

  return (
    <div className="space-y-6">
      {bonds.map((bond, index) => {
        const bondType = getBondType(bond.bond_type);
        const showInflationRate = bondType?.isInflationLinked;

        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                Obligacja {index + 1}
              </h3>
              {bonds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBond(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ obligacji *
                </label>
                <select
                  value={bond.bond_type}
                  onChange={(e) =>
                    updateBond(index, "bond_type", e.target.value)
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Wybierz typ</option>
                  {BOND_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktualna wartość (PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bond.current_value || ""}
                  onChange={(e) =>
                    updateBond(
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
                  value={bond.interest_rate || ""}
                  onChange={(e) =>
                    updateBond(
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
                  Data zakupu *
                </label>
                <input
                  type="date"
                  value={bond.purchase_date}
                  onChange={(e) =>
                    updateBond(index, "purchase_date", e.target.value)
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {showInflationRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stopa inflacji (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bond.inflation_rate || ""}
                    onChange={(e) =>
                      updateBond(
                        index,
                        "inflation_rate",
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
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addBond}
        className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <Plus className="h-5 w-5 mr-2" />
        Dodaj kolejną obligację
      </button>
    </div>
  );
}
