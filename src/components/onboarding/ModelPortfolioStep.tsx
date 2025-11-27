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

export interface ModelPortfolioAsset {
  name: string;
  category: string;
  allocation: number;
  color: string;
}

interface ModelPortfolioStepProps {
  onSubmit: (assets: ModelPortfolioAsset[], minCashLevel: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const AVAILABLE_ASSETS = [
  {
    name: "Obligacje indeksowane inflacją",
    category: "bonds",
    color: "#f59e0b",
  },
  { name: "Akcje zagraniczne", category: "foreign_stocks", color: "#10b981" },
  {
    name: "Fundusze inwestycyjne",
    category: "investment_funds",
    color: "#8b5cf6",
  },
  { name: "Złoto inwestycyjne", category: "gold", color: "#eab308" },
  { name: "Lokaty", category: "deposits", color: "#3b82f6" },
  {
    name: "Konta oszczędnościowe",
    category: "savings_accounts",
    color: "#06b6d4",
  },
  { name: "IKE/IKZE", category: "ike_ikze", color: "#ec4899" },
  { name: "PPK", category: "ppk", color: "#f97316" },
  { name: "Waluty", category: "currencies", color: "#14b8a6" },
];

const DEFAULT_PORTFOLIO: ModelPortfolioAsset[] = [
  {
    name: "Obligacje indeksowane inflacją",
    category: "bonds",
    allocation: 40,
    color: "#f59e0b",
  },
  {
    name: "Akcje zagraniczne",
    category: "foreign_stocks",
    allocation: 30,
    color: "#10b981",
  },
  {
    name: "Fundusze inwestycyjne",
    category: "investment_funds",
    allocation: 20,
    color: "#8b5cf6",
  },
  {
    name: "Złoto inwestycyjne",
    category: "gold",
    allocation: 10,
    color: "#eab308",
  },
];

export function ModelPortfolioStep({
  onSubmit,
  onBack,
  isSubmitting,
}: ModelPortfolioStepProps) {
  const [assets, setAssets] =
    useState<ModelPortfolioAsset[]>(DEFAULT_PORTFOLIO);
  const [minCashLevel, setMinCashLevel] = useState(5);
  const [showAddAsset, setShowAddAsset] = useState(false);

  const totalAllocation = assets.reduce(
    (sum, asset) => sum + asset.allocation,
    0
  );
  const isValid = Math.abs(totalAllocation - 100) < 0.1;

  const handleSliderChange = (index: number, value: number[]) => {
    const newValue = value[0];
    const oldValue = assets[index].allocation;
    const diff = newValue - oldValue;

    const newAssets = [...assets];
    newAssets[index].allocation = newValue;

    // Distribute the difference proportionally among other assets
    const otherAssets = newAssets.filter((_, i) => i !== index);
    const otherTotal = otherAssets.reduce((sum, a) => sum + a.allocation, 0);

    if (otherTotal > 0) {
      otherAssets.forEach((asset) => {
        const ratio = asset.allocation / otherTotal;
        asset.allocation = Math.max(0, asset.allocation - diff * ratio);
      });
    }

    setAssets(newAssets);
  };

  const handleAddAsset = (assetTemplate: (typeof AVAILABLE_ASSETS)[0]) => {
    const exists = assets.some((a) => a.category === assetTemplate.category);
    if (exists) {
      alert("To aktywo jest już w portfelu");
      return;
    }

    const newAssets = [...assets];

    // Add new asset with 10% allocation
    newAssets.push({
      name: assetTemplate.name,
      category: assetTemplate.category,
      allocation: 10,
      color: assetTemplate.color,
    });

    // Reduce others proportionally
    const reduceAmount = 10 / assets.length;
    assets.forEach((asset) => {
      asset.allocation = Math.max(0, asset.allocation - reduceAmount);
    });

    setAssets(newAssets);
    setShowAddAsset(false);
  };

  const handleRemoveAsset = (index: number) => {
    if (assets.length <= 1) {
      alert("Musisz mieć przynajmniej jedno aktywo w portfelu");
      return;
    }

    const removedAllocation = assets[index].allocation;
    const newAssets = assets.filter((_, i) => i !== index);

    // Distribute removed allocation proportionally
    const remainingTotal = newAssets.reduce((sum, a) => sum + a.allocation, 0);
    if (remainingTotal > 0) {
      newAssets.forEach((asset) => {
        const ratio = asset.allocation / remainingTotal;
        asset.allocation += removedAllocation * ratio;
      });
    }

    setAssets(newAssets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      alert("Suma alokacji musi wynosić 100%");
      return;
    }
    onSubmit(assets, minCashLevel);
  };

  const availableToAdd = AVAILABLE_ASSETS.filter(
    (template) => !assets.some((a) => a.category === template.category)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfel Modelowy</CardTitle>
        <CardDescription>
          Określ docelową strukturę swojego portfela inwestycyjnego
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              🎯 Portfel Modelowy
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              To jest Twój docelowy portfel długoterminowy. Możesz dostosować
              alokacje lub dodać/usunąć aktywa.
            </p>
            <p className="text-sm text-blue-800">
              <strong>Domyślna propozycja:</strong> 40% obligacje, 30% akcje
              zagraniczne, 20% fundusze, 10% złoto
            </p>
          </div>

          {/* Minimum cash level */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <Label htmlFor="minCash" className="text-base font-medium">
                Minimalny poziom gotówki
              </Label>
              <span className="font-semibold text-lg">{minCashLevel}%</span>
            </div>
            <Slider
              id="minCash"
              min={0}
              max={20}
              step={1}
              value={[minCashLevel]}
              onValueChange={(value) => setMinCashLevel(value[0])}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              System będzie ostrzegać, gdy gotówka spadnie poniżej tego poziomu
            </p>
          </div>

          {/* Asset allocations */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Alokacja aktywów</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddAsset(!showAddAsset)}
                disabled={availableToAdd.length === 0}
              >
                {showAddAsset ? "Anuluj" : "+ Dodaj aktywo"}
              </Button>
            </div>

            {/* Add asset dropdown */}
            {showAddAsset && availableToAdd.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium mb-3">
                  Wybierz aktywo do dodania:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableToAdd.map((asset) => (
                    <Button
                      key={asset.category}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAsset(asset)}
                      className="justify-start"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: asset.color }}
                      ></span>
                      {asset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Asset sliders */}
            {assets.map((asset, index) => (
              <div
                key={asset.category}
                className="space-y-3 pb-3 border-b border-gray-200 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <Label htmlFor={`asset-${index}`} className="text-base">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: asset.color }}
                    ></span>
                    {asset.name}
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {asset.allocation.toFixed(1)}%
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAsset(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <Slider
                  id={`asset-${index}`}
                  min={0}
                  max={100}
                  step={0.1}
                  value={[asset.allocation]}
                  onValueChange={(value) => handleSliderChange(index, value)}
                  className="w-full"
                />
              </div>
            ))}

            {/* Total check */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Suma alokacji:</span>
                <span
                  className={`font-bold text-lg ${
                    isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {totalAllocation.toFixed(1)}%
                </span>
              </div>
              {!isValid && (
                <p className="text-sm text-red-600 mt-2">
                  Suma musi wynosić dokładnie 100%
                </p>
              )}
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
            <Button type="submit" size="lg" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Zapisywanie..." : "Zakończ konfigurację"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
