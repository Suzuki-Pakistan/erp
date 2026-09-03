import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { once } from "node:events";
import { randomUUID } from "node:crypto";

// Runs against its own production server and disposable data, never the workspace's .data.
const directory = await mkdtemp(path.join(tmpdir(), "flair-api-test-"));
const base = "http://127.0.0.1:3107";
const password = "QA-only-password-9341";
let server;
let serverOutput = "";
let checks = 0;
function check(condition, message) {
  assert.ok(condition, message);
  checks++;
  console.log("PASS " + message);
}
function start() {
  serverOutput = "";
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3107",
    ],
    {
      cwd: process.cwd(),
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: "production",
        FLAIR_DATA_DIR: directory,
        FLAIR_ADMIN_PASSWORD: password,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });
}
async function ready() {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null)
      throw new Error("Test server exited: " + serverOutput);
    try {
      if (
        serverOutput.includes("Ready in") &&
        (await fetch(base + "/login")).ok
      )
        return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Test server did not start.");
}
async function stop() {
  if (server && server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill();
    await stopped;
  }
}
async function request(route, { cookie, body, method, origin = base } = {}) {
  return fetch(base + route, {
    method: method ?? (body ? "POST" : "GET"),
    redirect: "manual",
    headers: {
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
async function login(identifier) {
  const response = await request("/api/auth/login", {
    body: { identifier, password },
  });
  assert.equal(response.status, 200, await response.clone().text());
  return {
    cookie: response.headers.get("set-cookie").split(";")[0],
    header: response.headers.get("set-cookie"),
    data: await response.json(),
  };
}
async function redirectsTo(response, destination) {
  if ([303, 307, 308].includes(response.status)) {
    return response.headers.get("location") === destination;
  }
  // A shared layout may start streaming before a nested authorization guard
  // redirects. Next.js then emits a refresh tag or an RSC redirect instruction
  // (when the shared client shell defers its children) instead of a header.
  if (response.status !== 200) return false;
  const html = await response.text();
  const tag = html.match(/<meta\b[^>]*id="__next-page-redirect"[^>]*>/)?.[0];
  const metaRedirect =
    !!tag &&
    tag.includes('http-equiv="refresh"') &&
    tag.match(/content="\d+;url=([^"]+)"/)?.[1] === destination;
  const streamedRedirect = html.includes(
    `NEXT_REDIRECT;replace;${destination};307;`,
  );
  return metaRedirect || streamedRedirect;
}
try {
  start();
  await ready();
  check(
    (await request("/api/inventory")).status === 401,
    "anonymous inventory API is blocked",
  );
  const anonymousPage = await request("/core-setup");
  check(
    anonymousPage.headers.get("location") === "/login",
    "anonymous page redirects to login",
  );
  const wrong = await request("/api/auth/login", {
    body: { identifier: "admin", password: "wrong" },
  });
  assert.equal(wrong.status, 401, await wrong.text());
  check(true, "invalid credentials are rejected");
  const admin = await login("admin");
  check(
    admin.data.redirectTo === "/core-setup",
    "admin login lands on Core Setup",
  );
  check(
    /HttpOnly/i.test(admin.header) &&
      /Secure/i.test(admin.header) &&
      /SameSite=lax/i.test(admin.header),
    "production session cookie is HttpOnly, Secure and SameSite=Lax",
  );
  check(
    (await login("admin@admin.com")).data.user.username === "admin",
    "email sign-in works",
  );
  check(
    (
      await request("/api/inventory", {
        cookie: admin.cookie,
        origin: "https://other.example",
        body: { action: "product.archive", id: "invalid" },
      })
    ).status === 403,
    "cross-origin mutation is rejected",
  );
  const viewerBody = {
    username: "qa-viewer",
    name: "QA Viewer",
    email: "viewer@example.test",
    role: "inventory-viewer",
    active: true,
    password,
  };
  const viewerResponse = await request("/api/auth/accounts", {
    cookie: admin.cookie,
    body: viewerBody,
  });
  check(viewerResponse.ok, "administrator can create a login account");
  const viewerAccount = (await viewerResponse.json()).account;
  const viewer = await login("qa-viewer");
  check(
    viewer.data.redirectTo === "/product-inventory",
    "inventory account gets access-aware landing page",
  );
  check(
    await redirectsTo(
      await request("/core-setup/permissions", { cookie: viewer.cookie }),
      "/product-inventory",
    ),
    "viewer cannot enter Core Setup",
  );
  check(
    (await request("/api/auth/accounts", { cookie: viewer.cookie })).status ===
      403,
    "viewer cannot read login accounts",
  );
  check(
    (
      await request("/api/inventory", {
        cookie: viewer.cookie,
        body: { action: "product.archive", id: "invalid" },
      })
    ).status === 403,
    "viewer mutations are rejected by the server",
  );
  const redacted = (
    await (await request("/api/inventory", { cookie: viewer.cookie })).json()
  ).data;
  check(
    redacted.products.every(
      (p) => p.averageCost === 0 && p.lastCost === 0 && p.lowestPrice === 0,
    ) && redacted.movements.every((m) => m.unitCost === 0),
    "costs are removed from viewer API responses",
  );
  const data = (
    await (await request("/api/inventory", { cookie: admin.cookie })).json()
  ).data;
  const source = data.products[0];
  const managerBody = {
    username: "qa-manager",
    name: "QA Manager",
    email: "manager@example.test",
    role: "inventory-manager",
    active: true,
    password,
  };
  check(
    (
      await request("/api/auth/accounts", {
        cookie: admin.cookie,
        body: managerBody,
      })
    ).ok,
    "administrator can create an inventory manager",
  );
  const manager = await login("qa-manager");
  check(
    (
      await request("/api/inventory", {
        cookie: manager.cookie,
        body: {
          action: "product.save",
          product: { ...source, notes: "Isolated manager edit" },
        },
      })
    ).ok,
    "inventory manager can edit products",
  );
  check(
    (
      await request("/api/auth/accounts", {
        cookie: manager.cookie,
        body: viewerBody,
      })
    ).status === 403,
    "inventory manager cannot grant login access",
  );
  const product = {
    ...source,
    id: undefined,
    sku: "QA-NEW",
    barcode: "QA-123456",
    name: "QA isolated product",
  };
  check(
    (
      await request("/api/inventory", {
        cookie: admin.cookie,
        body: { action: "product.save", product },
      })
    ).ok,
    "product creation works through API",
  );
  const duplicate = await request("/api/inventory", {
    cookie: admin.cookie,
    body: { action: "product.save", product },
  });
  check(duplicate.status === 400, "duplicate SKU is rejected through API");
  const before = (
    await (await request("/api/inventory", { cookie: admin.cookie })).json()
  ).data;
  const badImport = await request("/api/inventory", {
    cookie: admin.cookie,
    body: {
      action: "products.import",
      products: [
        { ...product, sku: "QA-ATOMIC", barcode: "QA-ATOMIC" },
        { ...product, sku: "QA-INVALID", barcode: source.barcode },
      ],
    },
  });
  const afterImport = (
    await (await request("/api/inventory", { cookie: admin.cookie })).json()
  ).data;
  check(
    badImport.status === 400 &&
      !afterImport.products.some((p) => p.sku === "QA-ATOMIC") &&
      afterImport.products.length === before.products.length,
    "invalid CSV batch is rolled back atomically",
  );
  const balance = data.balances.find(
    (b) => b.productId === source.id && b.locationId === data.locations[0].id,
  );
  const quantity = Math.floor(
    (balance.onHand - balance.committed - balance.held) * 0.75,
  );
  const operation = {
    type: "transfer",
    date: "2026-08-31",
    locationId: data.locations[0].id,
    destinationId: data.locations[1].id,
    supplier: "",
    billReference: "",
    billTerms: "",
    dueDate: "",
    freight: 0,
    discount: 0,
    reason: "",
    memo: "Isolated API concurrency test",
    lines: [{ productId: source.id, quantity, unitCost: source.averageCost }],
    postNow: true,
  };
  const transfers = await Promise.all(
    [1, 2].map(() =>
      request("/api/inventory", {
        cookie: admin.cookie,
        body: { action: "operation.save", operation },
      }),
    ),
  );
  check(
    transfers.filter((r) => r.ok).length === 1 &&
      transfers.filter((r) => r.status === 400).length === 1,
    "concurrent stock updates cannot oversell available stock",
  );
  check(
    (await request("/api/pos")).status === 401,
    "anonymous POS API is blocked",
  );
  check(
    (await request("/api/pos", { cookie: manager.cookie })).status === 403,
    "inventory-only users cannot access POS",
  );
  check(
    (await request("/api/pos", { cookie: viewer.cookie })).status === 403,
    "inventory viewers cannot access POS customer data",
  );
  const cashierBody = {
    username: "qa-cashier",
    name: "QA Cashier",
    email: "cashier@example.test",
    role: "cashier",
    active: true,
    password,
  };
  check(
    (
      await request("/api/auth/accounts", {
        cookie: admin.cookie,
        body: cashierBody,
      })
    ).ok,
    "cashier login can be created",
  );
  const cashier = await login("qa-cashier");
  check(
    cashier.data.redirectTo === "/retail-pos",
    "cashier login lands at checkout",
  );
  check(
    (await request("/api/inventory", { cookie: cashier.cookie })).status ===
      403,
    "cashier cannot read inventory costs",
  );
  check(
    await redirectsTo(
      await request("/core-setup", { cookie: cashier.cookie }),
      "/retail-pos",
    ),
    "cashier page access is redirected safely",
  );
  const posRequest = async (body, cookie = admin.cookie) =>
    request("/api/pos", { cookie, body });
  check(
    (
      await request("/api/pos", {
        cookie: admin.cookie,
        origin: "https://evil.example",
        body: { action: "settings.save", taxBps: 825, receiptNote: "QA" },
      })
    ).status === 403,
    "POS mutations reject foreign origins",
  );
  check(
    (
      await posRequest(
        { action: "settings.save", taxBps: 825, receiptNote: "QA" },
        cashier.cookie,
      )
    ).status === 400,
    "cashier cannot change tax configuration",
  );
  check(
    (
      await posRequest({
        action: "settings.save",
        taxBps: 825,
        receiptNote: "QA",
      })
    ).ok,
    "manager can confirm tax configuration",
  );
  const shiftResponse = await posRequest({
    action: "shift.open",
    locationId: data.locations[0].id,
    register: "QA Register",
    openingCents: 10000,
  });
  assert.equal(shiftResponse.status, 200, await shiftResponse.clone().text());
  const shiftId = (await shiftResponse.json()).id;
  const saleCommand = {
    action: "sale.checkout",
    requestId: randomUUID(),
    shiftId,
    customerId: "",
    tier: "retail",
    note: "Isolated POS test",
    taxBps: 825,
    expectedTotalCents: 4222,
    lines: [
      {
        productId: source.id,
        quantity: 1,
        unitPriceCents: 3900,
        discountBps: 0,
      },
    ],
    tenders: [{ method: "cash", amountCents: 5000, reference: "" }],
  };
  const saleResponses = await Promise.all([
    posRequest(saleCommand),
    posRequest(saleCommand),
  ]);
  const saleResults = await Promise.all(saleResponses.map((r) => r.json()));
  check(
    saleResponses.every((r) => r.ok) &&
      saleResults[0].id === saleResults[1].id &&
      saleResults[1].data.pos.sales.length === 1,
    "concurrent duplicate checkout is exactly once",
  );
  const saleId = saleResults[0].id;
  check(
    saleResults[0].data.pos.sales[0].changeCents === 778,
    "server-calculated cash change is correct",
  );
  check(
    saleResults[0].data.catalog.products.every(
      (p) => p.averageCost === 0 && p.lastCost === 0,
    ),
    "POS response excludes purchase costs",
  );
  check(
    (
      await posRequest({
        ...saleCommand,
        requestId: randomUUID(),
        lines: [{ ...saleCommand.lines[0], unitPriceCents: 1 }],
      })
    ).status === 400,
    "forged POS price is rejected",
  );
  check(
    (
      await posRequest(
        { ...saleCommand, requestId: randomUUID() },
        cashier.cookie,
      )
    ).status === 400,
    "cashier cannot use another user's shift",
  );
  const afterPosInventory = (
    await (await request("/api/inventory", { cookie: viewer.cookie })).json()
  ).data;
  check(
    !("pos" in afterPosInventory),
    "inventory API does not expose POS customer or tender records",
  );
  check(
    afterPosInventory.movements.filter(
      (m) => m.operationId === saleId && m.type === "sale",
    ).length === 1,
    "posted sale appears once in stock ledger",
  );
  const cashierSnapshot = (
    await (await request("/api/pos", { cookie: cashier.cookie })).json()
  ).data;
  check(
    cashierSnapshot.pos.sales.length === 0 &&
      cashierSnapshot.pos.shifts.length === 0,
    "cashier history is limited to own records",
  );
  const customerResponse = await posRequest({
    action: "customer.save",
    name: "POS API customer",
    email: "pos-api@example.test",
    phone: "",
    notes: "",
  });
  const customerId = (await customerResponse.json()).id;
  const customerSale = (
    await (
      await posRequest({ ...saleCommand, requestId: randomUUID(), customerId })
    ).json()
  ).id;
  const returnCommand = {
    action: "sale.return",
    requestId: randomUUID(),
    saleId: customerSale,
    shiftId,
    reason: "Credit for an exchange",
    method: "credit",
    paymentReference: "",
    lines: [{ productId: source.id, quantity: 1, restock: true }],
  };
  const returned = await posRequest(returnCommand);
  assert.equal(returned.status, 200, await returned.clone().text());
  const returnResult = await returned.json();
  check(
    returnResult.data.pos.customers.find((c) => c.id === customerId)
      .creditCents === 4222,
    "return credits customer balance",
  );
  const retryReturn = await posRequest(returnCommand);
  check(
    (await retryReturn.json()).id === returnResult.id,
    "return retry is idempotent",
  );
  check(
    (await posRequest({ ...returnCommand, requestId: randomUUID() })).status ===
      400,
    "double return is blocked",
  );
  const redeemed = await posRequest({
    ...saleCommand,
    requestId: randomUUID(),
    customerId,
    tenders: [{ method: "credit", amountCents: 4222, reference: "" }],
  });
  assert.equal(redeemed.status, 200, await redeemed.clone().text());
  check(
    (await redeemed.json()).data.pos.customers.find((c) => c.id === customerId)
      .creditCents === 0,
    "store credit redeems atomically at checkout",
  );
  const beforeConcurrent = (
    await (await request("/api/inventory", { cookie: admin.cookie })).json()
  ).data;
  const currentBalance = beforeConcurrent.balances.find(
    (b) => b.productId === source.id && b.locationId === data.locations[0].id,
  );
  const saleQuantity = Math.ceil(
    (currentBalance.onHand - currentBalance.committed - currentBalance.held) *
      0.75,
  );
  const bulkTotal =
    saleQuantity * 3900 + Math.round(saleQuantity * 3900 * 0.0825);
  const bulk = {
    ...saleCommand,
    lines: [{ ...saleCommand.lines[0], quantity: saleQuantity }],
    expectedTotalCents: bulkTotal,
    tenders: [{ method: "cash", amountCents: bulkTotal, reference: "" }],
  };
  const concurrentSales = await Promise.all([
    posRequest({ ...bulk, requestId: randomUUID() }),
    posRequest({ ...bulk, requestId: randomUUID() }),
  ]);
  check(
    concurrentSales.filter((r) => r.ok).length === 1 &&
      concurrentSales.filter((r) => r.status === 400).length === 1,
    "concurrent POS sales cannot oversell stock",
  );
  await stop();
  start();
  await ready();
  const persisted = await request("/api/inventory", { cookie: admin.cookie });
  check(
    persisted.ok &&
      (await persisted.json()).data.products.some((p) => p.sku === "QA-NEW"),
    "sessions and inventory survive server restart",
  );
  const persistedPos = await posRequest(saleCommand);
  const persistedPosData = await persistedPos.json();
  check(
    persistedPos.ok && persistedPosData.id === saleId,
    "offline retry after restart resolves the original receipt without duplication",
  );
  const shiftRecord = persistedPosData.data.pos.shifts.find(
    (s) => s.id === shiftId,
  );
  const shiftSales = persistedPosData.data.pos.sales.filter(
    (s) => s.shiftId === shiftId,
  );
  const expected =
    shiftRecord.openingCents +
    shiftSales.reduce(
      (n, s) =>
        n +
        s.tenders
          .filter((t) => t.method === "cash")
          .reduce((a, t) => a + t.amountCents, 0) -
        s.changeCents,
      0,
    );
  check(
    (
      await posRequest({
        action: "shift.close",
        shiftId,
        countedCents: expected - 1,
        note: "",
      })
    ).status === 400,
    "variance requires an explanation",
  );
  check(
    (
      await posRequest({
        action: "shift.close",
        shiftId,
        countedCents: expected,
        note: "Balanced QA shift",
      })
    ).ok,
    "shift close freezes reconciliation",
  );
  check(
    (await posRequest({ ...saleCommand, requestId: randomUUID() })).status ===
      400,
    "closed shift rejects new checkouts",
  );
  await request("/api/auth/accounts", {
    cookie: admin.cookie,
    body: {
      ...viewerBody,
      id: viewerAccount.id,
      active: false,
      password: undefined,
    },
  });
  check(
    (await request("/api/inventory", { cookie: viewer.cookie })).status === 401,
    "deactivation revokes active sessions immediately",
  );
  check(
    (
      await request("/api/auth/logout", {
        cookie: admin.cookie,
        method: "POST",
      })
    ).ok,
    "logout succeeds",
  );
  check(
    (await request("/api/inventory", { cookie: admin.cookie })).status === 401,
    "logged-out session cannot access API",
  );
  console.log(
    `Completed ${checks} API integration checks using isolated data.`,
  );
} finally {
  await stop();
  const resolved = path.resolve(directory);
  if (
    path.dirname(resolved) === path.resolve(tmpdir()) &&
    path.basename(resolved).startsWith("flair-api-test-")
  )
    await rm(resolved, { recursive: true, force: true });
}
