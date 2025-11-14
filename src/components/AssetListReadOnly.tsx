import { Asset } from "@/types/database.types";
import { TrendingUp } from "lucide-react";

interface AssetListReadOnlyProps {
  assets: Asset[];
}

export default function AssetListReadOnly({ assets }: AssetListReadOnlyProps) {
  const sortedAssets = [...assets].sort((a, b) => a.name.localeCompare(b.name));
  const totalValue = sortedAssets.reduce(
    (sum, asset) => sum + asset.current_value,
    0
  );

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">
          Brak aktywów. Dodaj swoje pierwsze aktywa.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Twoje aktywa</h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Łączna wartość</p>
            <p className="text-2xl font-bold text-blue-600">
              {Number(totalValue).toFixed(2)} PLN
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedAssets.map((asset) => {
          const percentage = ((asset.current_value / totalValue) * 100).toFixed(
            1
          );

          return (
            <div
              key={asset.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{asset.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {asset.category.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">
                    {Number(asset.current_value).toFixed(2)} {asset.currency}
                  </p>
                  <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: asset.color,
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              Liczba aktywów: {sortedAssets.length}
            </span>
          </div>
          <a
            href="/profile"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Zarządzaj aktywami →
          </a>
        </div>
      </div>
    </div>
  );
}
