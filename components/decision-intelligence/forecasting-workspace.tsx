"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  Gauge,
  History,
  PackageCheck,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { Progress } from "@/components/ui/progress";
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
  daysOfCover,
  forecastAccuracy,
  forecastRisk,
  forecastSummary,
  money,
  projectedDemand,
  recommendedOrderQty,
} from "@/lib/decision-intelligence";
import { useDecisionIntelligenceStore } from "@/store/decision-intelligence-store";
import type {
  ForecastHorizon,
  ForecastItem,
  ForecastRisk,
  ForecastScenario,
  MovementType,
} from "@/types/decision-intelligence";

const pageCopy = {
  overview: {
    title: "Forecast Overview",
    description:
      "A live planning cockpit for demand, stock-out exposure, forecast quality and replenishment value.",
  },
  "demand-forecast": {
    title: "Demand Forecast",
    description:
      "Compare actual demand with the forecast, test scenarios and document planner overrides by SKU.",
  },
  "smart-reorder": {
    title: "Smart Reorder Recommendation",
    description:
      "Convert demand, lead time, safety stock and case packs into reviewable purchase recommendations.",
  },
  "stock-movement": {
    title: "Stock Movement Intelligence",
    description:
      "Understand velocity, aging and every stock event, then act on transfer and rebalancing signals.",
  },
} as const;

type ForecastView = keyof typeof pageCopy;

function riskTone(risk: ForecastRisk) {
  return risk === "critical"
    ? ("danger" as const)
    : risk === "watch" || risk === "overstock"
      ? ("attention" as const)
      : ("success" as const);
}

function riskLabel(risk: ForecastRisk) {
  return {
    critical: "Reorder now",
    watch: "Watch",
    healthy: "Healthy",
    overstock: "Overstock",
  }[risk];
}

