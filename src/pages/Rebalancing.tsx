import { useMemo } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useTargetPortfolio } from "@/hooks/useTargetPortfolio";
import { useSafetyCushion } from "@/hooks/useSafetyCushion";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryColor, getCategoryLabel } from "@/types/assetConfig";
import { AssetCategory } from "@/types/database.types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  RefreshCw,
} from "lucide-react";

interface CategoryComparison {
  category: AssetCategory;
  label: string;
  color: string;
  targetPercent: number;
  actualPercent: number;
  deviation: number;
  actualValue: number;
  targetValue: number;
  differenceValue: number;
}

type DeviationLevel = "ok" | "watch" | "action";

function getDeviationLevel(deviation: number): DeviationLevel {
  const absDeviation = Math.abs(deviation);
  if (absDeviation < 5) return "ok";
  if (absDeviation < 10) return "watch";
  return "action";
}

function getDeviationColor(level: DeviationLevel): string {
  switch (level) {
    case "ok":
      return "text-green-600";
    case "watch":
      return "text-yellow-600";
    case "action":
      return "text-red-600";
  }
}

function getDeviationBgColor(level: DeviationLevel): string {
  switch (level) {
    case "ok":
      return "bg-green-50";
    case "watch":
      return "bg-yellow-50";
    case "action":
      return "bg-red-50";
  }
}

function DeviationIcon({ deviation }: { deviation: number }) {
  if (deviation > 2) return <TrendingUp className="w-4 h-4" />;
  if (deviation < -2) return <TrendingDown className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
}

