"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  ClipboardCheck,
  Download,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Truck,
  CheckCheck,
  Pencil,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInventory } from "./inventory-provider";
import {
  DetailRow,
  InventoryBadge,
  InventoryEmpty,
  InventoryHeader,
  money,
  shortDate,
} from "./shared";
import { OperationDialog } from "./operation-dialog";
import {
  operationLabels,
  type OperationType,
  type StockOperation,
} from "@/types/inventory";
import { downloadCsv } from "@/lib/csv";
export function OperationsPage() {
  const { data, canWrite, costsVisible, mutate, busy } = useInventory();
  const params = useSearchParams();
  const router = useRouter();
  const [create, setCreate] = useState<OperationType | null>(null);
  const [editing, setEditing] = useState<StockOperation | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [confirm, setConfirm] = useState<{
    id: string;
    action: "operation.post" | "operation.cancel";
  } | null>(null);
  const queryType = params.get("new");
  const createType =
    create ??
    (canWrite &&
    queryType &&
    ["receipt", "transfer", "adjustment", "count"].includes(queryType)
      ? (queryType as OperationType)
      : null);
  const operations = data.operations.filter(
    (o) =>
      (!filter || o.type === filter || o.status === filter) &&
      (!query ||
        [o.reference, o.supplier, o.memo, o.billReference].some((v) =>
          v.toLowerCase().includes(query.toLowerCase()),
        )),
  );
  const movements = data.movements.filter(
    (m) =>
      !query ||
      [
        m.reference,
        data.products.find((p) => p.id === m.productId)?.name ?? "",
      ].some((v) => v.toLowerCase().includes(query.toLowerCase())),
  );
  const selected = data.operations.find((o) => o.id === detail);
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Stock Operations"
        description="Receive, transfer and reconcile inventory through traceable documents and a permanent movement ledger."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            {
              type: "receipt",
              label: "Receive stock",
              desc: "Supplier deliveries & costs",
              icon: Truck,
            },
            {
              type: "transfer",
              label: "Transfer stock",
              desc: "Move stock between locations",
              icon: ArrowRightLeft,
            },
            {
              type: "adjustment",
              label: "Adjust stock",
              desc: "Signed corrections with reasons",
              icon: SlidersHorizontal,
            },
            {
              type: "count",
              label: "Cycle count",
              desc: "Reconcile physical quantities",
              icon: ClipboardCheck,
            },
          ] as const
        ).map((a) => (
          <button
            key={a.type}
            disabled={!canWrite}
            onClick={() => setCreate(a.type)}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/25 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/6">
              <a.icon className="size-5 text-primary" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{a.label}</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">
                {a.desc}
              </span>
            </span>
            <Plus className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <Tabs defaultValue="documents">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="documents">
              Documents{" "}
              <span className="ml-1 text-[10px] opacity-50">
                {data.operations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="ledger">Movement ledger</TabsTrigger>
          </TabsList>
          <p className="text-xs text-muted-foreground">
            {data.operations.filter((o) => o.status === "draft").length} drafts
            awaiting posting
          </p>
        </div>
        <Card className="overflow-hidden py-0">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search reference, product or supplier…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="field-select sm:w-48"
              aria-label="Filter stock operations"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All documents</option>
              {Object.entries(operationLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "flair-movements.csv",
                  movements.map((m) => ({
                    date: m.date,
                    reference: m.reference,
                    sku:
                      data.products.find((p) => p.id === m.productId)?.sku ??
                      "",
                    product:
                      data.products.find((p) => p.id === m.productId)?.name ??
                      "",
                    location:
                      data.locations.find((l) => l.id === m.locationId)?.name ??
                      "",
                    type: m.type,
                    quantity: m.quantity,
                    before: m.before,
                    after: m.after,
                    actor: m.actor,
                    note: m.note,
                  })),
                )
              }
            >
              <Download />
              Export ledger
            </Button>
          </div>
          <TabsContent value="documents" className="m-0">
            {operations.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-muted/35 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {[
                        "Reference",
                        "Operation",
                        "Location",
                        "Date",
                        "Lines",
                        "Status",
                        "Created by",
                        "",
                      ].map((h, i) => (
                        <th key={i} className="px-4 py-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {operations.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/25">
                        <td className="px-4 py-4">
                          <button
                            className="font-mono font-semibold text-primary hover:underline"
                            onClick={() => setDetail(o.id)}
                          >
                            {o.reference}
                          </button>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {o.supplier || o.reason || "Internal movement"}
                          </p>
                        </td>
                        <td className="px-4">{operationLabels[o.type]}</td>
                        <td className="px-4">
                          <p className="max-w-40 truncate">
                            {
                              data.locations.find((l) => l.id === o.locationId)
                                ?.name
                            }
                          </p>
                          {o.type === "transfer" && (
                            <p className="mt-1 max-w-40 truncate text-[10px] text-muted-foreground">
                              →{" "}
                              {
                                data.locations.find(
                                  (l) => l.id === o.destinationId,
                                )?.name
                              }
                            </p>
                          )}
                        </td>
                        <td className="px-4">{shortDate(o.date)}</td>
                        <td className="px-4">{o.lines.length}</td>
                        <td className="px-4">
                          <InventoryBadge status={o.status} />
                        </td>
                        <td className="px-4">{o.actor}</td>
                        <td className="pr-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetail(o.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <InventoryEmpty
                title="No stock documents yet"
                description="Start with a receipt, transfer, adjustment or cycle count. Drafts do not change quantities until posted."
                action={
                  canWrite && (
                    <Button onClick={() => setCreate("receipt")}>
                      <Truck />
                      Receive stock
                    </Button>
                  )
                }
              />
            )}
          </TabsContent>
          <TabsContent value="ledger" className="m-0">
            {movements.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-muted/35 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {[
                        "Date / reference",
                        "Product",
                        "Location",
                        "Movement",
                        "Change",
                        "Before",
                        "After",
                        "Actor",
                      ].map((h) => (
                        <th key={h} className="px-4 py-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movements.slice(0, 100).map((m) => (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="px-4 py-4">
                          <p>{shortDate(m.date)}</p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {m.reference}
                          </p>
                        </td>
                        <td className="px-4">
                          <p className="max-w-52 truncate font-medium">
                            {
                              data.products.find((p) => p.id === m.productId)
                                ?.name
                            }
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {
                              data.products.find((p) => p.id === m.productId)
                                ?.sku
                            }
                          </p>
                        </td>
                        <td className="max-w-40 truncate px-4">
                          {
                            data.locations.find((l) => l.id === m.locationId)
                              ?.name
                          }
                        </td>
                        <td className="px-4 capitalize">
                          {m.type.replace("-", " ")}
                        </td>
                        <td
                          className={
                            "px-4 font-semibold " +
                            (m.quantity >= 0
                              ? "text-emerald-700"
                              : "text-amber-700")
                          }
                        >
                          {m.quantity > 0 ? "+" : ""}
                          {m.quantity}
                        </td>
                        <td className="px-4">{m.before}</td>
                        <td className="px-4">{m.after}</td>
                        <td className="px-4">{m.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <InventoryEmpty />
            )}
          </TabsContent>
        </Card>
      </Tabs>
      {(createType || editing) && (
        <OperationDialog
          type={editing?.type ?? createType!}
          operation={editing ?? undefined}
          onClose={() => {
            setCreate(null);
            if (params.has("new"))
              router.replace("/product-inventory/operations");
            setEditing(null);
          }}
        />
      )}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setDetail(null)}
      >
        <SheetContent className="flex !w-[min(760px,100vw)] !max-w-none flex-col gap-0 overflow-hidden p-0">
          {selected && (
            <>
              <SheetHeader className="shrink-0 border-b p-5 pr-12 sm:p-6">
                <div className="flex items-center gap-2">
                  <InventoryBadge status={selected.status} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {selected.reference}
                  </span>
                </div>
                <SheetTitle className="mt-2 text-2xl">
                  {operationLabels[selected.type]}
                </SheetTitle>
                <SheetDescription>
                  {shortDate(selected.date)} · Created by {selected.actor}
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                <Card>
                  <CardContent className="px-4 py-1">
                    <DetailRow
                      label="Location"
                      value={
                        data.locations.find((l) => l.id === selected.locationId)
                          ?.name
                      }
                    />
                    {selected.type === "transfer" && (
                      <DetailRow
                        label="Destination"
                        value={
                          data.locations.find(
                            (l) => l.id === selected.destinationId,
                          )?.name
                        }
                      />
                    )}
                    {selected.supplier && (
                      <DetailRow label="Supplier" value={selected.supplier} />
                    )}
                    {selected.billReference && (
                      <DetailRow
                        label="Bill reference"
                        value={selected.billReference}
                      />
                    )}
                    <DetailRow
                      label="Terms / due date"
                      value={[selected.billTerms, selected.dueDate]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                    {selected.reason && (
                      <DetailRow label="Reason" value={selected.reason} />
                    )}
                  </CardContent>
                </Card>
                <div className="overflow-hidden rounded-xl border">
                  <div className="border-b bg-muted/30 p-4 text-sm font-semibold">
                    Line items
                  </div>
                  {selected.lines.map((l) => (
                    <div
                      key={l.productId}
                      className="flex items-center gap-3 border-b p-4 last:border-0"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">
                          {
                            data.products.find((p) => p.id === l.productId)
                              ?.name
                          }
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {data.products.find((p) => p.id === l.productId)?.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {l.quantity} units
                        </p>
                        {costsVisible && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {money(l.unitCost)} per unit
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {costsVisible && (
                  <Card>
                    <CardContent className="px-4 py-1">
                      <DetailRow
                        label="Item value"
                        value={money(
                          selected.lines.reduce(
                            (s, l) => s + Math.abs(l.quantity) * l.unitCost,
                            0,
                          ),
                        )}
                      />
                      <DetailRow
                        label="Freight"
                        value={money(selected.freight)}
                      />
                      <DetailRow
                        label="Discount"
                        value={money(selected.discount)}
                      />
                      <DetailRow
                        label="Document total"
                        value={money(
                          selected.lines.reduce(
                            (s, l) => s + Math.abs(l.quantity) * l.unitCost,
                            0,
                          ) +
                            selected.freight -
                            selected.discount,
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
                {selected.memo && (
                  <div className="rounded-xl bg-muted/40 p-4 text-xs leading-6">
                    <p className="font-semibold">Memo</p>
                    <p className="mt-1 text-muted-foreground">
                      {selected.memo}
                    </p>
                  </div>
                )}
                {selected.status === "posted" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                    <CheckCheck className="mr-2 inline size-4" />
                    Posted {selected.postedAt && shortDate(selected.postedAt)}.
                    Quantities are recorded in the movement ledger.
                  </div>
                )}
              </div>
              {canWrite && selected.status === "draft" && (
                <div className="flex flex-wrap justify-end gap-2 border-t p-4">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setConfirm({
                        id: selected.id,
                        action: "operation.cancel",
                      })
                    }
                  >
                    <XCircle />
                    Cancel draft
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(selected);
                      setDetail(null);
                    }}
                  >
                    <Pencil />
                    Edit draft
                  </Button>
                  <Button
                    onClick={() =>
                      setConfirm({ id: selected.id, action: "operation.post" })
                    }
                  >
                    <CheckCheck />
                    Post operation
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.action === "operation.post"
                ? "Post this stock operation?"
                : "Cancel this draft?"}
            </DialogTitle>
            <DialogDescription>
              {confirm?.action === "operation.post"
                ? "Stock quantities will update immediately. Posted operations cannot be edited or deleted."
                : "The draft will be retained as cancelled. No inventory quantities will change."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Keep reviewing
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (confirm && (await mutate(confirm))) setConfirm(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
