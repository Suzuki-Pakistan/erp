export type ForecastScenario = "conservative" | "base" | "growth";
export type ForecastHorizon = 30 | 60 | 90;
export type ForecastRisk = "critical" | "watch" | "healthy" | "overstock";
export type ReorderStatus = "pending" | "approved" | "deferred" | "rejected";
export type MovementType =
  "sale" | "receipt" | "transfer" | "return" | "adjustment";

export interface ForecastItem {
  id: string;
  sku: string;
  product: string;
  brand: string;
  category: string;
  location: string;
  vendor: string;
  onHand: number;
  inbound: number;
  committed: number;
  safetyStock: number;
  leadTimeDays: number;
  casePack: number;
  actual30: number;
  forecast30: number;
  confidence: number;
  velocityPct: number;
  seasonalityPct: number;
  adjustmentPct: number;
  unitCostCents: number;
  retailPriceCents: number;
  lastMovement: string;
  weeklyActual: number[];
}

export interface ReorderDecision {
  skuId: string;
  approvedQty: number;
  status: ReorderStatus;
  selected: boolean;
  note: string;
  updatedAt: string;
}

export interface PurchaseDraft {
  id: string;
  vendor: string;
  createdAt: string;
  totalUnits: number;
  totalCostCents: number;
  skuIds: string[];
  status: "draft" | "exported";
}

export interface StockMovement {
  id: string;
  skuId: string;
  product: string;
  type: MovementType;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reference: string;
  occurredAt: string;
  user: string;
  note: string;
}

export type SeasonalAlertStatus =
  "needs-review" | "approved" | "deferred" | "resolved";

export interface SeasonalAlert {
  id: string;
  name: string;
  category: string;
  window: string;
  requiredUnits: number;
  cashImpactCents: number;
  projectedRevenueCents: number;
  risk: "stock-out" | "margin" | "overstock" | "cash";
  owner: string;
  status: SeasonalAlertStatus;
  note: string;
}

export type LedgerAccountType = "customer" | "vendor";
export type LedgerEntryType =
  "invoice" | "payment" | "credit-note" | "debit-note";

export interface LedgerEntry {
  id: string;
  date: string;
  dueDate: string;
  reference: string;
  description: string;
  type: LedgerEntryType;
  debitCents: number;
  creditCents: number;
  status: "open" | "partial" | "settled";
}

export interface LedgerAccount {
  id: string;
  name: string;
  type: LedgerAccountType;
  contact: string;
  termsDays: number;
  creditLimitCents: number;
  entries: LedgerEntry[];
}

export type JournalGroup = "revenue" | "cogs" | "expense" | "tax" | "cash";

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  account: string;
  group: JournalGroup;
  amountCents: number;
  location: string;
  status: "draft" | "posted";
  reconciled: boolean;
}

export interface DecisionIntelligenceData {
  forecastItems: ForecastItem[];
  reorderDecisions: ReorderDecision[];
  purchaseDrafts: PurchaseDraft[];
  movements: StockMovement[];
  seasonalAlerts: SeasonalAlert[];
  ledgerAccounts: LedgerAccount[];
  journalEntries: JournalEntry[];
  lastForecastAt: string;
  forecastRuns: number;
}

export interface DecisionIntelligenceData {
  forecastItems: ForecastItem[];
  reorderDecisions: ReorderDecision[];
  purchaseDrafts: PurchaseDraft[];
  movements: StockMovement[];
  seasonalAlerts: SeasonalAlert[];
  ledgerAccounts: LedgerAccount[];
  journalEntries: JournalEntry[];
  lastForecastAt: string;
  forecastRuns: number;
}
