"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  DollarSign,
  PackageCheck,
  Plus,
  Truck,
  ArrowRightLeft,
  ClipboardCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard, SectionTitle } from "@/components/core-setup/shared";
import { useInventory } from "./inventory-provider";
import {
  InventoryHeader,
  money,
  number,
  ProductVisual,
  shortDate,
} from "./shared";
import { productStock, type OperationType } from "@/types/inventory";
import { OperationDialog } from "./operation-dialog";
import { ProductEditor } from "./product-dialogs";

export function InventoryOverviewPage() {
  const { data, canWrite, costsVisible } = useInventory();
  const [operation, setOperation] = useState<OperationType | null>(null);
  const [addProduct, setAddProduct] = useState(false);
  const onHand = data.balances.reduce((sum, b) => sum + b.onHand, 0);
  const value = data.balances.reduce(
    (sum, b) =>
      sum +
      b.onHand *
        (data.products.find((p) => p.id === b.productId)?.averageCost ?? 0),
    0,
  );
  const alerts = data.products
    .filter(
      (p) =>
        p.trackInventory &&
        p.status === "active" &&
        productStock(data, p.id).available <= p.reorderPoint,
    )
    .sort(
      (a, b) =>
        productStock(data, a.id).available - productStock(data, b.id).available,
    );
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Product & Inventory"
        description="Know what you have, where it is, and what needs your attention next."
        actions={
          canWrite && (
            <>
              <Button variant="outline" onClick={() => setOperation("receipt")}>
                <Truck />
                Receive stock
              </Button>
              <Button onClick={() => setAddProduct(true)}>
                <Plus />
                Add product
              </Button>
            </>
          )
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Boxes}
          label="Active products"
          value={data.products.filter((p) => p.status === "active").length}
          meta={data.brands.length + " brands in your catalog"}
        />
        <MetricCard
          icon={PackageCheck}
          label="Units on hand"
          value={number(onHand)}
          meta={data.locations.length + " retail & warehouse locations"}
        />
        <MetricCard
          icon={costsVisible ? DollarSign : ClipboardCheck}
          label={costsVisible ? "Inventory value" : "Draft operations"}
          value={
            costsVisible
              ? money(value)
              : data.operations.filter((o) => o.status === "draft").length
          }
          meta={
            costsVisible ? "At weighted average unit cost" : "Awaiting posting"
          }
        />
        <MetricCard
          icon={CircleAlert}
          label="Replenishment alerts"
          value={alerts.length}
          meta="Available quantity at or below reorder"
          tone="attention"
        />
      </section>
      <section className="grid gap-5 2xl:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <SectionTitle
              title="Replenishment watchlist"
              description="Prioritize products with limited available stock."
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/product-inventory/products">
                    View catalog <ArrowUpRight />
                  </Link>
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((p) => {
              const stock = productStock(data, p.id);
              return (
                <Link
                  key={p.id}
                  href="/product-inventory/products"
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
                >
                  <ProductVisual product={p} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{p.name}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      SKU {p.sku} · Reorder at {p.reorderPoint}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        stock.available === 0
                          ? "text-sm font-semibold text-destructive"
                          : "text-sm font-semibold text-amber-700"
                      }
                    >
                      {stock.available}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      available
                    </p>
                  </div>
                </Link>
              );
            })}
            {!alerts.length && (
              <p className="py-6 text-sm text-muted-foreground">
                All active products are above their reorder points.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SectionTitle
              title="Stock across locations"
              description="Your physical footprint, measured in units."
            />
          </CardHeader>
          <CardContent className="space-y-5">
            {data.locations.map((l) => {
              const units = data.balances
                .filter((b) => b.locationId === l.id)
                .reduce((sum, b) => sum + b.onHand, 0);
              return (
                <div key={l.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {l.code} · {l.city}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {number(units)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/65"
                      style={{
                        width: (units / Math.max(onHand, 1)) * 100 + "%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <SectionTitle
              title="Recent inventory activity"
              description="Posted movements remain immutable and traceable."
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/product-inventory/operations">
                    All activity <ArrowUpRight />
                  </Link>
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {data.movements.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/5">
                  <ArrowRightLeft className="size-4 text-primary/60" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {data.products.find((p) => p.id === m.productId)?.name}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {m.reference} ·{" "}
                    {data.locations.find((l) => l.id === m.locationId)?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">
                    {m.quantity > 0 ? "+" : ""}
                    {m.quantity}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {shortDate(m.date)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SectionTitle
              title="Stock operations"
              description="Focused workflows with built-in validation."
            />
          </CardHeader>
          <CardContent className="grid gap-2">
            {(
              [
                { type: "receipt", label: "Receive stock", icon: Truck },
                {
                  type: "transfer",
                  label: "Transfer between locations",
                  icon: ArrowRightLeft,
                },
                {
                  type: "adjustment",
                  label: "Adjust inventory",
                  icon: SlidersHorizontal,
                },
                {
                  type: "count",
                  label: "Start a cycle count",
                  icon: ClipboardCheck,
                },
              ] as const
            ).map((action) => (
              <Button
                key={action.type}
                variant="outline"
                className="h-11 justify-start text-xs"
                disabled={!canWrite}
                onClick={() => setOperation(action.type)}
              >
                <action.icon />
                {action.label}
                <ArrowRight className="ml-auto size-3" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
      {operation && (
        <OperationDialog type={operation} onClose={() => setOperation(null)} />
      )}
      {addProduct && <ProductEditor onClose={() => setAddProduct(false)} />}
    </div>
  );
}
