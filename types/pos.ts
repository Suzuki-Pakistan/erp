import type { InventoryData } from "./inventory";

export type PriceTier = "retail" | "wholesale" | "vip";
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
}
export interface HeldCart {
  id: string;
  label: string;
  actorId: string;
  locationId: string;
  customerId: string;
  tier: PriceTier;
  note: string;
  lines: CartLine[];
  createdAt: string;
}
export interface PosData {
  version: number;
  settings: { taxBps: number; taxConfigured: boolean; receiptNote: string };
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
    version: 1,
    settings: {
      taxBps: 0,
      taxConfigured: false,
      receiptNote: "Thank you for shopping with Flair.",
    },
    sales: [],
    returns: [],
    customers: [],
    credits: [],
    shifts: [],
    held: [],
  };
}
