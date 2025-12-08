import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Asset } from "@/types/database.types";
import { getCategoryColor, getCategoryLabel } from "@/types/assetConfig";

interface PortfolioPieChartProps {
  assets: Asset[];
  showAllocation?: boolean;
  title?: string;
  compact?: boolean;
  groupByCategory?: boolean;
}

export default function PortfolioPieChart({
  assets,
  showAllocation = false,
  title,
  compact = false,
  groupByCategory = false,
}: PortfolioPieChartProps) {
  let data: { name: string; value: number; color: string }[];

  if (groupByCategory) {
    const categoryTotals = new Map<string, number>();

    assets.forEach((asset) => {
      const value = showAllocation
        ? Number(asset.target_allocation ?? 0)
        : Number(asset.current_value);
      if (value > 0) {
        const current = categoryTotals.get(asset.category) || 0;
        categoryTotals.set(asset.category, current + value);
      }
    });

    data = Array.from(categoryTotals.entries())
      .map(([category, value]) => ({
        name: getCategoryLabel(category),
        value,
        color: getCategoryColor(category),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } else {
    data = assets
      .filter((asset) =>
        showAllocation
          ? (asset.target_allocation ?? 0) > 0
          : asset.current_value > 0
      )
      .map((asset) => ({
        name: asset.name,
        value: showAllocation
          ? Number(asset.target_allocation ?? 0)
          : Number(asset.current_value),
        color: getCategoryColor(asset.category),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">
          {showAllocation
            ? "Brak zdefiniowanej alokacji"
            : "Brak aktywów do wyświetlenia"}
        </p>
      </div>
    );
  }

  const renderLabel = (entry: { value: number }) => {
    if (showAllocation) {
      return `${entry.value.toFixed(0)}%`;
    }
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className={compact ? "" : "bg-white rounded-lg shadow p-6"}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {!title && !compact && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {showAllocation ? "Docelowa alokacja" : "Skład poduszki"}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={compact ? 250 : 300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={compact ? 80 : 100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              showAllocation
                ? `${value.toFixed(1)}%`
                : `${value.toFixed(2)} PLN`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {!showAllocation && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Łączna wartość</p>
          <p className="text-xl font-bold text-gray-900">
            {total.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN
          </p>
        </div>
      )}
    </div>
  );
}
