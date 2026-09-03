import { z } from "zod";
const money = z.number().finite().min(0).max(1000000);
const quantity = z.number().finite().int().min(0).max(1000000);
const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value + "T12:00:00.000Z");
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Enter a valid calendar date.");
export const productSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(50)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,
      "Use letters, numbers, dots, dashes, underscores or slashes for SKU.",
    ),
  barcode: z
    .string()
    .trim()
    .max(80)
    .regex(
      /^[\x20-\x7E]*$/,
      "Use printable ASCII characters for scannable barcodes.",
    ),
  retailUpc: z.string().trim().max(80),
  name: z.string().trim().min(2, "Product name is required.").max(180),
  description: z.string().max(2000),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  gender: z.enum(["Women", "Men", "Unisex"]),
  concentration: z.string().max(80),
  sizeMl: z.number().finite().min(0).max(100000),
  unit: z.string().min(1).max(20),
  packSize: quantity.min(1),
  status: z.enum(["active", "draft", "discontinued"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  supplier: z.string().max(160),
  supplierCode: z.string().max(80),
  averageCost: money,
  lastCost: money,
  retailPrice: money,
  wholesalePrice: money,
  vipPrice: money,
  webPrice: money,
  suggestedPrice: money,
  lowestPrice: money,
  reorderPoint: quantity,
  minimumStock: quantity,
  maximumStock: quantity,
  daysOfStock: quantity,
  taxable: z.boolean(),
  taxCode: z.string().max(40),
  trackInventory: z.boolean(),
  dropShip: z.boolean(),
  labelOnReceipt: z.boolean(),
  notes: z.string().max(4000),
});
const operationSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["receipt", "transfer", "adjustment", "count"]),
  date: calendarDate,
  locationId: z.string().min(1),
  destinationId: z.string(),
  supplier: z.string().max(160),
  billReference: z.string().max(100),
  billTerms: z.string().max(60),
  dueDate: z.union([z.literal(""), calendarDate]),
  freight: money,
  discount: money,
  reason: z.string().max(160),
  memo: z.string().max(2000),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().finite().int().min(-1000000).max(1000000),
        unitCost: money,
      }),
    )
    .min(1)
    .max(200),
  postNow: z.boolean(),
});
export const inventoryCommandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("product.save"), product: productSchema }),
  z.object({ action: z.literal("product.duplicate"), id: z.string() }),
  z.object({ action: z.literal("product.archive"), id: z.string() }),
  z.object({
    action: z.literal("products.import"),
    products: z.array(productSchema).min(1).max(500),
  }),
  z.object({
    action: z.literal("taxonomy.save"),
    kind: z.enum(["categories", "brands"]),
    item: z.object({
      id: z.string().optional(),
      code: z.string().trim().min(1).max(30),
      name: z.string().trim().min(2).max(100),
      description: z.string().max(500),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
  }),
  z.object({
    action: z.literal("taxonomy.delete"),
    kind: z.enum(["categories", "brands"]),
    id: z.string(),
  }),
  z.object({ action: z.literal("operation.save"), operation: operationSchema }),
  z.object({ action: z.literal("operation.post"), id: z.string() }),
  z.object({ action: z.literal("operation.cancel"), id: z.string() }),
]);
export type InventoryCommand = z.infer<typeof inventoryCommandSchema>;
