"use client";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  ScanLine,
  Download,
  Upload,
  Barcode,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Copy,
  Archive,
  ChevronLeft,
  ChevronRight,
  ArrowDownAZ,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MetricCard } from "@/components/core-setup/shared";
import { useInventory } from "./inventory-provider";
import {
  InventoryBadge,
  InventoryEmpty,
  InventoryHeader,
  money,
  ProductVisual,
} from "./shared";
import { ProductDetail, ProductEditor } from "./product-dialogs";
import { CsvImportDialog, LabelsDialog } from "./tools-dialogs";
import { productStock, type Product } from "@/types/inventory";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

export function CatalogPage() {
  const { data, canWrite, costsVisible, mutate } = useInventory();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(
    () => searchParams.get("import") === "1" && canWrite,
  );
  const [labels, setLabels] = useState<Product[] | null>(null);
  const [archive, setArchive] = useState<Product | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const editor =
    editing ?? (searchParams.get("new") === "1" && canWrite ? "new" : null);
  const filtered = data.products
    .filter(
      (p) =>
        (!query ||
          [p.name, p.sku, p.barcode, p.retailUpc].some((v) =>
            v.toLowerCase().includes(query.toLowerCase()),
          )) &&
        (!category || p.categoryId === category) &&
        (!brand || p.brandId === brand) &&
        (!status ||
          (status === "low"
            ? productStock(data, p.id, location).available <= p.reorderPoint &&
              p.trackInventory
            : p.status === status)),
    )
    .sort((a, b) =>
      sort ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
    );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const exportProducts = (products: Product[]) =>
    downloadCsv(
      "flair-products.csv",
      products.map((p) => ({
        sku: p.sku,
        name: p.name,
        barcode: p.barcode,
        category:
          data.categories.find((c) => c.id === p.categoryId)?.code ?? "",
        brand: data.brands.find((b) => b.id === p.brandId)?.name ?? "",
        status: p.status,
        retailPrice: p.retailPrice,
        wholesalePrice: p.wholesalePrice,
        vipPrice: p.vipPrice,
        webPrice: p.webPrice,
        ...(costsVisible
          ? { averageCost: p.averageCost, lastCost: p.lastCost }
          : {}),
        reorderPoint: p.reorderPoint,
        sizeMl: p.sizeMl,
      })),
    );
  function select(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  }
  function actions(p: Product) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={"Actions for " + p.name}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetail(p.id)}>
            View product
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem onClick={() => setEditing(p)}>
                <Pencil />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  mutate({ action: "product.duplicate", id: p.id })
                }
              >
                <Copy />
                Duplicate as draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setArchive(p)}
                className="text-destructive"
              >
                <Archive />
                Discontinue
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={() => setLabels([p])}>
            <Barcode />
            Print label
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Product Catalog"
        description="A single, searchable home for every SKU, barcode, price level and product detail."
        actions={
          <>
            <Button variant="outline" onClick={() => exportProducts(filtered)}>
              <Download />
              Export
            </Button>
            {canWrite && (
              <>
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <Upload />
                  Import
                </Button>
                <Button onClick={() => setEditing("new")}>
                  <Plus />
                  Add product
                </Button>
              </>
            )}
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Package}
          label="Catalog products"
          value={data.products.length}
          meta={
            data.brands.length +
            " brands · " +
            data.categories.length +
            " categories"
          }
        />
        <MetricCard
          icon={Package}
          label="Active products"
          value={data.products.filter((p) => p.status === "active").length}
          meta="Available to operations"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Below reorder point"
          value={
            data.products.filter(
              (p) =>
                p.trackInventory &&
                productStock(data, p.id).available <= p.reorderPoint,
            ).length
          }
          meta="Review replenishment levels"
          tone="attention"
        />
        <MetricCard
          icon={Barcode}
          label="Barcode coverage"
          value={
            Math.round(
              (data.products.filter((p) => p.barcode).length /
                Math.max(data.products.length, 1)) *
                100,
            ) + "%"
          }
          meta="Ready for keyboard-wedge scanners"
        />
      </div>
      <Card className="overflow-hidden py-0">
        <div className="space-y-3 border-b p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search name, SKU or scan a barcode…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              title="Focus barcode scan search"
              aria-label="Scan barcode"
              onClick={() => {
                searchRef.current?.focus();
                searchRef.current?.select();
              }}
            >
              <ScanLine />
            </Button>
            <div className="flex rounded-lg border p-0.5">
              <Button
                size="icon"
                variant={view === "list" ? "secondary" : "ghost"}
                aria-label="List view"
                className="size-8"
                onClick={() => setView("list")}
              >
                <List />
              </Button>
              <Button
                size="icon"
                variant={view === "grid" ? "secondary" : "ghost"}
                aria-label="Grid view"
                className="size-8"
                onClick={() => setView("grid")}
              >
                <LayoutGrid />
              </Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["category", category, setCategory, data.categories],
              ["brand", brand, setBrand, data.brands],
              ["location", location, setLocation, data.locations],
            ].map(([kind, value, setter, options]) => (
              <select
                key={String(kind)}
                aria-label={"Filter " + kind}
                className="field-select"
                value={String(value)}
                onChange={(e) => {
                  (setter as (v: string) => void)(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">
                  All {kind === "category" ? "categories" : String(kind) + "s"}
                </option>
                {(options as { id: string; name: string }[]).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            ))}
            <select
              aria-label="Filter status"
              className="field-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="discontinued">Discontinued</option>
              <option value="low">Low stock</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              {filtered.length} products ·{" "}
              {location
                ? "Selected location quantities"
                : "All location quantities"}
            </p>
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium">
                  {selected.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportProducts(
                      data.products.filter((p) => selected.includes(p.id)),
                    )
                  }
                >
                  <Download />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLabels(
                      data.products.filter((p) => selected.includes(p.id)),
                    )
                  }
                >
                  <Barcode />
                  Labels
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected([])}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
        {filtered.length === 0 ? (
          <InventoryEmpty />
        ) : view === "grid" ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 2xl:grid-cols-3">
            {visible.map((p) => {
              const stock = productStock(data, p.id, location);
              return (
                <div key={p.id} className="overflow-hidden rounded-xl border">
                  <button
                    className="w-full text-left"
                    onClick={() => setDetail(p.id)}
                  >
                    <ProductVisual
                      product={p}
                      className="h-44 w-full rounded-none"
                    />
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.sku}
                        </span>
                        <InventoryBadge status={p.status} />
                      </div>
                      <h3 className="truncate text-sm font-semibold">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.sizeMl}ml · {p.concentration}
                      </p>
                      <div className="mt-4 flex justify-between border-t pt-3">
                        <span className="font-semibold">
                          {money(p.retailPrice)}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            stock.available <= p.reorderPoint
                              ? "text-amber-700"
                              : "text-muted-foreground",
                          )}
                        >
                          {stock.available} available
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-xs">
              <thead className="bg-muted/35 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 p-4">
                    <input
                      aria-label="Select visible products"
                      type="checkbox"
                      checked={
                        visible.length > 0 &&
                        visible.every((p) => selected.includes(p.id))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...selected,
                                  ...visible.map((p) => p.id),
                                ]),
                              ]
                            : selected.filter(
                                (id) => !visible.some((p) => p.id === id),
                              ),
                        )
                      }
                    />
                  </th>
                  <th className="py-4">
                    <button
                      className="flex items-center gap-2"
                      onClick={() => setSort(!sort)}
                    >
                      Product <ArrowDownAZ className="size-3.5" />
                    </button>
                  </th>
                  <th className="px-3">Brand / category</th>
                  <th className="px-3 text-right">Retail</th>
                  <th className="px-3 text-right">On hand</th>
                  <th className="px-3 text-right">Available</th>
                  <th className="px-3">Status</th>
                  <th className="w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((p) => {
                  const stock = productStock(data, p.id, location);
                  return (
                    <tr key={p.id} className="group hover:bg-muted/25">
                      <td className="p-4">
                        <input
                          aria-label={"Select " + p.name}
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => select(p.id)}
                        />
                      </td>
                      <td className="py-3">
                        <button
                          className="flex max-w-[290px] items-center gap-3 text-left"
                          onClick={() => setDetail(p.id)}
                        >
                          <ProductVisual product={p} className="size-12" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold">
                              {p.name}
                            </span>
                            <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                              {p.sku} · {p.barcode || "No barcode"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3">
                        <p>
                          {data.brands.find((b) => b.id === p.brandId)?.name}
                        </p>
                        <p className="mt-1 max-w-32 truncate text-[10px] text-muted-foreground">
                          {
                            data.categories.find((c) => c.id === p.categoryId)
                              ?.name
                          }
                        </p>
                      </td>
                      <td className="px-3 text-right font-medium">
                        {money(p.retailPrice)}
                      </td>
                      <td className="px-3 text-right tabular-nums">
                        {stock.onHand}
                      </td>
                      <td className="px-3 text-right">
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 tabular-nums",
                            stock.available <= p.reorderPoint &&
                              p.trackInventory
                              ? "bg-amber-50 text-amber-800"
                              : "text-emerald-700",
                          )}
                        >
                          {p.trackInventory ? stock.available : "Service"}
                        </span>
                      </td>
                      <td className="px-3">
                        <InventoryBadge status={p.status} />
                      </td>
                      <td className="pr-3">{actions(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
      {editor && (
        <ProductEditor
          key={editor === "new" ? "new" : editor.id}
          product={editor === "new" ? undefined : editor}
          onClose={() => {
            setEditing(null);
            if (searchParams.has("new"))
              router.replace("/product-inventory/products");
          }}
        />
      )}
      {detail && (
        <ProductDetail
          productId={detail}
          onClose={() => setDetail(null)}
          onEdit={(p) => {
            setDetail(null);
            setEditing(p);
          }}
          onLabels={(p) => {
            setDetail(null);
            setLabels([p]);
          }}
        />
      )}
      {importOpen && <CsvImportDialog onClose={() => setImportOpen(false)} />}
      {labels && (
        <LabelsDialog products={labels} onClose={() => setLabels(null)} />
      )}
      <Dialog
        open={!!archive}
        onOpenChange={(open) => !open && setArchive(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discontinue this product?</DialogTitle>
            <DialogDescription>
              {archive?.name} will remain in historical records. All stock,
              reservations and orders must be cleared first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (
                  archive &&
                  (await mutate({ action: "product.archive", id: archive.id }))
                )
                  setArchive(null);
              }}
            >
              Discontinue product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
