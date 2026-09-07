"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  History,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/inventory/shared";
import { useSessionUser } from "@/components/auth/session-provider";
import { canManagePos } from "@/types/auth";
import type {
  Customer,
  PosReturn,
  Sale,
  Shift,
  TenderMethod,
} from "@/types/pos";
import {
  cents,
  returnAmount,
  returnedQuantity,
  shiftTotals,
} from "@/lib/pos-calculations";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { usePos } from "./pos-provider";
import {
  CustomerDialog,
  dateTime,
  Empty,
  Metric,
  money,
  OpenShiftDialog,
  PosHeader,
  PosModal,
  ReceiptDialog,
  SettingsDialog,
} from "./shared";

function Status({
  children,
  warning = false,
}: {
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold",
        warning
          ? "bg-amber-50 text-amber-800"
          : "bg-emerald-50 text-emerald-700",
      )}
    >
      {children}
    </span>
  );
}
const tableClass =
  "w-full min-w-[720px] text-left text-xs [&_th]:whitespace-nowrap [&_th]:bg-muted/40 [&_th]:px-5 [&_th]:py-4 [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:border-t [&_td]:px-5 [&_td]:py-4";
export function SalesPage() {
  const { data, refresh, busy } = usePos();
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [tier, setTier] = useState("");
  const [date, setDate] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const sales = data.pos.sales.filter(
    (s) =>
      (!location || s.locationId === location) &&
      (!tier || s.tier === tier) &&
      (!date || s.createdAt.startsWith(date)) &&
      `${s.reference} ${s.customerName} ${s.actor} ${s.lines.map((l) => l.sku + " " + l.name).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const gross = sales.reduce((n, s) => n + s.totalCents, 0);
  const refunds = data.pos.returns
    .filter((r) => sales.some((s) => s.id === r.saleId))
    .reduce((n, r) => n + r.totalCents, 0);
  return (
    <div className="space-y-6">
      <PosHeader
        title="Sales history"
        description="Every sale, every detail. Find receipts and follow the full transaction trail."
        actions={
          <>
            <Button variant="outline" disabled={busy} onClick={refresh}>
              <RefreshCw />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/retail-pos">
                <Plus />
                New sale
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Recorded sales"
          value={String(sales.length)}
          detail="Matching current filters"
        />
        <Metric
          label="Gross collected"
          value={money(gross)}
          detail="Including sales tax"
        />
        <Metric
          label="Returned value"
          value={money(refunds)}
          detail="Against these receipts"
        />
        <Metric
          label="Net sales value"
          value={money(gross - refunds)}
          detail="After recorded returns"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Search sales"
            placeholder="Receipt, customer, SKU, or cashier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field-select w-full sm:w-48"
          aria-label="Sales location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All retail locations</option>
          {data.catalog.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          className="field-select w-full sm:w-44"
          aria-label="Sales price level"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
        >
          <option value="">All price levels</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
          <option value="vip">VIP</option>
        </select>
        <Input
          className="w-full sm:w-44"
          type="date"
          aria-label="Sale date (UTC)"
          title="Sale date (UTC)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button
          variant="outline"
          disabled={!sales.length}
          onClick={() =>
            downloadCsv(
              "flair-sales.csv",
              sales.map((s) => ({
                Receipt: s.reference,
                Date: s.createdAt,
                Store: s.locationName,
                Cashier: s.actor,
                Customer: s.customerName,
                PriceLevel: s.tier,
                Promotion:
                  s.promotion === "buy-one-second-half"
                    ? "Buy 1, second item 50% off"
                    : "",
                Subtotal: s.subtotalCents / 100,
                Discount: s.discountCents / 100,
                Tax: s.taxCents / 100,
                Total: s.totalCents / 100,
                Returned:
                  data.pos.returns
                    .filter((r) => r.saleId === s.id)
                    .reduce((n, r) => n + r.totalCents, 0) / 100,
              })),
            )
          }
        >
          <Download />
          Export
        </Button>
      </div>
      {!canManagePos(user) && (
        <p className="text-xs text-muted-foreground">
          Showing sales made by your login account. Date filters use UTC.
        </p>
      )}
      {sales.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                {[
                  "Receipt / time",
                  "Customer",
                  "Price level",
                  "Store / cashier",
                  "Payment",
                  "Total",
                  "Status",
                  "",
                ].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const returned = data.pos.returns
                  .filter((r) => r.saleId === s.id)
                  .reduce((n, r) => n + r.totalCents, 0);
                return (
                  <tr key={s.id}>
                    <td>
                      <button
                        onClick={() => setReceipt(s)}
                        className="font-semibold text-primary hover:underline"
                      >
                        {s.reference}
                      </button>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {dateTime(s.createdAt)}
                      </p>
                    </td>
                    <td>{s.customerName}</td>
                    <td className="capitalize">
                      {s.tier}
                      {s.promotion === "buy-one-second-half" && (
                        <p className="mt-1 text-[10px] text-emerald-700">
                          Buy 1, 2nd 50% off
                        </p>
                      )}
                    </td>
                    <td>
                      <p>{s.locationName}</p>
                      <p className="mt-1 text-muted-foreground">{s.actor}</p>
                    </td>
                    <td className="capitalize">
                      {s.tenders
                        .map((t) =>
                          t.method === "external"
                            ? "Card"
                            : t.method === "credit"
                              ? "Store credit"
                              : "Cash",
                        )
                        .join(" + ")}
                    </td>
                    <td className="font-semibold">{money(s.totalCents)}</td>
                    <td>
                      <Status warning={!!returned}>
                        {returned >= s.totalCents
                          ? "Returned"
                          : returned
                            ? "Partial return"
                            : "Completed"}
                      </Status>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReceipt(s)}
                      >
                        <Printer className="size-3.5" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="Your first sale starts here"
          description="Completed transactions appear here automatically. Pending offline checkouts live in the Sync Queue."
          action={
            <Button asChild>
              <Link href="/retail-pos">
                Open checkout
                <ArrowRight />
              </Link>
            </Button>
          }
        />
      )}
      <ReceiptDialog sale={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

export function ReturnsPage() {
  const { data } = usePos();
  const user = useSessionUser();
  const [search, setSearch] = useState("");
  const [sale, setSale] = useState<Sale | null>(null);
  const [creditNote, setCreditNote] = useState<PosReturn | null>(null);
  const eligible = data.pos.sales.filter(
    (s) =>
      s.lines.some(
        (l) => returnedQuantity(data.pos, s.id, l.productId) < l.quantity,
      ) &&
      `${s.reference} ${s.customerName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <PosHeader
        title="Returns & exchanges"
        description="Start with the original receipt. Keep pricing, tax, stock and credit fully traceable."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Credit notes issued"
          value={String(data.pos.returns.length)}
          detail="Audited return documents"
        />
        <Metric
          label="Returned value"
          value={money(data.pos.returns.reduce((n, r) => n + r.totalCents, 0))}
          detail="At original discounted prices"
        />
        <Metric
          label="Store credit issued"
          value={money(
            data.pos.returns
              .filter((r) => r.method === "credit")
              .reduce((n, r) => n + r.totalCents, 0),
          )}
          detail="Redeemable on the next purchase"
        />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/5">
              <RotateCcw className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Find the original sale</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Look up a receipt number or customer name.
              </p>
            </div>
          </div>
          <Input
            aria-label="Find receipt for return"
            placeholder="Search POS-000001 or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 max-h-[440px] space-y-2 overflow-y-auto">
            {eligible.length ? (
              eligible.map((s) => (
                <button
                  key={s.id}
                  disabled={!canManagePos(user)}
                  onClick={() => setSale(s)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left hover:bg-muted/40 disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-semibold">{s.reference}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.customerName} · {dateTime(s.createdAt)}
                    </p>
                  </div>
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    {money(s.totalCents)}
                    <ArrowRight className="size-4" />
                  </span>
                </button>
              ))
            ) : (
              <Empty
                title="No eligible receipts"
                description="Only completed sales with items remaining to return appear here."
              />
            )}
          </div>
        </section>
        <section className="rounded-2xl bg-primary p-6 text-white">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--brand-champagne)]">
            A considered return experience
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Make the next find
            <br />
            the right one.
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              "Find the original receipt and select returned quantities.",
              "Choose whether each item is suitable to restock.",
              "Issue a refund or customer store credit. For an exchange, use that credit on a new sale.",
            ].map((step, i) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-6 text-white/70"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/20 text-[10px] text-[var(--brand-champagne)]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex gap-2 border-t border-white/15 pt-5 text-xs leading-5 text-white/60">
            <ShieldCheck className="size-4 shrink-0" />
            Manager access is required. Refunds cannot exceed the original
            payment. An exchange is recorded as a return plus a separate new
            sale.
          </div>
        </section>
      </div>
      <section>
        <h2 className="mb-4 font-semibold">Return activity</h2>
        {data.pos.returns.length ? (
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className={tableClass}>
              <thead>
                <tr>
                  {[
                    "Credit note",
                    "Original receipt",
                    "Reason",
                    "Refund method",
                    "Amount",
                    "Processed by",
                    "",
                  ].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pos.returns.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <p className="font-semibold">{r.reference}</p>
                      <p className="mt-1 text-muted-foreground">
                        {dateTime(r.createdAt)}
                      </p>
                    </td>
                    <td>
                      {data.pos.sales.find((s) => s.id === r.saleId)?.reference}
                    </td>
                    <td className="max-w-52">
                      <p className="line-clamp-2">{r.reason}</p>
                    </td>
                    <td className="capitalize">
                      {r.method === "credit" ? "Store credit" : r.method}
                    </td>
                    <td className="font-semibold">{money(r.totalCents)}</td>
                    <td>{r.actor}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCreditNote(r)}
                      >
                        View note
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No returns recorded"
            description="Credit notes and their original receipts will be linked here."
          />
        )}
      </section>
      {sale && (
        <ReturnDialog
          sale={sale}
          onClose={() => setSale(null)}
          onComplete={(note) => {
            setSale(null);
            setCreditNote(note);
          }}
        />
      )}
      {creditNote && (
        <CreditNoteDialog
          record={creditNote}
          onClose={() => setCreditNote(null)}
        />
      )}
    </div>
  );
}
function ReturnDialog({
  sale,
  onClose,
  onComplete,
}: {
  sale: Sale;
  onClose: () => void;
  onComplete: (note: PosReturn) => void;
}) {
  const { data, mutate, busy } = usePos();
  const user = useSessionUser();
  const shift = data.pos.shifts.find(
    (s) => s.actorId === user.id && !s.closedAt,
  );
  const [requestId] = useState(() => crypto.randomUUID());
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<TenderMethod>(
    sale.customerId
      ? "credit"
      : sale.tenders.some((t) => t.method === "cash")
        ? "cash"
        : "external",
  );
  const [reference, setReference] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [lines, setLines] = useState(
    sale.lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity - returnedQuantity(data.pos, sale.id, l.productId),
      restock:
        l.tracked &&
        data.catalog.products.some(
          (p) =>
            p.id === l.productId && p.status === "active" && p.trackInventory,
        ),
    })),
  );
  const amount = lines.reduce(
    (n, l) =>
      n +
      returnAmount(
        sale.lines.find((s) => s.productId === l.productId)!,
        returnedQuantity(data.pos, sale.id, l.productId),
        l.quantity,
      ),
    0,
  );
  return (
    <PosModal
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
      wide
      title={`Return · ${sale.reference}`}
      description="Refunds use original prices, discounts and tax. Returned quantities cannot be refunded twice."
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              reason.trim().length < 3 ||
              amount <= 0 ||
              !shift ||
              shift.locationId !== sale.locationId ||
              (method === "external" &&
                (!confirmed || reference.trim().length < 3))
            }
            onClick={async () => {
              if (!shift) return;
              const result = await mutate({
                action: "sale.return",
                requestId,
                saleId: sale.id,
                shiftId: shift.id,
                reason,
                method,
                paymentReference: reference,
                lines: lines.filter((l) => l.quantity > 0),
              });
              const note = result?.data?.pos.returns.find(
                (r) => r.id === result.id,
              );
              if (note) onComplete(note);
            }}
          >
            Issue {money(amount)} return
          </Button>
        </>
      }
    >
      {(!shift || shift.locationId !== sale.locationId) && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          Open your own shift at {sale.locationName} before processing this
          return.
        </p>
      )}
      {sale.lines.map((original) => {
        const line = lines.find((l) => l.productId === original.productId)!;
        const remaining =
          original.quantity -
          returnedQuantity(data.pos, sale.id, original.productId);
        return (
          <div
            key={original.productId}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
          >
            <div className="min-w-40 flex-1">
              <p className="text-sm font-semibold">{original.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {remaining} returnable · Original line{" "}
                {money(original.totalCents)}
              </p>
            </div>
            <label className="grid gap-1 text-[10px] text-muted-foreground">
              Return quantity
              <Input
                aria-label={`Return quantity for ${original.name}`}
                type="number"
                min="0"
                max={remaining}
                className="w-20"
                value={line.quantity}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  if (Number.isInteger(q) && q >= 0 && q <= remaining)
                    setLines((prev) =>
                      prev.map((l) =>
                        l.productId === original.productId
                          ? { ...l, quantity: q }
                          : l,
                      ),
                    );
                }}
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={line.restock}
                disabled={!original.tracked}
                onChange={(e) =>
                  setLines((prev) =>
                    prev.map((l) =>
                      l.productId === original.productId
                        ? { ...l, restock: e.target.checked }
                        : l,
                    ),
                  )
                }
              />
              Restock
            </label>
          </div>
        );
      })}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Refund method">
          <select
            className="field-select"
            value={method}
            onChange={(e) => setMethod(e.target.value as TenderMethod)}
          >
            <option value="credit" disabled={!sale.customerId}>
              Customer store credit
            </option>
            <option value="cash">Cash refund</option>
            <option value="external">Card refund</option>
          </select>
        </FormField>
        <FormField label="Return reason">
          <Input
            value={reason}
            maxLength={500}
            placeholder="e.g. Unopened item returned"
            onChange={(e) => setReason(e.target.value)}
          />
        </FormField>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Cash and card refunds are limited to what was originally paid through
        that method. For mixed tenders, return fewer items per method or issue
        customer store credit. Damaged/non-restocked returns do not increase
        sellable stock.
      </p>
      {method === "external" && (
        <div className="space-y-3 rounded-xl border p-4">
          <FormField label="Card refund reference">
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </FormField>
          <label className="flex items-start gap-2 text-xs leading-5">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            The refund was completed using the card payment provider. Flair only
            records its reference.
          </label>
        </div>
      )}
      <div className="flex justify-between rounded-xl bg-primary p-5 text-white">
        <span>Refund including original tax</span>
        <strong>{money(amount)}</strong>
      </div>
    </PosModal>
  );
}
function CreditNoteDialog({
  record,
  onClose,
}: {
  record: PosReturn;
  onClose: () => void;
}) {
  const { data } = usePos();
  const sale = data.pos.sales.find((s) => s.id === record.saleId);
  return (
    <PosModal
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title={record.reference}
      description={`Credit note for ${sale?.reference ?? "sale"} · ${dateTime(record.createdAt)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {record.method === "credit" && sale?.customerId && (
            <Button asChild>
              <Link
                href={`/retail-pos?customer=${encodeURIComponent(sale.customerId)}`}
              >
                Start exchange sale
                <ArrowRight />
              </Link>
            </Button>
          )}
        </>
      }
    >
      <div className="rounded-xl bg-emerald-50 p-5">
        <CheckCircle2 className="mb-3 size-6 text-emerald-700" />
        <p className="text-2xl font-semibold">{money(record.totalCents)}</p>
        <p className="mt-1 text-sm capitalize">
          {record.method === "credit"
            ? "Customer store credit issued"
            : record.method + " refund recorded"}
        </p>
      </div>
      <p className="text-sm">{record.reason}</p>
      {record.lines.map((l) => (
        <div
          key={l.productId}
          className="flex justify-between gap-4 border-b pb-3 text-sm"
        >
          <div>
            <p>{sale?.lines.find((s) => s.productId === l.productId)?.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {l.quantity} returned ·{" "}
              {l.restock ? "Restocked" : "Not restocked"}
            </p>
          </div>
          <strong className="shrink-0">{money(l.amountCents)}</strong>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Processed by {record.actor}
        {record.paymentReference
          ? ` · Card confirmation ${record.paymentReference}`
          : ""}
        . Original receipt: {sale?.reference}.
      </p>
      <Button
        variant="outline"
        onClick={() =>
          downloadCsv(
            record.reference + ".csv",
            record.lines.map((l) => ({
              CreditNote: record.reference,
              OriginalReceipt: sale?.reference ?? "",
              Date: record.createdAt,
              Product:
                sale?.lines.find((s) => s.productId === l.productId)?.name ??
                l.productId,
              Quantity: l.quantity,
              Restocked: l.restock ? "Yes" : "No",
              Amount: l.amountCents / 100,
              Method: record.method,
              Reason: record.reason,
            })),
          )
        }
      >
        <Download />
        Download credit note
      </Button>
    </PosModal>
  );
}

export function CustomersPage() {
  const { data } = usePos();
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<Customer | "new" | null>(null);
  const [view, setView] = useState<Customer | null>(null);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const customers = data.pos.customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const selected = data.pos.customers.find((c) => c.id === view?.id);
  return (
    <div className="space-y-6">
      <PosHeader
        title="Customer accounts"
        description="Remember the person behind the purchase. One account for history, notes and store credit."
        actions={
          <>
            <Button
              variant="outline"
              disabled={!data.pos.customers.some((c) => c.marketingOptIn)}
              onClick={() =>
                downloadCsv(
                  "flair-promotion-contacts.csv",
                  data.pos.customers
                    .filter((c) => c.marketingOptIn)
                    .map((c) => ({
                      Customer: c.name,
                      Email: c.email,
                      Phone: c.phone,
                      PreferredContact: c.preferredContact,
                      PromotionConsent: "Yes",
                    })),
                )
              }
            >
              <Download />
              Export promotion contacts
            </Button>
            <Button onClick={() => setEdit("new")}>
              <Plus />
              New customer
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Customer accounts"
          value={String(data.pos.customers.length)}
          detail="Store-wide customer directory"
        />
        <Metric
          label="Outstanding store credit"
          value={money(
            data.pos.customers.reduce((n, c) => n + c.creditCents, 0),
          )}
          detail="Issued credit less redemptions"
        />
        <Metric
          label="Linked purchases"
          value={String(data.pos.sales.filter((s) => s.customerId).length)}
          detail="Within your receipt access"
        />
        <Metric
          label="Promotion alerts"
          value={String(
            data.pos.customers.filter((c) => c.marketingOptIn).length,
          )}
          detail="Customers with recorded consent"
        />
      </div>
      <Input
        aria-label="Search customers"
        placeholder="Search by name, email or phone…"
        className="max-w-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {customers.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {customers.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setView(c)}
              className="min-w-0 rounded-2xl border bg-card p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-champagne)]/20 text-sm font-semibold">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{c.name}</h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {c.email || c.phone || "No contact details"}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs">
                <span className="text-muted-foreground">Store credit</span>
                <strong className="text-emerald-700">
                  {money(c.creditCents)}
                </strong>
              </div>
              {c.marketingOptIn && (
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Promotions · {c.preferredContact}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <Empty
          title="Build lasting relationships"
          description="Create a customer account at checkout or here to connect purchases and store credit."
          action={
            <Button onClick={() => setEdit("new")}>
              <Plus />
              Add customer
            </Button>
          }
        />
      )}
      {edit && (
        <CustomerDialog
          key={edit === "new" ? "new" : edit.id}
          open
          onOpenChange={(o) => {
            if (!o) setEdit(null);
          }}
          customer={edit === "new" ? undefined : edit}
        />
      )}
      {selected && (
        <PosModal
          open
          wide
          onOpenChange={(o) => {
            if (!o) setView(null);
          }}
          title={selected.name}
          description={
            [selected.email, selected.phone].filter(Boolean).join(" · ") ||
            "Customer account"
          }
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEdit(selected);
                  setView(null);
                }}
              >
                Edit customer
              </Button>
              <Button asChild>
                <Link
                  href={`/retail-pos?customer=${encodeURIComponent(selected.id)}`}
                >
                  Start a sale
                  <ArrowRight />
                </Link>
              </Button>
            </>
          }
        >
          <Metric
            label="Available store credit"
            value={money(selected.creditCents)}
            detail="Credit is validated again when redeemed"
          />
          {selected.notes && (
            <p className="rounded-xl bg-muted/40 p-4 text-sm">
              {selected.notes}
            </p>
          )}
          <h3 className="font-semibold">Purchase history</h3>
          {data.pos.sales
            .filter((s) => s.customerId === selected.id)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => setReceipt(s)}
                className="flex w-full justify-between gap-3 rounded-xl border p-4 text-left text-sm"
              >
                <span>
                  <strong>{s.reference}</strong>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {dateTime(s.createdAt)}
                  </span>
                </span>
                <span>{money(s.totalCents)}</span>
              </button>
            ))}
          {!data.pos.sales.some((s) => s.customerId === selected.id) && (
            <p className="text-sm text-muted-foreground">
              No purchases visible to your account yet.
            </p>
          )}
          <h3 className="font-semibold">Store credit ledger</h3>
          {data.pos.credits
            .filter((c) => c.customerId === selected.id)
            .map((c) => (
              <div
                key={c.id}
                className="flex justify-between gap-4 border-b pb-3 text-xs"
              >
                <div>
                  <strong>{c.reference}</strong>
                  <p className="mt-1 text-muted-foreground">
                    {dateTime(c.createdAt)} · {c.actor}
                  </p>
                </div>
                <div className="text-right">
                  <strong>
                    {c.amountCents > 0 ? "+" : ""}
                    {money(c.amountCents)}
                  </strong>
                  <p className="mt-1 text-muted-foreground">
                    Balance {money(c.balanceCents)}
                  </p>
                </div>
              </div>
            ))}
          {!data.pos.credits.some((c) => c.customerId === selected.id) && (
            <p className="text-sm text-muted-foreground">
              No credit movements yet.
            </p>
          )}
        </PosModal>
      )}
      <ReceiptDialog sale={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

export function ShiftsPage() {
  const { data } = usePos();
  const user = useSessionUser();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [cash, setCash] = useState(false);
  const [close, setClose] = useState(false);
  const [view, setView] = useState<Shift | null>(null);
  const shift = data.pos.shifts.find(
    (s) => s.actorId === user.id && !s.closedAt,
  );
  const totals = shift ? shiftTotals(data.pos, shift) : null;
  return (
    <div className="space-y-6">
      <PosHeader
        title="Cashier shifts"
        description="A clear beginning and a balanced close. Keep each register accountable."
        actions={
          <>
            {canManagePos(user) && (
              <Button variant="outline" onClick={() => setSettings(true)}>
                <Settings2 />
                Configuration
              </Button>
            )}
            {!shift && (
              <Button onClick={() => setOpen(true)}>
                <Plus />
                Open shift
              </Button>
            )}
          </>
        }
      />
      {shift && totals ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-primary p-6 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--brand-champagne)]">
                Your active shift
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {shift.register} ·{" "}
                {
                  data.catalog.locations.find((l) => l.id === shift.locationId)
                    ?.name
                }
              </h2>
              <p className="mt-2 text-xs text-white/60">
                Opened {dateTime(shift.openedAt)} · {shift.actor}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => setCash(true)}
              >
                Cash in / out
              </Button>
              <Button
                className="bg-[var(--brand-champagne)] text-primary hover:bg-[var(--brand-champagne)]/90"
                onClick={() => setClose(true)}
              >
                Close & reconcile
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Opening float"
              value={money(shift.openingCents)}
              detail="Starting drawer balance"
            />
            <Metric
              label="Net cash sales"
              value={money(totals.cashSales - totals.cashRefunds)}
              detail="Cash sales less cash refunds"
            />
            <Metric
              label="Cash movements"
              value={money(totals.movements)}
              detail="Paid in less paid out"
            />
            <Metric
              label="Expected in drawer"
              value={money(totals.expected)}
              detail="Compare against your physical count"
            />
          </div>
        </>
      ) : (
        <Empty
          title="Your register is closed"
          description="Open a shift to record sales, refunds and cash movements."
          action={
            <Button onClick={() => setOpen(true)}>
              Open register
              <ArrowRight />
            </Button>
          }
        />
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Shift history</h2>
        <Link
          className="text-xs underline underline-offset-4"
          href="/retail-pos/reconciliation"
        >
          Daily reconciliation
        </Link>
      </div>
      {data.pos.shifts.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                {[
                  "Register",
                  "Cashier",
                  "Opened",
                  "Status",
                  "Expected cash",
                  "Variance",
                  "",
                ].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.pos.shifts.map((s) => (
                <tr key={s.id}>
                  <td>
                    <p className="font-semibold">{s.register}</p>
                    <p className="mt-1 text-muted-foreground">
                      {
                        data.catalog.locations.find(
                          (l) => l.id === s.locationId,
                        )?.name
                      }
                    </p>
                  </td>
                  <td>{s.actor}</td>
                  <td>{dateTime(s.openedAt)}</td>
                  <td>
                    <Status warning={!s.closedAt}>
                      {s.closedAt ? "Closed" : "Open"}
                    </Status>
                  </td>
                  <td>
                    {money(
                      s.expectedCents ?? shiftTotals(data.pos, s).expected,
                    )}
                  </td>
                  <td
                    className={
                      s.varianceCents
                        ? "font-semibold text-amber-800"
                        : "text-muted-foreground"
                    }
                  >
                    {s.closedAt ? money(s.varianceCents ?? 0) : "—"}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView(s)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No shifts recorded yet.</p>
      )}
      <OpenShiftDialog open={open} onOpenChange={setOpen} />
      <SettingsDialog
        key={String(settings)}
        open={settings}
        onOpenChange={setSettings}
      />
      {shift && cash && (
        <CashDialog shift={shift} onClose={() => setCash(false)} />
      )}{" "}
      {shift && close && (
        <CloseShiftDialog shift={shift} onClose={() => setClose(false)} />
      )}{" "}
      {view && <ShiftDetails shift={view} onClose={() => setView(null)} />}
    </div>
  );
}
function CashDialog({ shift, onClose }: { shift: Shift; onClose: () => void }) {
  const { mutate, busy } = usePos();
  const [direction, setDirection] = useState("in");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  return (
    <PosModal
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
      title="Record a cash movement"
      description="For float top-ups, safe drops, or paid-out expenses. Sales are recorded at checkout."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={
              busy ||
              !Number.isFinite(Number(amount)) ||
              Number(amount) <= 0 ||
              reason.trim().length < 3
            }
            onClick={async () => {
              if (
                await mutate({
                  action: "shift.cash",
                  shiftId: shift.id,
                  amountCents:
                    cents(Number(amount)) * (direction === "in" ? 1 : -1),
                  reason,
                })
              )
                onClose();
            }}
          >
            Record movement
          </Button>
        </>
      }
    >
      <FormField label="Direction">
        <select
          className="field-select"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="in">Cash in · add to drawer</option>
          <option value="out">Cash out · remove from drawer</option>
        </select>
      </FormField>
      <FormField label="Amount (USD)">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </FormField>
      <FormField label="Reason">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Float top-up or safe deposit"
          maxLength={250}
        />
      </FormField>
    </PosModal>
  );
}
function CloseShiftDialog({
  shift,
  onClose,
}: {
  shift: Shift;
  onClose: () => void;
}) {
  const { data, mutate, busy, queue } = usePos();
  const [count, setCount] = useState("");
  const [note, setNote] = useState("");
  const totals = shiftTotals(data.pos, shift);
  const variance = cents(Number(count) || 0) - totals.expected;
  const pending = queue.some((q) => q.command.shiftId === shift.id);
  return (
    <PosModal
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
      title="Close & reconcile"
      description="Count physical cash, explain differences, then lock this shift's reconciliation."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Keep shift open
          </Button>
          <Button
            disabled={
              busy ||
              pending ||
              count === "" ||
              !Number.isFinite(Number(count)) ||
              Number(count) < 0 ||
              (variance !== 0 && note.trim().length < 3)
            }
            onClick={async () => {
              if (
                await mutate({
                  action: "shift.close",
                  shiftId: shift.id,
                  countedCents: cents(Number(count)),
                  note,
                })
              )
                onClose();
            }}
          >
            Close shift
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Retail net sales"
          value={money(totals.retail.net)}
          detail={`${totals.retail.transactions} transactions · ${money(totals.retail.refunds)} returned`}
        />
        <Metric
          label="Wholesale net sales"
          value={money(totals.wholesale.net)}
          detail={`${totals.wholesale.transactions} transactions · ${money(totals.wholesale.refunds)} returned`}
        />
      </div>
      <Metric
        label="Expected cash"
        value={money(totals.expected)}
        detail="Opening cash + net cash sales + cash movements"
      />
      {pending && (
        <p className="rounded-xl bg-amber-50 p-4 text-xs text-amber-900">
          This device has pending sales for this shift. Resolve the Sync Queue
          before closing. Check other cashier devices too.
        </p>
      )}
      <FormField label="Physical cash counted (USD)">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </FormField>
      <div className="flex justify-between rounded-xl border p-4 text-sm">
        <span>Variance</span>
        <strong
          className={variance && count ? "text-amber-800" : "text-emerald-700"}
        >
          {count ? money(variance) : "Enter your count"}
        </strong>
      </div>
      <FormField label="Closing note / variance explanation">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={3}
        />
      </FormField>
      <p className="text-xs leading-5 text-muted-foreground">
        Closed shifts cannot accept new sales or cash movements. A new shift is
        required for later returns.
      </p>
    </PosModal>
  );
}
function ShiftDetails({
  shift,
  onClose,
}: {
  shift: Shift;
  onClose: () => void;
}) {
  const { data } = usePos();
  const s = data.pos.shifts.find((s) => s.id === shift.id) ?? shift;
  const totals = shiftTotals(data.pos, s);
  return (
    <PosModal
      open
      wide
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title={`${s.register} · ${s.actor}`}
      description={`${dateTime(s.openedAt)} → ${s.closedAt ? dateTime(s.closedAt) : "Still open"}`}
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Retail net sales"
          value={money(totals.retail.net)}
          detail={`${totals.retail.transactions} transactions · ${money(totals.retail.refunds)} returned`}
        />
        <Metric
          label="Wholesale net sales"
          value={money(totals.wholesale.net)}
          detail={`${totals.wholesale.transactions} transactions · ${money(totals.wholesale.refunds)} returned`}
        />
        <Metric
          label="Sales collected"
          value={money(totals.gross)}
          detail={`${totals.sales} transactions`}
        />
        <Metric
          label="Cash expected"
          value={money(s.expectedCents ?? totals.expected)}
          detail={
            s.closedAt
              ? `Counted ${money(s.countedCents ?? 0)} · Variance ${money(s.varianceCents ?? 0)}`
              : "Live drawer calculation"
          }
        />
        <Metric
          label="Card payments"
          value={money(totals.external)}
          detail="Recorded card approvals"
        />
        <Metric
          label="Store credit used"
          value={money(totals.credit)}
          detail="Redeemed at checkout"
        />
      </div>
      {s.closingNote && (
        <p className="rounded-xl bg-muted/40 p-4 text-sm">
          Closing note: {s.closingNote}
        </p>
      )}
      <h3 className="font-semibold">Cash movement journal</h3>
      {s.cashEntries.length ? (
        s.cashEntries.map((e) => (
          <div
            key={e.id}
            className="flex justify-between gap-4 border-b pb-3 text-sm"
          >
            <div>
              <p>{e.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dateTime(e.createdAt)} · {e.actor}
              </p>
            </div>
            <strong
              className={
                e.amountCents > 0 ? "text-emerald-700" : "text-amber-800"
              }
            >
              {money(e.amountCents)}
            </strong>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          No manual cash movements.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Cash refunds: {money(totals.cashRefunds)} · All returns recorded in this
        shift: {money(totals.refunds)}
      </p>
    </PosModal>
  );
}

export function ReconciliationPage() {
  const { data } = usePos();
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [view, setView] = useState<Shift | null>(null);
  const closed = data.pos.shifts.filter(
    (s) =>
      s.closedAt &&
      (!date || s.closedAt.startsWith(date)) &&
      (!location || s.locationId === location),
  );
  const reportTotals = closed.map((shift) => shiftTotals(data.pos, shift));
  const rows = closed.map((s) => ({
    Register: s.register,
    Cashier: s.actor,
    Store:
      data.catalog.locations.find((l) => l.id === s.locationId)?.name ?? "",
    Opened: s.openedAt,
    Closed: s.closedAt!,
    Opening: s.openingCents / 100,
    Expected: (s.expectedCents ?? 0) / 100,
    Counted: (s.countedCents ?? 0) / 100,
    Variance: (s.varianceCents ?? 0) / 100,
    RetailTransactions: shiftTotals(data.pos, s).retail.transactions,
    RetailGross: shiftTotals(data.pos, s).retail.gross / 100,
    RetailReturns: shiftTotals(data.pos, s).retail.refunds / 100,
    RetailNet: shiftTotals(data.pos, s).retail.net / 100,
    WholesaleTransactions: shiftTotals(data.pos, s).wholesale.transactions,
    WholesaleGross: shiftTotals(data.pos, s).wholesale.gross / 100,
    WholesaleReturns: shiftTotals(data.pos, s).wholesale.refunds / 100,
    WholesaleNet: shiftTotals(data.pos, s).wholesale.net / 100,
    Note: s.closingNote ?? "",
  }));
  return (
    <div className="space-y-6">
      <PosHeader
        title="Daily reconciliation"
        description="Physical cash against the system record. Closed-shift totals you can trace and export."
        actions={
          <Button
            variant="outline"
            disabled={!rows.length}
            onClick={() => downloadCsv("flair-cash-reconciliation.csv", rows)}
          >
            <Download />
            Export report
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Closed shifts"
          value={String(closed.length)}
          detail="Matching the selected filters"
        />
        <Metric
          label="Expected cash"
          value={money(closed.reduce((n, s) => n + (s.expectedCents ?? 0), 0))}
          detail="Frozen at shift close"
        />
        <Metric
          label="Counted cash"
          value={money(closed.reduce((n, s) => n + (s.countedCents ?? 0), 0))}
          detail="Submitted physical counts"
        />
        <Metric
          label="Net variance"
          value={money(closed.reduce((n, s) => n + (s.varianceCents ?? 0), 0))}
          detail={`${closed.filter((s) => s.varianceCents).length} shifts with a discrepancy`}
        />
        <Metric
          label="Retail net sales"
          value={money(
            reportTotals.reduce((total, item) => total + item.retail.net, 0),
          )}
          detail={`${reportTotals.reduce((total, item) => total + item.retail.transactions, 0)} transactions after returns`}
        />
        <Metric
          label="Wholesale net sales"
          value={money(
            reportTotals.reduce((total, item) => total + item.wholesale.net, 0),
          )}
          detail={`${reportTotals.reduce((total, item) => total + item.wholesale.transactions, 0)} transactions after returns`}
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <FormField label="Closing date (UTC)">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
        <FormField label="Retail location">
          <select
            className="field-select max-w-64"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All retail locations</option>
            {data.catalog.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </FormField>
        <Button
          variant="ghost"
          onClick={() => {
            setDate("");
            setLocation("");
          }}
        >
          All dates & stores
        </Button>
      </div>
      {closed.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                {[
                  "Register / cashier",
                  "Closed",
                  "Expected",
                  "Counted",
                  "Retail net",
                  "Wholesale net",
                  "Variance",
                  "Explanation",
                  "",
                ].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closed.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.register}</strong>
                    <p className="mt-1 text-muted-foreground">{s.actor}</p>
                  </td>
                  <td>{dateTime(s.closedAt!)}</td>
                  <td>{money(s.expectedCents ?? 0)}</td>
                  <td>{money(s.countedCents ?? 0)}</td>
                  <td>{money(shiftTotals(data.pos, s).retail.net)}</td>
                  <td>{money(shiftTotals(data.pos, s).wholesale.net)}</td>
                  <td>
                    <Status warning={!!s.varianceCents}>
                      {money(s.varianceCents ?? 0)}
                    </Status>
                  </td>
                  <td className="max-w-64">
                    <p className="line-clamp-2">
                      {s.closingNote || "Balanced"}
                    </p>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setView(s)}
                    >
                      Audit trail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="Ready for a balanced close"
          description="Close a cashier shift to create an immutable reconciliation record."
          action={
            <Button variant="outline" asChild>
              <Link href="/retail-pos/shifts">Manage shifts</Link>
            </Button>
          }
        />
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        Reports include only shifts visible to your login account. Open shifts
        are not reconciled yet. Card payment settlement must be reconciled with
        your payment provider separately.
      </p>
      {view && <ShiftDetails shift={view} onClose={() => setView(null)} />}
    </div>
  );
}

export function SyncPage() {
  const { queue, online, busy, sync, data, removeQueued, refresh } = usePos();
  const [remove, setRemove] = useState("");
  return (
    <div className="space-y-6">
      <PosHeader
        title="Offline sync queue"
        description="A transparent handoff from this device to the server. Nothing is final until confirmed."
        actions={
          <Button disabled={!online || busy || !queue.length} onClick={sync}>
            <RefreshCw className={busy ? "animate-spin" : ""} />
            Sync pending sales
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Device connection"
          value={online ? "Online" : "Offline"}
          detail="Sync runs automatically on reconnect"
        />
        <Metric
          label="Pending checkouts"
          value={String(queue.length)}
          detail="Saved on this device for your account"
        />
        <Metric
          label="Pending value"
          value={money(
            queue.reduce((n, q) => n + q.command.expectedTotalCents, 0),
          )}
          detail="Not included in posted sales totals"
        />
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <WifiOff className="mt-1 size-4 shrink-0" />
        <p>
          Queued records are not final receipts. Do not collect payment or
          release goods until the server confirms the sale. Stock, prices, tax,
          and the original shift are validated on sync. Keep the shift open and
          do not clear this device’s browser storage.
        </p>
      </div>
      {queue.length ? (
        <div className="space-y-3">
          {queue.map((q) => (
            <div
              key={q.command.requestId}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-amber-700" />
                  <h2 className="text-sm font-semibold">
                    Pending checkout · {q.command.requestId.slice(0, 8)}
                  </h2>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {dateTime(q.createdAt)} ·{" "}
                  {q.command.lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
                  {money(q.command.expectedTotalCents)}
                </p>
                <p className="mt-3 max-w-xl break-words text-xs text-amber-800">
                  {q.error || "Waiting to sync"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || !online}
                  onClick={sync}
                >
                  Retry safely
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy || !online}
                  onClick={async () => {
                    await refresh();
                    setRemove(q.command.requestId);
                  }}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="Everything is up to date"
          description="No pending checkouts on this device. Confirmed sales and receipts are available in Sales History."
          action={
            <Button variant="outline" asChild>
              <Link href="/retail-pos/sales">
                <History />
                Sales history
              </Link>
            </Button>
          }
        />
      )}
      <PosModal
        open={!!remove}
        onOpenChange={(o) => {
          if (!o) setRemove("");
        }}
        title="Resolve this device's queue entry"
        description="Removing a pending entry does not void or refund a sale that already reached the server."
        footer={
          <>
            <Button variant="outline" onClick={() => setRemove("")}>
              Keep pending
            </Button>
            <Button
              disabled={!online || busy}
              onClick={() => {
                removeQueued(remove);
                setRemove("");
              }}
            >
              Remove local entry
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6">
          {data.pos.sales.some((s) => s.requestId === remove)
            ? `This checkout is already posted as ${data.pos.sales.find((s) => s.requestId === remove)?.reference}. You can safely remove its local queue entry.`
            : "No matching sale appears in the latest loaded history. Retry sync first if payment status is uncertain. Only remove this entry if you have confirmed that no payment or goods were handed over."}
        </p>
      </PosModal>
    </div>
  );
}
