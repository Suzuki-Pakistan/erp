"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileCheck2,
  PackageCheck,
  Play,
  RefreshCcw,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const numberValue = (value: string) => Math.max(0, Number(value) || 0);

function WorkflowShell({
  eyebrow,
  title,
  description,
  children,
  onReset,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <Card className="overflow-hidden border-primary/15 shadow-[0_18px_46px_-38px_rgba(7,40,53,.7)]">
      <CardHeader className="border-b bg-[linear-gradient(115deg,rgba(7,40,53,.04),rgba(182,145,84,.08))] pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Play className="size-3 fill-current" /> Try it
              </Badge>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {eyebrow}
              </span>
            </div>
            <h2 className="mt-3 font-heading text-xl font-semibold tracking-[-0.025em]">
              {title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 text-[11px]"
            onClick={onReset}
          >
            <RefreshCcw className="size-3.5" /> Reset demo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn("h-9 text-xs tabular-nums", prefix && "pl-7")}
        />
      </div>
    </div>
  );
}

const summaryCell = (label: string, value: string, emphasis = false) => (
  <div
    className={cn(
      "rounded-lg border bg-background p-3",
      emphasis && "border-primary/20 bg-primary/[0.035]",
    )}
  >
    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </p>
    <p
      className={cn(
        "mt-1.5 text-base font-semibold tabular-nums",
        emphasis && "text-primary",
      )}
    >
      {value}
    </p>
  </div>
);

