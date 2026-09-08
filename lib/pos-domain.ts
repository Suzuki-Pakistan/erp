import { randomUUID } from "node:crypto";
import type { InventoryData } from "@/types/inventory";
import { availableStock } from "@/types/inventory";
import { canAccess, canManagePos, type SessionUser } from "@/types/auth";
import {
  createPosSeed,
  type PosData,
  type Sale,
  type PosSnapshot,
  type Shift,
} from "@/types/pos";
import type { PosCommand } from "./pos-schema";
import {
  cents,
  quoteCart,
  returnAmount,
  returnedQuantity,
  shiftTotals,
  tierPrice,
} from "./pos-calculations";

function migratePosData(pos: PosData) {
  if ((pos.version ?? 1) < 2) {
    pos.settings.taxBps = 825;
    pos.settings.taxConfigured = true;
    pos.customers.forEach((customer) => {
      customer.marketingOptIn = false;
      customer.preferredContact = "none";
    });
  }
  if ((pos.version ?? 1) < 3) {
    pos.discounts = createPosSeed().discounts;
  }
  pos.version = 3;
  pos.discounts ??= createPosSeed().discounts;
  pos.shifts.forEach((shift) => (shift.drawerEvents ??= []));
  return pos;
}

export function posSnapshot(
  data: InventoryData,
  user: SessionUser,
): PosSnapshot {
  const pos = migratePosData(structuredClone(data.pos ?? createPosSeed()));
  if (!canManagePos(user)) {
    pos.sales = pos.sales.filter((s) => s.actorId === user.id);
    pos.returns = pos.returns.filter((r) =>
      pos.sales.some((s) => s.id === r.saleId),
    );
    pos.shifts = pos.shifts.filter((s) => s.actorId === user.id);
    pos.held = pos.held.filter((h) => h.actorId === user.id);
  }
  // Costs remain in the inventory ledger, never in POS responses.
  return {
    pos,
    catalog: {
      products: data.products.map((p) => ({
        ...p,
        averageCost: 0,
        lastCost: 0,
        lowestPrice: 0,
        supplier: "",
        supplierCode: "",
        notes: "",
      })),
      categories: data.categories,
      brands: data.brands,
      locations: data.locations.filter((l) => l.type === "retail"),
      balances: data.balances,
    },
  };
}
function ownOpenShift(pos: PosData, id: string, user: SessionUser): Shift {
  const shift = pos.shifts.find((s) => s.id === id && s.actorId === user.id);
  if (!shift || shift.closedAt)
    throw new Error(
      "Open your own cashier shift before continuing. Queued sales require their original shift to remain open.",
    );
  return shift;
}
function manager(user: SessionUser) {
  if (!canManagePos(user))
    throw new Error("A POS manager or administrator must perform this action.");
}
function uniqueLines(lines: { productId: string }[]) {
  if (new Set(lines.map((l) => l.productId)).size !== lines.length)
    throw new Error("Combine duplicate products into one line.");
}
function customerCredit(
  pos: PosData,
  customerId: string,
  amountCents: number,
  reference: string,
  user: SessionUser,
  now: string,
) {
  const customer = pos.customers.find((c) => c.id === customerId);
  if (!customer) throw new Error("Select a customer account for store credit.");
  if (customer.creditCents + amountCents < 0)
    throw new Error("The customer has insufficient store credit.");
  customer.creditCents += amountCents;
  pos.credits.unshift({
    id: randomUUID(),
    customerId,
    amountCents,
    reference,
    balanceCents: customer.creditCents,
    actor: user.name,
    createdAt: now,
  });
}
function execute(data: InventoryData, command: PosCommand, user: SessionUser) {
  if (!canAccess(user, "pos"))
    throw new Error("Retail POS access is required.");
  const pos = migratePosData((data.pos ??= createPosSeed()));
  const now = new Date().toISOString();
  switch (command.action) {
    case "settings.save":
      manager(user);
      pos.settings = {
        taxBps: command.taxBps,
        taxConfigured: true,
        receiptNote: command.receiptNote,
      };
      return { message: "Checkout configuration saved" };
    case "discount.save": {
      manager(user);
      const code = command.code.toUpperCase();
      const duplicate = pos.discounts.find(
        (discount) =>
          discount.id !== command.id && discount.code.toUpperCase() === code,
      );
      if (duplicate) throw new Error("That discount code is already in use.");
      const existing = pos.discounts.find(
        (discount) => discount.id === command.id,
      );
      if (command.id && !existing) throw new Error("Discount not found.");
      const record = {
        id: existing?.id ?? randomUUID(),
        name: command.name,
        code,
        type: command.type,
        valueBps:
          command.type === "buy-one-get-one" ? 10000 : command.valueBps,
        active: command.active,
        createdAt: existing?.createdAt ?? now,
      };
      if (existing) Object.assign(existing, record);
      else pos.discounts.unshift(record);
      return {
        message: existing ? "Discount updated" : "Discount created",
        id: record.id,
      };
    }
    case "discount.toggle": {
      manager(user);
      const discount = pos.discounts.find((item) => item.id === command.id);
      if (!discount) throw new Error("Discount not found.");
      discount.active = command.active;
      return {
        message: command.active ? "Discount activated" : "Discount paused",
      };
    }
    case "customer.save": {
      const existing = pos.customers.find((c) => c.id === command.id);
      if (command.id && !existing) throw new Error("Customer not found.");
      if (
        command.marketingOptIn &&
        (command.preferredContact === "none" ||
          (["email", "both"].includes(command.preferredContact) &&
            !command.email) ||
          (["sms", "both"].includes(command.preferredContact) &&
            !command.phone))
      )
        throw new Error(
          "Add the selected contact details before enabling promotion alerts.",
        );
      if (
        command.email &&
        pos.customers.some(
          (c) =>
            c.id !== command.id &&
            c.email.toLowerCase() === command.email.toLowerCase(),
        )
      )
        throw new Error("This email already belongs to a customer.");
      const customer = {
        ...command,
        id: existing?.id ?? randomUUID(),
        creditCents: existing?.creditCents ?? 0,
        marketingOptIn: command.marketingOptIn,
        preferredContact: command.marketingOptIn
          ? command.preferredContact
          : ("none" as const),
        createdAt: existing?.createdAt ?? now,
      };
      const { action: _action, ...record } = customer;
      void _action;
      if (existing) Object.assign(existing, record);
      else pos.customers.unshift(record);
      return { message: "Customer saved", id: record.id };
    }
    case "shift.open": {
      if (
        !data.locations.some(
          (l) => l.id === command.locationId && l.type === "retail",
        )
      )
        throw new Error("Select a retail location.");
      if (
        pos.shifts.some(
          (s) =>
            !s.closedAt &&
            (s.actorId === user.id ||
              (s.locationId === command.locationId &&
                s.register.toLowerCase() === command.register.toLowerCase())),
        )
      )
        throw new Error("You or this register already have an open shift.");
      const id = randomUUID();
      pos.shifts.unshift({
        id,
        actorId: user.id,
        actor: user.name,
        locationId: command.locationId,
        register: command.register,
        openingCents: command.openingCents,
        openedAt: now,
        cashEntries: [],
        drawerEvents: [],
      });
      return { message: "Shift opened. Your register is ready.", id };
    }
    case "shift.cash": {
      const shift = ownOpenShift(pos, command.shiftId, user);
      if (shiftTotals(pos, shift).expected + command.amountCents < 0)
        throw new Error("The drawer does not contain enough recorded cash.");
      shift.cashEntries.unshift({
        id: randomUUID(),
        amountCents: command.amountCents,
        reason: command.reason,
        createdAt: now,
        actor: user.name,
      });
      return { message: "Cash movement recorded" };
    }
    case "shift.drawer": {
      const shift = ownOpenShift(pos, command.shiftId, user);
      shift.drawerEvents.unshift({
        id: randomUUID(),
        reason: command.reason,
        createdAt: now,
        actor: user.name,
      });
      return { message: "Drawer opened and added to the shift audit" };
    }
    case "shift.close": {
      const shift = ownOpenShift(pos, command.shiftId, user);
      const expected = shiftTotals(pos, shift).expected;
      const variance = command.countedCents - expected;
      if (variance && command.note.trim().length < 3)
        throw new Error("Explain the cash variance before closing this shift.");
      Object.assign(shift, {
        closedAt: now,
        countedCents: command.countedCents,
        expectedCents: expected,
        varianceCents: variance,
        closingNote: command.note,
      });
      return { message: "Shift closed and reconciliation saved" };
    }
    case "cart.hold": {
      uniqueLines(command.lines);
      if (
        !data.locations.some(
          (l) => l.id === command.locationId && l.type === "retail",
        )
      )
        throw new Error("Select a retail location.");
      if (
        command.lines.some(
          (l) =>
            !data.products.some(
              (p) => p.id === l.productId && p.status === "active",
            ),
        )
      )
        throw new Error("The cart contains an unavailable product.");
      if (pos.held.filter((h) => h.actorId === user.id).length >= 30)
        throw new Error(
          "Recall or discard a held cart before holding another.",
        );
      pos.held.unshift({
        id: randomUUID(),
        actorId: user.id,
        createdAt: now,
        label: command.label,
        locationId: command.locationId,
        customerId: command.customerId,
        tier: command.tier,
        promotion: command.promotion,
        note: command.note,
        lines: command.lines,
      });
      return { message: "Cart held. Stock is not reserved." };
    }
    case "cart.discard": {
      const held = pos.held.find((h) => h.id === command.id);
      if (!held || (held.actorId !== user.id && !canManagePos(user)))
        throw new Error("Held cart not available.");
      pos.held = pos.held.filter((h) => h.id !== command.id);
      return { message: "Held cart removed" };
    }
    case "sale.checkout": {
      const previous = pos.sales.find((s) => s.requestId === command.requestId);
      if (previous) {
        if (previous.actorId !== user.id)
          throw new Error("This checkout reference is already in use.");
        return {
          message:
            "Sale already recorded; no duplicate payment or stock movement",
          id: previous.id,
        };
      }
      const shift = ownOpenShift(pos, command.shiftId, user);
      const discount =
        command.promotion === "none"
          ? undefined
          : pos.discounts.find((item) => item.id === command.promotion);
      const legacyPromotion = command.promotion === "buy-one-second-half";
      if (
        command.promotion !== "none" &&
        !legacyPromotion &&
        (!discount || !discount.active)
      )
        throw new Error(
          "This discount is no longer active. Remove it and review the total.",
        );
      if (!pos.settings.taxConfigured)
        throw new Error(
          "A manager must confirm the checkout tax configuration first.",
        );
      if (command.taxBps !== pos.settings.taxBps)
        throw new Error(
          "Tax configuration changed. Refresh and review the total before payment.",
        );
      if (
        command.promotion !== "none" &&
        (command.tier !== "retail" ||
          command.lines.some((line) => line.discountBps > 0))
      )
        throw new Error(
          "Promotion uses retail prices and cannot be combined with manual discounts.",
        );
      if (
        user.role === "cashier" &&
        (command.tier !== "retail" ||
          command.lines.some((l) => l.discountBps > 1000))
      )
        throw new Error(
          "Cashiers can use retail prices with discounts up to 10%.",
        );
      if (
        command.customerId &&
        !pos.customers.some((c) => c.id === command.customerId)
      )
        throw new Error("Customer account no longer exists.");
      if (
        command.heldId &&
        !pos.held.some((h) => h.id === command.heldId && h.actorId === user.id)
      )
        throw new Error(
          "This held cart was already sold or removed. Refresh before continuing.",
        );
      uniqueLines(command.lines);
      for (const line of command.lines) {
        const product = data.products.find((p) => p.id === line.productId);
        if (!product || product.status !== "active")
          throw new Error("Only active products can be sold.");
        if (tierPrice(product, command.tier) !== line.unitPriceCents)
          throw new Error(
            product.name + ": price changed. Refresh and re-add the item.",
          );
        const gross = line.unitPriceCents * line.quantity;
        const net = gross - Math.round((gross * line.discountBps) / 10000);
        if (net < cents(product.lowestPrice) * line.quantity)
          throw new Error(
            product.name + ": discount exceeds the minimum selling price.",
          );
        const balance = data.balances.find(
          (b) =>
            b.productId === line.productId && b.locationId === shift.locationId,
        );
        if (
          product.trackInventory &&
          (!balance || availableStock(balance) < line.quantity)
        )
          throw new Error(
            product.name + ": insufficient available stock at this store.",
          );
      }
      const quote = quoteCart(
        command.lines,
        data.products,
        pos.settings.taxBps,
        discount ?? command.promotion,
      );
      for (const line of quote.lines) {
        const product = data.products.find((p) => p.id === line.productId)!;
        if (
          line.subtotalCents - line.discountCents <
          cents(product.lowestPrice) * line.quantity
        )
          throw new Error(
            product.name + ": promotion exceeds the minimum selling price.",
          );
      }
      if (
        quote.totalCents <= 0 ||
        quote.totalCents !== command.expectedTotalCents
      )
        throw new Error(
          "The checkout total changed. Review the cart and payments.",
        );
      if (
        new Set(command.tenders.map((t) => t.method)).size !==
        command.tenders.length
      )
        throw new Error("Use one entry for each payment method.");
      const cash =
        command.tenders.find((t) => t.method === "cash")?.amountCents ?? 0;
      const noncash = command.tenders
        .filter((t) => t.method !== "cash")
        .reduce((n, t) => n + t.amountCents, 0);
      if (noncash > quote.totalCents || noncash + cash < quote.totalCents)
        throw new Error(
          "Payments must cover the total; only cash may exceed the balance.",
        );
      if (
        command.tenders.some(
          (t) => t.method === "external" && t.reference.length < 3,
        )
      )
        throw new Error(
          "Enter the approval reference from your card payment terminal.",
        );
      const changeCents = cash + noncash - quote.totalCents;
      const reference = "POS-" + String(pos.sales.length + 1).padStart(6, "0");
      const credit =
        command.tenders.find((t) => t.method === "credit")?.amountCents ?? 0;
      if (credit)
        customerCredit(pos, command.customerId, -credit, reference, user, now);
      const sale: Sale = {
        id: randomUUID(),
        requestId: command.requestId,
        reference,
        createdAt: now,
        actorId: user.id,
        actor: user.name,
        shiftId: shift.id,
        locationId: shift.locationId,
        locationName: data.locations.find((l) => l.id === shift.locationId)!
          .name,
        customerId: command.customerId,
        customerName:
          pos.customers.find((c) => c.id === command.customerId)?.name ??
          "Walk-in customer",
        tier: command.tier,
        promotion: command.promotion,
        promotionName:
          discount?.name ??
          (legacyPromotion ? "Buy 1, second item 50% off" : undefined),
        note: command.note,
        taxBps: pos.settings.taxBps,
        receiptNote: pos.settings.receiptNote,
        ...quote,
        tenders: command.tenders,
        changeCents,
      };
      for (const line of sale.lines) {
        if (!line.tracked) continue;
        const balance = data.balances.find(
          (b) =>
            b.productId === line.productId && b.locationId === shift.locationId,
        )!;
        const product = data.products.find((p) => p.id === line.productId)!;
        const before = balance.onHand;
        balance.onHand -= line.quantity;
        data.movements.unshift({
          id: randomUUID(),
          operationId: sale.id,
          reference,
          productId: line.productId,
          locationId: shift.locationId,
          type: "sale",
          quantity: -line.quantity,
          before,
          after: balance.onHand,
          unitCost: product.averageCost,
          actor: user.name,
          date: now,
          note: "Retail POS checkout",
        });
        product.updatedAt = now;
      }
      pos.sales.unshift(sale);
      if (command.heldId)
        pos.held = pos.held.filter((h) => h.id !== command.heldId);
      return { message: "Sale recorded and stock updated", id: sale.id };
    }
    case "sale.return": {
      manager(user);
      const previous = pos.returns.find(
        (r) => r.requestId === command.requestId,
      );
      if (previous) {
        if (previous.actorId !== user.id)
          throw new Error("Return reference already in use.");
        return { message: "Return already recorded", id: previous.id };
      }
      const shift = ownOpenShift(pos, command.shiftId, user);
      const sale = pos.sales.find((s) => s.id === command.saleId);
      if (!sale || sale.locationId !== shift.locationId)
        throw new Error(
          "Open a shift at the original sale's store to process this return.",
        );
      uniqueLines(command.lines);
      const lines = command.lines.map((line) => {
        const original = sale.lines.find((l) => l.productId === line.productId);
        const already = returnedQuantity(pos, sale.id, line.productId);
        if (!original || already + line.quantity > original.quantity)
          throw new Error(
            "Return quantities exceed the remaining items on this receipt.",
          );
        const product = data.products.find((p) => p.id === line.productId);
        if (
          line.restock &&
          (!original.tracked ||
            !product?.trackInventory ||
            product.status !== "active")
        )
          throw new Error(
            "Only active, stock-tracked items can be restocked. Choose no restock for services or discontinued items.",
          );
        return {
          ...line,
          amountCents: returnAmount(original, already, line.quantity),
        };
      });
      const totalCents = lines.reduce((n, l) => n + l.amountCents, 0);
      if (totalCents <= 0)
        throw new Error("The selected return has no refundable value.");
      const reference =
        "CRN-" + String(pos.returns.length + 1).padStart(6, "0");
      if (command.method === "credit")
        customerCredit(pos, sale.customerId, totalCents, reference, user, now);
      else {
        const originalTender =
          sale.tenders
            .filter((t) => t.method === command.method)
            .reduce((n, t) => n + t.amountCents, 0) -
          (command.method === "cash" ? sale.changeCents : 0);
        const refunded = pos.returns
          .filter((r) => r.saleId === sale.id && r.method === command.method)
          .reduce((n, r) => n + r.totalCents, 0);
        if (totalCents > originalTender - refunded)
          throw new Error(
            "This refund exceeds the remaining original payment for that method. Use store credit for an attached customer, or return fewer items.",
          );
        if (
          command.method === "cash" &&
          shiftTotals(pos, shift).expected < totalCents
        )
          throw new Error("Insufficient recorded cash in this drawer.");
        if (
          command.method === "external" &&
          command.paymentReference.length < 3
        )
          throw new Error(
            "Enter the refund confirmation from the card payment provider.",
          );
      }
      const id = randomUUID();
      for (const line of lines) {
        if (!line.restock) continue;
        const product = data.products.find((p) => p.id === line.productId)!;
        let balance = data.balances.find(
          (b) =>
            b.productId === line.productId && b.locationId === shift.locationId,
        );
        if (!balance) {
          balance = {
            productId: line.productId,
            locationId: shift.locationId,
            onHand: 0,
            committed: 0,
            held: 0,
            onOrder: 0,
          };
          data.balances.push(balance);
        }
        const cost =
          data.movements.find(
            (m) =>
              m.operationId === sale.id &&
              m.productId === line.productId &&
              m.type === "sale",
          )?.unitCost ?? product.averageCost;
        const totalBefore = data.balances
          .filter((b) => b.productId === product.id)
          .reduce((n, b) => n + b.onHand, 0);
        product.averageCost =
          Math.round(
            ((totalBefore * product.averageCost + line.quantity * cost) /
              (totalBefore + line.quantity)) *
              10000,
          ) / 10000;
        const before = balance.onHand;
        balance.onHand += line.quantity;
        product.updatedAt = now;
        data.movements.unshift({
          id: randomUUID(),
          operationId: id,
          reference,
          productId: line.productId,
          locationId: shift.locationId,
          type: "return",
          quantity: line.quantity,
          before,
          after: balance.onHand,
          unitCost: cost,
          actor: user.name,
          date: now,
          note: command.reason,
        });
      }
      pos.returns.unshift({
        id,
        requestId: command.requestId,
        reference,
        saleId: sale.id,
        shiftId: shift.id,
        actorId: user.id,
        actor: user.name,
        createdAt: now,
        reason: command.reason,
        method: command.method,
        paymentReference: command.paymentReference,
        lines,
        totalCents,
      });
      return { message: "Return recorded and credit note issued", id };
    }
  }
}

export function applyPosCommand(
  data: InventoryData,
  command: PosCommand,
  user: SessionUser,
) {
  const next = structuredClone(data);
  const result = execute(next, command, user);
  Object.assign(data, next);
  return result;
}
