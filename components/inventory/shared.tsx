"use client";
import { PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/core-setup/shared";
import type { Product } from "@/types/inventory";
import { cn } from "@/lib/utils";
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
export const number = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value.length === 10 ? value + "T12:00:00" : value));
export function InventoryHeader(
  props: Omit<React.ComponentProps<typeof PageHeader>, "eyebrow">,
) {
  return <PageHeader {...props} eyebrow="Module 02 · Product & Inventory" />;
}
export function ProductVisual({
  product,
  className,
}: {
  product: Pick<Product, "color" | "name" | "concentration">;
  className?: string;
}) {
  const spray = product.concentration === "Room Spray";
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl bg-muted",
        className,
      )}
      style={{ backgroundColor: product.color + "18" }}
    >
      <svg
        viewBox="0 0 120 140"
        className="h-[82%] w-[82%]"
        role="img"
        aria-label={product.name + " product illustration"}
      >
        <ellipse
          cx="61"
          cy="127"
          rx="35"
          ry="5"
          fill={product.color}
          opacity=".13"
        />
        <rect
          x={spray ? 42 : 44}
          y="13"
          width={spray ? 36 : 32}
          height={spray ? 18 : 27}
          rx="4"
          fill="#22363d"
        />
        <rect
          x={spray ? 35 : 24}
          y={spray ? 30 : 37}
          width={spray ? 50 : 74}
          height={spray ? 91 : 84}
          rx={spray ? 10 : 16}
          fill={product.color}
        />
        <rect
          x={spray ? 38 : 29}
          y={spray ? 33 : 42}
          width={spray ? 10 : 13}
          height="70"
          rx="5"
          fill="white"
          opacity=".22"
        />
        <rect
          x={spray ? 40 : 34}
          y="61"
          width={spray ? 40 : 54}
          height="37"
          rx="3"
          fill="#fffefa"
          opacity=".92"
        />
        <path
          d="M53 70h15m-15 6h15m-11 8h7"
          stroke={product.color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M40 110h40" stroke="white" opacity=".18" strokeWidth="2" />
      </svg>
    </div>
  );
}
export function InventoryBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 text-[10px] capitalize",
        status === "active" || status === "posted"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "draft"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-stone-200 bg-stone-100 text-stone-600",
      )}
    >
      {status}
    </Badge>
  );
}
export function InventoryEmpty({
  title = "No matching records",
  description = "Try a different search or adjust your filters.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/5">
          <PackageSearch className="size-6 text-primary/55" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mx-auto mb-4 mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}
export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid min-w-0 content-start gap-2 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}
export function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b py-3 text-xs last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium">
        {value || "—"}
      </span>
    </div>
  );
}
