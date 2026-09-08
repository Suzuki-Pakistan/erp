import test from "node:test";
import assert from "node:assert/strict";
import { createDecisionIntelligenceSeed } from "../data/decision-intelligence";
import {
  availableStock,
  daysOfCover,
  forecastAccuracy,
  forecastRisk,
  forecastSummary,
  journalSummary,
  ledgerBalance,
  ledgerOpenAmount,
  ledgerOverdueAmount,
  projectedDemand,
  recommendedOrderQty,
} from "../lib/decision-intelligence";

test("forecast scenarios, horizons and planner overrides recalculate demand", () => {
  const item = createDecisionIntelligenceSeed().forecastItems[0];
  assert.equal(projectedDemand(item, 30, "base"), 136);
  assert.equal(projectedDemand(item, 60, "growth"), 313);
  assert.equal(
    projectedDemand({ ...item, adjustmentPct: 10 }, 30, "base"),
    150,
  );
  assert.equal(
    Math.round(forecastAccuracy(item.actual30, item.forecast30)),
    85,
  );
});

test("inventory cover and reorder recommendations obey lead time and case packs", () => {
  const item = createDecisionIntelligenceSeed().forecastItems[0];
  assert.equal(availableStock(item), 50);
  assert.equal(Math.round(daysOfCover(item, "base")), 6);
  assert.equal(forecastRisk(item, "base"), "critical");
  assert.equal(recommendedOrderQty(item, "base"), 132);
  assert.equal(recommendedOrderQty(item, "base") % item.casePack, 0);
});

test("forecast portfolio summary reconciles item-level recommendations", () => {
  const items = createDecisionIntelligenceSeed().forecastItems;
  const summary = forecastSummary(items, 30, "base");
  assert.equal(
    summary.demand,
    items.reduce((sum, item) => sum + projectedDemand(item, 30, "base"), 0),
  );
  assert.equal(
    summary.reorderUnits,
    items.reduce((sum, item) => sum + recommendedOrderQty(item, "base"), 0),
  );
  assert.ok(summary.atRiskCount > 0);
  assert.ok(summary.revenueAtRiskCents > 0);
  assert.ok(summary.accuracy > 0 && summary.accuracy <= 100);
});

test("customer and vendor ledgers use the correct debit-credit direction", () => {
  const accounts = createDecisionIntelligenceSeed().ledgerAccounts;
  const customer = accounts.find((item) => item.id === "la-c1")!;
  const vendor = accounts.find((item) => item.id === "la-v1")!;
  assert.equal(ledgerBalance(customer), 282000);
  assert.equal(ledgerOpenAmount(customer), 282000);
  assert.equal(ledgerBalance(vendor), 882000);
  assert.equal(ledgerOpenAmount(vendor), 882000);
});

test("part payments reduce overdue exposure instead of overstating the invoice", () => {
  const accounts = createDecisionIntelligenceSeed().ledgerAccounts;
  const partialCustomer = accounts.find((item) => item.id === "la-c2")!;
  const partialVendor = accounts.find((item) => item.id === "la-v2")!;
  assert.equal(ledgerOverdueAmount(partialCustomer), 118000);
  assert.equal(ledgerOverdueAmount(partialVendor), 465000);
});

test("live P&L is derived only from posted journals and tracks reconciliation", () => {
  const entries = createDecisionIntelligenceSeed().journalEntries;
  const summary = journalSummary(entries);
  assert.equal(summary.revenueCents, 7047000);
  assert.equal(summary.cogsCents, 3803000);
  assert.equal(summary.grossProfitCents, 3244000);
  assert.equal(summary.expensesCents, 2203000);
  assert.equal(summary.operatingProfitCents, 1041000);
  assert.equal(summary.taxPayableCents, 532000);
  assert.equal(summary.unreconciledCount, 2);

  const withDraft = journalSummary([
    ...entries,
    {
      ...entries[0],
      id: "draft-entry",
      amountCents: 99999999,
      status: "draft",
    },
  ]);
  assert.equal(withDraft.revenueCents, summary.revenueCents);
});
