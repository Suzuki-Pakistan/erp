import type { InventoryData } from "./inventory";

export type PriceTier = "retail" | "wholesale" | "vip";
export type PromotionCode = string;
export type DiscountType = "percentage" | "buy-one-get-one";
export interface DiscountProgram {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  valueBps: number;
  active: boolean;
  createdAt: string;
}
export type TenderMethod = "cash" | "external" | "credit";
export interface CartLine {
  productId: string;
  quantity: number;
  unitPriceCents: number;
  discountBps: number;
}
export interface SaleLine extends CartLine {
  sku: string;
  name: string;
  taxable: boolean;
  tracked: boolean;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}
export interface Tender {
  method: TenderMethod;
  amountCents: number;
  reference: string;
}
export interface Sale {
  id: string;
  requestId: string;
  reference: string;
  createdAt: string;
  actorId: string;
  actor: string;
  shiftId: string;
  locationId: string;
  locationName: string;
  customerId: string;
  customerName: string;
  tier: PriceTier;
  promotion?: PromotionCode;
  promotionName?: string;
  note: string;
  receiptNote: string;
  taxBps: number;
  lines: SaleLine[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  tenders: Tender[];
  changeCents: number;
}
export interface PosReturn {
  id: string;
  requestId: string;
  reference: string;
  saleId: string;
  shiftId: string;
  actorId: string;
  actor: string;
  createdAt: string;
  reason: string;
  method: TenderMethod;
  paymentReference: string;
  lines: {
    productId: string;
    quantity: number;
    restock: boolean;
    amountCents: number;
  }[];
  totalCents: number;
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  marketingOptIn: boolean;
  preferredContact: "none" | "email" | "sms" | "both";
  creditCents: number;
  createdAt: string;
}
export interface CreditEntry {
  id: string;
  customerId: string;
  reference: string;
  amountCents: number;
  balanceCents: number;
  actor: string;
  createdAt: string;
}
export interface CashEntry {
  id: string;
  amountCents: number;
  reason: string;
  createdAt: string;
  actor: string;
}
export interface DrawerEvent {
  id: string;
  reason: string;
  createdAt: string;
  actor: string;
}
export interface Shift {
  id: string;
  locationId: string;
  register: string;
  actorId: string;
  actor: string;
  openedAt: string;
  closedAt?: string;
  openingCents: number;
  countedCents?: number;
  expectedCents?: number;
  varianceCents?: number;
  closingNote?: string;
  cashEntries: CashEntry[];
  drawerEvents: DrawerEvent[];
}
export interface HeldCart {
  id: string;
  label: string;
  actorId: string;
  locationId: string;
  customerId: string;
  tier: PriceTier;
  promotion?: PromotionCode;
  note: string;
  lines: CartLine[];
  createdAt: string;
}
export interface PosData {
  version: number;
  settings: { taxBps: number; taxConfigured: boolean; receiptNote: string };
  discounts: DiscountProgram[];
  sales: Sale[];
  returns: PosReturn[];
  customers: Customer[];
  credits: CreditEntry[];
  shifts: Shift[];
  held: HeldCart[];
}
export interface PosSnapshot {
  pos: PosData;
  catalog: Pick<
    InventoryData,
    "products" | "categories" | "brands" | "locations" | "balances"
  >;
}
export function createPosSeed(): PosData {
  return {
    version: 3,
    settings: {
      taxBps: 825,
      taxConfigured: true,
      receiptNote: "Thank you for shopping with Flair.",
    },
    discounts: [
      {
        id: "discount-bogo",
        name: "Buy 1 Get 1 Free",
        code: "BOGO",
        type: "buy-one-get-one",
        valueBps: 10000,
        active: true,
        createdAt: "2026-09-08T09:00:00.000Z",
      },
      {
        id: "discount-black-friday",
        name: "Black Friday 20% Off",
        code: "BLACKFRIDAY",
        type: "percentage",
        valueBps: 2000,
        active: true,
        createdAt: "2026-09-08T09:05:00.000Z",
      },
    ],
    sales: [],
    returns: [],
    customers: [],
    credits: [],
    shifts: [],
    held: [],
  };
}
