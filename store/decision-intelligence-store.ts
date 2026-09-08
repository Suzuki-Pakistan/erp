"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createDecisionIntelligenceSeed } from "@/data/decision-intelligence";
import { recommendedOrderQty } from "@/lib/decision-intelligence";
import type {
  DecisionIntelligenceData,
  ForecastScenario,
  JournalEntry,
  LedgerEntry,
  PurchaseDraft,
  ReorderStatus,
  SeasonalAlert,
  SeasonalAlertStatus,
  StockMovement,
} from "@/types/decision-intelligence";

interface DecisionIntelligenceStore extends DecisionIntelligenceData {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  runForecast: () => void;
  setForecastAdjustment: (skuId: string, adjustmentPct: number) => void;
  setReorderSelected: (skuId: string, selected: boolean) => void;
  setAllReordersSelected: (skuIds: string[], selected: boolean) => void;
  setReorderQuantity: (skuId: string, quantity: number) => void;
  setReorderStatus: (skuIds: string[], status: ReorderStatus) => void;
  createPurchaseDrafts: (
    skuIds: string[],
    scenario: ForecastScenario,
  ) => PurchaseDraft[];
  postTransfer: (movement: Omit<StockMovement, "id" | "occurredAt">) => void;
  addSeasonalAlert: (alert: Omit<SeasonalAlert, "id">) => void;
  updateSeasonalAlert: (
    id: string,
    status: SeasonalAlertStatus,
    note?: string,
  ) => void;
  addLedgerEntry: (accountId: string, entry: Omit<LedgerEntry, "id">) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  toggleJournalReconciled: (id: string) => void;
  resetDecisionData: () => void;
}

