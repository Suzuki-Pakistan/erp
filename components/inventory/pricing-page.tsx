"use client";
import { useState } from "react";
import {
  Download,
  Search,
  Pencil,
  DollarSign,
  TrendingUp,
  Tags,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/core-setup/shared";
import { useInventory } from "./inventory-provider";
import {
  InventoryHeader,
  InventoryEmpty,
  money,
  ProductVisual,
} from "./shared";
import { ProductEditor } from "./product-dialogs";
import {
  grossMarginPercent,
  grossProfit,
  type Product,
} from "@/types/inventory";
import { downloadCsv } from "@/lib/csv";

function PriceMarginCell({
  price,
  cost,
  showMargin,
  featured = false,
}: {
  price: number;
  cost: number;
  showMargin: boolean;
  featured?: boolean;
}) {
  const margin = grossMarginPercent(price, cost);
  return (
    <div className="py-3 text-right">
      <p className={featured ? "font-semibold" : "font-medium"}>
        {money(price)}
      </p>
      {showMargin && (
        <p
          className={`mt-1 text-[10px] ${margin > 0 ? "text-emerald-700" : "text-destructive"}`}
        >
          {margin.toFixed(1)}% · {money(grossProfit(price, cost))}
        </p>
      )}
    </div>
  );
}

export function PricingPage() {
  const { data, canWrite, costsVisible } = useInventory();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const products = data.products.filter(
    (p) =>
      (!query ||
        [p.name, p.sku].some((v) =>
          v.toLowerCase().includes(query.toLowerCase()),
        )) &&
      (!brand || p.brandId === brand),
  );
  const pricedProducts = products.filter((p) => p.retailPrice > 0);
  const margin =
    pricedProducts.reduce(
      (sum, p) => sum + grossMarginPercent(p.retailPrice, p.averageCost),
      0,
    ) / Math.max(pricedProducts.length, 1);
  return (
    <div className="space-y-6">
      <InventoryHeader
        title="Pricing & Margins"
        description="Compare the selling price, gross profit and margin of every product across retail, wholesale, e-commerce and VIP."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                "flair-price-list.csv",
                products.map((p) => ({
                  sku: p.sku,
                  product: p.name,
                  retail: p.retailPrice,
                  retailMargin: grossMarginPercent(
                    p.retailPrice,
                    p.averageCost,
                  ),
                  wholesale: p.wholesalePrice,
                  wholesaleMargin: grossMarginPercent(
                    p.wholesalePrice,
                    p.averageCost,
                  ),
                  vip: p.vipPrice,
                  vipMargin: grossMarginPercent(p.vipPrice, p.averageCost),
                  ecommerce: p.webPrice,
                  ecommerceMargin: grossMarginPercent(
                    p.webPrice,
                    p.averageCost,
                  ),
                  suggested: p.suggestedPrice,
                  ...(costsVisible
                    ? { averageCost: p.averageCost, floor: p.lowestPrice }
                    : {}),
                })),
              )
            }
          >
            <Download />
            Export price list
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Tags}
          label="Price levels"
          value="4"
          meta="Retail · Wholesale · E-commerce · VIP"
        />
        <MetricCard
          icon={DollarSign}
          label="Products in view"
          value={products.length}
          meta="Live product price records"
        />
        <MetricCard
          icon={costsVisible ? TrendingUp : ShieldCheck}
          label={costsVisible ? "Average retail margin" : "Access level"}
          value={costsVisible ? margin.toFixed(1) + "%" : "Read only"}
          meta={
            costsVisible
              ? "Unweighted gross product margin"
              : "Cost information is restricted"
          }
        />
        <MetricCard
          icon={ShieldCheck}
          label="Price floor checks"
          value={products.filter((p) => p.retailPrice >= p.lowestPrice).length}
          meta="Retail meets minimum selling price"
        />
      </div>
      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a product or SKU…"
            />
          </div>
          <select
            className="field-select sm:w-52"
            value={brand}
            aria-label="Filter pricing brand"
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">All brands</option>
            {data.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        {products.length ? (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-xs">
              <thead className="bg-muted/35 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Product</th>
                  {[
                    ...(costsVisible ? ["Avg. cost"] : []),
                    "Retail",
                    "Wholesale",
                    "E-commerce",
                    "VIP",
                    ...(costsVisible ? ["Floor"] : []),
                  ].map((h) => (
                    <th key={h} className="px-3 text-right">
                      {h}
                    </th>
                  ))}
                  <th className="w-12">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProductVisual product={p} className="size-10" />
                        <div className="max-w-56">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    {costsVisible && (
                      <td className="px-3 text-right text-muted-foreground">
                        {money(p.averageCost)}
                      </td>
                    )}
                    {[
                      p.retailPrice,
                      p.wholesalePrice,
                      p.webPrice,
                      p.vipPrice,
                    ].map((price, i) => (
                      <td key={i} className="px-3">
                        <PriceMarginCell
                          price={price}
                          cost={p.averageCost}
                          showMargin={costsVisible}
                          featured={i === 0}
                        />
                      </td>
                    ))}
                    {costsVisible && (
                      <td className="px-3 text-right text-muted-foreground">
                        {money(p.lowestPrice)}
                      </td>
                    )}
                    <td className="pr-3">
                      {canWrite && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={"Edit prices for " + p.name}
                          onClick={() => setEditing(p)}
                        >
                          <Pencil />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <InventoryEmpty />
        )}
      </Card>
      {editing && (
        <ProductEditor
          product={editing}
          initialTab="pricing"
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
