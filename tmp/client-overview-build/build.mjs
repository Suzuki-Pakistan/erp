import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "D:/echo-work/flair-perfumes";
const TMP_DIR = path.join(ROOT, "tmp/client-overview-build");
const SCREEN_DIR = path.join(TMP_DIR, "screenshots");
const SKILL_DIR =
  "C:/Users/Shekhi/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const RUNTIME_PYTHON =
  "C:/Users/Shekhi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const FINAL_PPTX = path.join(
  ROOT,
  "artifacts/Flair_ERP_Update_Friday_to_Now_2026-09-07_v2.pptx",
);
const { finalizePresentation } = await import(
  pathToFileURL(
    path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
  ).href
);

const C = {
  ivory: "#F8F6F1",
  paper: "#FFFDF9",
  ink: "#072835",
  teal: "#164B57",
  green: "#237268",
  gold: "#B69154",
  paleGold: "#EFE7D8",
  paleTeal: "#E8F0EE",
  muted: "#657174",
  line: "#D9D7D0",
  white: "#FFFFFF",
  red: "#9C4941",
};

const FONT = "Aptos";
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});

let seq = 0;

function rect(slide, x, y, w, h, fill, line = "none", radius = false) {
  return slide.shapes.add({
    name: `surface-${seq++}`,
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: line, width: line === "none" ? 0 : 1, style: "solid" },
  });
}

function text(
  slide,
  value,
  x,
  y,
  w,
  h,
  size = 23,
  color = C.ink,
  bold = false,
  align = "left",
  valign = "top",
) {
  const shape = rect(slide, x, y, w, h, "none");
  shape.text = value;
  shape.text.style = {
    typeface: FONT,
    fontSize: size,
    color,
    bold,
    alignment: align,
    verticalAlignment: valign,
    autoFit: "none",
    wrap: "square",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return shape;
}

function rule(slide, x, y, w, color = C.line, height = 2) {
  rect(slide, x, y, w, height, color);
}

async function image(slide, file, x, y, w, h, fit = "cover", crop) {
  const bytes = await fs.readFile(file);
  slide.images.add({
    name: `image-${seq++}`,
    blob: bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ),
    contentType: file.endsWith(".webp") ? "image/webp" : "image/png",
    alt: path.basename(file),
    fit,
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
    borderRadius: "rounded-xl",
    ...(crop ? { crop } : {}),
  });
}

function footer(slide, number, dark = false) {
  rule(slide, 56, 672, 1168, dark ? "#31515A" : C.line, 1);
  text(
    slide,
    "FLAIR ERP · CLIENT UPDATE · 7 SEP 2026",
    56,
    684,
    720,
    20,
    13,
    dark ? "#B7C9C7" : C.muted,
    true,
  );
  text(
    slide,
    String(number).padStart(2, "0"),
    1166,
    681,
    58,
    24,
    15,
    dark ? C.gold : C.teal,
    true,
    "right",
  );
}

function addTitle(slide, number, title, subtitle = "", dark = false) {
  text(
    slide,
    `UPDATE ${String(number).padStart(2, "0")}`,
    56,
    34,
    1168,
    24,
    14,
    dark ? C.gold : C.green,
    true,
  );
  text(
    slide,
    title,
    56,
    69,
    1168,
    57,
    44,
    dark ? C.white : C.ink,
    true,
  );
  if (subtitle)
    text(
      slide,
      subtitle,
      56,
      130,
      1168,
      38,
      21,
      dark ? "#C6D5D2" : C.muted,
    );
  footer(slide, number, dark);
}

function label(slide, value, x, y, w, color = C.green) {
  text(slide, value.toUpperCase(), x, y, w, 22, 14, color, true);
}

function point(slide, title, body, x, y, w, number) {
  text(slide, String(number).padStart(2, "0"), x, y + 1, 38, 32, 18, C.gold, true);
  text(slide, title, x + 48, y, w - 48, 31, 23, C.ink, true);
  text(slide, body, x + 48, y + 38, w - 48, 66, 19, C.muted);
}

