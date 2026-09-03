import { randomUUID } from "node:crypto";
import type {
  InventoryData,
  ProductInput,
  StockOperation,
  StockBalance,
} from "@/types/inventory";
import { availableStock } from "@/types/inventory";
import type { InventoryCommand } from "./inventory-schema";

function validateProduct(data: InventoryData, input: ProductInput) {
  if (
    (!input.trackInventory || input.status === "discontinued") &&
    data.balances.some(
      (b) =>
        b.productId === input.id &&
        (b.onHand > 0 || b.committed > 0 || b.held > 0 || b.onOrder > 0),
    )
  ) {
    throw new Error(
      "Reconcile stock and outstanding quantities before discontinuing this product or disabling stock tracking.",
    );
  }
  if (
    !data.categories.some((c) => c.id === input.categoryId) ||
    !data.brands.some((b) => b.id === input.brandId)
  )
    throw new Error("Choose an existing category and brand.");
  if (
    data.products.some(
      (p) =>
        p.id !== input.id && p.sku.toLowerCase() === input.sku.toLowerCase(),
    )
  )
    throw new Error("This SKU is already in use.");
  if (
    input.barcode &&
    data.products.some((p) => p.id !== input.id && p.barcode === input.barcode)
  )
    throw new Error("This barcode is already assigned to another product.");
  if (input.maximumStock < input.minimumStock)
    throw new Error(
      "Maximum stock must be greater than or equal to minimum stock.",
    );
  if (input.retailPrice > 0 && input.lowestPrice > input.retailPrice)
    throw new Error("The lowest selling price cannot exceed the retail price.");
}

function balanceFor(
  data: InventoryData,
  productId: string,
  locationId: string,
): StockBalance {
  let balance = data.balances.find(
    (b) => b.productId === productId && b.locationId === locationId,
  );
  if (!balance) {
    balance = {
      productId,
      locationId,
      onHand: 0,
      committed: 0,
      held: 0,
      onOrder: 0,
    };
    data.balances.push(balance);
  }
  return balance;
}

function postOperation(
  data: InventoryData,
  operation: StockOperation,
  actor: string,
) {
  if (operation.status !== "draft")
    throw new Error("Only a draft operation can be posted.");
  if (!data.locations.some((l) => l.id === operation.locationId))
    throw new Error("Select a valid source location.");
  if (
    operation.type === "transfer" &&
    (operation.destinationId === operation.locationId ||
      !data.locations.some((l) => l.id === operation.destinationId))
  )
    throw new Error("Choose a different destination location.");
  if (
    new Set(operation.lines.map((l) => l.productId)).size !==
    operation.lines.length
  )
    throw new Error("Each product can appear only once per operation.");
  if (operation.type === "receipt" && !operation.supplier.trim())
    throw new Error("A supplier is required for receiving.");
  if (
    (operation.type === "adjustment" || operation.type === "count") &&
    !operation.reason.trim()
  )
    throw new Error("A reason is required for inventory reconciliation.");
  for (const line of operation.lines) {
    const product = data.products.find((p) => p.id === line.productId);
    if (!product || !product.trackInventory || product.status !== "active")
      throw new Error(
        "Choose active, stock-tracked products for this operation.",
      );
    if (
      (operation.type === "receipt" || operation.type === "transfer") &&
      line.quantity <= 0
    )
      throw new Error(
        "Receipt and transfer quantities must be greater than zero.",
      );
    if (operation.type === "count" && line.quantity < 0)
      throw new Error("Counted quantities cannot be negative.");
    if (operation.type === "adjustment" && line.quantity === 0)
      throw new Error("An adjustment must change the quantity.");
    const balance = balanceFor(data, line.productId, operation.locationId);
    const delta =
      operation.type === "transfer"
        ? -line.quantity
        : operation.type === "count"
          ? line.quantity - balance.onHand
          : line.quantity;
    if (balance.onHand + delta < balance.committed + balance.held)
      throw new Error(
        product.name +
          ": this would reduce stock below committed or held quantities.",
      );
    if (
      operation.type === "transfer" &&
      line.quantity > availableStock(balance)
    )
      throw new Error(product.name + ": insufficient available stock.");
  }
  const now = new Date().toISOString();
  for (const line of operation.lines) {
    const product = data.products.find((p) => p.id === line.productId)!;
    const balance = balanceFor(data, line.productId, operation.locationId);
    const delta =
      operation.type === "transfer"
        ? -line.quantity
        : operation.type === "count"
          ? line.quantity - balance.onHand
          : line.quantity;
    const totalBefore = data.balances
      .filter((b) => b.productId === product.id)
      .reduce((sum, b) => sum + b.onHand, 0);
    const before = balance.onHand;
    balance.onHand += delta;
    if (operation.type === "receipt") {
      balance.onOrder = Math.max(0, balance.onOrder - line.quantity);
      product.averageCost =
        Math.round(
          ((totalBefore * product.averageCost + line.quantity * line.unitCost) /
            (totalBefore + line.quantity)) *
            10000,
        ) / 10000;
      product.lastCost = line.unitCost;
    }
    data.movements.unshift({
      id: randomUUID(),
      operationId: operation.id,
      reference: operation.reference,
      productId: product.id,
      locationId: operation.locationId,
      type: operation.type === "transfer" ? "transfer-out" : operation.type,
      quantity: delta,
      before,
      after: balance.onHand,
      unitCost: line.unitCost,
      actor,
      date: now,
      note: operation.reason || operation.memo,
    });
    if (operation.type === "transfer") {
      const destination = balanceFor(data, product.id, operation.destinationId);
      const destinationBefore = destination.onHand;
      destination.onHand += line.quantity;
      data.movements.unshift({
        id: randomUUID(),
        operationId: operation.id,
        reference: operation.reference,
        productId: product.id,
        locationId: operation.destinationId,
        type: "transfer-in",
        quantity: line.quantity,
        before: destinationBefore,
        after: destination.onHand,
        unitCost: line.unitCost,
        actor,
        date: now,
        note: operation.memo,
      });
    }
    product.updatedAt = now;
  }
  operation.status = "posted";
  operation.postedAt = now;
  operation.actor = actor;
}

