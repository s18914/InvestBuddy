import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";
import { PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG } from "@/types/assetConfig";

interface SnapshotData {
  id: string;
  snapshot_date: string;
  total_value: number;
  asset_breakdown: Record<string, number>;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  [key: string]: string | number;
}

export default function PortfolioStackedChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [assetCategories, setAssetCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSnapshots();
  }, [user]);

  const getCategoryColor = (category: string): string => {
    const config = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
      (a) => a.category === category
    );
    return config?.color || "#939597";
  };

  const getCategoryLabel = (category: string): string => {
    const config = [...PREDEFINED_ASSETS, CUSTOM_ASSET_CONFIG].find(
      (a) => a.category === category
    );
    return config?.label || category;
  };

  const loadSnapshots = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: snapshots, error } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_date", { ascending: true });

      if (error) throw error;

      if (snapshots && snapshots.length > 0) {
        const allCategories = new Set<string>();

        snapshots.forEach((snapshot: SnapshotData) => {
          if (snapshot.asset_breakdown) {
            Object.keys(snapshot.asset_breakdown).forEach((category) =>
              allCategories.add(category)
            );
          }
        });

        const categoriesArray = Array.from(allCategories).sort();
        setAssetCategories(categoriesArray);

        const chartData: ChartDataPoint[] = snapshots.map(
          (snapshot: SnapshotData) => {
            const dataPoint: ChartDataPoint = {
              date: snapshot.snapshot_date,
              displayDate: new Date(snapshot.snapshot_date).toLocaleDateString(
                "pl-PL",
                {
                  month: "short",
                  year: "numeric",
                }
              ),
            };

            categoriesArray.forEach((category) => {
              dataPoint[category] = snapshot.asset_breakdown?.[category] || 0;
            });

            return dataPoint;
          }
        );

        setData(chartData);
      }
    } catch (err: any) {
      console.error("Error loading snapshots:", err);
      setError("Nie udało się załadować danych");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Ładowanie wykresu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600 py-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Historia struktury portfela
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Brak danych historycznych</p>
          <p className="text-sm text-gray-500">
            Dodaj aktualizacje portfela, aby zobaczyć wykres struktury w czasie
          </p>
        </div>
      </div>
    );
  }

  const totalValue =
    data.length > 0
      ? assetCategories.reduce(
          (sum, cat) => sum + (Number(data[data.length - 1][cat]) || 0),
          0
        )
      : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0
      );

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-700">
                      {getCategoryLabel(entry.dataKey)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.value.toFixed(2)} PLN
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Razem:
              </span>
              <span className="text-sm font-bold text-blue-600">
                {total.toFixed(2)} PLN
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Historia struktury portfela
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Aktualna wartość</p>
          <p className="text-lg font-bold text-blue-600">
            {totalValue.toFixed(2)} PLN
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            {assetCategories.map((category) => (
              <linearGradient
                key={category}
                id={`color-${category}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={getCategoryColor(category)}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={getCategoryColor(category)}
                  stopOpacity={0.3}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => getCategoryLabel(value)}
          />
          {assetCategories.map((category) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={getCategoryColor(category)}
              fill={`url(#color-${category})`}
              fillOpacity={1}
              name={category}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {assetCategories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              <span className="text-sm text-gray-700">
                {getCategoryLabel(category)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
