"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FilePlus2,
  Landmark,
  ListChecks,
  ReceiptText,
  RotateCcw,
  Scale,
  ShieldAlert,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/core-setup/shared";
import {
  ExportButton,
  FilterSelect,
  KpiCard,
  SearchBox,
  StatusPill,
} from "@/components/decision-intelligence/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  journalSummary,
  ledgerOpenAmount,
  ledgerOverdueAmount,
  money,
} from "@/lib/decision-intelligence";
import { useDecisionIntelligenceStore } from "@/store/decision-intelligence-store";
import type {
  JournalEntry,
  JournalGroup,
  LedgerEntryType,
  SeasonalAlert,
} from "@/types/decision-intelligence";

const pageCopy = {
  overview: {
    title: "Accounting & Finance Overview",
    description:
      "Monitor profitability, cash, obligations and reconciliation from a single operational finance cockpit.",
  },
  "safety-alerts": {
    title: "Safety Stock / Seasonal Alerts",
    description:
      "Translate inventory protection and seasonal plans into cash requirements, margin risk and approval decisions.",
  },
  ledgers: {
    title: "Customer & Vendor Ledgers",
    description:
      "Track account balances, due dates, invoices, credits and settlements with a clear transaction history.",
  },
  "live-pnl": {
    title: "Live P&L / Financial Dashboard",
    description:
      "Follow revenue, cost, operating expenses, tax and profit as entries are posted and reconciled.",
  },
} as const;

type FinanceView = keyof typeof pageCopy;

