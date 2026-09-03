export interface Taxonomy {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
}
export interface InventoryLocation {
  id: string;
  code: string;
  name: string;
  city: string;
  type: string;
}
export interface Product {
  id: string;
  sku: string;
  barcode: string;
  retailUpc: string;
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  gender: "Women" | "Men" | "Unisex";
  concentration: string;
  sizeMl: number;
  unit: string;
  packSize: number;
  status: "active" | "draft" | "discontinued";
  color: string;
  supplier: string;
  supplierCode: string;
  averageCost: number;
  lastCost: number;
  retailPrice: number;
  wholesalePrice: number;
  vipPrice: number;
  webPrice: number;
  suggestedPrice: number;
  lowestPrice: number;
  reorderPoint: number;
  minimumStock: number;
  maximumStock: number;
  daysOfStock: number;
  taxable: boolean;
  taxCode: string;
  trackInventory: boolean;
  dropShip: boolean;
  labelOnReceipt: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
export interface StockBalance {
  productId: string;
  locationId: string;
  onHand: number;
  committed: number;
  held: number;
  onOrder: number;
}
export type OperationType = "receipt" | "transfer" | "adjustment" | "count";
export interface OperationLine {
  productId: string;
  quantity: number;
  unitCost: number;
}
export interface StockOperation {
  id: string;
  reference: string;
  type: OperationType;
  status: "draft" | "posted" | "cancelled";
  date: string;
  locationId: string;
  destinationId: string;
  supplier: string;
  billReference: string;
  billTerms: string;
  dueDate: string;
  freight: number;
  discount: number;
  reason: string;
  memo: string;
  lines: OperationLine[];
  actor: string;
  createdAt: string;
  postedAt?: string;
}
export interface StockMovement {
  id: string;
  operationId: string;
  reference: string;
  productId: string;
  locationId: string;
  type:
    | "receipt"
    | "transfer-in"
    | "transfer-out"
    | "adjustment"
    | "count"
    | "sale"
    | "return"
    | "opening";
  quantity: number;
  before: number;
  after: number;
  unitCost: number;
  actor: string;
  date: string;
  note: string;
}
export interface InventoryData {
  pos?: import("./pos").PosData;
  version: number;
  products: Product[];
  categories: Taxonomy[];
  brands: Taxonomy[];
  locations: InventoryLocation[];
  balances: StockBalance[];
  operations: StockOperation[];
  movements: StockMovement[];
}
export const operationLabels: Record<OperationType, string> = {
  receipt: "Stock receipt",
  transfer: "Stock transfer",
  adjustment: "Stock adjustment",
  count: "Cycle count",
};
export function availableStock(balance: StockBalance) {
  return balance.onHand - balance.committed - balance.held;
}
export function productStock(
  data: InventoryData,
  productId: string,
  locationId?: string,
) {
  return data.balances
    .filter(
      (b) =>
        b.productId === productId &&
        (!locationId || b.locationId === locationId),
    )
    .reduce(
      (sum, b) => ({
        onHand: sum.onHand + b.onHand,
        committed: sum.committed + b.committed,
        held: sum.held + b.held,
        onOrder: sum.onOrder + b.onOrder,
        available: sum.available + availableStock(b),
      }),
      { onHand: 0, committed: 0, held: 0, onOrder: 0, available: 0 },
    );
}
