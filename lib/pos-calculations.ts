import type {
  CartLine,
  PosData,
  PriceTier,
  PromotionCode,
  SaleLine,
  Shift,
} from "@/types/pos";
import type { Product } from "@/types/inventory";

export const cents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100);
export const moneyCents = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value / 100,
  );
export function tierPrice(product: Product, tier: PriceTier) {
  return cents(
    tier === "vip"
      ? product.vipPrice
      : tier === "wholesale"
        ? product.wholesalePrice
        : product.retailPrice,
  );
}
export function quoteCart(
  lines: CartLine[],
  products: Product[],
  taxBps: number,
  promotion: PromotionCode = "none",
) {
  const promotionDiscounts = lines.map(() => 0);
  if (promotion === "buy-one-second-half") {
    const units = lines
      .flatMap((line, lineIndex) =>
        Array.from({ length: line.quantity }, () => ({
          lineIndex,
          unitPriceCents: line.unitPriceCents,
        })),
      )
      .sort((a, b) => b.unitPriceCents - a.unitPriceCents);
    for (let index = 1; index < units.length; index += 2) {
      const unit = units[index];
      promotionDiscounts[unit.lineIndex] += Math.round(unit.unitPriceCents / 2);
    }
  }
  const quoted: SaleLine[] = lines.map((line, lineIndex) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product)
      throw new Error(
        "A cart product no longer exists. Remove it and try again.",
      );
    const subtotalCents = line.unitPriceCents * line.quantity;
    const discountCents =
      Math.round((subtotalCents * line.discountBps) / 10000) +
      promotionDiscounts[lineIndex];
    const taxCents = product.taxable
      ? Math.round(((subtotalCents - discountCents) * taxBps) / 10000)
      : 0;
    return {
      ...line,
      sku: product.sku,
      name: product.name,
      taxable: product.taxable,
      tracked: product.trackInventory,
      subtotalCents,
      discountCents,
      taxCents,
      totalCents: subtotalCents - discountCents + taxCents,
    };
  });
  return {
    lines: quoted,
    subtotalCents: quoted.reduce((s, l) => s + l.subtotalCents, 0),
    discountCents: quoted.reduce((s, l) => s + l.discountCents, 0),
    taxCents: quoted.reduce((s, l) => s + l.taxCents, 0),
    totalCents: quoted.reduce((s, l) => s + l.totalCents, 0),
  };
}
export function shiftTotals(pos: PosData, shift: Shift) {
  const sales = pos.sales.filter((s) => s.shiftId === shift.id);
  const returns = pos.returns.filter((r) => r.shiftId === shift.id);
  const cashSales = sales.reduce(
    (sum, s) =>
      sum +
      s.tenders
        .filter((t) => t.method === "cash")
        .reduce((n, t) => n + t.amountCents, 0) -
      s.changeCents,
    0,
  );
  const cashRefunds = returns
    .filter((r) => r.method === "cash")
    .reduce((n, r) => n + r.totalCents, 0);
  const movements = shift.cashEntries.reduce((n, e) => n + e.amountCents, 0);
  const tierSummary = (tier: PriceTier) => {
    const tierSales = sales.filter((sale) => sale.tier === tier);
    const gross = tierSales.reduce((total, sale) => total + sale.totalCents, 0);
    const refunds = returns
      .filter((record) => tierSales.some((sale) => sale.id === record.saleId))
      .reduce((total, record) => total + record.totalCents, 0);
    return {
      transactions: tierSales.length,
      gross,
      refunds,
      net: gross - refunds,
    };
  };
  return {
    sales: sales.length,
    gross: sales.reduce((n, s) => n + s.totalCents, 0),
    refunds: returns.reduce((n, r) => n + r.totalCents, 0),
    cashSales,
    cashRefunds,
    movements,
    retail: tierSummary("retail"),
    wholesale: tierSummary("wholesale"),
    vip: tierSummary("vip"),
    external: sales.reduce(
      (n, s) =>
        n +
        s.tenders
          .filter((t) => t.method === "external")
          .reduce((a, t) => a + t.amountCents, 0),
      0,
    ),
    credit: sales.reduce(
      (n, s) =>
        n +
        s.tenders
          .filter((t) => t.method === "credit")
          .reduce((a, t) => a + t.amountCents, 0),
      0,
    ),
    expected: shift.openingCents + cashSales - cashRefunds + movements,
  };
}
export function returnedQuantity(
  pos: PosData,
  saleId: string,
  productId: string,
) {
  return pos.returns
    .filter((r) => r.saleId === saleId)
    .flatMap((r) => r.lines)
    .filter((l) => l.productId === productId)
    .reduce((n, l) => n + l.quantity, 0);
}
// Cumulative allocation returns every penny exactly, even over multiple partial returns.
export function returnAmount(
  line: SaleLine,
  alreadyReturned: number,
  quantity: number,
) {
  return (
    Math.round(
      (line.totalCents * (alreadyReturned + quantity)) / line.quantity,
    ) - Math.round((line.totalCents * alreadyReturned) / line.quantity)
  );
}
