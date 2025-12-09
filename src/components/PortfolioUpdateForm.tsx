import { useState, useEffect } from "react";
import { Save, Plus, Edit2, Trash2, AlertTriangle, Info } from "lucide-react";
import { Asset, AssetCategory } from "@/types/database.types";
import { getCategoryColor, getCategoryLabel } from "@/types/assetConfig";
import { fetchAllAssetDetails } from "@/services/assetDetailsService";

interface AssetDetails {
  interest_rate?: number;
  bank_name?: string;
  start_date?: string;
  duration_months?: number;
  maturity_date?: string;
  account_name?: string;
  bond_type?: string;
  is_inflation_linked?: boolean;
  inflation_rate?: number;
  purchase_date?: string;
  fund_name?: string;
  fund_category?: string;
  ounces?: number;
  exchange_rate?: number;
  currency_code?: string;
  amount?: number;
  account_type?: string;
  contributed_this_year?: number;
  annual_limit?: number;
}

interface AssetUpdate {
  id: string;
  name: string;
  category: AssetCategory;
  current_value: number;
  new_value: number;
  isEditing: boolean;
  details?: AssetDetails;
  ounces?: number;
  exchange_rate?: number;
  amount?: number;
  isMatured?: boolean;
  maturityInfo?: string;
  isNewThisMonth?: boolean;
  originalValue?: number;
}

interface PendingAsset {
  name: string;
  category: AssetCategory;
  current_value: number;
  currency: string;
  details?: any;
}

interface PortfolioUpdateFormProps {
  assets: Asset[];
  pendingAssets: PendingAsset[];
  selectedMonth: string;
  onSave: (updates: AssetUpdate[]) => Promise<void>;
  onAddNew: () => void;
  onDelete: (assetId: string) => Promise<void>;
  onRemovePending: (index: number) => void;
  currentDate: string;
}

function isValueEditable(category: AssetCategory): boolean {
  const nonEditableCategories: AssetCategory[] = [
    "gold",
    "currencies",
    "deposits",
    "bonds",
  ];
  return !nonEditableCategories.includes(category);
}

