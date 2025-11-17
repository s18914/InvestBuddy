import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Asset } from "@/types/database.types";

interface PortfolioPieChartProps {
  assets: Asset[];
}

export default function PortfolioPieChart({ assets }: PortfolioPieChartProps) {
  const data = assets
    .filter((asset) => asset.current_value > 0)
    .map((asset) => ({
      name: asset.name,
      value: Number(asset.current_value),
      color: asset.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
          Dodaj instrumenty inwestycyjne żeby zobaczyć skład portfela
        </p>
      </div>
    );
  }

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Skład portfela
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(2)} PLN`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Łączna wartość aktywów</p>
        <p className="text-2xl font-bold text-gray-900">
          {total.toFixed(2)} PLN
        </p>
      </div>
    </div>
  );
}
