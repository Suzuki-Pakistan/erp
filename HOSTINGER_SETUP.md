# Flair ERP — Hostinger deployment

This ZIP is a source deployment package for Hostinger's **Node.js Web App** service. It is not a static website or a prebuilt Windows server bundle. Hostinger installs the locked dependencies and builds them on its Linux server.

## Before deployment

- Use a Hostinger plan with Node.js Web Apps, or a manually configured Node.js VPS. Do not extract this into `public_html` as a static/PHP site: authentication, inventory and POS require the Node.js server.
- This package is a **fresh installation**. Local `.data`, accounts, sessions, sales, inventory changes, environment files and browser storage are NOT included. Bundled sample catalog/stock data will initialize on first use. Review or replace it before live trading.
- **Storage is a go-live requirement:** the current server stores accounts, inventory and POS in JSON files, not a hosted database. Set `FLAIR_DATA_DIR` to a private, writable, absolute directory that survives deployments and restarts. It must be outside `public`, `public_html`, build output and the replaceable release directory. Confirm persistence with Hostinger for your exact plan. If durable storage or a single process cannot be guaranteed, use a VPS with persistent disk or migrate the store to a database before recording real transactions.
- Run **one Node.js application process/replica only**. The JSON store's write queues are process-local; clustering or autoscaling can cause lost updates. Shared disk alone does not make multiple replicas safe.

## Upload in hPanel

1. Open **Websites → Add Website → Deploy Web App** (also called Node.js Web App).
2. Choose **Upload your website files** and upload the ZIP produced by `scripts/package-hostinger.ps1`.
3. Confirm these settings:

   | Setting | Value |
   | --- | --- |
   | Framework | Next.js, with server/backend support |
   | Node.js | 24.x |
   | Project root | Archive root, where `package.json` is located |
   | Package manager | npm, using `package-lock.json` |
   | Install command, if editable | `npm ci --include=dev` |
   | Build command | `npm run build` |
   | Output directory, if requested | `.next` |
   | Start command, if requested | `npm run start` |

   Do not select static export, `out`, or an invented `server.js` entry point. The Next.js preset should manage startup. `next start` uses the platform's `PORT` automatically. Build-time dependencies such as TypeScript and Tailwind must be installed before building. The build also needs outbound access to Google Fonts for the existing Figtree font.

   This release uses a plain CommonJS `next.config.js` rather than `next.config.ts`. That avoids a TypeScript-config-loader incompatibility seen on older Linux/GLIBC build images. A warning that Hostinger's GLIBC is too old for the optional native SWC package is acceptable when Next subsequently downloads and uses `@next/swc-wasm-nodejs`; the important result is that the build continues past it.

4. In hPanel's environment settings, configure these **server-only** variables before first login:

   | Variable | Required value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `FLAIR_ADMIN_PASSWORD` | Your own unique, strong password of at least 12 characters |
   | `FLAIR_DATA_DIR` | Your verified persistent, private absolute storage path |

   `deployment/hostinger.env.example` lists the keys without secrets. Fill them in hPanel; never place credentials in browser-facing `NEXT_PUBLIC_` variables. Let Hostinger assign `PORT`.

5. Deploy, inspect the build/runtime logs, attach your domain and enable HTTPS. Production session cookies are Secure and require HTTPS in the browser.
6. Open `/login`. Sign in with username `admin` or email `admin@admin.com` and the password you configured. The development password `admin` is intentionally blocked in production.

`FLAIR_ADMIN_PASSWORD` initializes a new account store only. Changing this variable later does not reset an existing account's password. Do not delete the account store to reset access. Use Login Access with an authorized administrator instead.

## Go-live checks

- Confirm login/logout and access-aware routing for administrator, inventory and cashier accounts.
- Verify brand/product images and all three modules load correctly.
- On staging, create a record, restart, then redeploy and confirm the same record still exists. Back up the private data directory and test restoration before live use.
- Core Setup locations, people and company settings remain a browser-local demo. Login Access accounts, Inventory and POS use server storage. Core Setup browser data does not automatically migrate or become shared through this deployment.
- Confirm POS tax configuration, approved inventory balances and cashier access before selling. Test the actual barcode scanner and receipt printer. Card payments are externally processed; Flair records their references, not charges.
- Arrange HTTPS, login rate limiting, monitoring and private backups. Take a consistent backup of **all** JSON files while writes are paused; do not restore only one store independently.

## Updating an existing installation

Create a new ZIP after code changes, then use Hostinger's redeploy/upload workflow. Keep the same persistent `FLAIR_DATA_DIR`. Back it up before updating; never replace it with sample data. This source ZIP is not a data migration or a business-data backup.

## Local package verification

The packager allowlists application source/configuration and public assets, rejects symlinks and sensitive build/data files, and checks every archived file against its source SHA-256. It excludes `node_modules` and `.next` so Hostinger builds platform-correct dependencies. Run these before packaging a later release:

```powershell
npm run lint
npm run build
npm test
npm run test:api
powershell -NoProfile -File scripts/package-hostinger.ps1
```

No Hostinger account, domain, deployment or hosted persistence has been configured by creating this package.

## Official references

- [Hostinger: add and upload a Node.js web app](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- [Hostinger: redeploy a Node.js application](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)
- [Next.js: self-hosting](https://nextjs.org/docs/app/guides/self-hosting)