export default function PortfolioUpdateForm({
  assets,
  pendingAssets,
  selectedMonth,
  onSave,
  onAddNew,
  onDelete,
  onRemovePending,
  currentDate,
}: PortfolioUpdateFormProps) {
  const [assetUpdates, setAssetUpdates] = useState<AssetUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      setDetailsLoading(true);

      const updates: AssetUpdate[] = [];
      const existingUpdatesMap = new Map(assetUpdates.map((u) => [u.id, u]));

      const monthStart = new Date(selectedMonth + "-01");
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      for (const asset of assets) {
        const existingUpdate = existingUpdatesMap.get(asset.id);

        if (existingUpdate) {
          updates.push(existingUpdate);
          continue;
        }

        let details: AssetDetails | undefined;
        let isMatured = false;
        let maturityInfo = "";

        const assetCreatedAt = new Date(asset.created_at);
        const isNewThisMonth =
          assetCreatedAt >= monthStart && assetCreatedAt < monthEnd;

        try {
          const detailsArray = await fetchAllAssetDetails(
            [asset.id],
            asset.category
          );
          if (detailsArray.length > 0) {
            details = detailsArray[0];

            if (asset.category === "deposits" && details?.maturity_date) {
              if (new Date(details.maturity_date) <= new Date(currentDate)) {
                isMatured = true;
                maturityInfo = `Lokata zakończyła się ${new Date(
                  details.maturity_date
                ).toLocaleDateString("pl-PL")}`;
              }
            }

            if (asset.category === "bonds" && details?.purchase_date) {
              const bondMaturity = calculateBondMaturity(
                details?.bond_type,
                details?.purchase_date
              );
              if (
                bondMaturity &&
                new Date(bondMaturity) <= new Date(currentDate)
              ) {
                isMatured = true;
                maturityInfo = `Obligacja została wykupiona ${new Date(
                  bondMaturity
                ).toLocaleDateString("pl-PL")}`;
              }
            }
          }
        } catch (e) {
          console.error("Error fetching details for asset:", asset.id, e);
        }

        const originalValue = isNewThisMonth ? 0 : asset.current_value;

        updates.push({
          id: asset.id,
          name: asset.name,
          category: asset.category,
          current_value: asset.current_value,
          new_value: asset.current_value,
          isEditing: false,
          details,
          ounces: details?.ounces,
          exchange_rate: details?.exchange_rate || undefined,
          amount: details?.amount,
          isMatured,
          maturityInfo,
          isNewThisMonth,
          originalValue,
        });
      }

      for (let i = 0; i < pendingAssets.length; i++) {
        const pending = pendingAssets[i];
        const pendingId = `pending-${i}`;

        const existingPending = existingUpdatesMap.get(pendingId);
        if (existingPending) {
          updates.push(existingPending);
          continue;
        }

        updates.push({
          id: pendingId,
          name: pending.name,
          category: pending.category,
          current_value: pending.current_value,
          new_value: pending.current_value,
          isEditing: false,
          details: pending.details,
          ounces: pending.details?.ounces,
          exchange_rate: pending.details?.exchange_rate,
          amount: pending.details?.amount,
          isMatured: false,
          maturityInfo: "",
          isNewThisMonth: true,
          originalValue: 0,
        });
      }

      setAssetUpdates(updates);
      setDetailsLoading(false);
    }

    loadDetails();
  }, [assets, pendingAssets, currentDate, selectedMonth]);

  function calculateBondMaturity(
    bondType?: string,
    purchaseDate?: string
  ): string | null {
    if (!bondType || !purchaseDate) return null;
    const purchase = new Date(purchaseDate);
    const maturityYears: Record<string, number> = {
      OTS: 0.25,
      ROR: 1,
      DOR: 2,
      TOS: 3,
      COI: 4,
      EDO: 10,
      TOZ: 3,
    };
    const years = maturityYears[bondType] || 1;
    purchase.setFullYear(purchase.getFullYear() + years);
    return purchase.toISOString().split("T")[0];
  }

  const handleValueChange = (id: string, value: string) => {
    setAssetUpdates(
      assetUpdates.map((asset) =>
        asset.id === id
          ? { ...asset, new_value: parseFloat(value) || 0 }
          : asset
      )
    );
  };

  const handleGoldOuncesChange = (id: string, value: string) => {
    const ounces = parseFloat(value) || 0;
    setAssetUpdates(
      assetUpdates.map((asset) => {
        if (asset.id !== id) return asset;
        const newValue = ounces * (asset.exchange_rate || 0);
        return { ...asset, ounces, new_value: newValue };
      })
    );
  };

  const handleCurrencyAmountChange = (id: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setAssetUpdates(
      assetUpdates.map((asset) => {
        if (asset.id !== id) return asset;
        const newValue = amount * (asset.exchange_rate || 0);
        return { ...asset, amount, new_value: newValue };
      })
    );
  };

  const handleExchangeRateChange = (id: string, value: string) => {
    const rate = parseFloat(value) || 0;
    setAssetUpdates(
      assetUpdates.map((asset) => {
        if (asset.id !== id) return asset;
        const quantity =
          asset.category === "gold" ? asset.ounces : asset.amount;
        const newValue = (quantity || 0) * rate;
        return { ...asset, exchange_rate: rate, new_value: newValue };
      })
    );
  };

  const toggleEdit = (id: string) => {
    setAssetUpdates(
      assetUpdates.map((asset) =>
        asset.id === id ? { ...asset, isEditing: !asset.isEditing } : asset
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(assetUpdates);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    assetUpdates.some(
      (asset) =>
        asset.new_value !== (asset.originalValue ?? asset.current_value)
    ) || assetUpdates.some((asset) => asset.isNewThisMonth);

  const totalOriginalValue = assetUpdates.reduce(
    (sum, asset) => sum + (asset.originalValue ?? asset.current_value),
    0
  );
  const totalNewValue = assetUpdates.reduce(
    (sum, asset) => sum + asset.new_value,
    0
  );
  const valueDiff = totalNewValue - totalOriginalValue;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Aktualizacja wartości aktywów
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Zaktualizuj wartości swoich aktywów na{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("pl-PL", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dodaj nowe aktywo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Obecna wartość</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalOriginalValue.toLocaleString("pl-PL", {
                minimumFractionDigits: 2,
              })}{" "}
              PLN
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Nowa wartość</p>
            <p className="text-lg font-semibold text-blue-600">
              {totalNewValue.toFixed(2)} PLN
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Zmiana</p>
            <p
              className={`text-lg font-semibold ${
                valueDiff >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {valueDiff >= 0 ? "+" : ""}
              {valueDiff.toFixed(2)} PLN
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Matured assets warning */}
        {assetUpdates.some((a) => a.isMatured) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2">
                  Wymagają uwagi
                </h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  {assetUpdates
                    .filter((a) => a.isMatured)
                    .map((asset) => (
                      <li key={asset.id}>• {asset.maturityInfo}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {detailsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {assetUpdates.map((asset) => (
              <div
                key={asset.id}
                className={`p-4 border rounded-lg transition-colors ${
                  asset.isMatured
                    ? "border-amber-300 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{
                      backgroundColor: getCategoryColor(asset.category),
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      {asset.isNewThisMonth &&
                        asset.id.startsWith("pending-") && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-200 text-yellow-800 rounded-full">
                            Niezapisane
                          </span>
                        )}
                      {asset.isNewThisMonth &&
                        !asset.id.startsWith("pending-") && (
                          <span className="px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded-full">
                            Nowe
                          </span>
                        )}
                      {asset.isMatured && (
                        <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full">
                          Zakończone
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {getCategoryLabel(asset.category)}
                    </p>

                    {/* Asset details */}
                    {asset.details && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                        {asset.details.interest_rate !== undefined && (
                          <span className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Oprocentowanie: {asset.details.interest_rate}%
                          </span>
                        )}
                        {asset.details.bank_name && (
                          <span>Bank: {asset.details.bank_name}</span>
                        )}
                        {asset.details.maturity_date && (
                          <span>
                            Termin:{" "}
                            {new Date(
                              asset.details.maturity_date
                            ).toLocaleDateString("pl-PL")}
                          </span>
                        )}
                        {asset.details.duration_months && (
                          <span>
                            Okres: {asset.details.duration_months} mies.
                          </span>
                        )}
                        {asset.details.bond_type && (
                          <span>Typ: {asset.details.bond_type}</span>
                        )}
                        {asset.details.is_inflation_linked && (
                          <span className="text-green-600">
                            Indeksowane inflacją
                          </span>
                        )}
                        {asset.details.fund_category && (
                          <span>
                            Kategoria:{" "}
                            {asset.details.fund_category === "equity"
                              ? "Akcyjny"
                              : asset.details.fund_category === "mixed"
                              ? "Mieszany"
                              : asset.details.fund_category === "bonds"
                              ? "Obligacyjny"
                              : asset.details.fund_category}
                          </span>
                        )}
                        {asset.details.account_type && (
                          <span>Typ: {asset.details.account_type}</span>
                        )}
                        {asset.details.contributed_this_year !== undefined && (
                          <span>
                            Wpłacono w tym roku:{" "}
                            {asset.details.contributed_this_year.toLocaleString(
                              "pl-PL"
                            )}{" "}
                            PLN
                          </span>
                        )}
                        {asset.details.currency_code && (
                          <span>Waluta: {asset.details.currency_code}</span>
                        )}
                      </div>
                    )}

                    {/* Gold and currency special inputs */}
                    {(asset.category === "gold" ||
                      asset.category === "currencies") && (
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        {asset.category === "gold" && (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-gray-600">Uncje:</label>
                              <input
                                type="number"
                                step="0.0001"
                                value={asset.ounces || 0}
                                onChange={(e) =>
                                  handleGoldOuncesChange(
                                    asset.id,
                                    e.target.value
                                  )
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-gray-600">
                                Kurs PLN/oz:
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={asset.exchange_rate || 0}
                                onChange={(e) =>
                                  handleExchangeRateChange(
                                    asset.id,
                                    e.target.value
                                  )
                                }
                                className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </>
                        )}
                        {asset.category === "currencies" && (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-gray-600">
                                Ilość {asset.details?.currency_code || ""}:
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={asset.amount || 0}
                                onChange={(e) =>
                                  handleCurrencyAmountChange(
                                    asset.id,
                                    e.target.value
                                  )
                                }
                                className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-gray-600">Kurs PLN:</label>
                              <input
                                type="number"
                                step="0.0001"
                                value={asset.exchange_rate || 0}
                                onChange={(e) =>
                                  handleExchangeRateChange(
                                    asset.id,
                                    e.target.value
                                  )
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {asset.isNewThisMonth ? "Poprzednia" : "Obecna"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {(
                          asset.originalValue ?? asset.current_value
                        ).toLocaleString("pl-PL", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        PLN
                      </p>
                    </div>

                    <div className="text-gray-400">→</div>

                    {asset.isEditing && isValueEditable(asset.category) ? (
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          value={asset.new_value}
                          onChange={(e) =>
                            handleValueChange(asset.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="text-right w-32">
                        <p className="text-xs text-gray-600">Nowa</p>
                        <p
                          className={`text-sm font-medium ${
                            asset.new_value !==
                            (asset.originalValue ?? asset.current_value)
                              ? "text-blue-600"
                              : "text-gray-900"
                          }`}
                        >
                          {asset.new_value.toLocaleString("pl-PL", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          PLN
                        </p>
                      </div>
                    )}

                    {isValueEditable(asset.category) && (
                      <button
                        onClick={() => toggleEdit(asset.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={asset.isEditing ? "Zatwierdź" : "Edytuj"}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}

                    {deleteConfirm === asset.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (asset.id.startsWith("pending-")) {
                              const pendingIndex = parseInt(
                                asset.id.replace("pending-", "")
                              );
                              onRemovePending(pendingIndex);
                              setAssetUpdates((prev) =>
                                prev.filter((a) => a.id !== asset.id)
                              );
                            } else {
                              onDelete(asset.id);
                            }
                            setDeleteConfirm(null);
                          }}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Potwierdź
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Anuluj
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(asset.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Usuń aktywo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {assetUpdates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Nie masz jeszcze żadnych aktywów w portfelu</p>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Dodaj pierwsze aktywo
            </button>
          </div>
        )}
      </div>

      {assetUpdates.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {hasChanges && (
                <p className="text-sm text-blue-600">Masz niezapisane zmiany</p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Zapisz aktualizację
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