export function ForecastingWorkspace({ view }: { view: string }) {
  const currentView = (view in pageCopy ? view : "overview") as ForecastView;
  const copy = pageCopy[currentView];
  const items = useDecisionIntelligenceStore((state) => state.forecastItems);
  const lastForecastAt = useDecisionIntelligenceStore(
    (state) => state.lastForecastAt,
  );
  const forecastRuns = useDecisionIntelligenceStore(
    (state) => state.forecastRuns,
  );
  const runForecast = useDecisionIntelligenceStore(
    (state) => state.runForecast,
  );
  const reset = useDecisionIntelligenceStore(
    (state) => state.resetDecisionData,
  );
  const [location, setLocation] = useState("All locations");
  const [scenario, setScenario] = useState<ForecastScenario>("base");
  const [horizon, setHorizon] = useState<ForecastHorizon>(30);

  const locations = useMemo(
    () => ["All locations", ...new Set(items.map((item) => item.location))],
    [items],
  );
  const filtered = useMemo(
    () =>
      items.filter(
        (item) => location === "All locations" || item.location === location,
      ),
    [items, location],
  );

  const commonFilters = (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
      <FilterSelect
        label="Location"
        value={location}
        onChange={setLocation}
        className="min-w-44"
        options={locations.map((value) => ({ value, label: value }))}
      />
      <FilterSelect
        label="Scenario"
        value={scenario}
        onChange={(value) => setScenario(value as ForecastScenario)}
        options={[
          { value: "conservative", label: "Conservative · −10%" },
          { value: "base", label: "Base forecast" },
          { value: "growth", label: "Growth · +15%" },
        ]}
      />
      <FilterSelect
        label="Horizon"
        value={String(horizon)}
        onChange={(value) => setHorizon(Number(value) as ForecastHorizon)}
        options={[
          { value: "30", label: "Next 30 days" },
          { value: "60", label: "Next 60 days" },
          { value: "90", label: "Next 90 days" },
        ]}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 07 · Smart Demand Forecasting · Live workspace"
        title={copy.title}
        description={copy.description}
        actions={
          <>
            <Button
              variant="outline"
              className="h-9 gap-2 text-xs"
              onClick={() => {
                reset();
                toast.success("Forecasting demo data restored.");
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              className="h-9 gap-2 text-xs"
              onClick={() => {
                runForecast();
                toast.success("Forecast run completed", {
                  description: `${filtered.length} SKUs recalculated using the latest velocity signals.`,
                });
              }}
            >
              <Sparkles className="size-3.5" />
              Run forecast
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {commonFilters}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <Badge variant="outline" className="h-7 gap-1.5 rounded-lg px-2.5">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Model online
          </Badge>
          <span>
            Run {forecastRuns} · Updated {formatWhen(lastForecastAt)}
          </span>
        </div>
      </div>

      {currentView === "overview" && (
        <ForecastOverview
          items={filtered}
          scenario={scenario}
          horizon={horizon}
        />
      )}
      {currentView === "demand-forecast" && (
        <DemandForecast
          items={filtered}
          scenario={scenario}
          horizon={horizon}
        />
      )}
      {currentView === "smart-reorder" && (
        <SmartReorder items={filtered} scenario={scenario} />
      )}
      {currentView === "stock-movement" && (
        <StockMovementIntelligence items={filtered} />
      )}
    </div>
  );
}

function ForecastOverview({
  items,
  scenario,
  horizon,
}: {
  items: ForecastItem[];
  scenario: ForecastScenario;
  horizon: ForecastHorizon;
}) {
  const summary = forecastSummary(items, horizon, scenario);
  const chart = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        period: `Wk ${index + 1}`,
        actual: items.reduce(
          (sum, item) => sum + (item.weeklyActual[index] ?? 0),
          0,
        ),
        forecast: Math.round(
          items.reduce(
            (sum, item) => sum + projectedDemand(item, 30, scenario) / 4.35,
            0,
          ) *
            (0.88 + index * 0.035),
        ),
      })),
    [items, scenario],
  );
  const watchlist = [...items]
    .sort((a, b) => daysOfCover(a, scenario) - daysOfCover(b, scenario))
    .slice(0, 6);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={`${horizon}-day demand`}
          value={`${summary.demand.toLocaleString()} units`}
          detail={`${scenario} scenario · ${items.length} SKUs`}
          change="Explainable"
          icon={Sparkles}
        />
        <KpiCard
          label="Stock-out exposure"
          value={`${summary.atRiskCount} SKUs`}
          detail={`${money(summary.revenueAtRiskCents, true)} revenue at risk`}
          icon={CircleAlert}
          tone="attention"
        />
        <KpiCard
          label="Recommended order"
          value={`${summary.reorderUnits.toLocaleString()} units`}
          detail={`${money(summary.reorderCostCents, true)} planned cost`}
          icon={PackageCheck}
        />
        <KpiCard
          label="Model accuracy"
          value={`${summary.accuracy.toFixed(1)}%`}
          detail="Weighted trailing 30-day result"
          change="+3.1 pts"
          icon={Gauge}
          tone="success"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.7fr)]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Actual demand vs forecast"
              description="Six-week operating signal recalculated for the selected scenario."
              action={
                <Badge variant="secondary" className="h-6 text-[9px]">
                  {scenario} scenario
                </Badge>
              }
            />
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ left: -22, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9b56d" stopOpacity={0.36} />
                    <stop
                      offset="100%"
                      stopColor="#d9b56d"
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
                <YAxis tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip />
                <Area
                  dataKey="forecast"
                  name="Forecast"
                  type="monotone"
                  stroke="#b68a39"
                  fill="url(#forecastFill)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="actual"
                  name="Actual"
                  type="monotone"
                  stroke="#0a3440"
                  fill="transparent"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              title="Planning priorities"
              description="The highest-impact actions in this forecast run."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {watchlist.slice(0, 4).map((item, index) => {
              const risk = forecastRisk(item, scenario);
              const quantity = recommendedOrderQty(item, scenario);
              return (
                <div key={item.id} className="rounded-xl border p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[10px] font-semibold text-primary-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {item.product}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {daysOfCover(item, scenario).toFixed(0)} days cover ·{" "}
                        {item.location}
                      </p>
                    </div>
                    <StatusPill label={riskLabel(risk)} tone={riskTone(risk)} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                    <span className="text-muted-foreground">
                      Recommended action
                    </span>
                    <span className="font-semibold">
                      {quantity ? `Order ${quantity} units` : "Monitor stock"}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionTitle
            title="Demand watchlist"
            description="Every risk is tied to stock cover, lead time and forecast demand."
          />
        </CardHeader>
        <ForecastTable
          items={watchlist}
          scenario={scenario}
          horizon={horizon}
        />
      </Card>
    </>
  );
}

function ForecastTable({
  items,
  scenario,
  horizon,
}: {
  items: ForecastItem[];
  scenario: ForecastScenario;
  horizon: ForecastHorizon;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>{horizon}d demand</TableHead>
            <TableHead>Cover</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Signal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const risk = forecastRisk(item, scenario);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="max-w-72 truncate text-xs font-semibold">
                    {item.product}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {item.sku} · {item.location}
                  </p>
                </TableCell>
                <TableCell className="text-xs tabular-nums">
                  {Math.max(0, item.onHand + item.inbound - item.committed)}
                </TableCell>
                <TableCell className="text-xs font-semibold tabular-nums">
                  {projectedDemand(item, horizon, scenario)}
                </TableCell>
                <TableCell className="text-xs tabular-nums">
                  {daysOfCover(item, scenario).toFixed(0)} days
                </TableCell>
                <TableCell className="text-xs tabular-nums">
                  {item.confidence}%
                </TableCell>
                <TableCell>
                  <StatusPill label={riskLabel(risk)} tone={riskTone(risk)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function DemandForecast({
  items,
  scenario,
  horizon,
}: {
  items: ForecastItem[];
  scenario: ForecastScenario;
  horizon: ForecastHorizon;
}) {
  const setAdjustment = useDecisionIntelligenceStore(
    (state) => state.setForecastAdjustment,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [riskFilter, setRiskFilter] = useState("all");
  const [editing, setEditing] = useState<ForecastItem | null>(null);
  const [adjustment, setAdjustmentValue] = useState(0);
  const categories = [
    "All categories",
    ...new Set(items.map((item) => item.category)),
  ];
  const visible = items.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      [item.product, item.sku, item.brand].some((value) =>
        value.toLowerCase().includes(query),
      );
    const matchesCategory =
      category === "All categories" || item.category === category;
    const risk = forecastRisk(item, scenario);
    return (
      matchesSearch &&
      matchesCategory &&
      (riskFilter === "all" || risk === riskFilter)
    );
  });

  const exportRows = [
    [
      "SKU",
      "Product",
      "Location",
      "Actual 30d",
      `${horizon}d forecast`,
      "Accuracy",
      "Planner override",
      "Risk",
    ],
    ...visible.map((item) => [
      item.sku,
      item.product,
      item.location,
      item.actual30,
      projectedDemand(item, horizon, scenario),
      `${forecastAccuracy(item.actual30, item.forecast30).toFixed(1)}%`,
      `${item.adjustmentPct}%`,
      forecastRisk(item, scenario),
    ]),
  ];

  return (
    <>
      <Card>
        <CardHeader className="gap-4">
          <SectionTitle
            title="SKU demand plan"
            description={`${visible.length} of ${items.length} products · edit an override to see demand and reorder quantities update immediately.`}
            action={
              <ExportButton
                filename="flair-demand-forecast.csv"
                rows={exportRows}
              />
            }
          />
          <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_180px_150px]">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search SKU, product or brand…"
            />
            <FilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories.map((value) => ({ value, label: value }))}
            />
            <FilterSelect
              label="Risk"
              value={riskFilter}
              onChange={setRiskFilter}
              options={[
                { value: "all", label: "All signals" },
                { value: "critical", label: "Critical" },
                { value: "watch", label: "Watch" },
                { value: "healthy", label: "Healthy" },
                { value: "overstock", label: "Overstock" },
              ]}
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Actual 30d</TableHead>
                <TableHead>{horizon}d forecast</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead>Planner override</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => {
                const risk = forecastRisk(item, scenario);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="max-w-64 truncate text-xs font-semibold">
                        {item.product}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {item.sku} · {item.brand}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {item.actual30}
                    </TableCell>
                    <TableCell className="text-xs font-semibold tabular-nums">
                      {projectedDemand(item, horizon, scenario)}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {forecastAccuracy(item.actual30, item.forecast30).toFixed(
                        1,
                      )}
                      %
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          item.velocityPct >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {item.velocityPct >= 0 ? "+" : ""}
                        {item.velocityPct}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.adjustmentPct ? "default" : "secondary"}
                        className="h-6 text-[9px]"
                      >
                        {item.adjustmentPct > 0 ? "+" : ""}
                        {item.adjustmentPct}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={riskLabel(risk)}
                        tone={riskTone(risk)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-[10px]"
                        onClick={() => {
                          setEditing(item);
                          setAdjustmentValue(item.adjustmentPct);
                        }}
                      >
                        <SlidersHorizontal className="size-3" />
                        Override
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!visible.length && (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <Sparkles className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">
                  No forecast rows match
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clear a filter to restore the demand plan.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Document forecast override</DialogTitle>
            <DialogDescription>
              Planner changes are applied on top of the selected scenario and
              retained in this demo workspace.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 py-2">
              <div className="rounded-xl border bg-muted/25 p-4">
                <p className="text-xs font-semibold">{editing.product}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Base 30-day forecast {editing.forecast30} · confidence{" "}
                  {editing.confidence}%
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="forecast-adjustment">
                  Adjustment percentage
                </Label>
                <Input
                  id="forecast-adjustment"
                  type="number"
                  min={-50}
                  max={100}
                  value={adjustment}
                  onChange={(event) =>
                    setAdjustmentValue(Number(event.target.value))
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Result:{" "}
                  {projectedDemand(
                    { ...editing, adjustmentPct: adjustment },
                    horizon,
                    scenario,
                  )}{" "}
                  units over {horizon} days.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                setAdjustment(editing.id, adjustment);
                setEditing(null);
                toast.success("Forecast override saved", {
                  description: `${editing.sku} now includes a ${adjustment}% planner adjustment.`,
                });
              }}
            >
              Save override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SmartReorder({
  items,
  scenario,
}: {
  items: ForecastItem[];
  scenario: ForecastScenario;
}) {
  const decisions = useDecisionIntelligenceStore(
    (state) => state.reorderDecisions,
  );
  const drafts = useDecisionIntelligenceStore((state) => state.purchaseDrafts);
  const setSelected = useDecisionIntelligenceStore(
    (state) => state.setReorderSelected,
  );
  const setAllSelected = useDecisionIntelligenceStore(
    (state) => state.setAllReordersSelected,
  );
  const setQuantity = useDecisionIntelligenceStore(
    (state) => state.setReorderQuantity,
  );
  const setStatus = useDecisionIntelligenceStore(
    (state) => state.setReorderStatus,
  );
  const createDrafts = useDecisionIntelligenceStore(
    (state) => state.createPurchaseDrafts,
  );
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState("All vendors");
  const [status, setStatusFilter] = useState("all");
  const vendors = ["All vendors", ...new Set(items.map((item) => item.vendor))];
  const rows = items
    .map((item) => ({
      item,
      decision: decisions.find((decision) => decision.skuId === item.id)!,
      recommended: recommendedOrderQty(item, scenario),
    }))
    .filter(({ item, decision, recommended }) => {
      const query = search.toLowerCase();
      return (
        (!query ||
          `${item.product} ${item.sku} ${item.vendor}`
            .toLowerCase()
            .includes(query)) &&
        (vendor === "All vendors" || item.vendor === vendor) &&
        (status === "all" || decision.status === status) &&
        (recommended > 0 || decision.status !== "pending")
      );
    });
  const selected = rows.filter(({ decision }) => decision.selected);
  const draftedSkuIds = new Set(drafts.flatMap((draft) => draft.skuIds));
  const approvedForDraft = rows.filter(
    ({ item, decision }) =>
      decision.status === "approved" && !draftedSkuIds.has(item.id),
  );
  const totalUnits = rows.reduce(
    (sum, row) => sum + (row.decision.approvedQty || row.recommended),
    0,
  );
  const totalCost = rows.reduce(
    (sum, row) =>
      sum +
      (row.decision.approvedQty || row.recommended) * row.item.unitCostCents,
    0,
  );

  function requireSelection(action: (ids: string[]) => void) {
    if (!selected.length) {
      toast.error("Select at least one recommendation first.");
      return;
    }
    action(selected.map(({ item }) => item.id));
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Recommendations"
          value={String(rows.length)}
          detail={`${selected.length} currently selected`}
          icon={Sparkles}
        />
        <KpiCard
          label="Suggested units"
          value={totalUnits.toLocaleString()}
          detail={`${new Set(rows.map((row) => row.item.vendor)).size} vendors`}
          icon={Boxes}
        />
        <KpiCard
          label="Planned investment"
          value={money(totalCost, true)}
          detail="At original unit purchase cost"
          icon={PackageCheck}
        />
        <KpiCard
          label="Draft purchase orders"
          value={String(drafts.length)}
          detail={
            drafts.length
              ? "Ready for Purchasing when unlocked"
              : "Create from approved rows"
          }
          icon={FileCheck2}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <SectionTitle
            title="Reorder approval queue"
            description="Recommendations are rounded to vendor case packs and remain editable before approval."
            action={
              <Button
                className="h-9 gap-2 text-xs"
                onClick={() => {
                  if (!approvedForDraft.length) {
                    toast.error(
                      "Approve at least one new recommendation first.",
                    );
                    return;
                  }
                  const created = createDrafts(
                    approvedForDraft.map(({ item }) => item.id),
                    scenario,
                  );
                  toast.success(
                    `${created.length} purchase draft${created.length === 1 ? "" : "s"} created`,
                    {
                      description: `${created.reduce((sum, draft) => sum + draft.totalUnits, 0)} units grouped by vendor.`,
                    },
                  );
                }}
              >
                <FileCheck2 className="size-3.5" />
                Create PO draft
              </Button>
            }
          />
          <div className="grid gap-2 xl:grid-cols-[minmax(220px,1fr)_180px_150px_auto]">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search product, SKU or vendor…"
            />
            <FilterSelect
              label="Vendor"
              value={vendor}
              onChange={setVendor}
              options={vendors.map((value) => ({ value, label: value }))}
            />
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "deferred", label: "Deferred" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[10px]"
                onClick={() =>
                  requireSelection((ids) => setStatus(ids, "approved"))
                }
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[10px]"
                onClick={() =>
                  requireSelection((ids) => setStatus(ids, "deferred"))
                }
              >
                Defer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[10px] text-rose-700"
                onClick={() =>
                  requireSelection((ids) => setStatus(ids, "rejected"))
                }
              >
                Reject
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all recommendations"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onCheckedChange={(checked) =>
                      setAllSelected(
                        rows.map(({ item }) => item.id),
                        Boolean(checked),
                      )
                    }
                  />
                </TableHead>
                <TableHead>Product / vendor</TableHead>
                <TableHead>Cover</TableHead>
                <TableHead>Lead time</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Approved qty</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ item, decision, recommended }) => {
                const quantity = decision.approvedQty || recommended;
                return (
                  <TableRow
                    key={item.id}
                    data-state={decision.selected ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        aria-label={`Select ${item.product}`}
                        checked={decision.selected}
                        onCheckedChange={(checked) =>
                          setSelected(item.id, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <p className="max-w-64 truncate text-xs font-semibold">
                        {item.product}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {item.vendor} · case {item.casePack}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {daysOfCover(item, scenario).toFixed(0)} days
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {item.leadTimeDays} days
                    </TableCell>
                    <TableCell className="text-xs font-semibold tabular-nums">
                      {recommended}
                    </TableCell>
                    <TableCell>
                      <Input
                        aria-label={`Approved quantity for ${item.product}`}
                        className="h-8 w-24 text-xs tabular-nums"
                        type="number"
                        min={0}
                        step={item.casePack}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(item.id, Number(event.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-xs font-semibold tabular-nums">
                      {money(quantity * item.unitCostCents)}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={decision.status}
                        tone={
                          decision.status === "approved"
                            ? "success"
                            : decision.status === "rejected"
                              ? "danger"
                              : decision.status === "deferred"
                                ? "attention"
                                : "info"
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle
              title="Created purchase drafts"
              description="Grouped by vendor and ready to hand off when Purchasing is unlocked."
            />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {drafts.slice(0, 6).map((draft) => (
              <div key={draft.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold">{draft.id}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {draft.vendor}
                    </p>
                  </div>
                  <StatusPill label={draft.status} tone="info" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Units
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {draft.totalUnits}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Cost
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {money(draft.totalCostCents)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function StockMovementIntelligence({ items }: { items: ForecastItem[] }) {
  const movements = useDecisionIntelligenceStore((state) => state.movements);
  const postTransfer = useDecisionIntelligenceStore(
    (state) => state.postTransfer,
  );
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MovementType | "all">("all");
  const [transferOpen, setTransferOpen] = useState(false);
  const [skuId, setSkuId] = useState(items[0]?.id ?? "");
  const [fromLocation, setFromLocation] = useState("Houston Main Warehouse");
  const [toLocation, setToLocation] = useState(
    items[0]?.location ?? "Harwin Flagship Store",
  );
  const [quantity, setQuantity] = useState(12);
  const [note, setNote] = useState("Rebalance stock from main warehouse");
  const itemIds = new Set(items.map((item) => item.id));
  const visible = movements.filter((movement) => {
    const query = search.toLowerCase();
    return (
      itemIds.has(movement.skuId) &&
      (type === "all" || movement.type === type) &&
      (!query ||
        `${movement.product} ${movement.reference} ${movement.note}`
          .toLowerCase()
          .includes(query))
    );
  });
  const fast = items.filter((item) => item.velocityPct >= 15);
  const slow = items.filter((item) => item.velocityPct < 0);
  const stale = items.filter((item) => item.lastMovement.includes("days"));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Movements logged"
          value={String(visible.length)}
          detail="Filtered immutable stock events"
          icon={History}
        />
        <KpiCard
          label="Fast sellers"
          value={String(fast.length)}
          detail="Velocity at least 15% above baseline"
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Slow movers"
          value={String(slow.length)}
          detail="Candidates for promotion or transfer"
          icon={TrendingDown}
          tone="attention"
        />
        <KpiCard
          label="Stale movement"
          value={String(stale.length)}
          detail="No event recorded in 3+ days"
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <Card>
          <CardHeader className="gap-4">
            <SectionTitle
              title="Stock movement journal"
              description="Sales, receipts, transfers, returns and inventory adjustments in one timeline."
              action={
                <Button
                  className="h-9 gap-2 text-xs"
                  onClick={() => setTransferOpen(true)}
                >
                  <Truck className="size-3.5" />
                  Create transfer
                </Button>
              }
            />
            <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_170px]">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search product, reference or note…"
              />
              <FilterSelect
                label="Movement type"
                value={type}
                onChange={(value) => setType(value as MovementType | "all")}
                options={[
                  { value: "all", label: "All movements" },
                  { value: "sale", label: "Sales" },
                  { value: "receipt", label: "Receipts" },
                  { value: "transfer", label: "Transfers" },
                  { value: "return", label: "Returns" },
                  { value: "adjustment", label: "Adjustments" },
                ]}
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time / reference</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Movement</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <p className="text-xs font-semibold">
                        {movement.reference}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatWhen(movement.occurredAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-64 truncate text-xs font-medium">
                        {movement.product}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {movement.note}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusPill
                          label={movement.type}
                          tone={
                            movement.type === "adjustment"
                              ? "attention"
                              : movement.type === "receipt" ||
                                  movement.type === "return"
                                ? "success"
                                : "info"
                          }
                        />
                        <span
                          className={
                            movement.quantity > 0
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }
                        >
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {movement.type === "transfer"
                        ? `${movement.fromLocation} → ${movement.toLocation}`
                        : (movement.fromLocation ?? movement.toLocation)}
                    </TableCell>
                    <TableCell className="text-xs">{movement.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              title="Movement intelligence"
              description="Signals that need an inventory decision."
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...items]
              .sort((a, b) => Math.abs(b.velocityPct) - Math.abs(a.velocityPct))
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="rounded-xl border p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {item.product}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Last movement {item.lastMovement}
                      </p>
                    </div>
                    <span
                      className={
                        item.velocityPct >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {item.velocityPct >= 0 ? "+" : ""}
                      {item.velocityPct}%
                    </span>
                  </div>
                  <Progress
                    className="mt-3 h-1.5"
                    value={Math.min(100, Math.abs(item.velocityPct) * 3)}
                  />
                  <Button
                    variant="ghost"
                    className="mt-2 h-7 w-full justify-between px-1 text-[10px] text-primary"
                    onClick={() => {
                      setSkuId(item.id);
                      setToLocation(item.location);
                      setQuantity(item.casePack);
                      setTransferOpen(true);
                    }}
                  >
                    Plan rebalance <ArrowRight className="size-3" />
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create stock transfer</DialogTitle>
            <DialogDescription>
              Record a demo transfer and immediately update the destination
              stock signal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label>Product</Label>
              <Select
                value={skuId}
                onValueChange={(value) => {
                  setSkuId(value);
                  const item = items.find((row) => row.id === value);
                  if (item) {
                    setToLocation(item.location);
                    setQuantity(item.casePack);
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.sku} · {item.product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-from">From</Label>
              <Input
                id="transfer-from"
                value={fromLocation}
                onChange={(event) => setFromLocation(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-to">To</Label>
              <Input
                id="transfer-to"
                value={toLocation}
                onChange={(event) => setToLocation(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-quantity">Quantity</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="transfer-note">Reason</Label>
              <Textarea
                id="transfer-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                !skuId ||
                !fromLocation.trim() ||
                !toLocation.trim() ||
                quantity <= 0
              }
              onClick={() => {
                const item = items.find((row) => row.id === skuId);
                if (!item) return;
                postTransfer({
                  skuId,
                  product: item.product,
                  type: "transfer",
                  quantity: Math.abs(quantity),
                  fromLocation,
                  toLocation,
                  reference: `TR-${String(Date.now()).slice(-5)}`,
                  user: "Admin",
                  note,
                });
                setTransferOpen(false);
                toast.success("Stock transfer recorded", {
                  description: `${quantity} units moved to ${toLocation}.`,
                });
              }}
            >
              <Warehouse className="size-4" />
              Post transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