function PurchasingWorkflow() {
  const initial = {
    quantity: "120",
    price: "16",
    freight: "420",
    duty: "180",
    delivery: "90",
  };
  const [form, setForm] = useState(initial);
  const [stage, setStage] = useState<"calculate" | "draft" | "received">(
    "calculate",
  );
  const quantity = numberValue(form.quantity);
  const invoice = quantity * numberValue(form.price);
  const charges =
    numberValue(form.freight) +
    numberValue(form.duty) +
    numberValue(form.delivery);
  const landed = quantity ? (invoice + charges) / quantity : 0;
  const currentQuantity = 42;
  const currentAverage = 15.68;
  const nextAverage = quantity
    ? (currentQuantity * currentAverage + quantity * landed) /
      (currentQuantity + quantity)
    : currentAverage;
  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStage("calculate");
  };
  const reset = () => {
    setForm(initial);
    setStage("calculate");
  };

  return (
    <WorkflowShell
      eyebrow="Purchasing · landed cost"
      title="See the real cost before receiving stock"
      description="Change the invoice and expense inputs. The original purchase price remains visible while freight, duty and delivery are allocated separately per piece."
      onReset={reset}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field
              label="Quantity"
              value={form.quantity}
              onChange={(v) => set("quantity", v)}
            />
            <Field
              label="Purchase price / pc"
              prefix="$"
              value={form.price}
              onChange={(v) => set("price", v)}
            />
            <Field
              label="Transportation"
              prefix="$"
              value={form.freight}
              onChange={(v) => set("freight", v)}
            />
            <Field
              label="Duties"
              prefix="$"
              value={form.duty}
              onChange={(v) => set("duty", v)}
            />
            <Field
              label="Local delivery"
              prefix="$"
              value={form.delivery}
              onChange={(v) => set("delivery", v)}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCell("Original invoice", money(invoice))}
            {summaryCell("Separate expenses", money(charges))}
            {summaryCell("Landed cost / pc", money(landed), true)}
            {summaryCell("New average cost", money(nextAverage), true)}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (!quantity || !numberValue(form.price))
                  return toast.error(
                    "Add a quantity and purchase price first.",
                  );
                setStage("draft");
                toast.success(
                  "Draft PO-2425 created with separated cost components.",
                );
              }}
            >
              <FileCheck2 /> Create draft PO
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={stage === "calculate" || stage === "received"}
              onClick={() => {
                setStage("received");
                toast.success(
                  "Receipt posted. Stock and weighted average cost are updated.",
                );
              }}
            >
              <PackageCheck /> Receive stock
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Existing: 42 pcs at {money(currentAverage)} average cost
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-muted/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">PO-2425 activity</p>
            <Badge variant="outline" className="text-[10px]">
              {stage === "calculate"
                ? "Not created"
                : stage === "draft"
                  ? "Draft"
                  : "Received"}
            </Badge>
          </div>
          <div className="mt-4 space-y-4">
            {[
              "Costs calculated",
              "Purchase order created",
              "Stock received",
            ].map((label, index) => {
              const completed =
                index === 0 ||
                (index === 1 && stage !== "calculate") ||
                (index === 2 && stage === "received");
              return (
                <div key={label} className="flex gap-3 text-xs">
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border",
                      completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "bg-background text-muted-foreground",
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        !completed && "text-muted-foreground",
                      )}
                    >
                      {label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {index === 0
                        ? `${money(charges)} retained as separate expenses`
                        : index === 1
                          ? "Vendor and invoice history remain traceable"
                          : "On-hand 42 → " + (42 + quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WorkflowShell>
  );
}

const forecastSeed = [
  {
    id: "10000",
    product: "Lattafa Yara Pink 3.4 oz",
    stock: 18,
    demand: 86,
    suggested: 96,
    cost: 16,
    confidence: 92,
  },
  {
    id: "13275",
    product: "Nabeel Oud Khas 300ml",
    stock: 7,
    demand: 54,
    suggested: 60,
    cost: 4.99,
    confidence: 87,
  },
  {
    id: "10015",
    product: "Gucci Guilty Pour Femme",
    stock: 9,
    demand: 31,
    suggested: 36,
    cost: 62,
    confidence: 81,
  },
];

function ForecastWorkflow() {
  const [selected, setSelected] = useState<string[]>(["10000", "13275"]);
  const [leadTime, setLeadTime] = useState("14");
  const [status, setStatus] = useState("Ready to plan");
  const chosen = forecastSeed.filter((row) => selected.includes(row.id));
  const units = chosen.reduce((sum, row) => sum + row.suggested, 0);
  const value = chosen.reduce((sum, row) => sum + row.suggested * row.cost, 0);
  const reset = () => {
    setSelected(["10000", "13275"]);
    setLeadTime("14");
    setStatus("Ready to plan");
  };
  return (
    <WorkflowShell
      eyebrow="Forecasting · replenishment"
      title="Turn a forecast into a purchase decision"
      description="Select recommendations, adjust the supplier lead time and create a draft purchase order from the items that need attention."
      onReset={reset}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/35">
                <TableHead className="w-12">Use</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>30-day demand</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastSeed.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      aria-label={`Select ${row.product}`}
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => {
                        setSelected((current) =>
                          current.includes(row.id)
                            ? current.filter((id) => id !== row.id)
                            : [...current, row.id],
                        );
                        setStatus("Ready to plan");
                      }}
                      className="size-4 accent-[var(--brand-ink)]"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold">{row.product}</p>
                    <p className="text-[10px] text-muted-foreground">
                      SKU {row.id}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {row.stock}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {row.demand}
                  </TableCell>
                  <TableCell className="text-xs font-semibold tabular-nums">
                    {row.suggested}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.confidence} className="h-1.5 w-14" />
                      <span className="text-[10px]">{row.confidence}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="rounded-xl border bg-muted/25 p-4">
          <Label className="text-[11px] text-muted-foreground">
            Supplier lead time
          </Label>
          <Select
            value={leadTime}
            onValueChange={(value) => {
              setLeadTime(value);
              setStatus("Ready to plan");
            }}
          >
            <SelectTrigger className="mt-1.5 h-9 w-full bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {summaryCell("Selected", `${chosen.length} SKUs`)}
            {summaryCell("Order units", String(units))}
          </div>
          <div className="mt-2">
            {summaryCell("Estimated commitment", money(value), true)}
          </div>
          <Button
            className="mt-4 w-full"
            size="sm"
            disabled={!chosen.length}
            onClick={() => {
              setStatus("Draft PO-2426 created");
              toast.success("Draft PO-2426 created from the forecast.");
            }}
          >
            Create draft purchase order <ArrowRight />
          </Button>
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Sparkles className="size-3 text-[var(--brand-champagne)]" />{" "}
            {status} · {leadTime}-day scenario
          </p>
        </div>
      </div>
    </WorkflowShell>
  );
}

type LedgerEntry = {
  id: number;
  label: string;
  account: string;
  amount: number;
  type: "income" | "expense";
};
const ledgerSeed: LedgerEntry[] = [
  {
    id: 1,
    label: "Wholesale payment · WS-1051",
    account: "Bank",
    amount: 2840,
    type: "income",
  },
  {
    id: 2,
    label: "Harwin store utilities",
    account: "Operating expense",
    amount: -385,
    type: "expense",
  },
  {
    id: 3,
    label: "Card settlement · Sep 06",
    account: "Card clearing",
    amount: 6214.4,
    type: "income",
  },
];

function FinanceWorkflow() {
  const [cash, setCash] = useState("200");
  const [card, setCard] = useState("400");
  const [entries, setEntries] = useState(ledgerSeed);
  const [expense, setExpense] = useState("125");
  const total = numberValue(cash) + numberValue(card);
  const net = total / 1.0825;
  const tax = total - net;
  const posted = entries.some((entry) => entry.label.includes("POS-10482"));
  const reset = () => {
    setCash("200");
    setCard("400");
    setEntries(ledgerSeed);
    setExpense("125");
  };
  return (
    <WorkflowShell
      eyebrow="Finance · posting demo"
      title="Follow a split payment into the finance ledger"
      description="This $600 POS sale demonstrates separate cash and card tenders, the approved 8.25% tax, and the resulting accounting entries."
      onReset={reset}
    >
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-xl border bg-muted/25 p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/8 text-primary">
              <CircleDollarSign className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold">Retail sale POS-10482</p>
              <p className="text-[10px] text-muted-foreground">
                Tender the same invoice two ways
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field
              label="Cash tender"
              prefix="$"
              value={cash}
              onChange={setCash}
            />
            <Field
              label="Card tender"
              prefix="$"
              value={card}
              onChange={setCard}
            />
          </div>
          <div className="mt-4 space-y-2 rounded-lg border bg-background p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net sale</span>
              <span className="tabular-nums">{money(net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sales tax · 8.25%</span>
              <span className="tabular-nums">{money(tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total paid</span>
              <span className="tabular-nums">{money(total)}</span>
            </div>
          </div>
          <Button
            className="mt-3 w-full"
            size="sm"
            disabled={!total || posted}
            onClick={() => {
              setEntries((current) => [
                {
                  id: 4,
                  label: "POS sale · POS-10482",
                  account: `Cash ${money(numberValue(cash))} · Card ${money(numberValue(card))}`,
                  amount: total,
                  type: "income",
                },
                ...current,
              ]);
              toast.success(
                "Split sale posted to cash, card clearing, revenue and tax payable.",
              );
            }}
          >
            {posted ? (
              <>
                <CheckCircle2 /> Sale posted
              </>
            ) : (
              <>
                Post split sale <ArrowRight />
              </>
            )}
          </Button>
          <div className="mt-4 flex items-end gap-2 border-t pt-4">
            <div className="min-w-0 flex-1">
              <Field
                label="Add a demo expense"
                prefix="$"
                value={expense}
                onChange={setExpense}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                const amount = numberValue(expense);
                if (!amount) return;
                setEntries((current) => [
                  {
                    id: Date.now(),
                    label: "Courier & local delivery",
                    account: "Delivery expense",
                    amount: -amount,
                    type: "expense",
                  },
                  ...current,
                ]);
                toast.success("Expense added to the demo ledger.");
              }}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b bg-muted/25 px-4 py-3">
            <div>
              <p className="text-xs font-semibold">Recent finance activity</p>
              <p className="text-[10px] text-muted-foreground">
                Entries update as you use the controls
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Balance{" "}
              {money(entries.reduce((sum, entry) => sum + entry.amount, 0))}
            </Badge>
          </div>
          <div className="divide-y">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    entry.type === "income"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  <CircleDollarSign className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{entry.label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {entry.account}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    entry.amount >= 0 ? "text-emerald-700" : "text-amber-700",
                  )}
                >
                  {entry.amount >= 0 ? "+" : ""}
                  {money(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkflowShell>
  );
}

const wholesaleSeed = [
  {
    id: "WS-1054",
    customer: "Scent Avenue",
    value: "$4,680",
    status: "Credit review",
  },
  {
    id: "WS-1053",
    customer: "Beauty Market",
    value: "$2,940",
    status: "Approved",
  },
  {
    id: "WS-1052",
    customer: "Texas Fragrance Co.",
    value: "$6,120",
    status: "Picking",
  },
];

function WholesaleWorkflow() {
  const [orders, setOrders] = useState(wholesaleSeed);
  const reset = () => setOrders(wholesaleSeed);
  const advance = (id: string) =>
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status:
                order.status === "Credit review"
                  ? "Approved"
                  : order.status === "Approved"
                    ? "Picking"
                    : "Ready to ship",
            }
          : order,
      ),
    );
  return (
    <WorkflowShell
      eyebrow="Wholesale · order desk"
      title="Move a B2B order from review to fulfillment"
      description="Use the next-action button to release a credit hold, send an approved order to picking and prepare it for shipment."
      onReset={reset}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">{order.id}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {order.customer}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {order.value}
              </span>
            </div>
            <div className="my-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all",
                  order.status === "Credit review"
                    ? "w-1/4"
                    : order.status === "Approved"
                      ? "w-1/2"
                      : order.status === "Picking"
                        ? "w-3/4"
                        : "w-full",
                )}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-[10px]">
                {order.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px]"
                disabled={order.status === "Ready to ship"}
                onClick={() => {
                  advance(order.id);
                  toast.success(`${order.id} moved to its next stage.`);
                }}
              >
                {order.status === "Credit review"
                  ? "Approve credit"
                  : order.status === "Approved"
                    ? "Start picking"
                    : order.status === "Picking"
                      ? "Mark ready"
                      : "Complete"}
                <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </WorkflowShell>
  );
}

