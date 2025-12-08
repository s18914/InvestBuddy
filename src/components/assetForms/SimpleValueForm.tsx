import { useState, useEffect } from "react";
import { BaseAssetFormData, GoldFormData } from "@/types/assetForms.types";

interface SimpleValueFormProps {
  onDataChange: (data: BaseAssetFormData | GoldFormData) => void;
  initialData?: BaseAssetFormData | GoldFormData;
  assetType: "ppk" | "cash" | "gold" | "ike_ikze";
}

export default function SimpleValueForm({
  onDataChange,
  initialData,
  assetType,
}: SimpleValueFormProps) {
  const [data, setData] = useState<BaseAssetFormData | GoldFormData>(
    initialData ||
      (assetType === "gold"
        ? { current_value: 0, ounces: 0, exchange_rate: 0 }
        : { current_value: 0 })
  );

  useEffect(() => {
    onDataChange(data);
  }, []);

  const updateGoldValue = (
    field: "ounces" | "exchange_rate",
    value: number
  ) => {
    const goldData = data as GoldFormData;
    const newOunces = field === "ounces" ? value : goldData.ounces || 0;
    const newRate =
      field === "exchange_rate" ? value : goldData.exchange_rate || 0;
    const calculatedValue = newOunces * newRate;

    const newData: GoldFormData = {
      ...goldData,
      [field]: value,
      current_value: calculatedValue,
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateValue = (field: string, value: number) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onDataChange(newData);
  };

  const isGold = assetType === "gold";

  if (isGold) {
    const goldData = data as GoldFormData;
    const calculatedValue =
      (goldData.ounces || 0) * (goldData.exchange_rate || 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ilość uncji *
            </label>
            <input
              type="number"
              step="0.0001"
              value={goldData.ounces || ""}
              onChange={(e) =>
                updateGoldValue("ounces", parseFloat(e.target.value) || 0)
              }
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kurs PLN/oz *
            </label>
            <input
              type="number"
              step="0.01"
              value={goldData.exchange_rate || ""}
              onChange={(e) =>
                updateGoldValue(
                  "exchange_rate",
                  parseFloat(e.target.value) || 0
                )
              }
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. 10500.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Aktualny kurs złota za uncję w PLN
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Obliczona wartość:</p>
          <p className="text-xl font-semibold text-blue-600">
            {calculatedValue.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            PLN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aktualna wartość (PLN) *
        </label>
        <input
          type="number"
          step="0.01"
          value={data.current_value || ""}
          onChange={(e) =>
            updateValue("current_value", parseFloat(e.target.value) || 0)
          }
          required
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
