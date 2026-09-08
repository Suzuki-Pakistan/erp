import type {
  ForecastHorizon,
  ForecastItem,
  ForecastRisk,
  ForecastScenario,
  JournalEntry,
  LedgerAccount,
} from "@/types/decision-intelligence";

export const scenarioMultiplier: Record<ForecastScenario, number> = {
  conservative: 0.9,
  base: 1,
  growth: 1.15,
};

export function projectedDemand(
  item: ForecastItem,
  horizon: ForecastHorizon,
  scenario: ForecastScenario,
) {
  const adjustment = 1 + item.adjustmentPct / 100;
  return Math.max(
    0,
    Math.round(
      item.forecast30 *
        (horizon / 30) *
        scenarioMultiplier[scenario] *
        adjustment,
    ),
  );
}

export function forecastAccuracy(actual: number, forecast: number) {
  if (actual === 0) return forecast === 0 ? 100 : 0;
  return Math.max(
    0,
    Math.min(100, 100 - (Math.abs(actual - forecast) / actual) * 100),
  );
}

export function availableStock(item: ForecastItem) {
  return item.onHand + item.inbound - item.committed;
}

export function daysOfCover(item: ForecastItem, scenario: ForecastScenario) {
  const dailyDemand = projectedDemand(item, 30, scenario) / 30;
  if (dailyDemand <= 0) return 999;
  return Math.max(0, (item.onHand - item.committed) / dailyDemand);
}

export function forecastRisk(
  item: ForecastItem,
  scenario: ForecastScenario,
): ForecastRisk {
  const cover = daysOfCover(item, scenario);
  if (item.onHand - item.committed <= 0 || cover <= item.leadTimeDays)
    return "critical";
  if (cover <= item.leadTimeDays + 10) return "watch";
  if (cover >= 70 && item.velocityPct < 0) return "overstock";
  return "healthy";
}

export function recommendedOrderQty(
  item: ForecastItem,
  scenario: ForecastScenario,
) {
  const dailyDemand = projectedDemand(item, 30, scenario) / 30;
  const targetDays = Math.max(30, item.leadTimeDays + 14);
  const raw = Math.max(
    0,
    Math.ceil(
      dailyDemand * targetDays + item.safetyStock - availableStock(item),
    ),
  );
  return raw === 0 ? 0 : Math.ceil(raw / item.casePack) * item.casePack;
}

export function forecastSummary(
  items: ForecastItem[],
  horizon: ForecastHorizon,
  scenario: ForecastScenario,
) {
  const demand = items.reduce(
    (sum, item) => sum + projectedDemand(item, horizon, scenario),
    0,
  );
  const atRisk = items.filter((item) =>
    ["critical", "watch"].includes(forecastRisk(item, scenario)),
  );
  const reorderUnits = items.reduce(
    (sum, item) => sum + recommendedOrderQty(item, scenario),
    0,
  );
  const reorderCostCents = items.reduce(
    (sum, item) =>
      sum + recommendedOrderQty(item, scenario) * item.unitCostCents,
    0,
  );
  const revenueAtRiskCents = atRisk.reduce(
    (sum, item) =>
      sum +
      Math.min(
        projectedDemand(item, horizon, scenario),
        Math.max(
          0,
          projectedDemand(item, horizon, scenario) - availableStock(item),
        ),
      ) *
        item.retailPriceCents,
    0,
  );
  const accuracy = items.length
    ? items.reduce(
        (sum, item) => sum + forecastAccuracy(item.actual30, item.forecast30),
        0,
      ) / items.length
    : 0;
  return {
    demand,
    atRiskCount: atRisk.length,
    reorderUnits,
    reorderCostCents,
    revenueAtRiskCents,
    accuracy,
  };
}

export function ledgerBalance(account: LedgerAccount) {
  const signed = account.entries.reduce(
    (sum, entry) => sum + entry.debitCents - entry.creditCents,
    0,
  );
  return account.type === "customer" ? signed : -signed;
}

export function ledgerOpenAmount(account: LedgerAccount) {
  return Math.max(0, ledgerBalance(account));
}

export function ledgerOverdueAmount(
  account: LedgerAccount,
  asOf = "2026-09-08",
) {
  const overdueInvoices = account.entries
    .filter(
      (entry) =>
        entry.type === "invoice" &&
        entry.status !== "settled" &&
        entry.dueDate < asOf,
    )
    .reduce(
      (sum, entry) =>
        sum +
        (account.type === "customer"
          ? entry.debitCents - entry.creditCents
          : entry.creditCents - entry.debitCents),
      0,
    );
  // The demo ledger records payments at account level. Cap overdue exposure at
  // the live account balance so a partially paid invoice is never overstated.
  return Math.max(0, Math.min(overdueInvoices, ledgerOpenAmount(account)));
}

export function journalSummary(
  entries: JournalEntry[],
  location = "All locations",
) {
  const included = entries.filter(
    (entry) =>
      entry.status === "posted" &&
      (location === "All locations" ||
        entry.location === location ||
        entry.location === "All locations"),
  );
  const byGroup = (group: JournalEntry["group"]) =>
    included
      .filter((entry) => entry.group === group)
      .reduce((sum, entry) => sum + entry.amountCents, 0);
  const revenueCents = byGroup("revenue");
  const cogsCents = byGroup("cogs");
  const expensesCents = byGroup("expense");
  const taxPayableCents = byGroup("tax");
  const grossProfitCents = revenueCents - cogsCents;
  const operatingProfitCents = grossProfitCents - expensesCents;
  const cashCents = byGroup("cash") + revenueCents - cogsCents - expensesCents;
  return {
    revenueCents,
    cogsCents,
    grossProfitCents,
    grossMarginPct: revenueCents ? (grossProfitCents / revenueCents) * 100 : 0,
    expensesCents,
    operatingProfitCents,
    operatingMarginPct: revenueCents
      ? (operatingProfitCents / revenueCents) * 100
      : 0,
    taxPayableCents,
    cashCents,
    unreconciledCount: included.filter((entry) => !entry.reconciled).length,
  };
}

export function money(cents: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact && Math.abs(cents) >= 10000000 ? "compact" : "standard",
  }).format(cents / 100);
}

export function csvValue(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
