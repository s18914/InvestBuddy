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
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

export type BondType = "OTS" | "ROR" | "DOR" | "COI" | "EDO" | "TOS" | "TOZ";
export type FundCategory =
  | "equity"
  | "mixed"
  | "absolute_return"
  | "bonds"
  | "other";

export interface ModelPortfolioAsset {
  id: string;
  name: string;
  category: string;
  allocation: number;
  color: string;
  bondType?: BondType;
  fundCategory?: FundCategory;
}

interface ModelPortfolioStepProps {
  onSubmit: (assets: ModelPortfolioAsset[], minCashLevel: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const BOND_TYPES: { value: BondType; label: string; description: string }[] = [
  {
    value: "EDO",
    label: "EDO (10-letnie)",
    description: "Indeksowane inflacją, 10 lat",
  },
  {
    value: "COI",
    label: "COI (4-letnie)",
    description: "Indeksowane inflacją, 4 lata",
  },
  {
    value: "TOS",
    label: "TOS (3-letnie)",
    description: "Oszczędnościowe, 3 lata",
  },
  {
    value: "TOZ",
    label: "TOZ (3-letnie)",
    description: "Zmiennoprocentowe, 3 lata",
  },
  {
    value: "ROR",
    label: "ROR (roczne)",
    description: "Zmiennoprocentowe, 1 rok",
  },
  {
    value: "DOR",
    label: "DOR (2-letnie)",
    description: "Zmiennoprocentowe, 2 lata",
  },
  {
    value: "OTS",
    label: "OTS (3-miesięczne)",
    description: "Oszczędnościowe, 3 miesiące",
  },
];

const FUND_CATEGORIES: {
  value: FundCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "mixed",
    label: "Mieszane",
    description: "Zrównoważony portfel akcji i obligacji",
  },
  {
    value: "equity",
    label: "Akcyjne",
    description: "Głównie akcje, wyższe ryzyko",
  },
  {
    value: "bonds",
    label: "Obligacyjne",
    description: "Głównie obligacje, niższe ryzyko",
  },
  {
    value: "absolute_return",
    label: "Absolute Return",
    description: "Cel: dodatnia stopa zwrotu",
  },
  { value: "other", label: "Inne", description: "Pozostałe strategie" },
];

const CATEGORY_COLORS: Record<string, string> = {
  bonds: "#f59e0b",
  foreign_stocks: "#10b981",
  investment_funds: "#8b5cf6",
  gold: "#eab308",
  deposits: "#3b82f6",
  savings_accounts: "#06b6d4",
  ike_ikze: "#ec4899",
  ppk: "#f97316",
  currencies: "#14b8a6",
};

const CATEGORY_LABELS: Record<string, string> = {
  bonds: "Obligacje",
  foreign_stocks: "Akcje zagraniczne",
  investment_funds: "Fundusze inwestycyjne",
  gold: "Złoto inwestycyjne",
  deposits: "Lokaty",
  savings_accounts: "Konta oszczędnościowe",
  ike_ikze: "IKE/IKZE",
  ppk: "PPK",
  currencies: "Waluty",
};

const AVAILABLE_CATEGORIES = [
  { category: "bonds", allowsMultiple: true },
  { category: "investment_funds", allowsMultiple: true },
  { category: "foreign_stocks", allowsMultiple: false },
  { category: "gold", allowsMultiple: false },
  { category: "deposits", allowsMultiple: false },
  { category: "savings_accounts", allowsMultiple: false },
  { category: "ike_ikze", allowsMultiple: false },
  { category: "ppk", allowsMultiple: false },
  { category: "currencies", allowsMultiple: false },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const getBondName = (bondType: BondType) => {
  const bond = BOND_TYPES.find((b) => b.value === bondType);
  return `Obligacje ${bond?.label || bondType}`;
};

const getFundName = (fundCategory: FundCategory) => {
  const fund = FUND_CATEGORIES.find((f) => f.value === fundCategory);
  return `Fundusze ${fund?.label.toLowerCase() || fundCategory}`;
};

const DEFAULT_PORTFOLIO: ModelPortfolioAsset[] = [
  {
    id: generateId(),
    name: "Obligacje EDO (10-letnie)",
    category: "bonds",
    allocation: 40,
    color: "#f59e0b",
    bondType: "EDO",
  },
  {
    id: generateId(),
    name: "Akcje zagraniczne",
    category: "foreign_stocks",
    allocation: 30,
    color: "#10b981",
  },
  {
    id: generateId(),
    name: "Fundusze mieszane",
    category: "investment_funds",
    allocation: 20,
    color: "#8b5cf6",
    fundCategory: "mixed",
  },
  {
    id: generateId(),
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
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const totalAllocation = assets.reduce(
    (sum, asset) => sum + asset.allocation,
    0
  );
  const isValid = Math.abs(totalAllocation - 100) < 0.1;

  const getUsedBondTypes = (): BondType[] => {
    return assets
      .filter((a) => a.category === "bonds" && a.bondType)
      .map((a) => a.bondType as BondType);
  };

  const getUsedFundCategories = (): FundCategory[] => {
    return assets
      .filter((a) => a.category === "investment_funds" && a.fundCategory)
      .map((a) => a.fundCategory as FundCategory);
  };

  const handleSliderChange = (id: string, value: number[]) => {
    const newValue = value[0];
    const assetIndex = assets.findIndex((a) => a.id === id);
    if (assetIndex === -1) return;

    const oldValue = assets[assetIndex].allocation;
    const diff = newValue - oldValue;

    const newAssets = [...assets];
    newAssets[assetIndex] = { ...newAssets[assetIndex], allocation: newValue };

    const otherAssets = newAssets.filter((_, i) => i !== assetIndex);
    const otherTotal = otherAssets.reduce((sum, a) => sum + a.allocation, 0);

    if (otherTotal > 0) {
      otherAssets.forEach((asset) => {
        const ratio = asset.allocation / otherTotal;
        asset.allocation = Math.max(0, asset.allocation - diff * ratio);
      });
    }

    setAssets(newAssets);
  };

  const handleBondTypeChange = (id: string, bondType: BondType) => {
    setAssets(
      assets.map((asset) => {
        if (asset.id === id) {
          return {
            ...asset,
            bondType,
            name: getBondName(bondType),
          };
        }
        return asset;
      })
    );
  };

  const handleFundCategoryChange = (id: string, fundCategory: FundCategory) => {
    setAssets(
      assets.map((asset) => {
        if (asset.id === id) {
          return {
            ...asset,
            fundCategory,
            name: getFundName(fundCategory),
          };
        }
        return asset;
      })
    );
  };

  const handleAddAsset = (category: string) => {
    const categoryConfig = AVAILABLE_CATEGORIES.find(
      (c) => c.category === category
    );
    if (!categoryConfig) return;

    const existingAssets = assets.filter((a) => a.category === category);

    if (!categoryConfig.allowsMultiple && existingAssets.length > 0) {
      return;
    }

    let newAsset: ModelPortfolioAsset;
    const color = CATEGORY_COLORS[category];

    if (category === "bonds") {
      const usedTypes = getUsedBondTypes();
      const availableType = BOND_TYPES.find(
        (t) => !usedTypes.includes(t.value)
      );
      if (!availableType) {
        alert("Wszystkie typy obligacji zostały już dodane");
        return;
      }
      newAsset = {
        id: generateId(),
        name: getBondName(availableType.value),
        category: "bonds",
        allocation: 10,
        color,
        bondType: availableType.value,
      };
    } else if (category === "investment_funds") {
      const usedCategories = getUsedFundCategories();
      const availableCategory = FUND_CATEGORIES.find(
        (c) => !usedCategories.includes(c.value)
      );
      if (!availableCategory) {
        alert("Wszystkie kategorie funduszy zostały już dodane");
        return;
      }
      newAsset = {
        id: generateId(),
        name: getFundName(availableCategory.value),
        category: "investment_funds",
        allocation: 10,
        color,
        fundCategory: availableCategory.value,
      };
    } else {
      newAsset = {
        id: generateId(),
        name: CATEGORY_LABELS[category],
        category,
        allocation: 10,
        color,
      };
    }

    const reduceAmount = 10 / assets.length;
    const newAssets = assets.map((asset) => ({
      ...asset,
      allocation: Math.max(0, asset.allocation - reduceAmount),
    }));
    newAssets.push(newAsset);

    setAssets(newAssets);
    setShowAddAsset(false);
    setExpandedAsset(newAsset.id);
  };

  const handleRemoveAsset = (id: string) => {
    if (assets.length <= 1) {
      alert("Musisz mieć przynajmniej jedno aktywo w portfelu");
      return;
    }

    const removedAsset = assets.find((a) => a.id === id);
    if (!removedAsset) return;

    const removedAllocation = removedAsset.allocation;
    const newAssets = assets.filter((a) => a.id !== id);

    const remainingTotal = newAssets.reduce((sum, a) => sum + a.allocation, 0);
    if (remainingTotal > 0) {
      newAssets.forEach((asset) => {
        const ratio = asset.allocation / remainingTotal;
        asset.allocation += removedAllocation * ratio;
      });
    }

    setAssets(newAssets);
    if (expandedAsset === id) {
      setExpandedAsset(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      alert("Suma alokacji musi wynosić 100%");
      return;
    }
    onSubmit(assets, minCashLevel);
  };

  const canAddCategory = (category: string) => {
    const config = AVAILABLE_CATEGORIES.find((c) => c.category === category);
    if (!config) return false;

    const existingCount = assets.filter((a) => a.category === category).length;

    if (!config.allowsMultiple) {
      return existingCount === 0;
    }

    if (category === "bonds") {
      return getUsedBondTypes().length < BOND_TYPES.length;
    }
    if (category === "investment_funds") {
      return getUsedFundCategories().length < FUND_CATEGORIES.length;
    }

    return true;
  };

  const availableToAdd = AVAILABLE_CATEGORIES.filter((c) =>
    canAddCategory(c.category)
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              🎯 Portfel Modelowy
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              To jest Twój docelowy portfel długoterminowy. Możesz dostosować
              alokacje, zmienić typy instrumentów lub dodać/usunąć aktywa.
            </p>
            <p className="text-sm text-blue-800">
              <strong>Domyślna propozycja:</strong> 40% obligacje EDO, 30% akcje
              zagraniczne, 20% fundusze mieszane, 10% złoto
            </p>
          </div>

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
                {showAddAsset ? (
                  "Anuluj"
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" /> Dodaj aktywo
                  </>
                )}
              </Button>
            </div>

            {showAddAsset && availableToAdd.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium mb-3">
                  Wybierz aktywo do dodania:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableToAdd.map(({ category }) => (
                    <Button
                      key={category}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAsset(category)}
                      className="justify-start"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      />
                      {CATEGORY_LABELS[category]}
                      {(category === "bonds" ||
                        category === "investment_funds") && (
                        <span className="ml-1 text-xs text-gray-500">+</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="font-medium">{asset.name}</span>
                      {(asset.category === "bonds" ||
                        asset.category === "investment_funds") && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAsset(
                              expandedAsset === asset.id ? null : asset.id
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedAsset === asset.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {asset.allocation.toFixed(1)}%
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Slider
                    min={0}
                    max={100}
                    step={0.1}
                    value={[asset.allocation]}
                    onValueChange={(value) =>
                      handleSliderChange(asset.id, value)
                    }
                    className="w-full"
                  />
                </div>

                {expandedAsset === asset.id && asset.category === "bonds" && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-amber-50">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Typ obligacji:
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {BOND_TYPES.map((bondType) => {
                        const isUsed = getUsedBondTypes().includes(
                          bondType.value
                        );
                        const isCurrent = asset.bondType === bondType.value;
                        return (
                          <button
                            key={bondType.value}
                            type="button"
                            disabled={isUsed && !isCurrent}
                            onClick={() =>
                              handleBondTypeChange(asset.id, bondType.value)
                            }
                            className={`text-left p-2 rounded border text-sm transition-colors ${
                              isCurrent
                                ? "border-amber-500 bg-amber-100 text-amber-900"
                                : isUsed
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                            }`}
                          >
                            <div className="font-medium">{bondType.label}</div>
                            <div className="text-xs text-gray-500">
                              {bondType.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {expandedAsset === asset.id &&
                  asset.category === "investment_funds" && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-purple-50">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Kategoria funduszu:
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {FUND_CATEGORIES.map((fundCat) => {
                          const isUsed = getUsedFundCategories().includes(
                            fundCat.value
                          );
                          const isCurrent =
                            asset.fundCategory === fundCat.value;
                          return (
                            <button
                              key={fundCat.value}
                              type="button"
                              disabled={isUsed && !isCurrent}
                              onClick={() =>
                                handleFundCategoryChange(
                                  asset.id,
                                  fundCat.value
                                )
                              }
                              className={`text-left p-2 rounded border text-sm transition-colors ${
                                isCurrent
                                  ? "border-purple-500 bg-purple-100 text-purple-900"
                                  : isUsed
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                              }`}
                            >
                              <div className="font-medium">{fundCat.label}</div>
                              <div className="text-xs text-gray-500">
                                {fundCat.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            ))}

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
