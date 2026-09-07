"use client";
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import {
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInventory } from "./inventory-provider";
import { emptyProduct } from "@/lib/inventory-defaults";
import { downloadCsv, parseCsv } from "@/lib/csv";
import {
  productSchema,
  taxonomyItemSchema,
  type InventoryCommand,
} from "@/lib/inventory-schema";
import type { Product, ProductInput } from "@/types/inventory";
import { money } from "./shared";

type ImportMode = "products" | "categories" | "brands" | "inventory";
type ImportCommand = Extract<
  InventoryCommand,
  {
    action: "products.import" | "taxonomies.import" | "stock.import";
  }
>;

const importCopy: Record<
  ImportMode,
  { title: string; description: string; placeholder: string }
> = {
  products: {
    title: "Products",
    description:
      "Create or update products by SKU. Categories and brands must already exist.",
    placeholder:
      "sku,name,barcode,category,brand,retailPrice,wholesalePrice,webPrice,vipPrice,averageCost",
  },
  categories: {
    title: "Categories",
    description: "Create or update categories by matching their name or code.",
    placeholder: "code,name,description,color",
  },
  brands: {
    title: "Brands",
    description: "Create or update brands by matching their name or code.",
    placeholder: "code,name,description,color",
  },
  inventory: {
    title: "Inventory",
    description:
      "Set on-hand balances by SKU and location. Every changed balance creates an auditable stock-count movement.",
    placeholder: "sku,location,onHand,unitCost",
  },
};

