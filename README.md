# Flair ERP — Core Setup, Inventory & Retail POS

A Next.js 16 / React 19 workspace for Flair Cosmetic & Fragrance. Module 02 extends the established teal, ivory and champagne design system. The supplied legacy screenshots inform the product fields, not the visual design.

Module 03 is available at `/retail-pos`, using the same design system and server-backed inventory. Open **Retail POS** in the sidebar. Before the first sale, an administrator or POS manager must confirm the checkout tax configuration, then open a cashier shift with its location, register name and opening cash. No tax rate is assumed.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with username **admin** or email **admin@admin.com**, password **admin**. Administrators land on Core Setup; inventory-only accounts land on Product & Inventory.

The requested short password is a development bootstrap only. It is not displayed in the login UI. Accounts are seeded on first sign-in, not every restart.

## Implemented workflows

- Login/logout, server-validated sessions, protected pages/APIs, access-aware navigation and login account administration at `/core-setup/login-access`.
- Catalog create/edit, duplicate as draft, safely discontinue, list/grid views, name/SKU/UPC search, filters, sorting, pagination, bulk selection and export.
- Product identity, brand/category, units/pack/size, retail/wholesale/VIP/web pricing, suggested/minimum prices, average/last costs, taxes, suppliers, replenishment thresholds and notes.
- Stock explorer: per-location on-hand, committed, held, on-order and available quantities; low-stock filters and export.
- Receipts, transfers, signed adjustments and cycle counts: draft/edit/post/cancel, multi-line documents, barcode-to-line entry, supplier/bill references, terms, freight/discount and history.
- Weighted-average receipt costing, paired transfer entries, committed/held stock protection, immutable posted documents and atomic server-side mutations.
- Category/brand management with in-use deletion protection; four-level pricing and margins workspace.
- CSV import with validation/preview and atomic SKU-based upserts; Code 128 label preview/printing. Scanners should use keyboard-wedge mode with an Enter suffix. Physical scanner/printer compatibility still requires testing on the actual hardware.

## Retail POS workflows

- **POS Terminal:** category-based product browsing, SKU/UPC barcode entry, stock-aware cart, per-line discounts, retail/wholesale/VIP pricing, customers, notes, server-held carts and a recoverable current-session cart. Held carts do not reserve inventory. Price/stock/tax changes are checked again by the server before posting.
- **Payments & receipts:** cash/change, externally processed card/other tender references, store-credit redemption, split tender, immutable sale snapshots, and browser-printable receipts styled for 80mm paper. No card details are collected and no payment is charged through Flair. External approvals must be obtained separately.
- **Sales History:** receipt/customer/SKU/cashier search, location/date filters, receipt lookup/reprinting, return status, net totals and CSV export. Dates are stored in UTC; date filters explicitly use UTC.
- **Returns & Exchanges:** manager-only, original-invoice-linked partial/full returns, original price/discount/tax allocation, returnable-quantity protection, optional restocking, refund-method limits, credit notes and store-credit issuance. Exchanges are a credit return followed by a separate sale to the same customer. Damaged or non-restocked goods do not increase sellable stock. Credit notes can be downloaded as CSV.
- **Customer Accounts:** create/edit/search contact records, attached purchase history, store-credit balance and immutable credit movements. Store credit can only be created by a recorded return and cannot be overdrawn. Walk-in receipts cannot receive customer credit retroactively.
- **Cashier Shifts:** open/close by cashier and register, opening float, reasoned cash-in/out entries, expected cash, physical count and mandatory variance explanations. Closed shifts cannot accept new transactions. Managers see all reports; cashiers see their own shifts and receipts.
- **Daily Reconciliation:** frozen closed-shift counts, variances, explanations, location/closing-date filters, audit detail and CSV exports. Card-provider settlements are external to this report.
- **Offline Sync Queue:** an already-loaded checkout can retain a cash-only pending command locally if server confirmation fails. It is not a final receipt. Reconnection triggers retry; server failures can also be retried manually. Stable request IDs prevent duplicate sales/returns, including after restart. Stale prices, stock, tax or a closed original shift produce a visible conflict, not a forced posting. Do not collect payment or release goods until confirmed. Do not clear browser storage with pending sales. This is an active-session queue, not an installable offline-first PWA; initial page loading and external/store-credit tenders require a connection.

POS uses integer cents, rounds discounts and tax per line, and allocates partial refunds cumulatively so the final return preserves every original cent. A single administrator-confirmed tax rate applies to taxable products at all stores; jurisdiction-specific/exemption rules need an appropriate tax integration. Returned stock uses the original sale movement's cost in weighted-average valuation. Sale and return stock movements appear in Inventory's existing ledger.

