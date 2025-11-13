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
        ? { current_value: 0, ounces: 0 }
        : { current_value: 0 })
  );

  useEffect(() => {
    onDataChange(data);
  }, []);

  const updateValue = (field: string, value: number) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onDataChange(newData);
  };

  const isGold = assetType === "gold";

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

      {isGold && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ilość uncji *
          </label>
          <input
            type="number"
            step="0.0001"
            value={(data as GoldFormData).ounces || ""}
            onChange={(e) =>
              updateValue("ounces", parseFloat(e.target.value) || 0)
            }
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0000"
          />
        </div>
      )}
    </div>
  );
}