function notes(slide, value, sources) {
  slide.speakerNotes.textFrame.setText(
    `${value}\n\n[Sources]\n${sources.join("\n")}\n[/Sources]`,
  );
}

// 01 Cover
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ink;
  await image(
    slide,
    path.join(ROOT, "public/demo/locations/harwin-store.webp"),
    770,
    0,
    510,
    720,
    "cover",
  );
  await image(
    slide,
    path.join(ROOT, "public/brand/flair-logo.png"),
    56,
    42,
    280,
    128,
    "contain",
  );
  label(slide, "Client progress review", 56, 230, 620, C.gold);
  text(
    slide,
    "Flair ERP\nFriday to now",
    56,
    267,
    650,
    155,
    64,
    C.white,
    true,
  );
  text(
    slide,
    "Working Phase One flows, complete demo data and interactive previews for finance, forecasting and operations.",
    56,
    452,
    620,
    100,
    25,
    "#C9D7D4",
  );
  rule(slide, 56, 594, 560, C.gold, 3);
  text(slide, "Prepared 7 September 2026", 56, 615, 500, 34, 18, "#B7C9C7");
  notes(
    slide,
    "Opening slide for the client progress review. The photograph and logo come from the application brand assets.",
    [
      path.join(ROOT, "public/brand/flair-logo.png"),
      path.join(ROOT, "public/demo/locations/harwin-store.webp"),
    ],
  );
}

// 02 Timeline
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    2,
    "Friday feedback became a working client demo",
    "Nine production commits moved the application from static coverage to connected, testable workflows.",
  );
  rule(slide, 110, 300, 1010, C.gold, 3);
  const events = [
    {
      x: 82,
      date: "FRI 04 SEP",
      title: "Client priorities",
      body: "Retail discounting, returns, refunds, customer follow-up, hold and recall, closing reports.",
    },
    {
      x: 392,
      date: "WEEKEND",
      title: "Operational controls",
      body: "POS history, invoice-linked returns, store credit, shifts, 8.25% tax and safer Vercel storage.",
    },
    {
      x: 702,
      date: "MON 07 SEP",
      title: "Commercial workflows",
      body: "Split tender, margin tiers, bulk import, multi-company setup and modules 04 to 09.",
    },
    {
      x: 1012,
      date: "LIVE NOW",
      title: "Client-ready data",
      body: "Interactive purchasing, finance, forecasting and populated operational records.",
    },
  ];
  events.forEach((event, index) => {
    rect(slide, event.x + 2, 290, 18, 18, index === 3 ? C.green : C.gold, "none", true);
    label(slide, event.date, event.x, 332, 236, index === 3 ? C.green : C.gold);
    text(slide, event.title, event.x, 367, 236, 58, 25, C.ink, true);
    text(slide, event.body, event.x, 431, 236, 130, 19, C.muted);
  });
  text(slide, "37", 90, 581, 92, 48, 37, C.ink, true);
  text(slide, "unit checks", 186, 591, 150, 27, 19, C.muted);
  text(slide, "51", 443, 581, 92, 48, 37, C.ink, true);
  text(slide, "API checks", 539, 591, 150, 27, 19, C.muted);
  text(slide, "29", 790, 581, 92, 48, 37, C.ink, true);
  text(slide, "built routes", 886, 591, 160, 27, 19, C.muted);
  notes(
    slide,
    "Timeline summarizes commits created from Friday 4 September through Monday 7 September in the Asia/Karachi timezone. Validation figures come from the current unit, API and production build runs.",
    ["git log --since=2026-09-04", "npm test", "npm run test:api", "npm run build"],
  );
}

