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
import { productSchema } from "@/lib/inventory-schema";
import type { Product, ProductInput } from "@/types/inventory";
import { money } from "./shared";

export function CsvImportDialog({ onClose }: { onClose: () => void }) {
  const { data, mutate, busy } = useInventory();
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ProductInput[]>([]);
  const [error, setError] = useState("");
  function validate() {
    setError("");
    setPreview([]);
    try {
      const rows = parseCsv(csv);
      if (rows.length > 500)
        throw new Error("Import up to 500 products at a time.");
      const seen = new Set<string>();
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
          if (row[key] !== undefined && row[key] !== "")
            input[key] = Number(row[key]);
        if (row.status) input.status = row.status as Product["status"];
        return productSchema.parse(input);
      });
      setPreview(products);
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
          <DialogTitle>Import product catalog</DialogTitle>
          <DialogDescription>
            Match existing products by SKU. New SKUs create products; matching
            SKUs update them. Stock quantities are never changed by catalog
            import.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv("flair-product-template.csv", [
                  {
                    sku: "NEW-001",
                    name: "New Fragrance",
                    barcode: "",
                    category: data.categories[0]?.code,
                    brand: data.brands[0]?.name,
                    retailPrice: 39,
                    wholesalePrice: 23,
                    vipPrice: 22,
                    webPrice: 39,
                    averageCost: 16,
                    lastCost: 16,
                    reorderPoint: 12,
                    sizeMl: 100,
                    status: "active",
                  },
                ])
              }
            >
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
                    setPreview([]);
                  }
                }}
              />
            </label>
          </div>
          <Textarea
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              setPreview([]);
            }}
            placeholder="sku,name,barcode,category,brand,retailPrice,averageCost"
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
          {preview.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <FileSpreadsheet className="size-4" />
                {preview.length} {preview.length === 1 ? "product" : "products"}{" "}
                ready to import
              </p>
              <div className="mt-3 max-h-44 space-y-2 overflow-auto">
                {preview.map((p) => (
                  <div key={p.sku} className="flex gap-3 text-xs">
                    <span className="w-20 shrink-0 font-mono">{p.sku}</span>
                    <span className="flex-1">{p.name}</span>
                    <span>
                      {data.products.some((item) => item.sku === p.sku)
                        ? "Update"
                        : "New"}
                    </span>
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
          {preview.length ? (
            <Button
              disabled={busy}
              onClick={async () => {
                if (
                  await mutate({ action: "products.import", products: preview })
                )
                  onClose();
              }}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Upload />}Import{" "}
              {preview.length} {preview.length === 1 ? "product" : "products"}
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