export function FinanceWorkspace({ view }: { view: string }) {
  const currentView = (view in pageCopy ? view : "overview") as FinanceView;
  const copy = pageCopy[currentView];
  const entries = useDecisionIntelligenceStore((state) => state.journalEntries);
  const reset = useDecisionIntelligenceStore(
    (state) => state.resetDecisionData,
  );
  const [location, setLocation] = useState("All locations");
  const [period, setPeriod] = useState("mtd");
  const [journalOpen, setJournalOpen] = useState(false);
  const locations = [
    "All locations",
    ...new Set(
      entries
        .map((entry) => entry.location)
        .filter((value) => value !== "All locations"),
    ),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 08 · Accounting & Finance · Live workspace"
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <Button
              variant="outline"
              className="h-9 gap-2 text-xs"
              onClick={() => {
                reset();
                toast.success("Finance demo data restored.");
              }}
            >
              <RotateCcw className="size-3.5" /> Reset
            </Button>
            <Button
              className="h-9 gap-2 text-xs"
              onClick={() => setJournalOpen(true)}
            >
              <FilePlus2 className="size-3.5" /> Post entry
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2">
          <FilterSelect
            label="Location"
            value={location}
            onChange={setLocation}
            className="min-w-44"
            options={locations.map((value) => ({ value, label: value }))}
          />
          <FilterSelect
            label="Period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "mtd", label: "September MTD" },
              { value: "qtd", label: "Quarter to date" },
              { value: "ytd", label: "Year to date" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Badge variant="outline" className="h-7 gap-1.5 rounded-lg px-2.5">
            <CheckCircle2 className="size-3 text-emerald-600" /> Books updated
          </Badge>
          <span>Last posting just now · USD</span>
        </div>
      </div>

      {currentView === "overview" && (
        <FinanceOverview
          location={location}
          period={period}
          onPost={() => setJournalOpen(true)}
        />
      )}
      {currentView === "safety-alerts" && <SafetyAlerts />}
      {currentView === "ledgers" && <Ledgers />}
      {currentView === "live-pnl" && (
        <LivePnl
          location={location}
          period={period}
          onPost={() => setJournalOpen(true)}
        />
      )}
      <JournalEntryDialog
        open={journalOpen}
        onOpenChange={setJournalOpen}
        defaultLocation={location}
      />
    </div>
  );
}

function FinanceOverview({
  location,
  period,
  onPost,
}: {
  location: string;
  period: string;
  onPost: () => void;
}) {
  const entries = useDecisionIntelligenceStore((state) => state.journalEntries);
  const accounts = useDecisionIntelligenceStore(
    (state) => state.ledgerAccounts,
  );
  const alerts = useDecisionIntelligenceStore((state) => state.seasonalAlerts);
  const toggleReconciled = useDecisionIntelligenceStore(
    (state) => state.toggleJournalReconciled,
  );
  const summary = journalSummary(entries, location);
  const receivables = accounts
    .filter((account) => account.type === "customer")
    .reduce((sum, account) => sum + ledgerOpenAmount(account), 0);
  const payables = accounts
    .filter((account) => account.type === "vendor")
    .reduce((sum, account) => sum + ledgerOpenAmount(account), 0);
  const cashTrend = [
    { period: "Apr", cash: 58900, profit: 22100 },
    { period: "May", cash: 64300, profit: 24600 },
    { period: "Jun", cash: 61100, profit: 22800 },
    { period: "Jul", cash: 70800, profit: 27900 },
    { period: "Aug", cash: 76200, profit: 30400 },
    {
      period: "Sep",
      cash: summary.cashCents / 100,
      profit: summary.operatingProfitCents / 100,
    },
  ];
  const visibleEntries = entries
    .filter(
      (entry) =>
        location === "All locations" ||
        entry.location === location ||
        entry.location === "All locations",
    )
    .slice(0, 6);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net revenue"
          value={money(summary.revenueCents, true)}
          detail={`${period.toUpperCase()} · posted entries`}
          change="+10.1%"
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Operating profit"
          value={money(summary.operatingProfitCents, true)}
          detail={`${summary.operatingMarginPct.toFixed(1)}% operating margin`}
          change="+2.4 pts"
          icon={BadgeDollarSign}
        />
        <KpiCard
          label="Cash position"
          value={money(summary.cashCents, true)}
          detail={`${summary.unreconciledCount} entries need reconciliation`}
          icon={WalletCards}
        />
        <KpiCard
          label="Sales tax payable"
          value={money(summary.taxPayableCents, true)}
          detail="8.25% retail tax liability"
          icon={Landmark}
          tone="attention"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Cash and operating profit"
              description="Six-month decision view with the selected live period at the right."
            />
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashTrend}
                margin={{ left: -8, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a3440" stopOpacity={0.28} />
                    <stop
                      offset="100%"
                      stopColor="#0a3440"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 4" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <YAxis
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <ChartTooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Area
                  dataKey="cash"
                  name="Cash"
                  type="monotone"
                  stroke="#0a3440"
                  fill="url(#cashFill)"
                  strokeWidth={2.5}
                />
                <Area
                  dataKey="profit"
                  name="Operating profit"
                  type="monotone"
                  stroke="#c39745"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              title="Working-capital position"
              description="Cash tied up in operating balances and approved seasonal plans."
            />
          </CardHeader>
          <CardContent className="space-y-5">
            <WorkingCapital
              label="Customer receivables"
              value={receivables}
              total={receivables + payables}
              tone="bg-sky-500"
            />
            <WorkingCapital
              label="Vendor payables"
              value={payables}
              total={receivables + payables}
              tone="bg-amber-500"
            />
            <WorkingCapital
              label="Seasonal cash requests"
              value={alerts
                .filter((alert) => alert.status === "needs-review")
                .reduce((sum, alert) => sum + alert.cashImpactCents, 0)}
              total={4000000}
              tone="bg-primary"
            />
            <div className="rounded-xl border bg-primary p-4 text-primary-foreground">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">
                Next decision
              </p>
              <p className="mt-2 text-sm font-semibold">
                Review Black Friday funding
              </p>
              <p className="mt-1 text-[10px] leading-4 text-white/65">
                $6,420 inventory funding · margin guardrail pending.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionTitle
            title="Recent journal activity"
            description="Reconcile entries individually or post an adjustment without leaving the dashboard."
            action={
              <Button
                variant="outline"
                className="h-8 gap-2 text-[10px]"
                onClick={onPost}
              >
                <FilePlus2 className="size-3" />
                Post adjustment
              </Button>
            }
          />
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reconciled</TableHead>
                <TableHead>Date / reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Reconcile ${entry.reference}`}
                      checked={entry.reconciled}
                      onCheckedChange={() => toggleReconciled(entry.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold">{entry.reference}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {entry.date}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">{entry.description}</TableCell>
                  <TableCell className="text-xs">{entry.account}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">
                    {entry.location}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold tabular-nums">
                    {money(entry.amountCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}

function WorkingCapital({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percentage = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{money(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SafetyAlerts() {
  const alerts = useDecisionIntelligenceStore((state) => state.seasonalAlerts);
  const updateAlert = useDecisionIntelligenceStore(
    (state) => state.updateSeasonalAlert,
  );
  const addAlert = useDecisionIntelligenceStore(
    (state) => state.addSeasonalAlert,
  );
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Women's Fragrance",
    window: "Oct 01 – Dec 31",
    requiredUnits: 120,
    cashImpact: 5000,
    projectedRevenue: 12000,
    risk: "stock-out",
    owner: "Inventory",
    note: "",
  });
  const visible = alerts.filter(
    (alert) =>
      (status === "all" || alert.status === status) &&
      (risk === "all" || alert.risk === risk),
  );
  const pending = alerts.filter((alert) => alert.status === "needs-review");
  const cashRequested = pending.reduce(
    (sum, alert) => sum + alert.cashImpactCents,
    0,
  );
  const revenueProtected = pending.reduce(
    (sum, alert) => sum + alert.projectedRevenueCents,
    0,
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Needs review"
          value={String(pending.length)}
          detail="Seasonal and safety-stock decisions"
          icon={ShieldAlert}
          tone="attention"
        />
        <KpiCard
          label="Funding requested"
          value={money(cashRequested, true)}
          detail="Original purchase-cost basis"
          icon={Banknote}
        />
        <KpiCard
          label="Revenue protected"
          value={money(revenueProtected, true)}
          detail="Projected sell-through value"
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Approved plans"
          value={String(
            alerts.filter((alert) => alert.status === "approved").length,
          )}
          detail="Ready for replenishment planning"
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <SectionTitle
            title="Seasonal funding and safety-stock queue"
            description="Approve, defer or resolve each plan while preserving the rationale and cash impact."
            action={
              <Button
                className="h-9 gap-2 text-xs"
                onClick={() => setDialogOpen(true)}
              >
                <FilePlus2 className="size-3.5" />
                New seasonal plan
              </Button>
            }
          />
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All statuses" },
                { value: "needs-review", label: "Needs review" },
                { value: "approved", label: "Approved" },
                { value: "deferred", label: "Deferred" },
                { value: "resolved", label: "Resolved" },
              ]}
            />
            <FilterSelect
              label="Risk"
              value={risk}
              onChange={setRisk}
              options={[
                { value: "all", label: "All risks" },
                { value: "stock-out", label: "Stock-out" },
                { value: "margin", label: "Margin" },
                { value: "overstock", label: "Overstock" },
                { value: "cash", label: "Cash" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 md:grid-cols-2">
          {visible.map((alert) => (
            <div key={alert.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{alert.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {alert.category} · {alert.window}
                  </p>
                </div>
                <StatusPill
                  label={alert.status}
                  tone={
                    alert.status === "approved" || alert.status === "resolved"
                      ? "success"
                      : alert.status === "deferred"
                        ? "attention"
                        : "info"
                  }
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-muted/35 p-3">
                <AlertMetric
                  label="Units"
                  value={alert.requiredUnits.toLocaleString()}
                />
                <AlertMetric
                  label="Cash"
                  value={money(alert.cashImpactCents, true)}
                />
                <AlertMetric
                  label="Revenue"
                  value={money(alert.projectedRevenueCents, true)}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                <span>Owner · {alert.owner}</span>
                <StatusPill
                  label={alert.risk}
                  tone={
                    alert.risk === "stock-out" || alert.risk === "cash"
                      ? "danger"
                      : "attention"
                  }
                />
              </div>
              <p className="mt-3 min-h-8 text-[10px] leading-4 text-muted-foreground">
                {alert.note}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
                <Button
                  size="sm"
                  className="h-8 text-[10px]"
                  disabled={alert.status === "approved"}
                  onClick={() => {
                    updateAlert(alert.id, "approved");
                    toast.success(`${alert.name} approved.`);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px]"
                  onClick={() => updateAlert(alert.id, "deferred")}
                >
                  Defer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px]"
                  onClick={() => updateAlert(alert.id, "resolved")}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create seasonal stock plan</DialogTitle>
            <DialogDescription>
              Add a funding decision with its inventory need, expected return
              and risk owner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <FormField label="Plan name" className="sm:col-span-2">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Holiday fragrance reserve"
              />
            </FormField>
            <FormField label="Category">
              <Input
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              />
            </FormField>
            <FormField label="Planning window">
              <Input
                value={form.window}
                onChange={(event) =>
                  setForm({ ...form, window: event.target.value })
                }
              />
            </FormField>
            <FormField label="Required units">
              <Input
                type="number"
                min={1}
                value={form.requiredUnits}
                onChange={(event) =>
                  setForm({
                    ...form,
                    requiredUnits: Number(event.target.value),
                  })
                }
              />
            </FormField>
            <FormField label="Cash impact ($)">
              <Input
                type="number"
                min={0}
                value={form.cashImpact}
                onChange={(event) =>
                  setForm({ ...form, cashImpact: Number(event.target.value) })
                }
              />
            </FormField>
            <FormField label="Projected revenue ($)">
              <Input
                type="number"
                min={0}
                value={form.projectedRevenue}
                onChange={(event) =>
                  setForm({
                    ...form,
                    projectedRevenue: Number(event.target.value),
                  })
                }
              />
            </FormField>
            <FormField label="Risk">
              <Select
                value={form.risk}
                onValueChange={(value) => setForm({ ...form, risk: value })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock-out">Stock-out</SelectItem>
                  <SelectItem value="margin">Margin</SelectItem>
                  <SelectItem value="overstock">Overstock</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Owner">
              <Input
                value={form.owner}
                onChange={(event) =>
                  setForm({ ...form, owner: event.target.value })
                }
              />
            </FormField>
            <FormField label="Rationale" className="sm:col-span-2">
              <Textarea
                value={form.note}
                onChange={(event) =>
                  setForm({ ...form, note: event.target.value })
                }
                placeholder="Explain the demand or risk signal…"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.name.trim() || form.requiredUnits <= 0}
              onClick={() => {
                addAlert({
                  name: form.name,
                  category: form.category,
                  window: form.window,
                  requiredUnits: form.requiredUnits,
                  cashImpactCents: Math.round(form.cashImpact * 100),
                  projectedRevenueCents: Math.round(
                    form.projectedRevenue * 100,
                  ),
                  risk: form.risk as SeasonalAlert["risk"],
                  owner: form.owner,
                  status: "needs-review",
                  note: form.note,
                });
                setDialogOpen(false);
                toast.success("Seasonal stock plan created.");
              }}
            >
              Create plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AlertMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Ledgers() {
  const accounts = useDecisionIntelligenceStore(
    (state) => state.ledgerAccounts,
  );
  const addLedgerEntry = useDecisionIntelligenceStore(
    (state) => state.addLedgerEntry,
  );
  const [type, setType] = useState<"customer" | "vendor">("customer");
  const [search, setSearch] = useState("");
  const visible = accounts.filter(
    (account) =>
      account.type === type &&
      (!search ||
        `${account.name} ${account.contact}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const [selectedId, setSelectedId] = useState(visible[0]?.id ?? "");
  const selected =
    visible.find((account) => account.id === selectedId) ?? visible[0];
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryType, setEntryType] = useState<LedgerEntryType>("payment");
  const [amount, setAmount] = useState(500);
  const [reference, setReference] = useState("PAY-");
  const [description, setDescription] = useState("Account payment");
  const openTotal = accounts
    .filter((account) => account.type === type)
    .reduce((sum, account) => sum + ledgerOpenAmount(account), 0);
  const overdue = accounts
    .filter((account) => account.type === type)
    .reduce((sum, account) => sum + ledgerOverdueAmount(account), 0);
  const exportRows = [
    ["Account", "Type", "Contact", "Terms", "Open balance", "Overdue"],
    ...visible.map((account) => [
      account.name,
      account.type,
      account.contact,
      `${account.termsDays} days`,
      (ledgerOpenAmount(account) / 100).toFixed(2),
      (ledgerOverdueAmount(account) / 100).toFixed(2),
    ]),
  ];

  function openEntry(nextType: LedgerEntryType) {
    setEntryType(nextType);
    const nextNumber =
      (nextType === "payment" ? 2200 : 5800) +
      (selected?.entries.length ?? 0) +
      1;
    setReference(`${nextType === "payment" ? "PAY" : "INV"}-${nextNumber}`);
    setDescription(
      nextType === "payment" ? "Account payment" : "New account invoice",
    );
    setEntryOpen(true);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={type === "customer" ? "Receivables" : "Payables"}
          value={money(openTotal, true)}
          detail={`${visible.length} active ${type} accounts`}
          icon={type === "customer" ? CircleDollarSign : Landmark}
        />
        <KpiCard
          label="Overdue"
          value={money(overdue, true)}
          detail="Open invoices past due date"
          icon={AlertTriangle}
          tone="attention"
        />
        <KpiCard
          label="Settled entries"
          value={String(
            visible
              .flatMap((account) => account.entries)
              .filter((entry) => entry.status === "settled").length,
          )}
          detail="Payments and credits recorded"
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="Average terms"
          value={`${Math.round(visible.reduce((sum, account) => sum + account.termsDays, 0) / Math.max(1, visible.length))} days`}
          detail="Configured account terms"
          icon={CalendarClock}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <SectionTitle
            title="Account ledgers"
            description="Select an account to review its running balance and post a transaction."
            action={
              <ExportButton
                filename={`flair-${type}-ledgers.csv`}
                rows={exportRows}
              />
            }
          />
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex w-fit rounded-lg border bg-muted/30 p-1">
              <Button
                variant={type === "customer" ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setType("customer");
                  setSelectedId(
                    accounts.find((account) => account.type === "customer")
                      ?.id ?? "",
                  );
                }}
              >
                Customers
              </Button>
              <Button
                variant={type === "vendor" ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setType("vendor");
                  setSelectedId(
                    accounts.find((account) => account.type === "vendor")?.id ??
                      "",
                  );
                }}
              >
                Vendors
              </Button>
            </div>
            <SearchBox
              className="w-full lg:w-72"
              value={search}
              onChange={setSearch}
              placeholder={`Search ${type} accounts…`}
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 border-t pt-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-2">
            {visible.map((account) => {
              const balance = ledgerOpenAmount(account);
              const isSelected = selected?.id === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${isSelected ? "border-primary/30 bg-primary/5" : "hover:bg-muted/40"}`}
                  onClick={() => setSelectedId(account.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {account.name}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">
                        {account.contact}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      {money(balance)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-[10px] text-muted-foreground">
                    <span>Net {account.termsDays} days</span>
                    <span>
                      {ledgerOverdueAmount(account)
                        ? `${money(ledgerOverdueAmount(account))} overdue`
                        : "Current"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {selected ? (
            <div className="min-w-0 rounded-xl border">
              <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">{selected.name}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {selected.contact} · Net {selected.termsDays}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px]"
                    onClick={() => openEntry("invoice")}
                  >
                    <ReceiptText className="size-3" />
                    New invoice
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-[10px]"
                    onClick={() => openEntry("payment")}
                  >
                    <Banknote className="size-3" />
                    Record payment
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b bg-muted/20 p-4 sm:grid-cols-4">
                <AlertMetric
                  label="Open balance"
                  value={money(ledgerOpenAmount(selected))}
                />
                <AlertMetric
                  label="Overdue"
                  value={money(ledgerOverdueAmount(selected))}
                />
                <AlertMetric
                  label="Entries"
                  value={String(selected.entries.length)}
                />
                <AlertMetric
                  label="Credit limit"
                  value={
                    selected.type === "customer"
                      ? money(selected.creditLimitCents)
                      : "Not applicable"
                  }
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-[10px]">
                          {entry.date}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {entry.reference}
                        </TableCell>
                        <TableCell className="text-xs">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {entry.debitCents ? money(entry.debitCents) : "—"}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {entry.creditCents ? money(entry.creditCents) : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={entry.status}
                            tone={
                              entry.status === "settled"
                                ? "success"
                                : entry.status === "partial"
                                  ? "attention"
                                  : "info"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-xl border text-sm text-muted-foreground">
              No account selected.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {entryType === "payment"
                ? "Record payment"
                : "Post account invoice"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `Add a ${entryType} to ${selected.name}. The running balance updates immediately.`
                : "Select an account first."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <FormField label="Amount ($)">
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </FormField>
            <FormField label="Reference">
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selected || amount <= 0 || !reference.trim()}
              onClick={() => {
                if (!selected) return;
                const cents = Math.round(amount * 100);
                const customerDebit =
                  selected.type === "customer" && entryType === "invoice";
                const vendorDebit =
                  selected.type === "vendor" && entryType === "payment";
                addLedgerEntry(selected.id, {
                  date: "2026-09-08",
                  dueDate:
                    entryType === "invoice" ? "2026-10-08" : "2026-09-08",
                  reference,
                  description,
                  type: entryType,
                  debitCents: customerDebit || vendorDebit ? cents : 0,
                  creditCents: customerDebit || vendorDebit ? 0 : cents,
                  status: entryType === "payment" ? "settled" : "open",
                });
                setEntryOpen(false);
                toast.success(
                  `${entryType === "payment" ? "Payment" : "Invoice"} posted to ${selected.name}.`,
                );
              }}
            >
              Post {entryType}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LivePnl({
  location,
  period,
  onPost,
}: {
  location: string;
  period: string;
  onPost: () => void;
}) {
  const entries = useDecisionIntelligenceStore((state) => state.journalEntries);
  const toggleReconciled = useDecisionIntelligenceStore(
    (state) => state.toggleJournalReconciled,
  );
  const summary = journalSummary(entries, location);
  const comparisonFactor =
    period === "mtd" ? 0.947 : period === "qtd" ? 0.91 : 0.88;
  const priorRevenue = summary.revenueCents * comparisonFactor;
  const priorCogs = summary.cogsCents * 0.96;
  const priorExpenses = summary.expensesCents * 0.98;
  const pnlRows = [
    {
      label: "Net revenue",
      current: summary.revenueCents,
      prior: priorRevenue,
      tone: "revenue",
    },
    {
      label: "Cost of goods sold",
      current: -summary.cogsCents,
      prior: -priorCogs,
      tone: "cogs",
    },
    {
      label: "Gross profit",
      current: summary.grossProfitCents,
      prior: priorRevenue - priorCogs,
      tone: "total",
    },
    {
      label: "Operating expenses",
      current: -summary.expensesCents,
      prior: -priorExpenses,
      tone: "expense",
    },
    {
      label: "Operating profit",
      current: summary.operatingProfitCents,
      prior: priorRevenue - priorCogs - priorExpenses,
      tone: "grand",
    },
  ];
  const chart = [
    {
      period: "Apr",
      revenue: 98200,
      grossProfit: 43100,
      operatingProfit: 21300,
    },
    {
      period: "May",
      revenue: 107400,
      grossProfit: 46800,
      operatingProfit: 24400,
    },
    {
      period: "Jun",
      revenue: 103800,
      grossProfit: 45200,
      operatingProfit: 22100,
    },
    {
      period: "Jul",
      revenue: 116900,
      grossProfit: 51800,
      operatingProfit: 28900,
    },
    {
      period: "Aug",
      revenue: 121600,
      grossProfit: 53700,
      operatingProfit: 30200,
    },
    {
      period: "Sep",
      revenue: summary.revenueCents / 100,
      grossProfit: summary.grossProfitCents / 100,
      operatingProfit: summary.operatingProfitCents / 100,
    },
  ];
  const revenueMix = entries
    .filter((entry) => entry.group === "revenue" && entry.status === "posted")
    .reduce<Record<string, number>>(
      (result, entry) => ({
        ...result,
        [entry.account]: (result[entry.account] ?? 0) + entry.amountCents,
      }),
      {},
    );
  const mix = Object.entries(revenueMix).map(([name, value]) => ({
    name,
    value: value / 100,
  }));
  const exportRows = [
    ["Account", "Current", "Prior", "Variance"],
    ...pnlRows.map((row) => [
      row.label,
      (row.current / 100).toFixed(2),
      (row.prior / 100).toFixed(2),
      ((row.current - row.prior) / 100).toFixed(2),
    ]),
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={money(summary.revenueCents, true)}
          detail={`${period.toUpperCase()} posted sales`}
          change={`+${((summary.revenueCents / priorRevenue - 1) * 100).toFixed(1)}%`}
          icon={ArrowUpRight}
          tone="success"
        />
        <KpiCard
          label="Gross profit"
          value={money(summary.grossProfitCents, true)}
          detail={`${summary.grossMarginPct.toFixed(1)}% gross margin`}
          icon={BadgeDollarSign}
        />
        <KpiCard
          label="Operating expenses"
          value={money(summary.expensesCents, true)}
          detail={`${summary.revenueCents ? ((summary.expensesCents / summary.revenueCents) * 100).toFixed(1) : 0}% of revenue`}
          icon={ArrowDownRight}
        />
        <KpiCard
          label="Operating profit"
          value={money(summary.operatingProfitCents, true)}
          detail={`${summary.operatingMarginPct.toFixed(1)}% operating margin`}
          icon={Scale}
          tone="success"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Profitability trend"
              description="Revenue, gross profit and operating profit across six operating periods."
            />
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 4" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <YAxis
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                />
                <ChartTooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#0a3440"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="grossProfit"
                  name="Gross profit"
                  fill="#c39745"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="operatingProfit"
                  name="Operating profit"
                  fill="#6d9884"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SectionTitle
              title="Revenue mix"
              description="Posted revenue by operating channel."
            />
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                  >
                    {mix.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          ["#0a3440", "#c39745", "#6d9884", "#94a3b8"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {mix.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between gap-3 text-[10px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: [
                          "#0a3440",
                          "#c39745",
                          "#6d9884",
                          "#94a3b8",
                        ][index % 4],
                      }}
                    />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-semibold">
                    ${entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionTitle
            title="Live profit and loss"
            description="Calculated from posted journal entries; drafts remain outside reported results."
            action={
              <div className="flex gap-2">
                <ExportButton filename="flair-live-pnl.csv" rows={exportRows} />
                <Button className="h-9 gap-2 text-xs" onClick={onPost}>
                  <FilePlus2 className="size-3.5" />
                  Post adjustment
                </Button>
              </div>
            }
          />
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Current period</TableHead>
                <TableHead className="text-right">Previous period</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">% of revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pnlRows.map((row) => (
                <TableRow
                  key={row.label}
                  className={
                    row.tone === "grand"
                      ? "border-t-2 bg-primary/[0.045] font-semibold"
                      : row.tone === "total"
                        ? "bg-muted/30 font-semibold"
                        : ""
                  }
                >
                  <TableCell className="text-xs">{row.label}</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {money(row.current)}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {money(row.prior)}
                  </TableCell>
                  <TableCell
                    className={`text-right text-xs font-semibold tabular-nums ${row.current - row.prior >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {money(row.current - row.prior)}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {summary.revenueCents
                      ? `${((Math.abs(row.current) / summary.revenueCents) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <SectionTitle
            title="Reconciliation queue"
            description={`${summary.unreconciledCount} posted entries need confirmation before close.`}
          />
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {entries
            .filter((entry) => !entry.reconciled && entry.status === "posted")
            .map((entry) => (
              <button
                type="button"
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40"
                onClick={() => {
                  toggleReconciled(entry.id);
                  toast.success(`${entry.reference} reconciled.`);
                }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <ListChecks className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">
                    {entry.description}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {entry.reference} · {money(entry.amountCents)}
                  </span>
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </button>
            ))}
        </CardContent>
      </Card>
    </>
  );
}

function JournalEntryDialog({
  open,
  onOpenChange,
  defaultLocation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLocation: string;
}) {
  const addEntry = useDecisionIntelligenceStore(
    (state) => state.addJournalEntry,
  );
  const entryCount = useDecisionIntelligenceStore(
    (state) => state.journalEntries.length,
  );
  const [group, setGroup] = useState<JournalGroup>("expense");
  const [account, setAccount] = useState("Operating expense");
  const [amount, setAmount] = useState(125);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("Finance adjustment");
  const [location, setLocation] = useState(
    defaultLocation === "All locations" ? "All locations" : defaultLocation,
  );
  const [status, setStatus] = useState<JournalEntry["status"]>("posted");

  const effectiveReference =
    reference || `ADJ-0908-${String(entryCount + 1).padStart(2, "0")}`;

  function setDialogOpen(nextOpen: boolean) {
    if (!nextOpen) setReference("");
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Post journal entry</DialogTitle>
          <DialogDescription>
            Add a controlled demo entry. Posted items update the live P&amp;L
            immediately; drafts stay outside totals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <FormField label="Entry group">
            <Select
              value={group}
              onValueChange={(value) => setGroup(value as JournalGroup)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="cogs">Cost of goods sold</SelectItem>
                <SelectItem value="expense">Operating expense</SelectItem>
                <SelectItem value="tax">Tax liability</SelectItem>
                <SelectItem value="cash">Cash / bank</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Amount ($)">
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </FormField>
          <FormField label="Account">
            <Input
              value={account}
              onChange={(event) => setAccount(event.target.value)}
            />
          </FormField>
          <FormField label="Reference">
            <Input
              value={effectiveReference}
              onChange={(event) => setReference(event.target.value)}
            />
          </FormField>
          <FormField label="Location">
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </FormField>
          <FormField label="Posting status">
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as JournalEntry["status"])
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Post now</SelectItem>
                <SelectItem value="draft">Save as draft</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              amount <= 0 || !account.trim() || !effectiveReference.trim()
            }
            onClick={() => {
              addEntry({
                date: "2026-09-08",
                reference: effectiveReference,
                description,
                account,
                group,
                amountCents: Math.round(amount * 100),
                location,
                status,
                reconciled: false,
              });
              setDialogOpen(false);
              toast.success(
                status === "posted"
                  ? "Journal entry posted."
                  : "Journal draft saved.",
              );
            }}
          >
            {status === "posted" ? "Post entry" : "Save draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