// 03 Phase One overview
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    3,
    "Phase One now gives the client a clear starting path",
    "The overview points directly to four working demonstrations instead of leaving the client to explore without context.",
  );
  await image(slide, path.join(SCREEN_DIR, "core-overview.png"), 56, 190, 790, 450, "cover");
  label(slide, "Change made", 884, 203, 310);
  text(
    slide,
    "A guided sequence covers split tender, product margins, bulk import and company setup.",
    884,
    237,
    330,
    106,
    23,
    C.ink,
    true,
  );
  label(slide, "Problem solved", 884, 384, 310, C.gold);
  text(
    slide,
    "The meeting has an obvious route. Every step opens the exact screen the presenter needs.",
    884,
    418,
    330,
    116,
    22,
    C.muted,
  );
  text(slide, "Core Setup  ·  Inventory  ·  Retail POS", 884, 583, 330, 34, 18, C.green, true);
  notes(slide, "Live application screenshot captured after deployment on 7 September 2026.", [path.join(SCREEN_DIR, "core-overview.png")]);
}

// 04 Multi-company
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    4,
    "A second company starts from proven Flair settings",
    "The new workspace keeps its own identity while copying regional and operating defaults from the current company.",
  );
  await image(slide, path.join(SCREEN_DIR, "multi-company.png"), 500, 185, 724, 454, "cover");
  point(slide, "Required identity", "Name, code, contact and address fields keep each company distinct.", 56, 224, 390, 1);
  point(slide, "Faster setup", "Regional formats, branding and notification defaults copy from the active company.", 56, 372, 390, 2);
  point(slide, "Independent control", "The user can switch the active company and maintain its profile separately.", 56, 520, 390, 3);
  notes(slide, "Live multi-company creation dialog. No company record was submitted while capturing this screenshot.", [path.join(SCREEN_DIR, "multi-company.png"), path.join(ROOT, "components/core-setup/settings-page.tsx")]);
}

// 05 Margins
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    5,
    "Every product shows the margin for each sales channel",
    "Retail, wholesale, e-commerce and VIP prices use the same average cost, with gross profit and margin visible by SKU.",
  );
  await image(slide, path.join(SCREEN_DIR, "pricing-margins.png"), 56, 190, 806, 448, "cover");
  label(slide, "Change made", 900, 205, 294);
  text(slide, "Four price tiers now calculate profit and margin independently.", 900, 239, 300, 86, 24, C.ink, true);
  label(slide, "Problem solved", 900, 370, 294, C.gold);
  text(slide, "Management can compare channel contribution before approving prices or discounts.", 900, 404, 300, 110, 22, C.muted);
  text(slide, "26 seeded products", 900, 567, 300, 34, 23, C.green, true);
  notes(slide, "Live pricing and margins screenshot with illustrative product data.", [path.join(SCREEN_DIR, "pricing-margins.png"), path.join(ROOT, "components/inventory/pricing-page.tsx")]);
}

// 06 Import and stock operations
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    6,
    "Bulk import and stock documents make the demo practical",
    "Products, organization and starting quantities can enter through validated CSV files, then move through traceable stock records.",
  );
  await image(slide, path.join(SCREEN_DIR, "bulk-import.png"), 56, 190, 560, 248, "cover");
  await image(slide, path.join(SCREEN_DIR, "inventory-operations.png"), 56, 452, 560, 190, "cover");
  point(slide, "Four import modes", "Separate templates cover products, categories, brands and inventory balances.", 662, 211, 540, 1);
  point(slide, "Validation before posting", "The preview catches missing fields and invalid identifiers before changing data.", 662, 348, 540, 2);
  point(slide, "Traceable stock history", "Seeded receipts, transfers, adjustments and counts show the full document lifecycle.", 662, 485, 540, 3);
  notes(slide, "Live screenshots of the bulk import center and seeded stock operations.", [path.join(SCREEN_DIR, "bulk-import.png"), path.join(SCREEN_DIR, "inventory-operations.png"), path.join(ROOT, "components/inventory/tools-dialogs.tsx"), path.join(ROOT, "data/inventory.ts")]);
}

