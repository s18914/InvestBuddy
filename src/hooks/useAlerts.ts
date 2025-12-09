import { useState, useEffect, useMemo } from "react";
import { useAssets } from "./useAssets";
import { useTargetPortfolio } from "./useTargetPortfolio";
import { useSafetyCushion } from "./useSafetyCushion";
import { useUserSettings } from "./useUserSettings";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  DepositDetails,
  RetirementAccountDetails,
} from "@/types/database.types";

export type AlertType = "urgent" | "warning" | "info" | "success";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

interface DepositWithAsset extends DepositDetails {
  asset_name?: string;
  asset_value?: number;
}

export function useAlerts() {
  const { user } = useAuth();
  const { assets: realAssets, loading: realLoading } = useAssets("real");
  const { targetAssets, loading: targetLoading } = useTargetPortfolio();
  const { totalCushionValue, loading: cushionLoading } = useSafetyCushion();
  const { settings, loading: settingsLoading } = useUserSettings();

  const [deposits, setDeposits] = useState<DepositWithAsset[]>([]);
  const [retirementAccounts, setRetirementAccounts] = useState<
    RetirementAccountDetails[]
  >([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) return;

      try {
        const depositAssets = realAssets.filter(
          (a) => a.category === "deposits"
        );
        if (depositAssets.length > 0) {
          const { data } = await supabase
            .from("deposit_details")
            .select("*")
            .in(
              "asset_id",
              depositAssets.map((a) => a.id)
            );

          const depositsWithNames = (data || []).map((d) => {
            const asset = depositAssets.find((a) => a.id === d.asset_id);
            return {
              ...d,
              asset_name: asset?.name,
              asset_value: asset?.current_value,
            };
          });
          setDeposits(depositsWithNames);
        }

        const retirementAssets = realAssets.filter(
          (a) => a.category === "ike_ikze"
        );
        if (retirementAssets.length > 0) {
          const { data } = await supabase
            .from("retirement_account_details")
            .select("*")
            .in(
              "asset_id",
              retirementAssets.map((a) => a.id)
            );

          setRetirementAccounts(data || []);
        }
      } catch (error) {
        console.error("Error fetching details for alerts:", error);
      } finally {
        setDetailsLoading(false);
      }
    };

    if (!realLoading && realAssets.length > 0) {
      fetchDetails();
    } else if (!realLoading) {
      setDetailsLoading(false);
    }
  }, [user, realAssets, realLoading]);

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Portfolio alignment check
    if (realAssets.length > 0 && targetAssets.length > 0) {
      const totalReal = realAssets.reduce(
        (sum, a) => sum + Number(a.current_value),
        0
      );

      if (totalReal > 0) {
        const categoryMap = new Map<string, { real: number; target: number }>();

        realAssets.forEach((asset) => {
          const current = categoryMap.get(asset.category) || {
            real: 0,
            target: 0,
          };
          current.real += Number(asset.current_value);
          categoryMap.set(asset.category, current);
        });

        targetAssets.forEach((asset) => {
          const current = categoryMap.get(asset.category) || {
            real: 0,
            target: 0,
          };
          current.target += Number(asset.target_allocation || 0);
          categoryMap.set(asset.category, current);
        });

        let maxDeviation = 0;

        categoryMap.forEach((data) => {
          const actualPercent = (data.real / totalReal) * 100;
          const deviation = Math.abs(actualPercent - data.target);
          if (deviation > maxDeviation) {
            maxDeviation = deviation;
          }
        });

        if (maxDeviation > 10) {
          result.push({
            id: "portfolio-deviation",
            type: "warning",
            title: "Portfel wymaga rebalancingu",
            message: `Największe odchylenie: ${maxDeviation.toFixed(
              1
            )}%. Sprawdź zakładkę Rebalancing.`,
            actionLabel: "Przejdź do rebalancingu",
            actionLink: "/rebalancing",
          });
        }
      }
    }

    // 2. Safety cushion incomplete
    if (settings?.safety_cushion_target && settings.safety_cushion_target > 0) {
      const percent =
        (totalCushionValue / settings.safety_cushion_target) * 100;
      if (percent < 100) {
        const missing = settings.safety_cushion_target - totalCushionValue;
        result.push({
          id: "safety-cushion",
          type: percent < 50 ? "urgent" : "info",
          title: "Poduszka bezpieczeństwa niekompletna",
          message: `Masz ${percent.toFixed(
            0
          )}% celu. Brakuje ${missing.toLocaleString("pl-PL", {
            minimumFractionDigits: 2,
          })} PLN.`,
          actionLabel: "Zobacz profil",
          actionLink: "/profile",
        });
      }
    }

    // 3. Cash level alerts
    const cashAssets = realAssets.filter((a) => a.category === "cash");
    const totalCash = cashAssets.reduce(
      (sum, a) => sum + Number(a.current_value),
      0
    );
    const minimumCash = settings?.minimum_cash_level || 0;

    if (minimumCash > 0) {
      if (totalCash < minimumCash) {
        result.push({
          id: "cash-low",
          type: "warning",
          title: "Gotówka poniżej minimum",
          message: `Masz ${totalCash.toLocaleString(
            "pl-PL"
          )} PLN, a minimum to ${minimumCash.toLocaleString("pl-PL")} PLN.`,
        });
      } else if (totalCash > minimumCash * 1.5) {
        const excess = totalCash - minimumCash;
        result.push({
          id: "cash-excess",
          type: "info",
          title: "Nadwyżka gotówki",
          message: `Masz ${excess.toLocaleString(
            "pl-PL"
          )} PLN ponad minimum. Rozważ zainwestowanie.`,
          actionLabel: "Zobacz rebalancing",
          actionLink: "/rebalancing",
        });
      }
    }

    // 4. Deposit maturity alerts
    deposits.forEach((deposit) => {
      if (!deposit.maturity_date) return;

      const maturityDate = new Date(deposit.maturity_date);
      maturityDate.setHours(0, 0, 0, 0);
      const daysUntilMaturity = Math.ceil(
        (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilMaturity <= 0) {
        result.push({
          id: `deposit-matured-${deposit.id}`,
          type: "urgent",
          title: "Lokata zapadła!",
          message: `${deposit.bank_name} (${deposit.asset_value?.toLocaleString(
            "pl-PL"
          )} PLN) - zdecyduj co zrobić ze środkami.`,
          actionLabel: "Aktualizuj portfel",
          actionLink: "/update",
        });
      } else if (daysUntilMaturity <= 7) {
        result.push({
          id: `deposit-maturing-${deposit.id}`,
          type: "warning",
          title: `Lokata zapada za ${daysUntilMaturity} dni`,
          message: `${deposit.bank_name} (${deposit.asset_value?.toLocaleString(
            "pl-PL"
          )} PLN) - ${maturityDate.toLocaleDateString("pl-PL")}.`,
        });
      }
    });

    // 5. IKE/IKZE limit alerts (show from October onwards)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (currentMonth >= 9) {
      retirementAccounts.forEach((account) => {
        if (account.year !== currentYear) return;

        const remaining = account.annual_limit - account.contributed_this_year;
        if (remaining > 0) {
          const isUrgent = currentMonth === 11;
          result.push({
            id: `retirement-limit-${account.account_type}`,
            type: isUrgent ? "urgent" : "info",
            title: `Niewykorzystany limit ${account.account_type}`,
            message: `Pozostało ${remaining.toLocaleString(
              "pl-PL"
            )} PLN do końca roku${isUrgent ? " - ostatni miesiąc!" : "."}`,
            actionLabel: "Aktualizuj portfel",
            actionLink: "/update",
          });
        }
      });
    }

    // Sort by type priority
    const typePriority: Record<AlertType, number> = {
      urgent: 0,
      warning: 1,
      info: 2,
      success: 3,
    };

    return result.sort((a, b) => typePriority[a.type] - typePriority[b.type]);
  }, [
    realAssets,
    targetAssets,
    totalCushionValue,
    settings,
    deposits,
    retirementAccounts,
  ]);

  const loading =
    realLoading ||
    targetLoading ||
    cushionLoading ||
    settingsLoading ||
    detailsLoading;

  return { alerts, loading };
}