export function CsvImportDialog({
  onClose,
  initialTab = "products",
}: {
  onClose: () => void;
  initialTab?: ImportMode;
}) {
  const { data, mutate, busy } = useInventory();
  const [mode, setMode] = useState<ImportMode>(initialTab);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportCommand | null>(null);
  const [previewRows, setPreviewRows] = useState<
    { key: string; label: string; detail: string; status: string }[]
  >([]);
  const [error, setError] = useState("");
  function reset(nextMode?: ImportMode) {
    if (nextMode) setMode(nextMode);
    setCsv("");
    setPreview(null);
    setPreviewRows([]);
    setError("");
  }
  function template() {
    const file = `flair-${mode}-import-template.csv`;
    if (mode === "products") {
      downloadCsv(file, [
        {
          sku: "NEW-001",
          name: "New Fragrance",
          barcode: "",
          category: data.categories[0]?.code,
          brand: data.brands[0]?.name,
          retailPrice: 39,
          wholesalePrice: 23,
          webPrice: 39,
          vipPrice: 22,
          averageCost: 16,
          lastCost: 16,
          reorderPoint: 12,
          sizeMl: 100,
          status: "active",
        },
      ]);
    } else if (mode === "inventory") {
      downloadCsv(file, [
        {
          sku: data.products[0]?.sku ?? "10000",
          location: data.locations[0]?.code ?? "101",
          onHand: 25,
          unitCost: data.products[0]?.averageCost ?? 0,
        },
      ]);
    } else {
      downloadCsv(file, [
        {
          code: mode === "brands" ? "BRAND-NEW" : "CAT-NEW",
          name: mode === "brands" ? "New Brand" : "New Category",
          description: "Imported catalog organization",
          color: "#b69154",
        },
      ]);
    }
  }
  function validate() {
    setError("");
    setPreview(null);
    setPreviewRows([]);
    try {
      const rows = parseCsv(csv);
      if (rows.length > 500)
        throw new Error("Import up to 500 rows at a time.");
      const seen = new Set<string>();
      if (mode === "products") {
        const products = rows.map((row, i) => {
          if (!row.sku || !row.name)
            throw new Error("Row " + (i + 2) + ": sku and name are required.");
          if (seen.has(row.sku.toLowerCase()))
            throw new Error("The CSV repeats SKU " + row.sku + ".");
          seen.add(row.sku.toLowerCase());
          const existing = data.products.find(
            (p) => p.sku.toLowerCase() === row.sku.toLowerCase(),
          );
          const category = data.categories.find(
            (c) =>
              c.code.toLowerCase() === row.category?.toLowerCase() ||
              c.name.toLowerCase() === row.category?.toLowerCase(),
          );
          const brand = data.brands.find(
            (b) =>
              b.code.toLowerCase() === row.brand?.toLowerCase() ||
              b.name.toLowerCase() === row.brand?.toLowerCase(),
          );
          if (!category || !brand)
            throw new Error(
              "Row " +
                (i + 2) +
                ": category and brand must match an existing name or code.",
            );
          const input: ProductInput = {
            ...(existing ?? emptyProduct(data)),
            sku: row.sku,
            name: row.name,
            barcode: row.barcode ?? existing?.barcode ?? "",
            categoryId: category.id,
            brandId: brand.id,
            description: row.description ?? existing?.description ?? row.name,
          };
          for (const key of [
            "retailPrice",
            "wholesalePrice",
            "vipPrice",
            "webPrice",
            "averageCost",
            "lastCost",
            "reorderPoint",
            "sizeMl",
          ] as const)
            if (row[key] !== undefined && row[key] !== "") {
              const value = Number(row[key]);
              if (!Number.isFinite(value))
                throw new Error(`Row ${i + 2}: ${key} must be a number.`);
              input[key] = value;
            }
          if (row.status) input.status = row.status as Product["status"];
          return productSchema.parse(input);
        });
        setPreview({ action: "products.import", products });
        setPreviewRows(
          products.map((product) => ({
            key: product.sku,
            label: product.name,
            detail: product.sku,
            status: data.products.some(
              (item) => item.sku.toLowerCase() === product.sku.toLowerCase(),
            )
              ? "Update"
              : "New",
          })),
        );
      } else if (mode === "categories" || mode === "brands") {
        const items = rows.map((row, i) => {
          if (!row.code || !row.name)
            throw new Error(`Row ${i + 2}: code and name are required.`);
          const codeKey = `code:${row.code.toLowerCase()}`;
          const nameKey = `name:${row.name.toLowerCase()}`;
          if (seen.has(codeKey) || seen.has(nameKey))
            throw new Error(`Row ${i + 2}: duplicate name or code.`);
          seen.add(codeKey);
          seen.add(nameKey);
          return taxonomyItemSchema.parse({
            code: row.code,
            name: row.name,
            description: row.description ?? "",
            color: row.color || "#b69154",
          });
        });
        setPreview({ action: "taxonomies.import", kind: mode, items });
        setPreviewRows(
          items.map((item) => ({
            key: item.code,
            label: item.name,
            detail: item.code,
            status: data[mode].some(
              (record) =>
                record.code.toLowerCase() === item.code.toLowerCase() ||
                record.name.toLowerCase() === item.name.toLowerCase(),
            )
              ? "Update"
              : "New",
          })),
        );
      } else {
        const stockRows = rows.map((row, i) => {
          if (!row.sku || !row.location || row.onHand === undefined)
            throw new Error(
              `Row ${i + 2}: sku, location and onHand are required.`,
            );
          const product = data.products.find(
            (item) => item.sku.toLowerCase() === row.sku.toLowerCase(),
          );
          const location = data.locations.find(
            (item) =>
              item.code.toLowerCase() === row.location.toLowerCase() ||
              item.name.toLowerCase() === row.location.toLowerCase(),
          );
          if (!product || !location)
            throw new Error(
              `Row ${i + 2}: SKU and location must match existing records.`,
            );
          const onHand = Number(row.onHand);
          const unitCost =
            row.unitCost === undefined || row.unitCost === ""
              ? product.averageCost
              : Number(row.unitCost);
          if (
            !Number.isInteger(onHand) ||
            onHand < 0 ||
            !Number.isFinite(unitCost) ||
            unitCost < 0
          )
            throw new Error(
              `Row ${i + 2}: onHand must be a whole quantity and unitCost must be a non-negative number.`,
            );
          const key = `${product.id}:${location.id}`;
          if (seen.has(key))
            throw new Error(`Row ${i + 2}: the SKU/location pair is repeated.`);
          seen.add(key);
          return {
            productId: product.id,
            locationId: location.id,
            onHand,
            unitCost,
          };
        });
        setPreview({ action: "stock.import", rows: stockRows });
        setPreviewRows(
          stockRows.map((row) => {
            const product = data.products.find(
              (item) => item.id === row.productId,
            )!;
            const location = data.locations.find(
              (item) => item.id === row.locationId,
            )!;
            return {
              key: `${row.productId}:${row.locationId}`,
              label: product.name,
              detail: `${product.sku} · ${location.name}`,
              status: `${row.onHand} on hand`,
            };
          }),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The CSV could not be parsed.",
      );
    }
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90svh] flex-col overflow-hidden sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Bulk import center</DialogTitle>
          <DialogDescription>
            Import products, catalog organization and stock balances from
            separate CSV templates. Every batch is validated before it is
            applied.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <Tabs
            value={mode}
            onValueChange={(value) => reset(value as ImportMode)}
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
              {(Object.keys(importCopy) as ImportMode[]).map((value) => (
                <TabsTrigger key={value} value={value}>
                  {importCopy[value].title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="rounded-xl border bg-muted/25 p-3 text-xs leading-5 text-muted-foreground">
            <strong className="text-foreground">
              {importCopy[mode].title}.
            </strong>{" "}
            {importCopy[mode].description}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={template}>
              <Download />
              Download template
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium">
              <Upload className="size-3.5" />
              Choose CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    if (file.size > 2000000) {
                      setError("Choose a CSV smaller than 2 MB.");
                      return;
                    }
                    setCsv(await file.text());
                    setPreview(null);
                    setPreviewRows([]);
                  }
                }}
              />
            </label>
          </div>
          <Textarea
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              setPreview(null);
              setPreviewRows([]);
            }}
            placeholder={importCopy[mode].placeholder}
            rows={8}
            className="font-mono text-xs"
          />
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/5 p-3 text-xs text-destructive"
            >
              {error}
            </p>
          )}
          {preview && previewRows.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <FileSpreadsheet className="size-4" />
                {previewRows.length} {previewRows.length === 1 ? "row" : "rows"}{" "}
                validated and ready
              </p>
              <div className="mt-3 max-h-44 space-y-2 overflow-auto">
                {previewRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="w-36 shrink-0 truncate font-mono text-[10px] text-muted-foreground">
                      {row.detail}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{row.label}</span>
                    <span className="shrink-0 font-medium">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {preview ? (
            <Button
              disabled={busy}
              onClick={async () => {
                if (await mutate(preview)) onClose();
              }}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Upload />}Import{" "}
              {previewRows.length} {previewRows.length === 1 ? "row" : "rows"}
            </Button>
          ) : (
            <Button onClick={validate} disabled={!csv.trim()}>
              <FileSpreadsheet />
              Validate & preview
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BarcodeLabel({ product }: { product: Product }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current)
      JsBarcode(ref.current, product.barcode || product.sku, {
        format: "CODE128",
        width: 1.4,
        height: 38,
        fontSize: 11,
        margin: 4,
        background: "#ffffff",
        lineColor: "#111111",
      });
  }, [product]);
  return (
    <div className="barcode-label rounded border bg-white p-3 text-center text-black">
      <p className="text-[9px] font-semibold uppercase tracking-wider">
        Flair Cosmetic & Fragrance
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] font-medium">
        {product.name}
      </p>
      <svg ref={ref} className="mx-auto my-1 max-w-full" />
      <div className="flex justify-between text-[10px]">
        <span>SKU {product.sku}</span>
        <strong>{money(product.retailPrice)}</strong>
      </div>
    </div>
  );
}
export function LabelsDialog({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const [copies, setCopies] = useState(1);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="label-dialog flex max-h-[90svh] flex-col overflow-hidden sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Barcode labels</DialogTitle>
          <DialogDescription>
            Print scannable Code 128 labels using each product’s barcode, or SKU
            when no barcode is assigned.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 text-sm">
          <span>Copies per product</span>
          <Input
            aria-label="Copies per product"
            className="w-20"
            type="number"
            min={1}
            max={24}
            value={copies}
            onChange={(e) =>
              setCopies(
                Math.max(
                  1,
                  Math.min(24, Math.trunc(Number(e.target.value)) || 1),
                ),
              )
            }
          />
          <span className="text-xs text-muted-foreground">
            {products.length * copies}{" "}
            {products.length * copies === 1 ? "label" : "labels"}
          </span>
        </div>
        <div className="barcode-print-area grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
          {products.flatMap((p) =>
            Array.from({ length: copies }, (_, i) => (
              <BarcodeLabel key={p.id + "-" + i} product={p} />
            )),
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer />
            Print labels
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