## Access roles

| Login role        | Core Setup | Inventory                         | Cost visibility   |
| ----------------- | ---------- | --------------------------------- | ----------------- |
| Administrator     | Full       | Full                              | Visible           |
| Inventory manager | None       | Manage products, prices and stock | Visible           |
| Inventory viewer  | None       | Read-only                         | Removed by server |

Administrators also have full POS access. **POS manager** accounts have POS checkout, returns, settings, customers and all shift reports; **Cashier** accounts have retail checkout, customer maintenance and their own shifts/history, with discounts capped at 10%. Both POS-only roles land on `/retail-pos` and cannot access Core Setup or the inventory API. Purchase costs are removed from all POS responses. Inventory-only roles cannot access the POS API or customer/payment records. Create these accounts in **Core Setup → Login Access**.

Editing/deactivating accounts revokes their sessions. The current account cannot edit itself; the bootstrap administrator cannot be demoted or deactivated. Use a second administrator to change its password.

## Persistence and boundaries

Authentication and inventory use server-backed local JSON stores in `.data/auth.json` and `.data/inventory.json`. Passwords use salted scrypt hashes; opaque session tokens are hashed server-side. Cookies are HttpOnly, SameSite=Lax, expire after 12 hours and are Secure in production. Writes validate origin/input and are serialized within one server process. Files are written atomically. Back up `.data` securely; it contains accounts/business data and is ignored by Git.

POS records live in an additive `pos` section of the **same inventory file**, so sales, credit and stock commit within one serialized atomic write. Existing files are initialized lazily without resetting inventory. POS starts with empty sales, returns, customers and shifts, not fabricated business transactions. Browser queue keys are scoped by login account; the current cart/catalog cache uses session storage. Use trusted devices and protect their browser profiles.

Inventory starts with **26 illustrative products, 14 categories, 15 brands and 5 seeded locations**. Selected values reproduce the supplied screenshots (SKU 10000 at the flagship has 258 on hand, 16 committed and 242 available). This is not an import of the ManageMore database. Bottle graphics are illustrations, not product photographs.

Core Setup retains its previous browser-local demonstration data for staff, locations, configurable permission policies and settings. That staff/policy editor is **not** the authentication account store. Real sign-in access is managed in **Login Access**, using the roles above. Inventory locations start from the same seed, but subsequent browser-local Core Setup location edits do not synchronize into the server inventory store. Resetting the Core Setup demo does not delete accounts or inventory.

Modules 04–09 remain roadmap items. Live payment processing, automatic cash-drawer/printer drivers, purchase orders/vendor bills and accounting integrations are not connected. Receipt supplier/bill fields are inventory references, not payable/payment transactions. Freight and discount are document totals and are not allocated into weighted unit costs.

## Deployment

Before the first production startup, set `FLAIR_ADMIN_PASSWORD` to a unique password of at least 12 characters. This only affects first-time seeding; it does not overwrite existing passwords. Existing accounts also need passwords of at least 12 characters to sign in in production. Do not deploy the development `admin` password or copy development sessions into production.

```bash
npm run build
npm start
```

`FLAIR_DATA_DIR` optionally selects an absolute persistent data directory. Keep it outside public assets and restrict OS permissions. Use HTTPS and a trusted reverse proxy that preserves the Host header.

This adapter is intended for a **single-process local/self-hosted workspace**, not multi-instance/serverless production or an untrusted public login service. A production rollout needs a transactional database, backups/recovery, a mature identity provider or hardened recovery/MFA, shared rate limiting and an operational security review. Login throttling here is process-local, not distributed abuse protection.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run test:api
```

`test:api` requires a fresh production build and free port 3107. It launches an isolated server and temporary data directory, tests authentication, role restrictions, cost redaction, atomic imports, concurrent stock updates, persistence and logout, then removes only its own test data. It never changes the workspace's `.data` files.

POS coverage includes checkout/change/tax, split payments, stale/forged prices, overselling, simultaneous duplicate submission, original-method refund limits, partial-return rounding, store-credit issuance/redemption, held-cart consumption, cashier access, shift ownership/variance/closure and idempotent recovery after server restart. Browser QA should also use disposable data rather than recording test sales against business inventory.

The interface uses TypeScript, Tailwind CSS, shadcn/Radix, TanStack Table, React Hook Form + Zod, Recharts, Lucide, Sonner and Zustand. Dense tables scroll within their own containers rather than widening the page.
