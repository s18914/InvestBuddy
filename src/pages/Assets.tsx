import { useState, useEffect } from "react";
import { useAssets } from "@/hooks/useAssets";
import { Asset, AssetCategory } from "@/types/database.types";
import { fetchAllAssetDetails } from "@/services/assetDetailsService";
import { getCategoryColor } from "@/types/assetConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Banknote,
  Building2,
  PiggyBank,
  TrendingUp,
  Landmark,
  Coins,
  CircleDollarSign,
  Wallet,
  Package,
  ChevronRight,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; showChart: boolean }
> = {
  bonds: { label: "Obligacje", icon: Landmark, showChart: false },
  deposits: { label: "Lokaty", icon: Building2, showChart: false },
  savings_accounts: {
    label: "Konta oszczędnościowe",
    icon: PiggyBank,
    showChart: true,
  },
  investment_funds: { label: "Fundusze", icon: TrendingUp, showChart: false },
  foreign_stocks: {
    label: "Akcje zagraniczne",
    icon: TrendingUp,
    showChart: true,
  },
  ike_ikze: { label: "IKE/IKZE", icon: Landmark, showChart: false },
  ppk: { label: "PPK", icon: Coins, showChart: true },
  gold: { label: "Złoto", icon: Coins, showChart: true },
  currencies: { label: "Waluty", icon: CircleDollarSign, showChart: true },
  cash: { label: "Gotówka", icon: Wallet, showChart: true },
};

const CATEGORY_ORDER: AssetCategory[] = [
  "bonds",
  "deposits",
  "savings_accounts",
  "investment_funds",
  "foreign_stocks",
  "ike_ikze",
  "ppk",
  "gold",
  "currencies",
  "cash",
];

interface AssetWithDetails extends Asset {
  details?: any;
}