const ecommerceSeed = [
  {
    id: "WEB-7851",
    channel: "Shopify",
    customer: "Olivia Martin",
    value: "$129.00",
    status: "Picking",
  },
  {
    id: "WEB-7850",
    channel: "Website",
    customer: "Noah Williams",
    value: "$78.50",
    status: "Packed",
  },
  {
    id: "WEB-7849",
    channel: "Marketplace",
    customer: "Emma Davis",
    value: "$214.00",
    status: "New",
  },
];

function EcommerceWorkflow() {
  const [orders, setOrders] = useState(ecommerceSeed);
  const [sync, setSync] = useState("2 catalog issues");
  const next: Record<string, string> = {
    New: "Picking",
    Picking: "Packed",
    Packed: "Shipped",
  };
  const reset = () => {
    setOrders(ecommerceSeed);
    setSync("2 catalog issues");
  };
  return (
    <WorkflowShell
      eyebrow="E-commerce · fulfillment"
      title="Process online orders and clean up channel sync"
      description="Advance orders through a compact pick-pack-ship flow, then resolve the sample channel catalog exceptions."
      onReset={reset}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 md:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border p-4">
              <div className="flex justify-between gap-2">
                <Badge variant="secondary" className="text-[9px]">
                  {order.channel}
                </Badge>
                <span className="text-xs font-semibold">{order.value}</span>
              </div>
              <p className="mt-3 text-xs font-semibold">{order.id}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {order.customer}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full text-[10px]"
                disabled={order.status === "Shipped"}
                onClick={() => {
                  setOrders((current) =>
                    current.map((item) =>
                      item.id === order.id
                        ? { ...item, status: next[item.status] ?? item.status }
                        : item,
                    ),
                  );
                  toast.success(
                    `${order.id} is now ${next[order.status] ?? order.status}.`,
                  );
                }}
              >
                {order.status === "Shipped" ? (
                  <>
                    <CheckCircle2 /> Shipped
                  </>
                ) : (
                  <>
                    {order.status} <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-muted/25 p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/8 text-primary">
              <ShoppingCart className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold">Channel health</p>
              <p className="text-[10px] text-muted-foreground">
                Inventory and catalog sync
              </p>
            </div>
          </div>
          <p className="mt-5 text-2xl font-semibold">98.7%</p>
          <Progress
            value={sync === "Synced" ? 100 : 98.7}
            className="mt-2 h-2"
          />
          <p className="mt-3 text-[11px] text-muted-foreground">{sync}</p>
          <Button
            className="mt-4 w-full"
            size="sm"
            disabled={sync === "Synced"}
            onClick={() => {
              setSync("Synced");
              toast.success(
                "Catalog exceptions resolved; all channels are synced.",
              );
            }}
          >
            Resolve sync issues
          </Button>
        </div>
      </div>
    </WorkflowShell>
  );
}

function ReportsWorkflow() {
  const [location, setLocation] = useState("Harwin Retail Store");
  const [generated, setGenerated] = useState(false);
  const rows = [
    {
      channel: "Retail POS",
      transactions: 48,
      netSales: 6435.82,
      tax: 530.95,
      cash: 2210,
      card: 4756.77,
    },
    {
      channel: "Wholesale",
      transactions: 9,
      netSales: 8920,
      tax: 0,
      cash: 0,
      card: 8920,
    },
  ];
  const reset = () => {
    setLocation("Harwin Retail Store");
    setGenerated(false);
  };
  return (
    <WorkflowShell
      eyebrow="Reports · daily closing"
      title="Generate a retail and wholesale closing pack"
      description="Choose a scope, generate the close and export the same tender, sales and tax totals used for reconciliation."
      onReset={reset}
    >
      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        <div className="rounded-xl border bg-muted/25 p-4">
          <Label className="text-[11px] text-muted-foreground">
            Reporting scope
          </Label>
          <Select
            value={location}
            onValueChange={(value) => {
              setLocation(value);
              setGenerated(false);
            }}
          >
            <SelectTrigger className="mt-1.5 h-9 w-full bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Harwin Retail Store">
                Harwin Retail Store
              </SelectItem>
              <SelectItem value="All Flair locations">
                All Flair locations
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 rounded-lg border bg-background p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business date</span>
              <span>Sep 7, 2026</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Tax rate</span>
              <span>8.25%</span>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            size="sm"
            onClick={() => {
              setGenerated(true);
              toast.success("Closing report generated and ready to export.");
            }}
          >
            <Calculator /> Generate closing report
          </Button>
        </div>
        <div
          className={cn(
            "rounded-xl border transition-opacity",
            !generated && "opacity-55",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/25 px-4 py-3">
            <div>
              <p className="text-xs font-semibold">Daily close · {location}</p>
              <p className="text-[10px] text-muted-foreground">
                Retail and wholesale shown separately
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[10px]"
              disabled={!generated}
              onClick={() => downloadCsv("flair-closing-report.csv", rows)}
            >
              <Download className="size-3.5" /> Export CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Net sales</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Cash</TableHead>
                <TableHead>Card</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell className="text-xs font-semibold">
                    {row.channel}
                  </TableCell>
                  <TableCell className="text-xs">{row.transactions}</TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {money(row.netSales)}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {money(row.tax)}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {money(row.cash)}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {money(row.card)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="grid gap-2 border-t bg-muted/15 p-3 sm:grid-cols-3">
            {summaryCell("Total collected", money(15886.77), true)}
            {summaryCell("Cash drawer", money(2210))}
            {summaryCell("Card settlement", money(13676.77))}
          </div>
        </div>
      </div>
    </WorkflowShell>
  );
}

export function InteractiveWorkflow({ moduleId }: { moduleId: string }) {
  const workflow = useMemo(() => {
    if (moduleId === "purchasing") return <PurchasingWorkflow />;
    if (moduleId === "forecasting") return <ForecastWorkflow />;
    if (moduleId === "finance") return <FinanceWorkflow />;
    if (moduleId === "wholesale") return <WholesaleWorkflow />;
    if (moduleId === "ecommerce") return <EcommerceWorkflow />;
    if (moduleId === "reports") return <ReportsWorkflow />;
    return null;
  }, [moduleId]);
  return workflow;
}
