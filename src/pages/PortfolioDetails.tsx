import { useAssets } from "@/hooks/useAssets";
import PortfolioPieChart from "@/components/PortfolioPieChart";
import AssetListReadOnly from "@/components/AssetListReadOnly";

export default function PortfolioDetails() {
  const { assets, loading } = useAssets();

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Szczegóły portfela
      </h1>

      <div className="space-y-6">
        {assets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PortfolioPieChart assets={assets} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Podsumowanie
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Liczba aktywów</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {assets.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Łączna wartość</p>
                    <p className="text-2xl font-bold text-green-600">
                      {assets
                        .reduce((sum, a) => sum + a.current_value, 0)
                        .toFixed(2)}{" "}
                      PLN
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AssetListReadOnly assets={assets} />
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              Nie masz jeszcze żadnych aktywów w portfelu.
            </p>
            <a
              href="/profile"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Dodaj swoje pierwsze aktywa
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
