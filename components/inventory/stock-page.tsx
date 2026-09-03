"use client";
import { useState } from "react";
import {
  Search,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  ClipboardCheck,
  Download,
  Warehouse,
  Boxes,
  LockKeyhole,
  PackagePlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/core-setup/shared";
import { useInventory } from "./inventory-provider";
import {
  InventoryEmpty,
  InventoryHeader,
  money,
  number,
  ProductVisual,
} from "./shared";
import { OperationDialog } from "./operation-dialog";
import { availableStock, type OperationType } from "@/types/inventory";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
export function StockPage() {
  const { data, canWrite, costsVisible, refresh, busy } = useInventory();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [health, setHealth] = useState("");
  const [operation, setOperation] = useState<OperationType | null>(null);
  const [limit, setLimit] = useState(25);
  const rows = data.balances
    .map((b) => ({
      ...b,
      product: data.products.find((p) => p.id === b.productId)!,
      location: data.locations.find((l) => l.id === b.locationId)!,
    }))
    .filter(
      (r) =>
        r.product.trackInventory &&
        (!location || r.locationId === location) &&
        (!query ||
          [r.product.name, r.product.sku, r.product.barcode].some((v) =>
            v.toLowerCase().includes(query.toLowerCase()),
          )) &&
        (!health ||
          (health === "out"
            ? availableStock(r) === 0
            : health === "low"
              ? availableStock(r) <= r.product.reorderPoint
              : r.committed > 0)),
    );
  const totals = rows.reduce(
    (s, r) => ({
      onHand: s.onHand + r.onHand,
      available: s.available + availableStock(r),
      committed: s.committed + r.committed + r.held,
      onOrder: s.onOrder + r.onOrder,
    }),
    { onHand: 0, available: 0, committed: 0, onOrder: 0 },
  );
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Stock Explorer"
        description="Inspect on-hand, available, committed and incoming stock at every location."
        actions={
          <>
            <Button variant="outline" onClick={refresh} disabled={busy}>
              <RefreshCw />
              Refresh stock
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "flair-stock.csv",
                  rows.map((r) => ({
                    sku: r.product.sku,
                    product: r.product.name,
                    location: r.location.name,
                    onHand: r.onHand,
                    available: availableStock(r),
                    committed: r.committed,
                    held: r.held,
                    onOrder: r.onOrder,
                    ...(costsVisible
                      ? { value: r.onHand * r.product.averageCost }
                      : {}),
                  })),
                )
              }
            >
              <Download />
              Export stock
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Boxes}
          label="On hand"
          value={number(totals.onHand)}
          meta="Physical units in the current view"
        />
        <MetricCard
          icon={Warehouse}
          label="Available"
          value={number(totals.available)}
          meta="On hand less committed and held"
        />
        <MetricCard
          icon={LockKeyhole}
          label="Reserved & held"
          value={number(totals.committed)}
          meta="Excluded from transfer availability"
        />
        <MetricCard
          icon={PackagePlus}
          label="On order"
          value={number(totals.onOrder)}
          meta="Expected incoming units"
        />
      </div>
      {canWrite && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { type: "receipt", label: "Receive stock", icon: Truck },
              {
                type: "transfer",
                label: "Transfer stock",
                icon: ArrowRightLeft,
              },
              {
                type: "adjustment",
                label: "Adjustment",
                icon: SlidersHorizontal,
              },
              { type: "count", label: "Cycle count", icon: ClipboardCheck },
            ] as const
          ).map((a) => (
            <Button
              key={a.type}
              variant={a.type === "receipt" ? "default" : "outline"}
              onClick={() => setOperation(a.type)}
            >
              <a.icon />
              {a.label}
            </Button>
          ))}
        </div>
      )}
      <Card className="overflow-hidden py-0">
        <div className="grid gap-3 border-b p-4 sm:p-5 md:grid-cols-[1fr_240px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Find product or scan barcode…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="field-select"
            aria-label="Stock location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {data.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            className="field-select"
            aria-label="Stock health"
            value={health}
            onChange={(e) => setHealth(e.target.value)}
          >
            <option value="">All stock states</option>
            <option value="low">Below reorder point</option>
            <option value="out">Out of stock</option>
            <option value="reserved">Reserved stock</option>
          </select>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs">
              <thead className="bg-muted/35 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  {[
                    "Product",
                    "Location",
                    "On hand",
                    "Committed",
                    "Held",
                    "Available",
                    "On order",
                    "Reorder",
                    ...(costsVisible ? ["Stock value"] : []),
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={cn("px-4 py-4", i > 1 && "text-right")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.slice(0, limit).map((r) => (
                  <tr
                    key={r.productId + r.locationId}
                    className="hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductVisual
                          product={r.product}
                          className="size-10"
                        />
                        <div className="max-w-52">
                          <p className="truncate font-semibold">
                            {r.product.name}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {r.product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <p className="max-w-40 truncate">{r.location.name}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {r.location.code}
                      </p>
                    </td>
                    {[r.onHand, r.committed, r.held].map((v, i) => (
                      <td key={i} className="px-4 text-right tabular-nums">
                        {v}
                      </td>
                    ))}
                    <td className="px-4 text-right">
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 font-medium tabular-nums",
                          availableStock(r) <= r.product.reorderPoint
                            ? "bg-amber-50 text-amber-800"
                            : "text-emerald-700",
                        )}
                      >
                        {availableStock(r)}
                      </span>
                    </td>
                    <td className="px-4 text-right">{r.onOrder}</td>
                    <td className="px-4 text-right text-muted-foreground">
                      {r.product.reorderPoint}
                    </td>
                    {costsVisible && (
                      <td className="px-4 text-right">
                        {money(r.onHand * r.product.averageCost)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <InventoryEmpty />
        )}
        <div className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
          <span>
            Showing {Math.min(limit, rows.length)} of {rows.length}{" "}
            product-location balances
          </span>
          {rows.length > limit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLimit(limit + 25)}
            >
              Load more
            </Button>
          )}
        </div>
      </Card>
      {operation && (
        <OperationDialog type={operation} onClose={() => setOperation(null)} />
      )}
    </div>
  );
}
