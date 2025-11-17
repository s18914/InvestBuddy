import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";

interface SnapshotData {
  id: string;
  snapshot_date: string;
  total_value: number;
  asset_breakdown: any;
  created_at: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  value: number;
}

export default function PortfolioTimelineChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSnapshots();
  }, [user]);

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
        const chartData: ChartDataPoint[] = snapshots.map(
          (snapshot: SnapshotData) => ({
            date: snapshot.snapshot_date,
            displayDate: new Date(snapshot.snapshot_date).toLocaleDateString(
              "pl-PL",
              {
                month: "short",
                year: "numeric",
              }
            ),
            value: Number(snapshot.total_value),
          })
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
            Historia wartości portfela
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Brak danych historycznych</p>
          <p className="text-sm text-gray-500">
            Dodaj aktualizacje portfela, aby zobaczyć wykres czasowy
          </p>
        </div>
      </div>
    );
  }

  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const valueChange =
    data.length > 1 ? data[data.length - 1].value - data[0].value : 0;
  const percentChange =
    data.length > 1 ? (valueChange / data[0].value) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Historia wartości portfela
          </h2>
        </div>
        {data.length > 1 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Zmiana całkowita</p>
            <p
              className={`text-lg font-bold ${
                valueChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {valueChange >= 0 ? "+" : ""}
              {valueChange.toFixed(2)} PLN
              <span className="text-sm ml-2">
                ({percentChange >= 0 ? "+" : ""}
                {percentChange.toFixed(1)}%)
              </span>
            </p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            domain={[Math.floor(minValue * 0.95), Math.ceil(maxValue * 1.05)]}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number) => [
              `${value.toFixed(2)} PLN`,
              "Wartość",
            ]}
            labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: "#2563eb", r: 4 }}
            activeDot={{ r: 6 }}
            name="Wartość portfela"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Liczba aktualizacji</p>
            <p className="text-lg font-semibold text-gray-900">{data.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Wartość początkowa</p>
            <p className="text-lg font-semibold text-gray-900">
              {data[0].value.toFixed(2)} PLN
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Wartość aktualna</p>
            <p className="text-lg font-semibold text-gray-900">
              {data[data.length - 1].value.toFixed(2)} PLN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
