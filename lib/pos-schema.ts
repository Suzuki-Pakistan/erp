import { z } from "zod";
const id = z.string().min(1).max(120);
const amount = z.number().int().min(0).max(100_000_000);
const text = z.string().trim().max(1000);
const tier = z.enum(["retail", "wholesale", "vip"]);
export const cartLineSchema = z.object({
  productId: id,
  quantity: z.number().int().min(1).max(9999),
  unitPriceCents: amount,
  discountBps: z.number().int().min(0).max(10000),
});
const lines = z.array(cartLineSchema).min(1).max(100);
const tender = z.object({
  method: z.enum(["cash", "external", "credit"]),
  amountCents: amount.refine((v) => v > 0, "Enter a positive payment amount"),
  reference: z.string().trim().max(150),
});
export const checkoutSchema = z.object({
  action: z.literal("sale.checkout"),
  requestId: z.uuid(),
  shiftId: id,
  customerId: z.string().max(120),
  tier,
  note: text,
  lines,
  taxBps: z.number().int().min(0).max(2500),
  expectedTotalCents: amount,
  tenders: z.array(tender).min(1).max(3),
  heldId: z.string().max(120).optional(),
});
export const posCommandSchema = z.discriminatedUnion("action", [
  checkoutSchema,
  z.object({
    action: z.literal("settings.save"),
    taxBps: z.number().int().min(0).max(2500),
    receiptNote: z.string().trim().max(250),
  }),
  z.object({
    action: z.literal("shift.open"),
    locationId: id,
    register: z.string().trim().min(1).max(40),
    openingCents: amount,
  }),
  z.object({
    action: z.literal("shift.close"),
    shiftId: id,
    countedCents: amount,
    note: text,
  }),
  z.object({
    action: z.literal("shift.cash"),
    shiftId: id,
    amountCents: z
      .number()
      .int()
      .min(-100_000_000)
      .max(100_000_000)
      .refine((v) => v !== 0),
    reason: z.string().trim().min(3).max(250),
  }),
  z.object({
    action: z.literal("customer.save"),
    id: id.optional(),
    name: z.string().trim().min(2).max(100),
    email: z.union([z.email(), z.literal("")]),
    phone: z.string().trim().max(40),
    notes: text,
  }),
  z.object({
    action: z.literal("cart.hold"),
    label: z.string().trim().min(1).max(80),
    locationId: id,
    customerId: z.string().max(120),
    tier,
    note: text,
    lines,
  }),
  z.object({ action: z.literal("cart.discard"), id }),
  z.object({
    action: z.literal("sale.return"),
    requestId: z.uuid(),
    saleId: id,
    shiftId: id,
    reason: z.string().trim().min(3).max(500),
    method: z.enum(["cash", "external", "credit"]),
    paymentReference: z.string().trim().max(150),
    lines: z
      .array(
        z.object({
          productId: id,
          quantity: z.number().int().min(1).max(9999),
          restock: z.boolean(),
        }),
      )
      .min(1)
      .max(100),
  }),
]);
export type PosCommand = z.infer<typeof posCommandSchema>;
export type CheckoutCommand = z.infer<typeof checkoutSchema>;