// 07 POS controls
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    7,
    "POS connects every sale, return and customer credit",
    "Seeded receipts and credit notes let the client inspect the full flow without entering setup data first.",
  );
  await image(slide, path.join(SCREEN_DIR, "returns-credit-notes.png"), 56, 190, 790, 450, "cover");
  label(slide, "Retail controls added", 884, 202, 326);
  text(slide, "Split cash and card\nBuy one, second 50% off\nLast sale lookup\nHold and recall\nRefund or store credit\nRetail and wholesale close", 884, 240, 328, 235, 22, C.ink, true);
  label(slide, "Problem solved", 884, 507, 326, C.gold);
  text(slide, "Staff can recover the original transaction and keep stock and credit adjustments auditable.", 884, 541, 328, 84, 20, C.muted);
  notes(slide, "Live returns screen showing seeded linked records. The listed controls were implemented in the POS workflow between 4 and 7 September.", [path.join(SCREEN_DIR, "returns-credit-notes.png"), path.join(ROOT, "components/pos/terminal-page.tsx"), path.join(ROOT, "components/pos/management-pages.tsx")]);
}

// 08 Purchasing
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    8,
    "Purchasing preserves the real invoice cost",
    "Transportation, duty and local delivery stay separate while the application calculates landed and weighted average cost per piece.",
  );
  await image(slide, path.join(SCREEN_DIR, "purchasing-landed-cost.png"), 56, 190, 828, 452, "cover");
  label(slide, "Example result", 920, 208, 280);
  text(slide, "$16.00", 920, 245, 280, 48, 38, C.ink, true);
  text(slide, "original unit price", 920, 293, 280, 28, 18, C.muted);
  text(slide, "$5.75", 920, 352, 280, 48, 38, C.gold, true);
  text(slide, "allocated extra cost", 920, 400, 280, 28, 18, C.muted);
  text(slide, "$21.75", 920, 459, 280, 48, 38, C.green, true);
  text(slide, "landed cost per piece", 920, 507, 280, 28, 18, C.muted);
  text(slide, "The purchase history remains comparable without reopening a physical invoice.", 920, 562, 280, 68, 19, C.ink, true);
  notes(slide, "Interactive purchasing screenshot. Amounts are seeded demonstration values, not client accounting results.", [path.join(SCREEN_DIR, "purchasing-landed-cost.png"), path.join(ROOT, "components/roadmap/interactive-workflows.tsx")]);
}

// 09 Forecasting
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    9,
    "The sales forecast produces a purchase decision",
    "The presenter can select recommended SKUs, change lead time and create a draft purchase order from the scenario.",
  );
  await image(slide, path.join(SCREEN_DIR, "sales-forecast.png"), 56, 190, 830, 452, "cover");
  point(slide, "Demand signal", "Thirty-day demand sits next to available stock for each product.", 922, 222, 286, 1);
  point(slide, "Confidence", "Each suggestion shows the model confidence used in the demo scenario.", 922, 365, 286, 2);
  point(slide, "Purchase action", "Selected recommendations become an estimated commitment and draft order.", 922, 508, 286, 3);
  notes(slide, "Interactive forecast screenshot with illustrative data. Recommendations are a demo of the planned interface, not a trained production forecast.", [path.join(SCREEN_DIR, "sales-forecast.png"), path.join(ROOT, "components/roadmap/interactive-workflows.tsx")]);
}

// 10 Finance
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    10,
    "A split payment becomes clear finance activity",
    "The $600 example records $200 cash and $400 card, separates 8.25% sales tax and posts a readable ledger entry.",
  );
  await image(slide, path.join(SCREEN_DIR, "finance-split-payment.png"), 56, 190, 822, 452, "cover");
  label(slide, "Transaction", 916, 210, 284);
  text(slide, "$600.00", 916, 246, 284, 52, 40, C.ink, true);
  text(slide, "$554.27 net sale\n$45.73 tax\n$200 cash\n$400 card", 916, 322, 284, 168, 23, C.muted, true);
  label(slide, "Problem solved", 916, 525, 284, C.gold);
  text(slide, "Cash drawer and card settlement no longer appear as one unexplained payment.", 916, 558, 284, 73, 19, C.ink, true);
  notes(slide, "Interactive finance screenshot using the client-provided split tender example. Figures are correctly derived from a $600 tax-inclusive sale at 8.25%.", [path.join(SCREEN_DIR, "finance-split-payment.png"), path.join(ROOT, "components/roadmap/interactive-workflows.tsx")]);
}