const seed = createDecisionIntelligenceSeed();

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export const useDecisionIntelligenceStore = create<DecisionIntelligenceStore>()(
  persist(
    (set, get) => ({
      ...seed,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      runForecast: () =>
        set((state) => ({
          forecastItems: state.forecastItems.map((item) => ({
            ...item,
            forecast30: Math.max(
              0,
              Math.round(item.forecast30 * (1 + item.velocityPct / 5000)),
            ),
            confidence: Math.min(
              98,
              Number((item.confidence + 0.1).toFixed(1)),
            ),
          })),
          lastForecastAt: new Date().toISOString(),
          forecastRuns: state.forecastRuns + 1,
        })),
      setForecastAdjustment: (skuId, adjustmentPct) =>
        set((state) => ({
          forecastItems: state.forecastItems.map((item) =>
            item.id === skuId
              ? {
                  ...item,
                  adjustmentPct: Math.max(-50, Math.min(100, adjustmentPct)),
                }
              : item,
          ),
        })),
      setReorderSelected: (skuId, selected) =>
        set((state) => ({
          reorderDecisions: state.reorderDecisions.map((decision) =>
            decision.skuId === skuId ? { ...decision, selected } : decision,
          ),
        })),
      setAllReordersSelected: (skuIds, selected) => {
        const selectedIds = new Set(skuIds);
        set((state) => ({
          reorderDecisions: state.reorderDecisions.map((decision) =>
            selectedIds.has(decision.skuId)
              ? { ...decision, selected }
              : decision,
          ),
        }));
      },
      setReorderQuantity: (skuId, quantity) =>
        set((state) => ({
          reorderDecisions: state.reorderDecisions.map((decision) =>
            decision.skuId === skuId
              ? {
                  ...decision,
                  approvedQty: Math.max(0, Math.round(quantity)),
                  updatedAt: "Adjusted just now",
                }
              : decision,
          ),
        })),
      setReorderStatus: (skuIds, status) => {
        const ids = new Set(skuIds);
        set((state) => ({
          reorderDecisions: state.reorderDecisions.map((decision) =>
            ids.has(decision.skuId)
              ? {
                  ...decision,
                  status,
                  selected: false,
                  updatedAt: "Updated just now",
                }
              : decision,
          ),
        }));
      },
      createPurchaseDrafts: (skuIds, scenario) => {
        const state = get();
        const selected = new Set(skuIds);
        const groups = new Map<string, typeof state.forecastItems>();
        for (const item of state.forecastItems.filter((row) =>
          selected.has(row.id),
        )) {
          groups.set(item.vendor, [...(groups.get(item.vendor) ?? []), item]);
        }
        const createdAt = new Date().toISOString();
        const drafts = [...groups.entries()].map(([vendor, items], index) => {
          const quantities = items.map((item) => {
            const override = state.reorderDecisions.find(
              (decision) => decision.skuId === item.id,
            )?.approvedQty;
            return override || recommendedOrderQty(item, scenario);
          });
          return {
            id: `PO-DRAFT-${String(state.purchaseDrafts.length + index + 1).padStart(3, "0")}`,
            vendor,
            createdAt,
            totalUnits: quantities.reduce((sum, quantity) => sum + quantity, 0),
            totalCostCents: items.reduce(
              (sum, item, itemIndex) =>
                sum + quantities[itemIndex] * item.unitCostCents,
              0,
            ),
            skuIds: items.map((item) => item.id),
            status: "draft" as const,
          };
        });
        set((current) => ({
          purchaseDrafts: [...drafts, ...current.purchaseDrafts],
          reorderDecisions: current.reorderDecisions.map((decision) =>
            selected.has(decision.skuId)
              ? {
                  ...decision,
                  status: "approved",
                  selected: false,
                  updatedAt: "PO drafted just now",
                }
              : decision,
          ),
        }));
        return drafts;
      },
      postTransfer: (movement) =>
        set((state) => ({
          movements: [
            {
              ...movement,
              id: id("mv"),
              occurredAt: new Date().toISOString(),
            },
            ...state.movements,
          ],
          forecastItems: state.forecastItems.map((item) => {
            if (item.id !== movement.skuId) return item;
            const quantity = Math.abs(movement.quantity);
            if (movement.toLocation === item.location)
              return {
                ...item,
                onHand: item.onHand + quantity,
                lastMovement: "Just now",
              };
            if (movement.fromLocation === item.location)
              return {
                ...item,
                onHand: Math.max(0, item.onHand - quantity),
                lastMovement: "Just now",
              };
            return item;
          }),
        })),
      addSeasonalAlert: (alert) =>
        set((state) => ({
          seasonalAlerts: [{ ...alert, id: id("sa") }, ...state.seasonalAlerts],
        })),
      updateSeasonalAlert: (alertId, status, note) =>
        set((state) => ({
          seasonalAlerts: state.seasonalAlerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, status, note: note ?? alert.note }
              : alert,
          ),
        })),
      addLedgerEntry: (accountId, entry) =>
        set((state) => ({
          ledgerAccounts: state.ledgerAccounts.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  entries: [{ ...entry, id: id("le") }, ...account.entries],
                }
              : account,
          ),
        })),
      addJournalEntry: (entry) =>
        set((state) => ({
          journalEntries: [{ ...entry, id: id("je") }, ...state.journalEntries],
        })),
      toggleJournalReconciled: (entryId) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === entryId
              ? { ...entry, reconciled: !entry.reconciled }
              : entry,
          ),
        })),
      resetDecisionData: () =>
        set({ ...createDecisionIntelligenceSeed(), hasHydrated: true }),
    }),
    {
      name: "flair-decision-intelligence:v1",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        forecastItems: state.forecastItems,
        reorderDecisions: state.reorderDecisions,
        purchaseDrafts: state.purchaseDrafts,
        movements: state.movements,
        seasonalAlerts: state.seasonalAlerts,
        ledgerAccounts: state.ledgerAccounts,
        journalEntries: state.journalEntries,
        lastForecastAt: state.lastForecastAt,
        forecastRuns: state.forecastRuns,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
