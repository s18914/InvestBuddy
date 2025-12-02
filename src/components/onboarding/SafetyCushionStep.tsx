import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SafetyCushionAllocation {
  deposits: number;
  savingsAccounts: number;
  inflationBonds: number;
}

interface SafetyCushionStepProps {
  monthlyLivingCosts: number;
  targetAmount: number;
  initialAllocation: SafetyCushionAllocation;
  onSubmit: (allocation: SafetyCushionAllocation) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function SafetyCushionStep({
  monthlyLivingCosts,
  targetAmount,
  initialAllocation,
  onSubmit,
  onBack,
  isSubmitting,
}: SafetyCushionStepProps) {
  const [allocation, setAllocation] =
    useState<SafetyCushionAllocation>(initialAllocation);

  const handleSliderChange = (
    field: keyof SafetyCushionAllocation,
    value: number[]
  ) => {
    const newValue = value[0];

    // Adjust other fields proportionally
    if (field === "deposits") {
      const remaining = 100 - newValue;
      const savingsRatio =
        allocation.savingsAccounts /
        (allocation.savingsAccounts + allocation.inflationBonds);
      const bondsRatio =
        allocation.inflationBonds /
        (allocation.savingsAccounts + allocation.inflationBonds);

      setAllocation({
        deposits: newValue,
        savingsAccounts: remaining * savingsRatio,
        inflationBonds: remaining * bondsRatio,
      });
    } else if (field === "savingsAccounts") {
      const remaining = 100 - newValue;
      const depositsRatio =
        allocation.deposits / (allocation.deposits + allocation.inflationBonds);
      const bondsRatio =
        allocation.inflationBonds /
        (allocation.deposits + allocation.inflationBonds);

      setAllocation({
        deposits: remaining * depositsRatio,
        savingsAccounts: newValue,
        inflationBonds: remaining * bondsRatio,
      });
    } else if (field === "inflationBonds") {
      const remaining = 100 - newValue;
      const depositsRatio =
        allocation.deposits /
        (allocation.deposits + allocation.savingsAccounts);
      const savingsRatio =
        allocation.savingsAccounts /
        (allocation.deposits + allocation.savingsAccounts);

      setAllocation({
        deposits: remaining * depositsRatio,
        savingsAccounts: remaining * savingsRatio,
        inflationBonds: newValue,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(allocation);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAmountForCategory = (percentage: number) => {
    return (targetAmount * percentage) / 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poduszka Finansowa</CardTitle>
        <CardDescription>
          Skonfiguruj skład swojej poduszki finansowej
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Twoja poduszka finansowa
              </p>
              <p className="text-4xl font-bold text-blue-900">
                {formatCurrency(targetAmount)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(monthlyLivingCosts)} × 6 miesięcy
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">
              📊 Rekomendowany skład
            </h4>
            <p className="text-sm text-amber-800 mb-2">
              Poduszka finansowa powinna składać się z instrumentów o niskim
              ryzyku:
            </p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>
                • <strong>25% Lokaty i konta oszczędnościowe</strong> - płynność
                i dostępność
              </li>
              <li>
                •{" "}
                <strong>
                  75% Obligacje EDO (10-letnie indeksowane inflacją)
                </strong>{" "}
                - ochrona przed inflacją, zysk powyżej inflacji
              </li>
            </ul>
          </div>

          {/* Allocation sliders */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Dostosuj skład portfela</h3>

            {/* Deposits */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="deposits" className="text-base">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Lokaty
                </Label>
                <div className="text-right">
                  <p className="font-semibold">
                    {allocation.deposits.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(getAmountForCategory(allocation.deposits))}
                  </p>
                </div>
              </div>
              <Slider
                id="deposits"
                min={0}
                max={100}
                step={0.1}
                value={[allocation.deposits]}
                onValueChange={(value) => handleSliderChange("deposits", value)}
                className="w-full"
              />
            </div>

            {/* Savings Accounts */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="savingsAccounts" className="text-base">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Konta oszczędnościowe
                </Label>
                <div className="text-right">
                  <p className="font-semibold">
                    {allocation.savingsAccounts.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(
                      getAmountForCategory(allocation.savingsAccounts)
                    )}
                  </p>
                </div>
              </div>
              <Slider
                id="savingsAccounts"
                min={0}
                max={100}
                step={0.1}
                value={[allocation.savingsAccounts]}
                onValueChange={(value) =>
                  handleSliderChange("savingsAccounts", value)
                }
                className="w-full"
              />
            </div>

            {/* Inflation Bonds - EDO */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="inflationBonds" className="text-base">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                  Obligacje EDO (10-letnie)
                </Label>
                <div className="text-right">
                  <p className="font-semibold">
                    {allocation.inflationBonds.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(
                      getAmountForCategory(allocation.inflationBonds)
                    )}
                  </p>
                </div>
              </div>
              <Slider
                id="inflationBonds"
                min={0}
                max={100}
                step={0.1}
                value={[allocation.inflationBonds]}
                onValueChange={(value) =>
                  handleSliderChange("inflationBonds", value)
                }
                className="w-full"
              />
            </div>

            {/* Total check */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Suma alokacji:</span>
                <span
                  className={`font-bold text-lg ${
                    Math.abs(
                      allocation.deposits +
                        allocation.savingsAccounts +
                        allocation.inflationBonds -
                        100
                    ) < 0.1
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    allocation.deposits +
                    allocation.savingsAccounts +
                    allocation.inflationBonds
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              ← Wstecz
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz poduszkę finansową"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