// 11 Closing reports
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ivory;
  addTitle(
    slide,
    11,
    "Daily closing separates retail, wholesale and tender totals",
    "One report shows transactions, net sales, tax, cash and card settlement, with a CSV export for reconciliation.",
  );
  await image(slide, path.join(SCREEN_DIR, "closing-report.png"), 56, 190, 820, 452, "cover");
  label(slide, "What the client sees", 914, 208, 286);
  text(slide, "Retail POS\nWholesale\nSales tax\nCash drawer\nCard settlement", 914, 246, 286, 190, 24, C.ink, true);
  label(slide, "Problem solved", 914, 476, 286, C.gold);
  text(slide, "Managers can reconcile both selling channels without combining tender types or rebuilding totals manually.", 914, 511, 286, 116, 21, C.muted);
  notes(slide, "Interactive closing report screenshot with illustrative data.", [path.join(SCREEN_DIR, "closing-report.png"), path.join(ROOT, "components/roadmap/interactive-workflows.tsx")]);
}

// 12 Handoff
{
  const slide = presentation.slides.add();
  slide.background.fill = C.ink;
  addTitle(
    slide,
    12,
    "The client can now test the whole operating story",
    "The live demo combines populated records with safe reset controls and direct links to each important workflow.",
    true,
  );
  const items = [
    ["01", "Set up", "Locations, users, access and companies"],
    ["02", "Control stock", "Products, margins, imports and movements"],
    ["03", "Serve customers", "Sales, promotions, returns and credit"],
    ["04", "Plan and close", "Purchasing, forecasting, finance and reports"],
  ];
  items.forEach((item, index) => {
    const y = 220 + index * 88;
    text(slide, item[0], 72, y, 60, 36, 22, C.gold, true);
    text(slide, item[1], 155, y, 270, 38, 28, C.white, true);
    text(slide, item[2], 470, y + 2, 650, 42, 23, "#C9D7D4");
  });
  rule(slide, 72, 588, 1080, C.gold, 3);
  text(slide, "Live application", 72, 608, 220, 29, 18, C.gold, true);
  text(slide, "https://flaiur-erp.vercel.app", 302, 606, 650, 34, 24, C.white, true);
  notes(slide, "Closing slide. The live URL points to the deployment verified after commit 4fa765e. Demo records are synthetic. Offline sync remains empty when the device has no unconfirmed payments, which represents a healthy state.", ["https://flaiur-erp.vercel.app", "git commit 4fa765e", path.join(ROOT, "data/inventory.ts")]);
}

await fs.mkdir(path.join(TMP_DIR, "render"), { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const stagingDir = path.join(ROOT, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "flair-client-update-candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = { basis: "design", families: [FONT] };
const result = await finalizePresentation({
  ...requirements,
  workspaceDir: ROOT,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_package_integrity.py",
  ),
  layoutValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_layout_geometry.py",
  ),
  layoutArgs: [
    "--expected-slide-size-emu",
    "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(
    stagingDir,
    `${path.basename(FINAL_PPTX)}.validation.json`,
  ),
});

for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.items[i];
  const base = path.join(
    TMP_DIR,
    "render",
    `slide-${String(i + 1).padStart(2, "0")}`,
  );
  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(base + ".png", new Uint8Array(await png.arrayBuffer()));
  await fs.writeFile(base + ".json", await (await slide.export({ format: "layout" })).text());
}

console.log(JSON.stringify({ final: FINAL_PPTX, slides: 12, result }, null, 2));
