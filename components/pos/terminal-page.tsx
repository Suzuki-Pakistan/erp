"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  History,
  Minus,
  Pause,
  Plus,
  RotateCcw,
  ReceiptText,
  ScanLine,
  Search,
  Settings2,
  ShoppingBag,
  Tag,
  Trash2,
  UserRoundPlus,
  Wallet,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductVisual, FormField } from "@/components/inventory/shared";
import { useSessionUser } from "@/components/auth/session-provider";
import { canManagePos } from "@/types/auth";
import { availableStock, type Product } from "@/types/inventory";
import type {
  CartLine,
  PriceTier,
  PromotionCode,
  Sale,
  Tender,
} from "@/types/pos";
import { cartLineSchema } from "@/lib/pos-schema";
import { cents, quoteCart, tierPrice } from "@/lib/pos-calculations";
import { cn } from "@/lib/utils";
import { usePos } from "./pos-provider";
import {
  CustomerDialog,
  Empty,
  money,
  OpenShiftDialog,
  PosHeader,
  PosModal,
  ReceiptDialog,
  SettingsDialog,
} from "./shared";

export function TerminalPage() {
  const { data, busy, online, queue, mutate } = usePos();
  const user = useSessionUser();
  const params = useSearchParams();
  const requestedCustomer = params.get("customer") ?? "";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [tier, setTier] = useState<PriceTier>("retail");
  const [promotion, setPromotion] = useState<PromotionCode>("none");
  const [customerId, setCustomerId] = useState(params.get("customer") ?? "");
  const [note, setNote] = useState("");
  const [requestId, setRequestId] = useState("");
  const [heldId, setHeldId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [openShift, setOpenShift] = useState(false);
  const [settings, setSettings] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [pay, setPay] = useState(false);
  const [hold, setHold] = useState(false);
  const [held, setHeld] = useState(false);
  const [holdName, setHoldName] = useState("");
  const [clear, setClear] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [drawerReason, setDrawerReason] = useState("Customer requested change");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const shift = data.pos.shifts.find(
    (s) => s.actorId === user.id && !s.closedAt,
  );
  const [browseLocation, setBrowseLocation] = useState(
    data.catalog.locations[0]?.id ?? "",
  );
  const locationId = shift?.locationId ?? browseLocation;
  const location = data.catalog.locations.find((l) => l.id === locationId);
  const storageKey = "flair-pos-draft-v1:" + user.id;
  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
        if (
          saved &&
          Array.isArray(saved.lines) &&
          saved.lines.every((l: unknown) => cartLineSchema.safeParse(l).success)
        ) {
          setLines(saved.lines);
          setTier(
            ["retail", "wholesale", "vip"].includes(saved.tier)
              ? saved.tier
              : "retail",
          );
          setPromotion(
            typeof saved.promotion === "string" ? saved.promotion : "none",
          );
          setCustomerId(
            !saved.lines.length && requestedCustomer
              ? requestedCustomer
              : (saved.customerId ?? ""),
          );
          if (
            saved.lines.length &&
            requestedCustomer &&
            requestedCustomer !== saved.customerId
          ) {
            toast.info(
              "Finish the existing cart first, or select the requested customer from the cart.",
            );
          }
          setNote(saved.note ?? "");
          setRequestId(saved.requestId || crypto.randomUUID());
          setHeldId(saved.heldId ?? "");
          setBrowseLocation(saved.locationId ?? "");
        } else setRequestId(crypto.randomUUID());
      } catch {
        setRequestId(crypto.randomUUID());
        toast.error("The saved cart could not be restored.");
      }
      setLoaded(true);
    });
  }, [storageKey, requestedCustomer]);
  useEffect(() => {
    if (loaded) {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            lines,
            tier,
            promotion,
            customerId,
            note,
            requestId,
            heldId,
            locationId,
          }),
        );
      } catch {
        /* The on-screen cart remains available. */
      }
    }
  }, [
    lines,
    tier,
    promotion,
    customerId,
    note,
    requestId,
    heldId,
    locationId,
    loaded,
    storageKey,
  ]);
  const selectedDiscount = data.pos.discounts.find(
    (discount) => discount.id === promotion && discount.active,
  );
  const quote = useMemo(
    () =>
      quoteCart(
        lines.filter((l) =>
          data.catalog.products.some((p) => p.id === l.productId),
        ),
        data.catalog.products,
        data.pos.settings.taxBps,
        selectedDiscount ?? promotion,
      ),
    [
      lines,
      data.catalog.products,
      data.pos.settings.taxBps,
      promotion,
      selectedDiscount,
    ],
  );
  function stock(product: Product) {
    return data.catalog.balances
      .filter((b) => b.productId === product.id && b.locationId === locationId)
      .reduce((n, b) => n + availableStock(b), 0);
  }
  function add(product: Product) {
    const current =
      lines.find((l) => l.productId === product.id)?.quantity ?? 0;
    if (product.trackInventory && current >= stock(product)) {
      toast.error("No more available stock at this store.");
      return;
    }
    setLines((prev) =>
      prev.some((l) => l.productId === product.id)
        ? prev.map((l) =>
            l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [
            ...prev,
            {
              productId: product.id,
              quantity: 1,
              unitPriceCents: tierPrice(product, tier),
              discountBps: 0,
            },
          ],
    );
    searchRef.current?.focus();
  }
  function reset() {
    setLines([]);
    setCustomerId("");
    setNote("");
    setHeldId("");
    setPromotion("none");
    setRequestId(crypto.randomUUID());
    setClear(false);
  }
  function changeTier(next: PriceTier) {
    setTier(next);
    if (next !== "retail") setPromotion("none");
    setLines((prev) =>
      prev.map((l) => {
        const p = data.catalog.products.find((p) => p.id === l.productId);
        return p ? { ...l, unitPriceCents: tierPrice(p, next) } : l;
      }),
    );
  }
  const active = data.catalog.products.filter((p) => p.status === "active");
  const products = active.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      (!inStock || !p.trackInventory || stock(p) > 0) &&
      `${p.name} ${p.sku} ${p.barcode} ${data.catalog.brands.find((b) => b.id === p.brandId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const ownHeld = data.pos.held.filter((h) => h.actorId === user.id);
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <PosHeader
        title="Point of sale"
        description="Thoughtful service. Effortless checkout."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/retail-pos/sales">
                <History />
                Sales history
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={!data.pos.sales.length}
              onClick={() => setReceipt(data.pos.sales[0])}
            >
              <ReceiptText />
              Last sale
            </Button>
            {canManagePos(user) && (
              <Button
                variant="outline"
                size="icon"
                aria-label="Checkout configuration"
                onClick={() => setSettings(true)}
              >
                <Settings2 />
              </Button>
            )}
          </>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 text-primary-foreground sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10">
            <ScanLine className="size-5 text-[var(--brand-champagne)]" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
              Your retail counter
            </p>
            <h2 className="mt-1 text-sm font-semibold">
              {shift
                ? `${location?.name} · ${shift.register}`
                : "Ready for a fresh start"}
            </h2>
            <p className="mt-1 text-xs text-white/60">
              {shift
                ? `Serving with ${user.name}`
                : "Open a cashier shift to begin accepting sales."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-white/75">
            <span
              className={cn(
                "size-1.5 rounded-full",
                online ? "bg-emerald-300" : "bg-amber-300",
              )}
            />
            {online ? "Connected" : "Offline"}
          </span>
          {queue.length > 0 && (
            <Link
              className="text-xs text-amber-200 underline underline-offset-4"
              href="/retail-pos/sync"
            >
              {queue.length} pending
            </Link>
          )}
          {shift ? (
            <Link
              href="/retail-pos/shifts"
              className="flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-xs"
            >
              Manage shift
              <ChevronRight className="size-3" />
            </Link>
          ) : (
            <Button
              className="bg-[var(--brand-champagne)] text-primary hover:bg-[var(--brand-champagne)]/90"
              onClick={() => setOpenShift(true)}
            >
              Open register
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
      <section
        className="grid gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-3 xl:grid-cols-6"
        aria-label="POS quick actions"
      >
        <Button
          variant="outline"
          className="justify-start"
          disabled={!shift || busy}
          onClick={() => setDrawer(true)}
        >
          <Banknote />
          Open drawer
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/retail-pos/sales">
            <History />
            Sale lookup
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/retail-pos/returns">
            <RotateCcw />
            Return / refund
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/retail-pos/customers">
            <UserRoundPlus />
            Customer
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/retail-pos/discounts">
            <Tag />
            Discounts
          </Link>
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => setHeld(true)}
        >
          <Pause />
          Recall ({ownHeld.length})
        </Button>
      </section>
      {!data.pos.settings.taxConfigured && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p>
            A manager must confirm the tax configuration before the first sale.
          </p>
          {canManagePos(user) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSettings(true)}
            >
              Configure checkout
            </Button>
          )}
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_370px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="min-w-0 space-y-4" aria-label="Product selection">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  className="h-10 pl-9 pr-10"
                  aria-label="Scan barcode or search products"
                  placeholder="Scan barcode, SKU, or search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const found = active.find(
                        (p) =>
                          p.barcode === search.trim() ||
                          (p.retailUpc === search.trim() && !!search.trim()) ||
                          p.sku === search.trim(),
                      );
                      if (found) {
                        add(found);
                        setSearch("");
                      } else
                        toast.info(
                          "No exact barcode or SKU match. Choose a result below.",
                        );
                    }
                  }}
                />
                <ScanLine className="pointer-events-none absolute right-3 top-3 size-4 text-primary/50" />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                aria-label="Focus barcode scanner"
                onClick={() => searchRef.current?.focus()}
              >
                <ScanLine />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] text-muted-foreground">
                Keyboard-wedge scanners · Enter to add an exact match
              </p>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-[var(--brand-ink)]"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                In stock only
              </label>
            </div>
            {!shift && (
              <select
                aria-label="Browse stock at location"
                className="field-select mt-3 text-xs"
                value={browseLocation}
                onChange={(e) => setBrowseLocation(e.target.value)}
              >
                {data.catalog.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            aria-label="Product categories"
          >
            {[
              { id: "", name: "All products" },
              ...data.catalog.categories.filter((c) =>
                active.some((p) => p.categoryId === c.id),
              ),
            ].map((c) => (
              <button
                type="button"
                key={c.id}
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                  category === c.id
                    ? "border-primary bg-primary text-white"
                    : "bg-card text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium">
              {category
                ? data.catalog.categories.find((c) => c.id === category)?.name
                : "The fragrance edit"}{" "}
              <span className="ml-1 text-muted-foreground">
                / {products.length} items
              </span>
            </p>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {tier} prices
            </span>
          </div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
              {products.map((p) => {
                const available = stock(p);
                const disabled = p.trackInventory && available <= 0;
                const count = lines.find((l) => l.productId === p.id)?.quantity;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={disabled || busy || !loaded}
                    onClick={() => add(p)}
                    aria-label={`Add ${p.name} to cart`}
                    className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:p-4"
                  >
                    <div className="relative mb-3 w-full">
                      <ProductVisual
                        product={p}
                        className="h-32 w-full sm:h-36"
                      />
                      {count && (
                        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-white">
                          {count}
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-primary/70">
                        {p.sizeMl} ml
                      </span>
                    </div>
                    <p className="truncate text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {
                        data.catalog.brands.find((b) => b.id === p.brandId)
                          ?.name
                      }
                    </p>
                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                      {p.name}
                    </h3>
                    <div className="mt-3 flex items-end justify-between gap-1">
                      <div>
                        <p className="text-base font-semibold tracking-tight">
                          {money(tierPrice(p, tier))}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            disabled
                              ? "text-muted-foreground"
                              : available < 10 && p.trackInventory
                                ? "text-amber-700"
                                : "text-emerald-700",
                          )}
                        >
                          {p.trackInventory
                            ? `${available} available`
                            : "Non-stock item"}
                        </p>
                      </div>
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white">
                        <Plus className="size-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Empty
              title="No products found"
              description="Try another name, barcode, or category. Discontinued and draft products cannot be sold."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategory("");
                    setSearch("");
                    setInStock(false);
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          )}
        </section>
        <aside
          id="pos-current-sale"
          className="pos-cart min-w-0 scroll-mt-20 overflow-hidden rounded-2xl border bg-card shadow-[0_12px_35px_-25px_rgba(7,40,53,.3)] lg:sticky lg:top-20"
          aria-label="Current sale"
        >
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4" />
              <h2 className="font-semibold">Current sale</h2>
              <span className="rounded-md bg-primary/5 px-2 py-0.5 text-xs">
                {lines.reduce((n, l) => n + l.quantity, 0)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear current cart"
              disabled={!lines.length || busy}
              onClick={() => setClear(true)}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="space-y-3 border-b px-5 py-4">
            <div className="flex min-w-0 gap-2">
              <select
                aria-label="Sale customer"
                className="field-select min-w-0 flex-1 text-xs"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Walk-in customer</option>
                {data.pos.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.creditCents > 0
                      ? ` · ${money(c.creditCents)} credit`
                      : ""}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="icon"
                aria-label="Create customer"
                onClick={() => setCustomerOpen(true)}
              >
                <UserRoundPlus className="size-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Price level</span>
              <select
                className="field-select h-8 w-32 text-xs"
                aria-label="Price level"
                value={tier}
                disabled={!canManagePos(user)}
                onChange={(e) => changeTier(e.target.value as PriceTier)}
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div
              className={cn(
                "rounded-xl border p-3",
                selectedDiscount
                  ? "border-emerald-300 bg-emerald-50/70"
                  : "bg-card",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-champagne)]/25 text-primary">
                  <Tag className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">Sale discount</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Active retail campaigns only
                  </p>
                </div>
                <Link
                  href="/retail-pos/discounts"
                  className="text-[10px] font-semibold text-primary underline underline-offset-4"
                >
                  Manage
                </Link>
              </div>
              <select
                aria-label="Apply sale discount"
                className="field-select mt-3 w-full text-xs"
                value={promotion}
                disabled={tier !== "retail"}
                onChange={(event) => {
                  const next = event.target.value;
                  setPromotion(next);
                  if (next !== "none")
                    setLines((current) =>
                      current.map((line) => ({ ...line, discountBps: 0 })),
                    );
                }}
              >
                <option value="none">No campaign discount</option>
                {data.pos.discounts
                  .filter((discount) => discount.active)
                  .map((discount) => (
                    <option key={discount.id} value={discount.id}>
                      {discount.name} · {discount.code}
                    </option>
                  ))}
              </select>
              {selectedDiscount && (
                <p className="mt-2 text-[10px] font-medium text-emerald-800">
                  Applied ·{" "}
                  {selectedDiscount.type === "buy-one-get-one"
                    ? "lower-priced item in each pair is free"
                    : `${selectedDiscount.valueBps / 100}% off eligible retail items`}
                </p>
              )}
            </div>
            {heldId && (
              <p className="text-xs text-amber-800">
                Recalled cart · removed from held carts after checkout
              </p>
            )}
          </div>
          <div className="pos-cart-lines max-h-[420px] min-h-40 space-y-4 overflow-y-auto px-5 py-5">
            {!lines.length ? (
              <div className="py-7 text-center">
                <ShoppingBag className="mx-auto mb-3 size-9 text-primary/20" />
                <p className="text-sm font-medium">A great find starts here</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Scan a barcode or select a product
                  <br />
                  to start your next sale.
                </p>
              </div>
            ) : (
              lines.map((l) => {
                const p = data.catalog.products.find(
                  (p) => p.id === l.productId,
                );
                return (
                  <div
                    key={l.productId}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3">
                      {p && <ProductVisual product={p} className="size-12" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold leading-5">
                          {p?.name ?? "Unavailable product"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {p?.sku} · {money(l.unitPriceCents)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${p?.name ?? "product"}`}
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter(
                              (item) => item.productId !== l.productId,
                            ),
                          )
                        }
                        className="self-start rounded p-1.5 text-muted-foreground hover:bg-muted"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          className="p-2 disabled:opacity-30"
                          aria-label={`Decrease ${p?.name} quantity`}
                          disabled={l.quantity <= 1}
                          onClick={() =>
                            setLines((prev) =>
                              prev.map((item) =>
                                item.productId === l.productId
                                  ? { ...item, quantity: item.quantity - 1 }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Minus className="size-3" />
                        </button>
                        <input
                          aria-label={`Quantity for ${p?.name}`}
                          className="w-9 bg-transparent text-center text-xs outline-none"
                          type="number"
                          min="1"
                          max="9999"
                          value={l.quantity}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            if (Number.isInteger(q) && q > 0 && q <= 9999)
                              setLines((prev) =>
                                prev.map((item) =>
                                  item.productId === l.productId
                                    ? { ...item, quantity: q }
                                    : item,
                                ),
                              );
                          }}
                        />
                        <button
                          type="button"
                          className="p-2"
                          aria-label={`Increase ${p?.name} quantity`}
                          onClick={() => {
                            if (p) add(p);
                          }}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Off</span>
                        <input
                          type="number"
                          className="h-7 w-12 rounded-md border bg-transparent px-1 text-center text-xs text-foreground"
                          aria-label={`Discount percent for ${p?.name}`}
                          min="0"
                          max={canManagePos(user) ? 100 : 10}
                          disabled={promotion !== "none"}
                          value={l.discountBps / 100}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (
                              Number.isFinite(value) &&
                              value >= 0 &&
                              value <= (canManagePos(user) ? 100 : 10)
                            )
                              setLines((prev) =>
                                prev.map((item) =>
                                  item.productId === l.productId
                                    ? {
                                        ...item,
                                        discountBps: Math.round(value * 100),
                                      }
                                    : item,
                                ),
                              );
                          }}
                        />
                        %
                      </label>
                      <strong className="text-xs">
                        {money(
                          quote.lines.find(
                            (item) => item.productId === l.productId,
                          )?.totalCents ?? 0,
                        )}
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-3 border-t bg-muted/25 p-5">
            <Input
              aria-label="Sale note"
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              className="h-8 text-xs"
            />
            <div className="space-y-2 py-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{money(quote.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-emerald-700">
                  −{money(quote.discountCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({data.pos.settings.taxBps / 100}%)
                </span>
                <span>{money(quote.taxCents)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-semibold">Total due</span>
              <strong className="text-2xl tracking-tight">
                {money(quote.totalCents)}
              </strong>
            </div>
            <Button
              className="h-12 w-full rounded-xl"
              disabled={
                !loaded ||
                !lines.length ||
                !shift ||
                !data.pos.settings.taxConfigured ||
                busy
              }
              onClick={() => setPay(true)}
            >
              <Wallet />
              Take payment <ArrowRight className="ml-auto" />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="text-xs"
                disabled={!lines.length || busy || !!heldId || !online}
                onClick={() => {
                  setHoldName(
                    customerId
                      ? (data.pos.customers.find((c) => c.id === customerId)
                          ?.name ?? "")
                      : "",
                  );
                  setHold(true);
                }}
              >
                <Pause className="size-3.5" />
                Hold sale
              </Button>
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setHeld(true)}
              >
                Held carts ({ownHeld.length})
              </Button>
            </div>
            <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
              <Wifi className="size-3" />
              Stock checked again when payment is recorded
            </p>
          </div>
        </aside>
      </div>
      {!!lines.length && (
        <a
          href="#pos-current-sale"
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-4 rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-white shadow-xl lg:hidden"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            View sale · {lines.reduce((n, l) => n + l.quantity, 0)} items
          </span>
          <span className="flex items-center gap-2">
            {money(quote.totalCents)}
            <ArrowRight className="size-4" />
          </span>
        </a>
      )}
      {drawer && shift && (
        <PosModal
          open
          onOpenChange={(open) => !open && !busy && setDrawer(false)}
          title="Open cash drawer"
          description="Choose a reason before opening the drawer. The event is recorded against this cashier shift."
          footer={
            <>
              <Button variant="outline" onClick={() => setDrawer(false)}>
                Cancel
              </Button>
              <Button
                disabled={busy || drawerReason.trim().length < 3}
                onClick={async () => {
                  if (
                    await mutate({
                      action: "shift.drawer",
                      shiftId: shift.id,
                      reason: drawerReason,
                    })
                  ) {
                    setDrawer(false);
                    setDrawerReason("Customer requested change");
                  }
                }}
              >
                <Banknote />
                Open drawer
              </Button>
            </>
          }
        >
          <FormField label="Reason">
            <select
              className="field-select"
              value={drawerReason}
              onChange={(event) => setDrawerReason(event.target.value)}
            >
              <option>Customer requested change</option>
              <option>Cash count</option>
              <option>Safe drop</option>
              <option>Manager access</option>
            </select>
          </FormField>
          <p className="rounded-xl border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
            Demo mode records the request and audit trail. Connected register
            hardware can trigger the physical drawer in production.
          </p>
        </PosModal>
      )}
      <OpenShiftDialog open={openShift} onOpenChange={setOpenShift} />
      <SettingsDialog
        key={String(settings) + data.pos.settings.taxBps}
        open={settings}
        onOpenChange={setSettings}
      />
      <CustomerDialog
        key={String(customerOpen)}
        open={customerOpen}
        onOpenChange={setCustomerOpen}
        onSaved={setCustomerId}
      />
      <ReceiptDialog sale={receipt} onClose={() => setReceipt(null)} />
      <PosModal
        open={clear}
        onOpenChange={setClear}
        title="Clear this cart?"
        description="Unsaved cart items will be removed. Completed sales and held carts are not affected."
        footer={
          <>
            <Button variant="outline" onClick={() => setClear(false)}>
              Keep cart
            </Button>
            <Button variant="destructive" onClick={reset}>
              Clear cart
            </Button>
          </>
        }
      >
        <p className="text-sm">
          You have {lines.length} product lines in this cart.
        </p>
      </PosModal>
      <PosModal
        open={hold}
        onOpenChange={setHold}
        title="Hold this sale"
        description="Save this cart on the server and come back to it later. Stock is not reserved."
        footer={
          <>
            <Button variant="outline" onClick={() => setHold(false)}>
              Cancel
            </Button>
            <Button
              disabled={busy || !holdName.trim()}
              onClick={async () => {
                if (
                  await mutate({
                    action: "cart.hold",
                    label: holdName,
                    locationId,
                    customerId,
                    tier,
                    promotion,
                    note,
                    lines,
                  })
                ) {
                  setHold(false);
                  reset();
                }
              }}
            >
              Hold cart
            </Button>
          </>
        }
      >
        <FormField label="Cart label">
          <Input
            value={holdName}
            onChange={(e) => setHoldName(e.target.value)}
            placeholder="Customer name or a helpful reminder"
            maxLength={80}
          />
        </FormField>
      </PosModal>
      <PosModal
        open={held}
        onOpenChange={setHeld}
        title="Held carts"
        description="Recall a saved cart. Its prices and stock will be checked at checkout."
      >
        {ownHeld.length ? (
          ownHeld.map((h) => (
            <div key={h.id} className="rounded-xl border p-4">
              <p className="font-semibold">{h.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {h.lines.length} products ·{" "}
                {
                  data.catalog.locations.find((l) => l.id === h.locationId)
                    ?.name
                }
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    busy ||
                    !!lines.length ||
                    (!!shift && shift.locationId !== h.locationId)
                  }
                  onClick={() => {
                    setLines(h.lines);
                    setCustomerId(h.customerId);
                    setTier(h.tier);
                    setPromotion(h.promotion ?? "none");
                    setNote(h.note);
                    setHeldId(h.id);
                    setBrowseLocation(h.locationId);
                    setRequestId(crypto.randomUUID());
                    setHeld(false);
                  }}
                >
                  Recall cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || heldId === h.id}
                  onClick={async () => {
                    await mutate({ action: "cart.discard", id: h.id });
                  }}
                >
                  Discard
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Empty
            title="Nothing on hold"
            description="Held carts will appear here."
          />
        )}
        {!!lines.length && (
          <p className="text-xs text-amber-800">
            Finish or clear your current cart before recalling another.
          </p>
        )}
      </PosModal>
      {pay && shift && (
        <PaymentDialog
          requestId={requestId}
          shiftId={shift.id}
          lines={lines}
          tier={tier}
          promotion={promotion}
          customerId={customerId}
          note={note}
          heldId={heldId}
          onClose={() => setPay(false)}
          onComplete={(sale) => {
            setPay(false);
            reset();
            if (sale) setReceipt(sale);
          }}
        />
      )}
    </div>
  );
}

function PaymentDialog({
  requestId,
  shiftId,
  lines,
  tier,
  promotion,
  customerId,
  note,
  heldId,
  onClose,
  onComplete,
}: {
  requestId: string;
  shiftId: string;
  lines: CartLine[];
  tier: PriceTier;
  promotion: PromotionCode;
  customerId: string;
  note: string;
  heldId: string;
  onClose: () => void;
  onComplete: (sale?: Sale) => void;
}) {
  const { data, mutate, busy, online } = usePos();
  const quote = quoteCart(
    lines,
    data.catalog.products,
    data.pos.settings.taxBps,
    promotion,
  );
  const [cash, setCash] = useState((quote.totalCents / 100).toFixed(2));
  const [external, setExternal] = useState("");
  const [credit, setCredit] = useState("");
  const [reference, setReference] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const cashCents = cents(Number(cash) || 0);
  const externalCents = cents(Number(external) || 0);
  const creditCents = cents(Number(credit) || 0);
  const paid = cashCents + externalCents + creditCents;
  const remaining = Math.max(0, quote.totalCents - paid);
  const change = Math.max(0, paid - quote.totalCents);
  const customer = data.pos.customers.find((c) => c.id === customerId);
  const invalid =
    [cash, external, credit].some(
      (v) => v !== "" && (!Number.isFinite(Number(v)) || Number(v) < 0),
    ) ||
    externalCents + creditCents > quote.totalCents ||
    creditCents > (customer?.creditCents ?? 0) ||
    remaining > 0 ||
    (!!externalCents && (!confirmed || reference.trim().length < 3)) ||
    (!online && (externalCents > 0 || creditCents > 0));
  return (
    <PosModal
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
      title="Take payment"
      description="Collect one payment or combine cash, card and store credit in the same transaction."
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Back to cart
          </Button>
          <Button
            disabled={busy || invalid}
            onClick={async () => {
              const tenders: Tender[] = [];
              if (cashCents)
                tenders.push({
                  method: "cash",
                  amountCents: cashCents,
                  reference: "",
                });
              if (externalCents)
                tenders.push({
                  method: "external",
                  amountCents: externalCents,
                  reference,
                });
              if (creditCents)
                tenders.push({
                  method: "credit",
                  amountCents: creditCents,
                  reference: "",
                });
              const result = await mutate(
                {
                  action: "sale.checkout",
                  requestId,
                  shiftId,
                  customerId,
                  tier,
                  promotion,
                  note,
                  lines,
                  taxBps: data.pos.settings.taxBps,
                  expectedTotalCents: quote.totalCents,
                  tenders,
                  heldId: heldId || undefined,
                },
                true,
              );
              if (result)
                onComplete(
                  result.data?.pos.sales.find((s) => s.id === result.id),
                );
            }}
          >
            <Check />
            {busy
              ? "Recording…"
              : online
                ? "Record payment"
                : "Queue pending checkout"}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-primary p-5 text-center text-white">
        <p className="text-xs text-white/60">Total to collect</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {money(quote.totalCents)}
        </p>
        <p className="mt-2 text-xs text-white/60">
          {lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
          {customer?.name ?? "Walk-in customer"}
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs leading-5 text-emerald-950">
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="size-3" />
        </span>
        <p>
          <strong>Split tender is ready.</strong> Enter the card amount and
          Flair automatically leaves the balance in cash—for example, $400 card
          on a $600 sale leaves $200 cash.
        </p>
      </div>
      {!online && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Offline: cash-only checkouts can be queued. Do not collect payment or
          release goods until server confirmation. Store credit and card tenders
          require a connection.
        </p>
      )}
      <FormField label="Cash received (USD)">
        <div className="relative">
          <Banknote className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            type="number"
            step="0.01"
            min="0"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
          />
        </div>
      </FormField>
      <div className="flex flex-wrap gap-2">
        {[10, 20, 50, 100].map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => setCash(String(value))}
          >
            ${value}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCash(
              (
                Math.max(0, quote.totalCents - externalCents - creditCents) /
                100
              ).toFixed(2),
            )
          }
        >
          Exact balance
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Card payment (USD)">
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              disabled={!online}
              type="number"
              min="0"
              step="0.01"
              className="pl-9"
              value={external}
              onChange={(e) => {
                setExternal(e.target.value);
                setConfirmed(false);
                setCash(
                  (
                    Math.max(
                      0,
                      quote.totalCents -
                        cents(Number(e.target.value) || 0) -
                        creditCents,
                    ) / 100
                  ).toFixed(2),
                );
              }}
            />
          </div>
        </FormField>
        <FormField
          label={`Store credit · ${money(customer?.creditCents ?? 0)} available`}
        >
          <Input
            disabled={!online || !customer}
            type="number"
            min="0"
            step="0.01"
            value={credit}
            onChange={(e) => {
              setCredit(e.target.value);
              setCash(
                (
                  Math.max(
                    0,
                    quote.totalCents -
                      cents(Number(e.target.value) || 0) -
                      externalCents,
                  ) / 100
                ).toFixed(2),
              );
            }}
          />
        </FormField>
      </div>
      {externalCents > 0 && (
        <div className="space-y-3 rounded-xl border bg-muted/25 p-4">
          <FormField label="Card approval reference">
            <Input
              value={reference}
              maxLength={150}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Terminal / provider transaction reference"
            />
          </FormField>
          <label className="flex items-start gap-2 text-xs leading-5">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I have verified the card payment was approved on the terminal. No
            card details are entered or stored in Flair.
          </label>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Cash", cashCents],
          ["Card", externalCents],
          ["Store credit", creditCents],
          ["Tendered", paid],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border bg-muted/20 p-3"
          >
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">
              {money(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-between rounded-xl border p-4">
        <span className="text-sm">
          {remaining ? "Balance remaining" : "Change to give"}
        </span>
        <strong
          className={cn(
            "text-lg",
            remaining ? "text-amber-800" : "text-emerald-700",
          )}
        >
          {money(remaining || change)}
        </strong>
      </div>
    </PosModal>
  );
}