export default function Rebalancing() {
  const { assets: realAssets, loading: realLoading } = useAssets("real");
  const { targetAssets, loading: targetLoading } = useTargetPortfolio();
  const { totalCushionValue, loading: cushionLoading } = useSafetyCushion();
  const { settings, loading: settingsLoading } = useUserSettings();

  const isLoading =
    realLoading || targetLoading || cushionLoading || settingsLoading;

  const { comparisons, totalRealValue, totalTargetAllocation, alignmentScore } =
    useMemo(() => {
      if (isLoading) {
        return {
          comparisons: [],
          totalRealValue: 0,
          totalTargetAllocation: 0,
          alignmentScore: 0,
        };
      }

      const totalReal = realAssets.reduce(
        (sum, a) => sum + Number(a.current_value),
        0
      );
      const totalTarget = targetAssets.reduce(
        (sum, a) => sum + Number(a.target_allocation || 0),
        0
      );

      const categoryMap = new Map<
        AssetCategory,
        { realValue: number; targetPercent: number }
      >();

      realAssets.forEach((asset) => {
        const current = categoryMap.get(asset.category) || {
          realValue: 0,
          targetPercent: 0,
        };
        current.realValue += Number(asset.current_value);
        categoryMap.set(asset.category, current);
      });

      targetAssets.forEach((asset) => {
        const current = categoryMap.get(asset.category) || {
          realValue: 0,
          targetPercent: 0,
        };
        current.targetPercent += Number(asset.target_allocation || 0);
        categoryMap.set(asset.category, current);
      });

      const result: CategoryComparison[] = [];
      let totalDeviation = 0;

      categoryMap.forEach((data, category) => {
        const actualPercent =
          totalReal > 0 ? (data.realValue / totalReal) * 100 : 0;
        const targetPercent = data.targetPercent;
        const deviation = actualPercent - targetPercent;
        const targetValue = (targetPercent / 100) * totalReal;
        const differenceValue = data.realValue - targetValue;

        totalDeviation += Math.abs(deviation);

        result.push({
          category,
          label: getCategoryLabel(category),
          color: getCategoryColor(category),
          targetPercent,
          actualPercent,
          deviation,
          actualValue: data.realValue,
          targetValue,
          differenceValue,
        });
      });

      result.sort((a, b) => a.label.localeCompare(b.label));

      const score = Math.max(0, Math.round(100 - totalDeviation / 2));

      return {
        comparisons: result,
        totalRealValue: totalReal,
        totalTargetAllocation: totalTarget,
        alignmentScore: score,
      };
    }, [realAssets, targetAssets, isLoading]);

  const cushionStatus = useMemo(() => {
    if (!settings?.safety_cushion_target) {
      return { isComplete: false, current: 0, target: 0, percent: 0 };
    }
    const target = settings.safety_cushion_target;
    const current = totalCushionValue;
    const percent = Math.min(100, (current / target) * 100);
    return {
      isComplete: current >= target,
      current,
      target,
      percent,
    };
  }, [settings, totalCushionValue]);

  const rebalancingSuggestions = useMemo(() => {
    const needsAction = comparisons.filter(
      (c) => getDeviationLevel(c.deviation) !== "ok"
    );
    const underweight = needsAction
      .filter((c) => c.deviation < -2)
      .sort((a, b) => a.deviation - b.deviation);
    const overweight = needsAction
      .filter((c) => c.deviation > 2)
      .sort((a, b) => b.deviation - a.deviation);

    return { underweight, overweight };
  }, [comparisons]);

  const monthlyAllocationSuggestion = useMemo(() => {
    const monthlySavings = settings?.monthly_savings_amount || 0;
    if (monthlySavings === 0 || comparisons.length === 0) return [];

    const underweight = comparisons.filter((c) => c.deviation < 0);
    const totalUnderweight = underweight.reduce(
      (sum, c) => sum + Math.abs(c.deviation),
      0
    );

    if (totalUnderweight === 0) {
      return comparisons
        .filter((c) => c.targetPercent > 0)
        .map((c) => ({
          ...c,
          suggestedAmount: (monthlySavings * c.targetPercent) / 100,
          normalAmount: (monthlySavings * c.targetPercent) / 100,
        }));
    }

    const boostFactor = 0.5;
    const normalAllocation = 1 - boostFactor;

    return comparisons
      .filter((c) => c.targetPercent > 0)
      .map((c) => {
        const normalAmount =
          monthlySavings * normalAllocation * (c.targetPercent / 100);
        let boostAmount = 0;

        if (c.deviation < 0 && totalUnderweight > 0) {
          boostAmount =
            monthlySavings *
            boostFactor *
            (Math.abs(c.deviation) / totalUnderweight);
        }

        return {
          ...c,
          suggestedAmount: normalAmount + boostAmount,
          normalAmount: (monthlySavings * c.targetPercent) / 100,
        };
      })
      .sort((a, b) => b.suggestedAmount - a.suggestedAmount);
  }, [settings, comparisons]);

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie analizy...</p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 70) return "bg-yellow-100";
    if (score >= 50) return "bg-orange-100";
    return "bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Portfel doskonale zbalansowany";
    if (score >= 70) return "Niewielkie odchylenia";
    if (score >= 50) return "Rebalancing zalecany";
    return "Znaczące odchylenia - wymaga uwagi";
  };

  const actualChartData = comparisons
    .filter((c) => c.actualPercent > 0)
    .map((c) => ({
      name: c.label,
      value: c.actualPercent,
      color: c.color,
    }));

  const targetChartData = comparisons
    .filter((c) => c.targetPercent > 0)
    .map((c) => ({
      name: c.label,
      value: c.targetPercent,
      color: c.color,
    }));

  const formatCurrency = (value: number) =>
    value.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " PLN";

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Analiza i Rebalancing Portfela
      </h1>

      {/* Educational Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900">
                <strong>Kwartalny przegląd portfela</strong> to wystarczająca
                częstotliwość dla strategii długoterminowej. Zbyt częste zmiany
                generują niepotrzebne koszty transakcyjne i prowadzą do
                emocjonalnych decyzji.
              </p>
              <p className="text-blue-800 mt-2 text-sm">
                Zalecane terminy przeglądów: koniec marca, czerwca, września i
                grudnia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Cushion Warning */}
      {!cushionStatus.isComplete && cushionStatus.target > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-900 font-medium">
                  Poduszka bezpieczeństwa niekompletna
                </p>
                <p className="text-amber-800 mt-1 text-sm">
                  Przed rebalancingiem portfela inwestycyjnego zalecamy
                  uzupełnienie poduszki bezpieczeństwa. Aktualna wartość:{" "}
                  <strong>{formatCurrency(cushionStatus.current)}</strong> z{" "}
                  <strong>{formatCurrency(cushionStatus.target)}</strong> (
                  {cushionStatus.percent.toFixed(0)}%).
                </p>
                <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${cushionStatus.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alignment Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Wskaźnik dopasowania portfela
              </h3>
              <p className={`mt-1 ${getScoreColor(alignmentScore)}`}>
                {getScoreLabel(alignmentScore)}
              </p>
            </div>
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBgColor(
                alignmentScore
              )}`}
            >
              <span
                className={`text-3xl font-bold ${getScoreColor(
                  alignmentScore
                )}`}
              >
                {alignmentScore}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dual Pie Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Aktualny portfel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actualChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={actualChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => `${value.toFixed(1)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {actualChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Brak aktywów w portfelu
              </div>
            )}
            <p className="text-center text-sm text-gray-600 mt-2">
              Łączna wartość: <strong>{formatCurrency(totalRealValue)}</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Portfel docelowy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {targetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={targetChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => `${value.toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {targetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Brak zdefiniowanego portfela docelowego
              </div>
            )}
            <p className="text-center text-sm text-gray-600 mt-2">
              Suma alokacji:{" "}
              <strong>{totalTargetAllocation.toFixed(0)}%</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Porównanie alokacji</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold text-gray-700">
                    Kategoria
                  </th>
                  <th className="pb-3 font-semibold text-gray-700 text-right">
                    Cel %
                  </th>
                  <th className="pb-3 font-semibold text-gray-700 text-right">
                    Aktualnie %
                  </th>
                  <th className="pb-3 font-semibold text-gray-700 text-right">
                    Różnica
                  </th>
                  <th className="pb-3 font-semibold text-gray-700 text-right">
                    Wartość
                  </th>
                  <th className="pb-3 font-semibold text-gray-700 text-right">
                    Do celu
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item) => {
                  const level = getDeviationLevel(item.deviation);
                  return (
                    <tr
                      key={item.category}
                      className={`border-b ${getDeviationBgColor(level)}`}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {item.targetPercent.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
                        {item.actualPercent.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 ${getDeviationColor(
                            level
                          )}`}
                        >
                          <DeviationIcon deviation={item.deviation} />
                          {item.deviation > 0 ? "+" : ""}
                          {item.deviation.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.actualValue)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            item.differenceValue >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.differenceValue >= 0 ? "+" : ""}
                          {formatCurrency(item.differenceValue)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span className="text-gray-600">{"< 5% - OK"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
              <span className="text-gray-600">5-10% - Do obserwacji</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span className="text-gray-600">{"> 10% - Wymaga uwagi"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Suggestions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strategy A: Through new contributions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-5 h-5" />
              Rebalancing przez nowe wpłaty
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Zalecane - bez kosztów transakcyjnych
            </p>
          </CardHeader>
          <CardContent>
            {settings?.monthly_savings_amount ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Przy miesięcznych oszczędnościach{" "}
                  <strong>
                    {formatCurrency(settings.monthly_savings_amount)}
                  </strong>
                  , sugerowany rozkład na najbliższe 3 miesiące:
                </p>
                <div className="space-y-2">
                  {monthlyAllocationSuggestion.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(item.suggestedAmount)}
                        </span>
                        {Math.abs(item.suggestedAmount - item.normalAmount) >
                          1 && (
                          <span className="text-xs text-gray-500 block">
                            (zwykle {formatCurrency(item.normalAmount)})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Nie ustawiono miesięcznej kwoty oszczędności.</p>
                <p className="text-sm mt-1">
                  Przejdź do ustawień profilu, aby ją skonfigurować.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategy B: Through transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <RefreshCw className="w-5 h-5" />
              Rebalancing przez transakcje
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Dla większych odchyleń - może generować koszty
            </p>
          </CardHeader>
          <CardContent>
            {rebalancingSuggestions.overweight.length > 0 ||
            rebalancingSuggestions.underweight.length > 0 ? (
              <div className="space-y-4">
                {rebalancingSuggestions.overweight.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      Sprzedaj / Przenieś (nadwyżka)
                    </h4>
                    {rebalancingSuggestions.overweight.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between py-2 bg-red-50 rounded px-3 mb-1"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-semibold text-red-700">
                          -{formatCurrency(Math.abs(item.differenceValue))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {rebalancingSuggestions.underweight.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Kup / Wpłać (niedobór)
                    </h4>
                    {rebalancingSuggestions.underweight.map((item) => (
                      <div
                        key={item.category}
                        className="flex items-center justify-between py-2 bg-green-50 rounded px-3 mb-1"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-semibold text-green-700">
                          +{formatCurrency(Math.abs(item.differenceValue))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Uwaga: Transakcje mogą generować koszty i potencjalne
                  konsekwencje podatkowe.
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">
                  Portfel jest dobrze zbalansowany!
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Nie są wymagane żadne transakcje rebalancingowe.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
