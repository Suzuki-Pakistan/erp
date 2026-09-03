"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  CheckCheck,
  Loader2,
  ArrowRightLeft,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInventory } from "./inventory-provider";
import { FormField, money } from "./shared";
import {
  operationLabels,
  productStock,
  type OperationType,
  type StockOperation,
} from "@/types/inventory";
import type { InventoryCommand } from "@/lib/inventory-schema";
type OperationInput = Extract<
  InventoryCommand,
  { action: "operation.save" }
>["operation"];
export function OperationDialog({
  type,
  operation,
  onClose,
}: {
  type: OperationType;
  operation?: StockOperation;
  onClose: () => void;
}) {
  const { data, mutate, busy } = useInventory();
  const [scan, setScan] = useState("");
  const [scanFeedback, setScanFeedback] = useState(
    "Keyboard-wedge scanners: scan once per unit; repeated scans increase quantity.",
  );
  const products = data.products.filter(
    (p) => p.trackInventory && p.status === "active",
  );
  const [form, setForm] = useState<OperationInput>(
    operation
      ? { ...operation, postNow: false }
      : {
          type,
          date: new Date().toISOString().slice(0, 10),
          locationId: data.locations[0]?.id ?? "",
          destinationId: data.locations[1]?.id ?? "",
          supplier: "",
          billReference: "",
          billTerms: "Net 30",
          dueDate: "",
          freight: 0,
          discount: 0,
          reason: "",
          memo: "",
          lines: [
            {
              productId: "",
              quantity: type === "count" ? 0 : 1,
              unitCost: 0,
            },
          ],
          postNow: false,
        },
  );
  function update<K extends keyof OperationInput>(
    key: K,
    value: OperationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function line(
    index: number,
    changes: Partial<OperationInput["lines"][number]>,
  ) {
    update(
      "lines",
      form.lines.map((l, i) => (i === index ? { ...l, ...changes } : l)),
    );
  }
  function addScan() {
    const value = scan.trim().toLowerCase();
    if (!value) return;
    const product = products.find((p) =>
      [p.sku, p.barcode, p.retailUpc].some(
        (v) => v && v.toLowerCase() === value,
      ),
    );
    if (!product) {
      toast.error(
        "No active, stock-tracked product matches this SKU or barcode.",
      );
      return;
    }
    const existing = form.lines.findIndex((l) => l.productId === product.id);
    const blank = form.lines.findIndex((l) => !l.productId);
    const item = {
      productId: product.id,
      quantity: 1,
      unitCost: product.lastCost,
    };
    if (existing >= 0)
      line(existing, { quantity: form.lines[existing].quantity + 1 });
    else if (blank >= 0) line(blank, item);
    else update("lines", [...form.lines, item]);
    setScan("");
    setScanFeedback(
      product.name +
        " added · " +
        (existing >= 0 ? form.lines[existing].quantity + 1 : 1) +
        " units on this line",
    );
  }
  async function save(postNow: boolean) {
    if (
      await mutate({
        action: "operation.save",
        operation: { ...form, postNow },
      })
    )
      onClose();
  }
  const subtotal = form.lines.reduce(
    (sum, l) => sum + Math.abs(l.quantity) * l.unitCost,
    0,
  );
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[950px]">
        <DialogHeader className="shrink-0 border-b px-5 py-5 sm:px-6">
          <DialogTitle>
            {operation ? "Edit " + operation.reference : operationLabels[type]}
          </DialogTitle>
          <DialogDescription>
            {type === "transfer"
              ? "Move available stock between locations with a paired audit trail."
              : type === "count"
                ? "Enter physical counts. The difference from current stock is calculated when posted."
                : type === "adjustment"
                  ? "Record a signed quantity change with a reason and audit trail."
                  : "Receive products from a supplier and update quantities and weighted average costs."}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              label={type === "transfer" ? "From location *" : "Location *"}
            >
              <select
                className="field-select"
                value={form.locationId}
                onChange={(e) => update("locationId", e.target.value)}
              >
                {data.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </FormField>
            {type === "transfer" && (
              <FormField label="To location *">
                <select
                  className="field-select"
                  value={form.destinationId}
                  onChange={(e) => update("destinationId", e.target.value)}
                >
                  {data.locations
                    .filter((l) => l.id !== form.locationId)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
              </FormField>
            )}
            <FormField label="Transaction date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </FormField>
            {type === "receipt" && (
              <>
                <FormField label="Supplier *">
                  <Input
                    value={form.supplier}
                    onChange={(e) => update("supplier", e.target.value)}
                    placeholder="Famous Fragrance"
                  />
                </FormField>
                <FormField label="Bill reference">
                  <Input
                    value={form.billReference}
                    onChange={(e) => update("billReference", e.target.value)}
                    placeholder="Supplier invoice / PO reference"
                  />
                </FormField>
                <FormField label="Bill terms">
                  <select
                    className="field-select"
                    value={form.billTerms}
                    onChange={(e) => update("billTerms", e.target.value)}
                  >
                    {[
                      "Due on receipt",
                      "Net 15",
                      "Net 30",
                      "Net 60",
                      "Prepaid",
                    ].map((term) => (
                      <option key={term}>{term}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Due date">
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => update("dueDate", e.target.value)}
                  />
                </FormField>
              </>
            )}
            {(type === "adjustment" || type === "count") && (
              <FormField label="Reason *">
                <select
                  className="field-select"
                  value={form.reason}
                  onChange={(e) => update("reason", e.target.value)}
                >
                  <option value="">Choose a reason</option>
                  {[
                    "Cycle count reconciliation",
                    "Damaged goods",
                    "Found stock",
                    "Opening balance",
                    "Shrinkage",
                    "Supplier correction",
                    "Other",
                  ].map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 px-4 py-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">Line items</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {type === "adjustment"
                    ? "Use negative quantities to remove stock."
                    : "One row per product. Quantities are in sale units."}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  update("lines", [
                    ...form.lines,
                    { productId: "", quantity: 1, unitCost: 0 },
                  ])
                }
              >
                <Plus />
                Add line
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b p-4">
              <div className="relative min-w-0 flex-1">
                <ScanLine className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  aria-label="Scan product barcode or SKU"
                  placeholder="Scan barcode or enter SKU, then press Enter"
                  value={scan}
                  onChange={(e) => setScan(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addScan();
                    }
                  }}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={addScan}
                disabled={!scan.trim()}
              >
                Add scan
              </Button>
              <p
                aria-live="polite"
                className="w-full text-[10px] leading-4 text-muted-foreground"
              >
                {scanFeedback}
              </p>
            </div>
            <div className="divide-y">
              {form.lines.map((item, index) => (
                <div
                  key={index}
                  className="grid items-start gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_110px_110px_32px]"
                >
                  <FormField label="Product / SKU">
                    <select
                      className="field-select"
                      value={item.productId}
                      onChange={(e) => {
                        const p = products.find((p) => p.id === e.target.value);
                        line(index, {
                          productId: e.target.value,
                          unitCost: p?.lastCost ?? 0,
                          ...(type === "count"
                            ? {
                                quantity: productStock(
                                  data,
                                  e.target.value,
                                  form.locationId,
                                ).onHand,
                              }
                            : {}),
                        });
                      }}
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} · {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Available:{" "}
                      {
                        productStock(data, item.productId, form.locationId)
                          .available
                      }{" "}
                      · On hand:{" "}
                      {
                        productStock(data, item.productId, form.locationId)
                          .onHand
                      }
                    </span>
                  </FormField>
                  <FormField
                    label={type === "count" ? "Physical count" : "Quantity"}
                  >
                    <Input
                      type="number"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        line(index, { quantity: Number(e.target.value) })
                      }
                    />
                  </FormField>
                  <FormField label="Unit cost">
                    <Input
                      type="number"
                      min="0"
                      step=".01"
                      value={item.unitCost}
                      onChange={(e) =>
                        line(index, { unitCost: Number(e.target.value) })
                      }
                    />
                  </FormField>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={"Remove line " + (index + 1)}
                    className="justify-self-end sm:mt-6"
                    disabled={form.lines.length === 1}
                    onClick={() =>
                      update(
                        "lines",
                        form.lines.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_260px]">
            <FormField label="Memo / operational notes">
              <Textarea
                rows={4}
                value={form.memo}
                onChange={(e) => update("memo", e.target.value)}
                placeholder="Add receiving notes or an explanation for the audit trail…"
              />
            </FormField>
            <div className="rounded-xl border bg-muted/25 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item value</span>
                <span>{money(subtotal)}</span>
              </div>
              {type === "receipt" && (
                <div className="my-3 grid grid-cols-2 gap-2">
                  <FormField label="Freight">
                    <Input
                      type="number"
                      min="0"
                      step=".01"
                      value={form.freight}
                      onChange={(e) =>
                        update("freight", Number(e.target.value))
                      }
                    />
                  </FormField>
                  <FormField label="Discount">
                    <Input
                      type="number"
                      min="0"
                      step=".01"
                      value={form.discount}
                      onChange={(e) =>
                        update("discount", Number(e.target.value))
                      }
                    />
                  </FormField>
                </div>
              )}
              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Document total</span>
                <span>{money(subtotal + form.freight - form.discount)}</span>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                Freight and discount are document-level references, not
                allocated into unit costs.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-primary/4 p-3 text-xs leading-5 text-muted-foreground">
            <ArrowRightLeft className="mt-0.5 size-4 shrink-0" />
            Posting updates stock immediately. Posted documents are immutable;
            use a new adjustment to correct an error.
          </div>
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 border-t bg-muted/30 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => save(false)}>
            <Save />
            Save draft
          </Button>
          <Button disabled={busy} onClick={() => save(true)}>
            {busy ? <Loader2 className="animate-spin" /> : <CheckCheck />}Post &
            update stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
