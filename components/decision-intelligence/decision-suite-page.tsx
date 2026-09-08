"use client";

import { useEffect } from "react";

import { DecisionWorkspaceLoading } from "@/components/decision-intelligence/shared";
import { FinanceWorkspace } from "@/components/decision-intelligence/finance-workspace";
import { ForecastingWorkspace } from "@/components/decision-intelligence/forecasting-workspace";
import { useDecisionIntelligenceStore } from "@/store/decision-intelligence-store";

export function DecisionSuitePage({
  moduleId,
  view,
}: {
  moduleId: "forecasting" | "finance";
  view: string;
}) {
  const hydrated = useDecisionIntelligenceStore((state) => state.hasHydrated);

  useEffect(() => {
    void useDecisionIntelligenceStore.persist.rehydrate();
  }, []);

  if (!hydrated) return <DecisionWorkspaceLoading />;
  return moduleId === "forecasting" ? (
    <ForecastingWorkspace view={view} />
  ) : (
    <FinanceWorkspace view={view} />
  );
}
