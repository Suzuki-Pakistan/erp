import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createInventorySeed } from "../data/inventory";
import { applyPosCommand, posSnapshot } from "../lib/pos-domain";
import {
  cents,
  quoteCart,
  returnedQuantity,
  shiftTotals,
} from "../lib/pos-calculations";
import {
  posCommandSchema,
  type CheckoutCommand,
  type PosCommand,
} from "../lib/pos-schema";
import {
  canAccess,
  canManageInventory,
  landingPath,
  type SessionUser,
} from "../types/auth";
import type { InventoryData } from "../types/inventory";
const admin: SessionUser = {
  id: "admin",
  username: "admin",
  name: "Test Admin",
  email: "admin@example.test",
  role: "admin",
  active: true,
  createdAt: "2026-09-02",
};
const cashier: SessionUser = {
  ...admin,
  id: "cashier",
  username: "cashier",
  name: "Test Cashier",
  role: "cashier",
};
function run(data: InventoryData, command: PosCommand, user = admin) {
  return applyPosCommand(data, posCommandSchema.parse(command), user);
}
function setup(user = admin) {
  const data = createInventorySeed();
  run(data, {
    action: "settings.save",
    taxBps: 825,
    receiptNote: "Test receipt",
  });
  const shift = run(
    data,
    {
      action: "shift.open",
      locationId: data.locations.find((l) => l.type === "retail")!.id,
      register: "QA 01",
      openingCents: 10000,
    },
    user,
  ).id!;
  return { data, shift };
}
function checkout(
  data: InventoryData,
  shift: string,
  quantity = 1,
): CheckoutCommand {
  const product = data.products.find((p) => p.sku === "10000")!;
  const lines = [
    { productId: product.id, quantity, unitPriceCents: 3900, discountBps: 0 },
  ];
  const quote = quoteCart(lines, data.products, data.pos!.settings.taxBps);
  return {
    action: "sale.checkout",
    requestId: randomUUID(),
    shiftId: shift,
    customerId: "",
    tier: "retail",
    note: "",
    lines,
    taxBps: data.pos!.settings.taxBps,
    expectedTotalCents: quote.totalCents,
    tenders: [{ method: "cash", amountCents: quote.totalCents, reference: "" }],
  };
}
test("POS roles land in their own workspace and cannot edit inventory", () => {
  assert.equal(landingPath(cashier), "/retail-pos");
  assert.equal(canAccess(cashier, "core"), false);
  assert.equal(canAccess(cashier, "inventory"), false);
  assert.equal(canManageInventory(cashier), false);
  assert.equal(canAccess(cashier, "pos"), true);
  assert.equal(
    canAccess({ ...cashier, role: "inventory-manager" }, "pos"),
    false,
  );
});
test("checkout records exact tax, cash change and one atomic stock movement", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift, 2);
  command.tenders[0].amountCents = 10000;
  const before = data.balances.find(
    (b) =>
      b.productId === command.lines[0].productId &&
      b.locationId === data.pos!.shifts[0].locationId,
  )!.onHand;
  const result = run(data, command);
  const sale = data.pos!.sales[0];
  assert.equal(sale.id, result.id);
  assert.equal(sale.taxCents, 644);
  assert.equal(sale.totalCents, 8444);
  assert.equal(sale.changeCents, 1556);
  assert.equal(
    data.movements.filter((m) => m.operationId === sale.id).length,
    1,
  );
  assert.equal(data.movements[0].after, before - 2);
  assert.equal(shiftTotals(data.pos!, data.pos!.shifts[0]).expected, 18444);
});
test("retrying checkout, even after shift closure, never duplicates payment or inventory", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  const first = run(data, command);
  run(data, {
    action: "shift.close",
    shiftId: shift,
    countedCents: 14222,
    note: "",
  });
  const before = structuredClone(data);
  const retry = run(data, command);
  assert.equal(retry.id, first.id);
  assert.deepEqual(data, before);
});
test("overselling held/committed stock rolls back all lines and customer credit", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift, 243);
  const before = structuredClone(data);
  assert.throws(() => run(data, command), /insufficient available stock/);
  assert.deepEqual(data, before);
});
test("cashier discount and wholesale restrictions are enforced on the server", () => {
  const { data, shift } = setup(cashier);
  const command = checkout(data, shift);
  command.lines[0].discountBps = 1100;
  assert.throws(() => run(data, command, cashier), /up to 10%/);
  command.lines[0].discountBps = 0;
  command.tier = "vip";
  assert.throws(() => run(data, command, cashier), /retail prices/);
});
test("prices, tax configuration and expected totals cannot be forged", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  assert.throws(
    () =>
      run(data, {
        ...command,
        lines: [{ ...command.lines[0], unitPriceCents: 1 }],
      }),
    /price changed/,
  );
  assert.throws(
    () => run(data, { ...command, taxBps: 0 }),
    /Tax configuration changed/,
  );
  assert.throws(
    () => run(data, { ...command, expectedTotalCents: 1 }),
    /total changed/,
  );
  assert.throws(
    () =>
      run(data, { ...command, lines: [...command.lines, ...command.lines] }),
    /duplicate products/,
  );
});
test("underpayment, non-cash overpayment and missing external approvals are rejected", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  assert.throws(
    () =>
      run(data, {
        ...command,
        tenders: [{ method: "cash", amountCents: 1, reference: "" }],
      }),
    /Payments must cover/,
  );
  assert.throws(
    () =>
      run(data, {
        ...command,
        tenders: [
          { method: "external", amountCents: 5000, reference: "APPROVED" },
        ],
      }),
    /only cash/,
  );
  assert.throws(
    () =>
      run(data, {
        ...command,
        tenders: [{ method: "external", amountCents: 4222, reference: "" }],
      }),
    /approval reference/,
  );
});
test("split tender posts once and only cash contributes to the drawer", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  command.tenders = [
    { method: "cash", amountCents: 2500, reference: "" },
    { method: "external", amountCents: 2000, reference: "REF-123" },
  ];
  run(data, command);
  assert.equal(data.pos!.sales[0].changeCents, 278);
  assert.equal(shiftTotals(data.pos!, data.pos!.shifts[0]).expected, 12222);
});
test("partial returns preserve rounding and reject repeat returns", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift, 3);
  command.lines[0].discountBps = 777;
  const quote = quoteCart(command.lines, data.products, 825);
  command.expectedTotalCents = quote.totalCents;
  command.tenders[0].amountCents = quote.totalCents;
  const saleId = run(data, command).id!;
  for (let i = 0; i < 3; i++)
    run(data, {
      action: "sale.return",
      requestId: randomUUID(),
      saleId,
      shiftId: shift,
      reason: "Customer return",
      method: "cash",
      paymentReference: "",
      lines: [
        { productId: command.lines[0].productId, quantity: 1, restock: true },
      ],
    });
  assert.equal(
    data.pos!.returns.reduce((n, r) => n + r.totalCents, 0),
    quote.totalCents,
  );
  assert.equal(
    returnedQuantity(data.pos!, saleId, command.lines[0].productId),
    3,
  );
  assert.equal(shiftTotals(data.pos!, data.pos!.shifts[0]).expected, 10000);
  const before = structuredClone(data);
  assert.throws(
    () =>
      run(data, {
        action: "sale.return",
        requestId: randomUUID(),
        saleId,
        shiftId: shift,
        reason: "Duplicate return",
        method: "cash",
        paymentReference: "",
        lines: [
          { productId: command.lines[0].productId, quantity: 1, restock: true },
        ],
      }),
    /exceed/,
  );
  assert.deepEqual(data, before);
});
test("credit return and later redemption retain an immutable balance ledger", () => {
  const { data, shift } = setup();
  const customerId = run(data, {
    action: "customer.save",
    name: "QA Customer",
    email: "qa@example.test",
    phone: "",
    notes: "",
  }).id!;
  const command = checkout(data, shift);
  command.customerId = customerId;
  const saleId = run(data, command).id!;
  run(data, {
    action: "sale.return",
    requestId: randomUUID(),
    saleId,
    shiftId: shift,
    reason: "Exchange via credit",
    method: "credit",
    paymentReference: "",
    lines: [
      { productId: command.lines[0].productId, quantity: 1, restock: false },
    ],
  });
  assert.equal(data.pos!.customers[0].creditCents, 4222);
  const second = checkout(data, shift);
  second.customerId = customerId;
  second.tenders = [{ method: "credit", amountCents: 4222, reference: "" }];
  run(data, second);
  assert.equal(data.pos!.customers[0].creditCents, 0);
  assert.equal(data.pos!.credits.length, 2);
  assert.throws(
    () => run(data, { ...second, requestId: randomUUID() }),
    /insufficient store credit/,
  );
});
test("external-only sales cannot be refunded as cash", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  command.tenders = [
    { method: "external", amountCents: 4222, reference: "APPROVAL" },
  ];
  const saleId = run(data, command).id!;
  assert.throws(
    () =>
      run(data, {
        action: "sale.return",
        requestId: randomUUID(),
        saleId,
        shiftId: shift,
        reason: "Return",
        method: "cash",
        paymentReference: "",
        lines: [
          { productId: command.lines[0].productId, quantity: 1, restock: true },
        ],
      }),
    /original payment/,
  );
});
test("return replay is idempotent; cashiers cannot issue refunds", () => {
  const { data, shift } = setup();
  const saleId = run(data, checkout(data, shift)).id!;
  const command: PosCommand = {
    action: "sale.return",
    requestId: randomUUID(),
    saleId,
    shiftId: shift,
    reason: "Return",
    method: "cash",
    paymentReference: "",
    lines: [{ productId: data.products[0].id, quantity: 1, restock: true }],
  };
  run(data, command);
  const before = structuredClone(data);
  run(data, command);
  assert.deepEqual(data, before);
  assert.throws(() => run(data, command, cashier), /manager/);
});
test("shift ownership, drawer limits, variance notes and close immutability", () => {
  const { data, shift } = setup();
  assert.throws(
    () =>
      run(
        data,
        {
          action: "shift.open",
          locationId: data.pos!.shifts[0].locationId,
          register: "QA 01",
          openingCents: 0,
        },
        cashier,
      ),
    /already have an open shift/,
  );
  assert.throws(
    () => run(data, checkout(data, shift), cashier),
    /own cashier shift/,
  );
  assert.throws(
    () =>
      run(data, {
        action: "shift.cash",
        shiftId: shift,
        amountCents: -10001,
        reason: "Safe drop",
      }),
    /enough recorded cash/,
  );
  run(data, {
    action: "shift.cash",
    shiftId: shift,
    amountCents: 5000,
    reason: "Float top-up",
  });
  run(data, {
    action: "shift.cash",
    shiftId: shift,
    amountCents: -2000,
    reason: "Safe drop",
  });
  assert.throws(
    () =>
      run(data, {
        action: "shift.close",
        shiftId: shift,
        countedCents: 12900,
        note: "",
      }),
    /Explain the cash variance/,
  );
  run(data, {
    action: "shift.close",
    shiftId: shift,
    countedCents: 12900,
    note: "One dollar short",
  });
  assert.equal(data.pos!.shifts[0].varianceCents, -100);
  assert.throws(() => run(data, checkout(data, shift)), /Open your own/);
});
test("held carts do not reserve stock and cannot be sold twice with new request IDs", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  const before = structuredClone(data.balances);
  run(data, {
    action: "cart.hold",
    locationId: data.pos!.shifts[0].locationId,
    label: "QA hold",
    customerId: "",
    tier: "retail",
    note: "",
    lines: command.lines,
  });
  assert.deepEqual(data.balances, before);
  command.heldId = data.pos!.held[0].id;
  run(data, command);
  assert.equal(data.pos!.held.length, 0);
  assert.throws(
    () => run(data, { ...command, requestId: randomUUID() }),
    /already sold or removed/,
  );
});
test("POS snapshots redact costs and cashiers cannot see another cashier's shifts or sales", () => {
  const { data, shift } = setup();
  run(data, checkout(data, shift));
  const snapshot = posSnapshot(data, cashier);
  assert.equal(snapshot.pos.sales.length, 0);
  assert.equal(snapshot.pos.shifts.length, 0);
  assert.ok(
    snapshot.catalog.products.every(
      (p) => p.averageCost === 0 && p.lastCost === 0 && p.lowestPrice === 0,
    ),
  );
  assert.ok(snapshot.catalog.locations.every((l) => l.type === "retail"));
});
test("invalid, fractional and negative financial inputs fail schema validation", () => {
  const { data, shift } = setup();
  const command = checkout(data, shift);
  for (const quantity of [0, -1, 1.1, Infinity])
    assert.equal(
      posCommandSchema.safeParse({
        ...command,
        lines: [{ ...command.lines[0], quantity }],
      }).success,
      false,
    );
  assert.equal(
    posCommandSchema.safeParse({
      ...command,
      tenders: [{ method: "cash", amountCents: -1, reference: "" }],
    }).success,
    false,
  );
});
test("non-stock services sell without creating physical stock movements", () => {
  const { data, shift } = setup();
  const product = data.products.find((p) => !p.trackInventory)!;
  product.status = "active";
  product.taxable = false;
  const command = checkout(data, shift);
  command.lines = [
    {
      productId: product.id,
      quantity: 2,
      unitPriceCents: cents(product.retailPrice),
      discountBps: 0,
    },
  ];
  command.expectedTotalCents = command.lines[0].unitPriceCents * 2;
  command.tenders[0].amountCents = command.expectedTotalCents;
  const sale = run(data, command);
  assert.equal(data.pos!.sales[0].taxCents, 0);
  assert.equal(
    data.movements.filter((m) => m.operationId === sale.id).length,
    0,
  );
});
