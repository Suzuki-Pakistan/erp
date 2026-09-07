"use client";
import { useState } from "react";
import {
  Barcode,
  Copy,
  Pencil,
  Save,
  Warehouse,
  Package,
  History,
  DollarSign,
  Loader2,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { productSchema } from "@/lib/inventory-schema";
import { emptyProduct } from "@/lib/inventory-defaults";
import { useInventory } from "./inventory-provider";
import {
  DetailRow,
  FormField,
  InventoryBadge,
  InventoryEmpty,
  money,
  number,
  ProductVisual,
  shortDate,
} from "./shared";
import {
  availableStock,
  grossMarginPercent,
  grossProfit,
  productStock,
  type Product,
  type ProductInput,
} from "@/types/inventory";

function MarginPreview({
  label,
  price,
  cost,
}: {
  label: string;
  price: number;
  cost: number;
}) {
  const margin = grossMarginPercent(price, cost);
  return (
    <div className="rounded-xl border border-primary/10 bg-primary/4 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${margin > 0 ? "text-primary" : "text-destructive"}`}
      >
        {margin.toFixed(1)}%
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {money(grossProfit(price, cost))} gross profit per unit
      </p>
    </div>
  );
}

export function ProductEditor({
  product,
  initialTab = "general",
  onClose,
}: {
  product?: Product;
  initialTab?: string;
  onClose: () => void;
}) {
  const { data, mutate, busy } = useInventory();
  const [form, setForm] = useState<ProductInput>(product ?? emptyProduct(data));
  const [error, setError] = useState("");
  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  const numeric = (key: keyof ProductInput, label: string, step = "0.01") => (
    <FormField key={key} label={label}>
      <Input
        type="number"
        min="0"
        step={step}
        value={String(form[key] ?? 0)}
        onChange={(e) => update(key, Number(e.target.value) as never)}
      />
    </FormField>
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = productSchema.safeParse(form);
    if (!result.success) {
      setError(
        result.error.issues
          .map((issue) => issue.path.join(".") + ": " + issue.message)
          .join(" · "),
      );
      return;
    }
    if (await mutate({ action: "product.save", product: result.data }))
      onClose();
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[820px]">
        <DialogHeader className="shrink-0 border-b px-5 py-5 sm:px-6">
          <DialogTitle>
            {product ? "Edit product" : "Add a product"}
          </DialogTitle>
          <DialogDescription>
            A complete product record, from identity and pricing to stock
            controls.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <Tabs
            defaultValue={initialTab}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 border-b px-5 py-3 sm:px-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="notes">Details</TabsTrigger>
              </TabsList>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <TabsContent value="general" className="mt-0 space-y-5">
                <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                  <ProductVisual product={form} className="size-20" />
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {form.name || "New product"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Product illustration · choose a shelf color
                    </p>
                    <input
                      aria-label="Product color"
                      type="color"
                      value={form.color}
                      onChange={(e) => update("color", e.target.value)}
                      className="mt-2 h-7 w-16 cursor-pointer rounded border"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Product name *" className="sm:col-span-2">
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Lattafa Yara Pink"
                    />
                  </FormField>
                  <FormField label="SKU / item code *">
                    <Input
                      required
                      value={form.sku}
                      onChange={(e) => update("sku", e.target.value)}
                      placeholder="10000"
                    />
                  </FormField>
                  <FormField label="UPC / barcode">
                    <Input
                      value={form.barcode}
                      onChange={(e) => update("barcode", e.target.value)}
                      placeholder="Scan or type barcode"
                    />
                  </FormField>
                  <FormField label="Category *">
                    <select
                      className="field-select"
                      value={form.categoryId}
                      onChange={(e) => update("categoryId", e.target.value)}
                    >
                      {data.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Brand *">
                    <select
                      className="field-select"
                      value={form.brandId}
                      onChange={(e) => update("brandId", e.target.value)}
                    >
                      {data.brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Gender">
                    <select
                      className="field-select"
                      value={form.gender}
                      onChange={(e) =>
                        update("gender", e.target.value as Product["gender"])
                      }
                    >
                      {["Women", "Men", "Unisex"].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select
                      className="field-select"
                      value={form.status}
                      onChange={(e) =>
                        update("status", e.target.value as Product["status"])
                      }
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </FormField>
                  <FormField label="Concentration / format">
                    <Input
                      value={form.concentration}
                      onChange={(e) => update("concentration", e.target.value)}
                    />
                  </FormField>
                  {numeric("sizeMl", "Size (ml)")}
                </div>
              </TabsContent>
              <TabsContent value="pricing" className="mt-0 space-y-5">
                <div>
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        Individual product margins
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Calculated from the current average unit cost.
                      </p>
                    </div>
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-[10px] text-muted-foreground">
                      Cost {money(form.averageCost)}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MarginPreview
                      label="Retail"
                      price={form.retailPrice}
                      cost={form.averageCost}
                    />
                    <MarginPreview
                      label="Wholesale"
                      price={form.wholesalePrice}
                      cost={form.averageCost}
                    />
                    <MarginPreview
                      label="E-commerce"
                      price={form.webPrice}
                      cost={form.averageCost}
                    />
                    <MarginPreview
                      label="VIP"
                      price={form.vipPrice}
                      cost={form.averageCost}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {numeric("retailPrice", "Retail price *")}
                  {numeric("wholesalePrice", "Wholesale price")}
                  {numeric("webPrice", "E-commerce price")}
                  {numeric("vipPrice", "VIP price")}
                  {numeric("suggestedPrice", "Suggested retail price")}
                  {numeric("lowestPrice", "Lowest selling price")}
                  {numeric("averageCost", "Average unit cost")}
                  {numeric("lastCost", "Last unit cost")}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Posted receipts update average cost using a weighted average.
                  Price changes do not rewrite historical movement costs.
                </p>
              </TabsContent>
              <TabsContent value="inventory" className="mt-0 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {numeric("reorderPoint", "Reorder point", "1")}
                  {numeric("minimumStock", "Minimum stock", "1")}
                  {numeric("maximumStock", "Maximum stock", "1")}
                  {numeric("daysOfStock", "Target days of stock", "1")}
                  <FormField label="Sale unit">
                    <Input
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                    />
                  </FormField>
                  {numeric("packSize", "Pack size", "1")}
                  <FormField label="Preferred supplier">
                    <Input
                      value={form.supplier}
                      onChange={(e) => update("supplier", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Supplier item code">
                    <Input
                      value={form.supplierCode}
                      onChange={(e) => update("supplierCode", e.target.value)}
                    />
                  </FormField>
                </div>
                <div className="grid gap-3 rounded-xl border p-4">
                  {(
                    ["trackInventory", "dropShip", "labelOnReceipt"] as const
                  ).map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => update(key, e.target.checked)}
                        className="size-4 accent-[var(--primary)]"
                      />
                      {
                        {
                          trackInventory: "Track inventory quantities",
                          dropShip: "Allow drop shipping",
                          labelOnReceipt: "Create labels when received",
                        }[key]
                      }
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Opening quantities are added through a receipt or adjustment,
                  so every stock change has an audit trail.
                </p>
              </TabsContent>
              <TabsContent value="notes" className="mt-0 space-y-4">
                <FormField label="Full description">
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Retail UPC alias">
                    <Input
                      value={form.retailUpc}
                      onChange={(e) => update("retailUpc", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Tax code">
                    <Input
                      value={form.taxCode}
                      onChange={(e) => update("taxCode", e.target.value)}
                    />
                  </FormField>
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.taxable}
                    onChange={(e) => update("taxable", e.target.checked)}
                  />
                  Taxable item
                </label>
                <FormField label="Internal notes">
                  <Textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </FormField>
              </TabsContent>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-destructive/5 p-3 text-xs text-destructive"
                >
                  {error}
                </p>
              )}
            </div>
          </Tabs>
          <DialogFooter className="mx-0 mb-0 shrink-0 border-t bg-muted/30 px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Save />}
              {product ? "Save product" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDetail({
  productId,
  onClose,
  onEdit,
  onLabels,
}: {
  productId: string;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onLabels: (product: Product) => void;
}) {
  const { data, canWrite, costsVisible, mutate } = useInventory();
  const product = data.products.find((p) => p.id === productId);
  if (!product) return null;
  const stock = productStock(data, product.id);
  const balances = data.balances.filter((b) => b.productId === product.id);
  const movements = data.movements.filter((m) => m.productId === product.id);
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex !w-[min(780px,100vw)] !max-w-none flex-col gap-0 overflow-hidden p-0">
        <SheetHeader className="shrink-0 border-b p-5 pr-12 sm:p-6">
          <div className="flex gap-4">
            <ProductVisual product={product} className="size-24" />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <InventoryBadge status={product.status} />
                <span className="rounded bg-muted px-2 py-1 font-mono text-[10px]">
                  {product.sku}
                </span>
              </div>
              <SheetTitle className="text-xl leading-7">
                {product.name}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {data.brands.find((b) => b.id === product.brandId)?.name} ·{" "}
                {product.sizeMl}ml · {product.concentration}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {canWrite && (
              <Button size="sm" onClick={() => onEdit(product)}>
                <Pencil />
                Edit product
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLabels(product)}
            >
              <Barcode />
              Print label
            </Button>
            {canWrite && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  mutate({ action: "product.duplicate", id: product.id })
                }
              >
                <Copy />
                Duplicate
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              ["Available", stock.available],
              ["On hand", stock.onHand],
              ["Committed", stock.committed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-muted/25 p-3">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {number(Number(value))}
                </p>
              </div>
            ))}
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">
                <Package />
                Overview
              </TabsTrigger>
              <TabsTrigger value="stock">
                <Warehouse />
                Stock
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <DollarSign />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="history">
                <History />
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-5">
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
              <Card>
                <CardContent className="px-4 py-1">
                  <DetailRow
                    label="Category"
                    value={
                      data.categories.find((c) => c.id === product.categoryId)
                        ?.name
                    }
                  />
                  <DetailRow
                    label="UPC / barcode"
                    value={<span className="font-mono">{product.barcode}</span>}
                  />
                  <DetailRow label="Supplier" value={product.supplier} />
                  <DetailRow
                    label="Supplier item"
                    value={product.supplierCode}
                  />
                  <DetailRow
                    label="Sale unit / pack"
                    value={product.unit + " / " + product.packSize}
                  />
                  <DetailRow
                    label="Reorder / min / max"
                    value={[
                      product.reorderPoint,
                      product.minimumStock,
                      product.maximumStock,
                    ].join(" / ")}
                  />
                  <DetailRow
                    label="Tax"
                    value={product.taxable ? product.taxCode : "Non-taxable"}
                  />
                  <DetailRow
                    label="Last updated"
                    value={shortDate(product.updatedAt)}
                  />
                </CardContent>
              </Card>
              {product.notes && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                  <strong>Internal note</strong>
                  <p>{product.notes}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="stock" className="mt-5 space-y-3">
              {balances.map((b) => (
                <div key={b.locationId} className="rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <Warehouse className="size-4 text-primary/60" />
                    <p className="text-sm font-semibold">
                      {data.locations.find((l) => l.id === b.locationId)?.name}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                    {[
                      ["On hand", b.onHand],
                      ["Available", availableStock(b)],
                      ["Committed", b.committed],
                      ["Held", b.held],
                      ["On order", b.onOrder],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[9px] text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!balances.length && (
                <InventoryEmpty
                  title="No stock yet"
                  description="Receive this product into a location to begin tracking quantities."
                />
              )}
            </TabsContent>
            <TabsContent value="pricing" className="mt-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Retail", product.retailPrice],
                  ["Wholesale", product.wholesalePrice],
                  ["E-commerce", product.webPrice],
                  ["VIP", product.vipPrice],
                  ["Suggested retail", product.suggestedPrice],
                  ...(costsVisible
                    ? [
                        ["Average cost", product.averageCost],
                        ["Last cost", product.lastCost],
                        ["Lowest selling price", product.lowestPrice],
                      ]
                    : []),
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 text-xl font-semibold">
                      {money(Number(value))}
                    </p>
                    {costsVisible &&
                      ["Retail", "Wholesale", "E-commerce", "VIP"].includes(
                        String(label),
                      ) && (
                        <p className="mt-1 text-[10px] text-emerald-700">
                          {grossMarginPercent(
                            Number(value),
                            product.averageCost,
                          ).toFixed(1)}
                          % margin ·{" "}
                          {money(
                            grossProfit(Number(value), product.averageCost),
                          )}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="history" className="mt-5">
              {movements.length ? (
                <div className="space-y-3">
                  {movements.slice(0, 30).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-xl border p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {m.type.replace("-", " ")}{" "}
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            {m.reference}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            data.locations.find((l) => l.id === m.locationId)
                              ?.name
                          }{" "}
                          · {shortDate(m.date)}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {m.actor} · {m.before} → {m.after}
                        </p>
                      </div>
                      <span
                        className={
                          m.quantity >= 0
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-amber-700"
                        }
                      >
                        {m.quantity > 0 ? "+" : ""}
                        {m.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <InventoryEmpty title="No movements yet" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
