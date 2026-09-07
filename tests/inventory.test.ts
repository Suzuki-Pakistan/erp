import test from "node:test";
import assert from "node:assert/strict";
import { createInventorySeed } from "../data/inventory";
import { applyInventoryCommand } from "../lib/inventory-domain";
import {
  inventoryCommandSchema,
  type InventoryCommand,
} from "../lib/inventory-schema";
import { parseCsv } from "../lib/csv";
import {
  grossMarginPercent,
  grossProfit,
  productStock,
  type InventoryData,
  type OperationType,
} from "../types/inventory";
import {
  canAccess,
  canManageInventory,
  landingPath,
  type SessionUser,
} from "../types/auth";

test("individual tier margins preserve gross profit and percentage", () => {
  assert.equal(grossProfit(39, 16), 23);
  assert.equal(grossMarginPercent(39, 16), 59);
  assert.equal(grossMarginPercent(0, 16), 0);
});

function operation(
  data: InventoryData,
  type: OperationType,
  quantity: number,
  postNow = true,
): InventoryCommand {
  return {
    action: "operation.save",
    operation: {
      type,
      date: "2026-08-31",
      locationId: data.locations[0].id,
      destinationId: data.locations[1].id,
      supplier: "Test supplier",
      billReference: "TEST",
      billTerms: "Net 30",
      dueDate: "",
      freight: 0,
      discount: 0,
      reason: "QA reconciliation",
      memo: "In-memory automated test",
      postNow,
      lines: [{ productId: data.products[0].id, quantity, unitCost: 20 }],
    },
  };
}
test("seed preserves reference SKU, barcode and available quantity", () => {
  const data = createInventorySeed();
  const product = data.products.find((p) => p.sku === "10000")!;
  assert.equal(product.barcode, "6291108730515");
  assert.equal(product.retailPrice, 39);
  assert.equal(product.lastCost, 16);
  assert.equal(
    productStock(data, product.id, data.locations[0].id).available,
    242,
  );
  data.products.forEach((p) =>
    assert.equal(
      inventoryCommandSchema.safeParse({ action: "product.save", product: p })
        .success,
      true,
    ),
  );
});
test("invalid calendar dates and non-scannable barcodes are rejected", () => {
  const data = createInventorySeed();
  const command = operation(data, "receipt", 1);
  if (command.action === "operation.save")
    command.operation.date = "2026-02-31";
  assert.equal(inventoryCommandSchema.safeParse(command).success, false);
  assert.equal(
    inventoryCommandSchema.safeParse({
      action: "product.save",
      product: { ...data.products[0], barcode: "香水" },
    }).success,
    false,
  );
});
test("receipt updates stock and weighted average cost exactly once", () => {
  const data = createInventorySeed();
  const product = data.products[0];
  const before = productStock(data, product.id).onHand;
  const cost = product.averageCost;
  applyInventoryCommand(data, operation(data, "receipt", 10), "QA");
  assert.equal(productStock(data, product.id).onHand, before + 10);
  assert.equal(
    product.averageCost,
    Math.round(((before * cost + 200) / (before + 10)) * 10000) / 10000,
  );
  assert.equal(product.lastCost, 20);
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        { action: "operation.post", id: data.operations[0].id },
        "QA",
      ),
    /Only a draft/,
  );
});
test("transfers conserve stock and create paired ledger entries", () => {
  const data = createInventorySeed();
  const id = data.products[0].id;
  const before = productStock(data, id).onHand;
  const source = productStock(data, id, data.locations[0].id).onHand;
  applyInventoryCommand(data, operation(data, "transfer", 12), "QA");
  assert.equal(productStock(data, id).onHand, before);
  assert.equal(
    productStock(data, id, data.locations[0].id).onHand,
    source - 12,
  );
  assert.equal(data.movements[0].quantity + data.movements[1].quantity, 0);
  assert.deepEqual(
    data.movements.slice(0, 2).map((m) => m.type),
    ["transfer-in", "transfer-out"],
  );
});
test("negative stock and consuming committed stock are rejected", () => {
  const data = createInventorySeed();
  const before = structuredClone(data);
  assert.throws(
    () =>
      applyInventoryCommand(data, operation(data, "transfer", 100000), "QA"),
    /below committed|insufficient/,
  );
  assert.deepEqual(data, before);
  assert.throws(
    () => applyInventoryCommand(data, operation(data, "count", 0), "QA"),
    /below committed/,
  );
});
test("cycle counts post only the difference and adjustments require a reason", () => {
  const data = createInventorySeed();
  const before = productStock(
    data,
    data.products[0].id,
    data.locations[0].id,
  ).onHand;
  applyInventoryCommand(data, operation(data, "count", 250), "QA");
  assert.equal(data.movements[0].quantity, 250 - before);
  const command = operation(data, "adjustment", -1);
  if (command.action === "operation.save") command.operation.reason = "";
  assert.throws(
    () => applyInventoryCommand(data, command, "QA"),
    /reason is required/,
  );
});
test("drafts do not change stock and cancelled drafts cannot post", () => {
  const data = createInventorySeed();
  const before = structuredClone(data.balances);
  applyInventoryCommand(data, operation(data, "receipt", 8, false), "QA");
  assert.deepEqual(data.balances, before);
  applyInventoryCommand(
    data,
    { action: "operation.cancel", id: data.operations[0].id },
    "QA",
  );
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        { action: "operation.post", id: data.operations[0].id },
        "QA",
      ),
    /Only a draft/,
  );
});
test("duplicate identifiers, in-use taxonomies and hiding stocked products are blocked", () => {
  const data = createInventorySeed();
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        {
          action: "product.save",
          product: { ...data.products[1], sku: data.products[0].sku },
        },
        "QA",
      ),
    /SKU/,
  );
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        {
          action: "product.save",
          product: { ...data.products[1], barcode: data.products[0].barcode },
        },
        "QA",
      ),
    /barcode/,
  );
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        {
          action: "product.save",
          product: { ...data.products[0], trackInventory: false },
        },
        "QA",
      ),
    /Reconcile stock/,
  );
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        { action: "product.archive", id: data.products[0].id },
        "QA",
      ),
    /stock|quantities/i,
  );
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        {
          action: "taxonomy.delete",
          kind: "categories",
          id: data.products[0].categoryId,
        },
        "QA",
      ),
    /assigned products/,
  );
});
test("duplicate product is a fresh draft without copied stock or barcode", () => {
  const data = createInventorySeed();
  applyInventoryCommand(
    data,
    { action: "product.duplicate", id: data.products[0].id },
    "QA",
  );
  const copy = data.products[0];
  assert.equal(copy.status, "draft");
  assert.equal(copy.barcode, "");
  assert.equal(productStock(data, copy.id).onHand, 0);
});
test("receipt discounts cannot create a negative document total", () => {
  const data = createInventorySeed();
  const command = operation(data, "receipt", 1);
  if (command.action === "operation.save") command.operation.discount = 30;
  assert.throws(() => applyInventoryCommand(data, command, "QA"), /discount/);
});
test("CSV handles quoted commas, escaped quotes, newlines and invalid rows", () => {
  assert.deepEqual(parseCsv('sku,name\r\n1,"A, \"\"B\"\""\r\n2,"Line\nTwo"'), [
    { sku: "1", name: 'A, "B"' },
    { sku: "2", name: "Line\nTwo" },
  ]);
  assert.throws(() => parseCsv("sku,name\n1"), /Column count/);
  assert.throws(() => parseCsv("sku,sku\n1,2"), /unique/);
  assert.throws(() => parseCsv('sku,name\n1,"bad'), /unclosed/);
});
test("bulk taxonomy import creates and updates categories atomically", () => {
  const data = createInventorySeed();
  const existing = data.categories[0];
  applyInventoryCommand(
    data,
    {
      action: "taxonomies.import",
      kind: "categories",
      items: [
        {
          code: existing.code,
          name: existing.name,
          description: "Updated by import",
          color: "#123456",
        },
        {
          code: "CAT-NEW",
          name: "New Category",
          description: "Imported",
          color: "#654321",
        },
      ],
    },
    "QA",
  );
  assert.equal(
    data.categories.find((item) => item.id === existing.id)?.description,
    "Updated by import",
  );
  assert.equal(
    data.categories.some((item) => item.code === "CAT-NEW"),
    true,
  );
  const before = structuredClone(data.categories);
  assert.throws(
    () =>
      applyInventoryCommand(
        data,
        {
          action: "taxonomies.import",
          kind: "categories",
          items: [
            {
              code: "DUPLICATE",
              name: "Repeated",
              description: "",
              color: "#123456",
            },
            {
              code: "DUPLICATE",
              name: "Another",
              description: "",
              color: "#123456",
            },
          ],
        },
        "QA",
      ),
    /duplicate/i,
  );
  assert.deepEqual(data.categories, before);
});
test("bulk inventory import sets location counts with auditable movements", () => {
  const data = createInventorySeed();
  const product = data.products[0];
  const location = data.locations[0];
  const beforeOperations = data.operations.length;
  applyInventoryCommand(
    data,
    {
      action: "stock.import",
      rows: [
        {
          productId: product.id,
          locationId: location.id,
          onHand: 300,
          unitCost: product.averageCost,
        },
      ],
    },
    "QA",
  );
  assert.equal(productStock(data, product.id, location.id).onHand, 300);
  assert.equal(data.operations.length, beforeOperations + 1);
  assert.equal(data.operations[0].status, "posted");
  assert.equal(data.operations[0].reason, "Bulk inventory import");
  assert.equal(data.movements[0].after, 300);
});
test("access roles choose landing page and block writes/core access", () => {
  const user: SessionUser = {
    id: "test",
    username: "test",
    email: "test@example.com",
    name: "Test",
    role: "inventory-viewer",
    active: true,
    createdAt: "",
  };
  assert.equal(canAccess(user, "core"), false);
  assert.equal(canAccess(user, "inventory"), true);
  assert.equal(canManageInventory(user), false);
  assert.equal(landingPath(user), "/product-inventory");
  assert.equal(
    canManageInventory({ ...user, role: "inventory-manager" }),
    true,
  );
  assert.equal(landingPath({ ...user, role: "admin" }), "/core-setup");
  assert.equal(canAccess({ ...user, active: false }, "inventory"), false);
});