export function applyInventoryCommand(
  data: InventoryData,
  command: InventoryCommand,
  actor: string,
): string {
  const now = new Date().toISOString();
  switch (command.action) {
    case "product.save": {
      validateProduct(data, command.product);
      const existing = data.products.find((p) => p.id === command.product.id);
      if (command.product.id && !existing)
        throw new Error("Product not found.");
      const product = {
        ...command.product,
        id: existing?.id ?? randomUUID(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      if (existing)
        data.products = data.products.map((p) =>
          p.id === existing.id ? product : p,
        );
      else data.products.unshift(product);
      return existing ? "Product updated" : "Product created";
    }
    case "product.duplicate": {
      const source = data.products.find((p) => p.id === command.id);
      if (!source) throw new Error("Product not found.");
      let sku = source.sku + "-COPY";
      let suffix = 2;
      while (data.products.some((p) => p.sku === sku))
        sku = source.sku + "-COPY-" + suffix++;
      data.products.unshift({
        ...source,
        id: randomUUID(),
        sku,
        barcode: "",
        name: source.name + " Copy",
        status: "draft",
        createdAt: now,
        updatedAt: now,
      });
      return "Product duplicated as a draft";
    }
    case "product.archive": {
      const product = data.products.find((p) => p.id === command.id);
      if (!product) throw new Error("Product not found.");
      if (
        data.balances.some(
          (b) =>
            b.productId === product.id &&
            (b.onHand || b.committed || b.held || b.onOrder),
        )
      )
        throw new Error(
          "Clear all stock, reservations and orders before discontinuing this product.",
        );
      product.status = "discontinued";
      product.updatedAt = now;
      return "Product discontinued";
    }
    case "products.import": {
      for (const product of command.products) {
        const existing = data.products.find(
          (p) => p.sku.toLowerCase() === product.sku.toLowerCase(),
        );
        const input = { ...product, id: existing?.id };
        validateProduct(data, input);
        const next = {
          ...input,
          id: existing?.id ?? randomUUID(),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        if (existing)
          data.products = data.products.map((p) =>
            p.id === existing.id ? next : p,
          );
        else data.products.push(next);
      }
      return command.products.length + " products imported";
    }
    case "taxonomy.save": {
      const collection = data[command.kind];
      if (
        collection.some(
          (item) =>
            item.id !== command.item.id &&
            (item.code.toLowerCase() === command.item.code.toLowerCase() ||
              item.name.toLowerCase() === command.item.name.toLowerCase()),
        )
      )
        throw new Error("That name or code is already in use.");
      const item = { ...command.item, id: command.item.id ?? randomUUID() };
      if (command.item.id && !collection.some((i) => i.id === item.id))
        throw new Error("Record not found.");
      data[command.kind] = command.item.id
        ? collection.map((i) => (i.id === item.id ? item : i))
        : [...collection, item];
      return command.kind === "brands" ? "Brand saved" : "Category saved";
    }
    case "taxonomy.delete": {
      const key = command.kind === "brands" ? "brandId" : "categoryId";
      if (data.products.some((p) => p[key] === command.id))
        throw new Error("Move assigned products before deleting this record.");
      data[command.kind] = data[command.kind].filter(
        (i) => i.id !== command.id,
      );
      return "Record deleted";
    }
    case "operation.save": {
      if (
        command.operation.type === "receipt" &&
        command.operation.discount >
          command.operation.lines.reduce(
            (sum, line) => sum + line.quantity * line.unitCost,
            0,
          ) +
            command.operation.freight
      ) {
        throw new Error("The discount cannot exceed the receipt total.");
      }
      const existing = data.operations.find(
        (o) => o.id === command.operation.id,
      );
      if (command.operation.id && !existing)
        throw new Error("Operation not found.");
      if (existing && existing.type !== command.operation.type)
        throw new Error(
          "An operation's type cannot be changed after creation.",
        );
      if (existing && existing.status !== "draft")
        throw new Error("Posted or cancelled operations cannot be edited.");
      const prefix = {
        receipt: "RCV",
        transfer: "TRF",
        adjustment: "ADJ",
        count: "CNT",
      }[command.operation.type];
      const { postNow, ...input } = command.operation;
      const operation: StockOperation = {
        ...input,
        id: existing?.id ?? randomUUID(),
        reference:
          existing?.reference ??
          prefix + "-" + String(data.operations.length + 1001),
        status: "draft",
        actor,
        createdAt: existing?.createdAt ?? now,
      };
      if (postNow) postOperation(data, operation, actor);
      data.operations = existing
        ? data.operations.map((o) => (o.id === existing.id ? operation : o))
        : [operation, ...data.operations];
      return postNow ? "Stock operation posted" : "Draft saved";
    }
    case "operation.post": {
      const operation = data.operations.find((o) => o.id === command.id);
      if (!operation) throw new Error("Operation not found.");
      postOperation(data, operation, actor);
      return "Stock operation posted";
    }
    case "operation.cancel": {
      const operation = data.operations.find((o) => o.id === command.id);
      if (!operation || operation.status !== "draft")
        throw new Error("Only draft operations can be cancelled.");
      operation.status = "cancelled";
      return "Draft cancelled";
    }
  }
}
