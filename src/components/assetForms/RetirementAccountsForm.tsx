import { useState, useEffect } from "react";
import { BaseAssetFormData } from "@/types/assetForms.types";

interface RetirementAccountData extends BaseAssetFormData {
  contributed_this_year: number;
}

interface RetirementAccountsFormData {
  user_age: number;
  ike?: RetirementAccountData;
  ikze?: RetirementAccountData;
}

interface RetirementAccountsFormProps {
  onDataChange: (data: RetirementAccountsFormData) => void;
  initialData?: RetirementAccountsFormData;
}

const IKE_LIMIT_2024 = 23681.28;
const IKZE_LIMIT_2024 = 9472.51;

export default function RetirementAccountsForm({
  onDataChange,
  initialData,
}: RetirementAccountsFormProps) {
  const [data, setData] = useState<RetirementAccountsFormData>(
    initialData || {
      user_age: 0,
      ike: undefined,
      ikze: undefined,
    }
  );

  useEffect(() => {
    onDataChange(data);
  }, []);

  const updateAge = (age: number) => {
    const newData = { ...data, user_age: age };
    setData(newData);
    onDataChange(newData);
  };

  const updateIKE = (field: keyof RetirementAccountData, value: number) => {
    const newData = {
      ...data,
      ike: {
        current_value: data.ike?.current_value || 0,
        contributed_this_year: data.ike?.contributed_this_year || 0,
        ...data.ike,
        [field]: value,
      },
    };
    setData(newData);
    onDataChange(newData);
  };

  const updateIKZE = (field: keyof RetirementAccountData, value: number) => {
    const newData = {
      ...data,
      ikze: {
        current_value: data.ikze?.current_value || 0,
        contributed_this_year: data.ikze?.contributed_this_year || 0,
        ...data.ikze,
        [field]: value,
      },
    };
    setData(newData);
    onDataChange(newData);
  };

  const clearIKE = () => {
    const newData = { ...data, ike: undefined };
    setData(newData);
    onDataChange(newData);
  };

  const clearIKZE = () => {
    const newData = { ...data, ikze: undefined };
    setData(newData);
    onDataChange(newData);
  };

  const ikeRemaining = data.ike
    ? IKE_LIMIT_2024 - data.ike.contributed_this_year
    : IKE_LIMIT_2024;
  const ikzeRemaining = data.ikze
    ? IKZE_LIMIT_2024 - data.ikze.contributed_this_year
    : IKZE_LIMIT_2024;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wiek użytkownika *
        </label>
        <input
          type="number"
          value={data.user_age || ""}
          onChange={(e) => updateAge(parseInt(e.target.value) || 0)}
          required
          min="18"
          max="120"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="np. 35"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">IKE</h3>
            {data.ike && (
              <button
                type="button"
                onClick={clearIKE}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Usuń
              </button>
            )}
          </div>

          {!data.ike ? (
            <button
              type="button"
              onClick={() => updateIKE("current_value", 0)}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Dodaj IKE
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktualna wartość (PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.ike.current_value || ""}
                  onChange={(e) =>
                    updateIKE("current_value", parseFloat(e.target.value) || 0)
                  }
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wpłacono w tym roku (PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.ike.contributed_this_year || ""}
                  onChange={(e) =>
                    updateIKE(
                      "contributed_this_year",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min="0"
                  max={IKE_LIMIT_2024}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Limit roczny:</span>{" "}
                  {IKE_LIMIT_2024.toFixed(2)} PLN
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Pozostało:</span>{" "}
                  <span
                    className={
                      ikeRemaining < 0
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {ikeRemaining.toFixed(2)} PLN
                  </span>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">IKZE</h3>
            {data.ikze && (
              <button
                type="button"
                onClick={clearIKZE}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Usuń
              </button>
            )}
          </div>

          {!data.ikze ? (
            <button
              type="button"
              onClick={() => updateIKZE("current_value", 0)}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Dodaj IKZE
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktualna wartość (PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.ikze.current_value || ""}
                  onChange={(e) =>
                    updateIKZE("current_value", parseFloat(e.target.value) || 0)
                  }
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wpłacono w tym roku (PLN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.ikze.contributed_this_year || ""}
                  onChange={(e) =>
                    updateIKZE(
                      "contributed_this_year",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                  min="0"
                  max={IKZE_LIMIT_2024}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Limit roczny:</span>{" "}
                  {IKZE_LIMIT_2024.toFixed(2)} PLN
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Pozostało:</span>{" "}
                  <span
                    className={
                      ikzeRemaining < 0
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {ikzeRemaining.toFixed(2)} PLN
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