export default function Assets() {
  const { assets, loading } = useAssets("real");
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory | null>(null);
  const [assetsWithDetails, setAssetsWithDetails] = useState<
    AssetWithDetails[]
  >([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const categoriesWithAssets = CATEGORY_ORDER.filter((category) =>
    assets.some((a) => a.category === category)
  );

  useEffect(() => {
    if (categoriesWithAssets.length > 0 && !selectedCategory) {
      setSelectedCategory(categoriesWithAssets[0]);
    }
  }, [categoriesWithAssets, selectedCategory]);

  useEffect(() => {
    async function loadDetails() {
      if (!selectedCategory) return;

      const categoryAssets = assets.filter(
        (a) => a.category === selectedCategory
      );
      if (categoryAssets.length === 0) {
        setAssetsWithDetails([]);
        return;
      }

      setDetailsLoading(true);
      try {
        const assetIds = categoryAssets.map((a) => a.id);
        const details = await fetchAllAssetDetails(assetIds, selectedCategory);

        const enriched = categoryAssets.map((asset) => ({
          ...asset,
          details: details.find((d: any) => d.asset_id === asset.id),
        }));

        setAssetsWithDetails(enriched);
      } catch (error) {
        console.error("Error loading asset details:", error);
        setAssetsWithDetails(categoryAssets);
      } finally {
        setDetailsLoading(false);
      }
    }

    loadDetails();
  }, [selectedCategory, assets]);

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

  if (assets.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Aktywa</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Banknote className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">
            Nie masz jeszcze żadnych aktywów w portfelu.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Dodaj swoje pierwsze aktywa
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Aktywa</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow overflow-hidden">
            {categoriesWithAssets.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config?.icon || Package;
              const isSelected = selectedCategory === category;
              const categoryAssets = assets.filter(
                (a) => a.category === category
              );
              const totalValue = categoryAssets.reduce(
                (sum, a) => sum + a.current_value,
                0
              );

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-900"
                      : "border-transparent hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: getCategoryColor(category) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {config?.label || category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {categoryAssets.length}{" "}
                      {categoryAssets.length === 1 ? "aktywo" : "aktywów"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {totalValue.toLocaleString("pl-PL", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">PLN</p>
                  </div>
                  {isSelected && (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedCategory && (
            <CategoryDetails
              category={selectedCategory}
              assets={assetsWithDetails}
              loading={detailsLoading}
              showChart={CATEGORY_CONFIG[selectedCategory]?.showChart || false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface CategoryDetailsProps {
  category: AssetCategory;
  assets: AssetWithDetails[];
  loading: boolean;
  showChart: boolean;
}

function CategoryDetails({
  category,
  assets,
  loading,
  showChart,
}: CategoryDetailsProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config?.icon || Package;
  const totalValue = assets.reduce((sum, a) => sum + a.current_value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${getCategoryColor(category)}20` }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: getCategoryColor(category) }}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {config?.label || category}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {assets.length} {assets.length === 1 ? "aktywo" : "aktywów"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {totalValue.toLocaleString("pl-PL", { minimumFractionDigits: 2 })}{" "}
              PLN
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Historical Chart for applicable categories */}
      {showChart && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historia wartości</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoricalChart
              assets={assets}
              color={getCategoryColor(category)}
            />
          </CardContent>
        </Card>
      )}

      {/* Asset List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Szczegóły aktywów</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <AssetDetailRow
                key={asset.id}
                asset={asset}
                category={category}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AssetDetailRowProps {
  asset: AssetWithDetails;
  category: AssetCategory;
}

function AssetDetailRow({ asset, category }: AssetDetailRowProps) {
  const renderDetails = () => {
    const details = asset.details;
    if (!details) return null;

    switch (category) {
      case "bonds":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Typ obligacji</p>
              <p className="font-medium">{details.bond_type || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Oprocentowanie</p>
              <p className="font-medium">
                {details.interest_rate ? `${details.interest_rate}%` : "—"}
              </p>
            </div>
            {details.is_inflation_linked && (
              <div>
                <p className="text-gray-500">Inflacja</p>
                <p className="font-medium">
                  {details.inflation_rate
                    ? `${details.inflation_rate}%`
                    : "Indeksowana"}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Data zakupu</p>
              <p className="font-medium">
                {details.purchase_date
                  ? new Date(details.purchase_date).toLocaleDateString("pl-PL")
                  : "—"}
              </p>
            </div>
          </div>
        );

      case "deposits":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Bank</p>
              <p className="font-medium">{details.bank_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Oprocentowanie</p>
              <p className="font-medium">
                {details.interest_rate ? `${details.interest_rate}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Okres</p>
              <p className="font-medium">
                {details.duration_months
                  ? `${details.duration_months} mies.`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Data zapadalności</p>
              <p className="font-medium">
                {details.maturity_date
                  ? new Date(details.maturity_date).toLocaleDateString("pl-PL")
                  : "—"}
              </p>
            </div>
          </div>
        );

      case "savings_accounts":
        return (
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Nazwa konta</p>
              <p className="font-medium">
                {details.account_name || "Konto oszczędnościowe"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Oprocentowanie</p>
              <p className="font-medium">
                {details.interest_rate ? `${details.interest_rate}%` : "—"}
              </p>
            </div>
          </div>
        );

      case "investment_funds":
        return (
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Nazwa funduszu</p>
              <p className="font-medium">{details.fund_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Kategoria</p>
              <p className="font-medium">
                {getFundCategoryLabel(details.fund_category)}
              </p>
            </div>
          </div>
        );

      case "ike_ikze":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Typ konta</p>
              <p className="font-medium">{details.account_type || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Limit roczny</p>
              <p className="font-medium">
                {details.annual_limit
                  ? `${details.annual_limit.toLocaleString("pl-PL")} PLN`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Wpłacono w tym roku</p>
              <p className="font-medium">
                {details.contributed_this_year !== undefined
                  ? `${details.contributed_this_year.toLocaleString(
                      "pl-PL"
                    )} PLN`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Pozostało do wpłaty</p>
              <p className="font-medium text-green-600">
                {details.annual_limit &&
                details.contributed_this_year !== undefined
                  ? `${(
                      details.annual_limit - details.contributed_this_year
                    ).toLocaleString("pl-PL")} PLN`
                  : "—"}
              </p>
            </div>
          </div>
        );

      case "gold":
        return (
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Ilość uncji</p>
              <p className="font-medium">
                {details.ounces ? `${details.ounces} oz` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Wartość za uncję</p>
              <p className="font-medium">
                {details.ounces && asset.current_value
                  ? `${(asset.current_value / details.ounces).toLocaleString(
                      "pl-PL",
                      { minimumFractionDigits: 2 }
                    )} PLN`
                  : "—"}
              </p>
            </div>
          </div>
        );

      case "currencies":
        return (
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Waluta</p>
              <p className="font-medium">{details.currency_code || "—"}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: getCategoryColor(asset.category) }}
          />
          <p className="font-medium text-gray-900">{asset.name}</p>
        </div>
        <p className="font-semibold">
          {asset.current_value.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
          })}{" "}
          {asset.currency}
        </p>
      </div>
      {renderDetails()}
    </div>
  );
}

function getFundCategoryLabel(category: string | undefined): string {
  const labels: Record<string, string> = {
    equity: "Akcyjne",
    mixed: "Mieszane",
    absolute_return: "Absolute Return",
    bonds: "Obligacyjne",
    other: "Inne",
  };
  return labels[category || ""] || category || "—";
}

interface HistoricalChartProps {
  assets: AssetWithDetails[];
  color: string;
}

function HistoricalChart({ assets, color }: HistoricalChartProps) {
  // Generate mock historical data for demonstration
  // In production, this would come from portfolio_snapshots table
  const totalValue = assets.reduce((sum, a) => sum + a.current_value, 0);

  const data = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const variance = 0.9 + Math.random() * 0.2;
    return {
      date: date.toLocaleDateString("pl-PL", {
        month: "short",
        year: "2-digit",
      }),
      value: Math.round(totalValue * variance * (0.7 + (i / 11) * 0.3)),
    };
  });

  // Set last point to current value
  data[data.length - 1].value = totalValue;

  if (totalValue === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">Brak danych historycznych</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [
            `${value.toLocaleString("pl-PL", {
              minimumFractionDigits: 2,
            })} PLN`,
            "Wartość",
          ]}
          labelStyle={{ color: "#374151" }}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
