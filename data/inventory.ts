import { createSeedData } from "./mock";
import type { InventoryData, Product, Taxonomy } from "@/types/inventory";
import { createPosSeed, type PosData, type PriceTier } from "@/types/pos";

const categoryRows = [
  ["C001", "Women's Fragrance", "Signature fragrances for women", "#9d6d6b"],
  ["C007", "Men's Cologne", "Eau de parfum and eau de toilette", "#47665d"],
  ["C017", "Unisex Fragrance", "Fragrance without boundaries", "#b69154"],
  ["C016", "Air Fresheners", "Room and air fragrance", "#6b8a7a"],
  ["C014", "Diffusers", "Home fragrance diffusers", "#a76f48"],
  ["C013", "Kids Gift Sets", "Gift-ready children's fragrance", "#bb929c"],
  ["C009", "Men's Gift Sets", "Curated fragrance collections", "#596f81"],
  ["C018", "Unisex Gift Sets", "Versatile fragrance gifting", "#a59676"],
  ["C019", "Unisex Lotion", "Fragranced body care", "#9d8d7e"],
  ["C020", "Men's Testers", "Tester format fragrances", "#747b69"],
  ["C024", "Unisex Minis", "Discovery and travel formats", "#8d809e"],
  ["C025", "Atomizers", "Refillable travel accessories", "#6f8b8e"],
  ["C032", "Packaging Services", "Gift wrapping and packaging", "#ba9d7b"],
  ["C033", "Shipping Services", "Shipping and fulfillment services", "#879498"],
];
const brandNames = [
  "Lattafa",
  "Afnan",
  "Yves Saint Laurent",
  "Jimmy Choo",
  "Paco Rabanne",
  "Dolce & Gabbana",
  "Giorgio Armani",
  "Gucci",
  "Burberry",
  "Emporio Armani",
  "Atika Perfumes",
  "Nabeel",
  "Coach",
  "Saint Mario",
  "Flair Essentials",
];
type SeedRow = [
  string,
  string,
  string,
  string,
  number,
  number,
  number,
  string,
  string,
];
const rows: SeedRow[] = [
  [
    "10000",
    "Lattafa Yara Pink",
    "Lattafa",
    "C001",
    39,
    15.68,
    258,
    "6291108730515",
    "#d3a5ac",
  ],
  [
    "10001",
    "Afnan Turathi Red",
    "Afnan",
    "C001",
    39,
    18,
    9,
    "6290171070597",
    "#a94f50",
  ],
  [
    "10004",
    "YSL La Nuit de L'Homme",
    "Yves Saint Laurent",
    "C007",
    79,
    46,
    0,
    "3365440375079",
    "#424343",
  ],
  [
    "10005",
    "Jimmy Choo I Want Choo Forever",
    "Jimmy Choo",
    "C001",
    98,
    54,
    70,
    "3386460129879",
    "#6b4565",
  ],
  [
    "10006",
    "Paco Rabanne Olympéa Blossom",
    "Paco Rabanne",
    "C001",
    79,
    41,
    12,
    "3349668588718",
    "#cd9aa4",
  ],
  [
    "10012",
    "Burberry Weekend",
    "Burberry",
    "C007",
    49,
    22,
    10,
    "3614227748484",
    "#b6a572",
  ],
  [
    "10013",
    "Armani Code for Women",
    "Giorgio Armani",
    "C001",
    109,
    63,
    0,
    "3360375010972",
    "#5c6d8d",
  ],
  [
    "10014",
    "Gucci Guilty Pour Femme",
    "Gucci",
    "C001",
    119,
    68,
    9,
    "3614227758162",
    "#c8a063",
  ],
  [
    "10015",
    "Acqua di Giò",
    "Giorgio Armani",
    "C007",
    165,
    89,
    0,
    "3360372078500",
    "#a7b9b3",
  ],
  [
    "10016",
    "Acqua di Giò Refillable",
    "Giorgio Armani",
    "C007",
    95,
    48,
    16,
    "3614273955546",
    "#779b96",
  ],
  [
    "10017",
    "Dolce & Gabbana King",
    "Dolce & Gabbana",
    "C007",
    139,
    73,
    4,
    "8057971183937",
    "#55718a",
  ],
  [
    "10022",
    "Gucci Guilty Pour Femme Travel",
    "Gucci",
    "C001",
    79,
    39,
    1,
    "3614227758117",
    "#be9b67",
  ],
  [
    "10024",
    "Emporio Armani He",
    "Emporio Armani",
    "C007",
    99,
    43,
    10,
    "3614273070249",
    "#74877e",
  ],
  [
    "12456",
    "Saint Mario Louis Nove Blue Intense",
    "Saint Mario",
    "C007",
    29,
    7,
    48,
    "8901234502456",
    "#456787",
  ],
  [
    "13275",
    "Atika Ameer Al Oud Khas 300ml",
    "Atika Perfumes",
    "C016",
    4.99,
    1.8,
    31,
    "8901234513275",
    "#947852",
  ],
  [
    "13268",
    "Atika Bakhoor Room 300ml",
    "Atika Perfumes",
    "C016",
    4.99,
    1.8,
    42,
    "8901234513268",
    "#796350",
  ],
  [
    "13284",
    "Atika Dirham Oud 300ml",
    "Atika Perfumes",
    "C016",
    4.99,
    1.8,
    11,
    "8901234513284",
    "#c2a95b",
  ],
  [
    "13283",
    "Atika Dirham Silver 300ml",
    "Atika Perfumes",
    "C016",
    4.99,
    1.8,
    4,
    "8901234513283",
    "#98a6a5",
  ],
  [
    "13274",
    "Atika King Sheikh Zayed Musk",
    "Atika Perfumes",
    "C016",
    4.99,
    1.8,
    12,
    "8901234513274",
    "#a5b093",
  ],
  [
    "13292",
    "Nabeel Al Ghadeer Room Spray",
    "Nabeel",
    "C016",
    7.99,
    3.1,
    0,
    "8901234513292",
    "#76947d",
  ],
  [
    "14108",
    "Lattafa Fakhar Air Freshener",
    "Lattafa",
    "C016",
    7.99,
    3.1,
    122,
    "8901234514108",
    "#b1a571",
  ],
  [
    "12389",
    "Coach Blue Mini 4.5ml",
    "Coach",
    "C024",
    9.5,
    4.2,
    2,
    "8901234512389",
    "#698ca8",
  ],
  [
    "14200",
    "Lattafa Khamrah Gift Collection",
    "Lattafa",
    "C018",
    59,
    25,
    36,
    "8901234514200",
    "#a87543",
  ],
  [
    "14201",
    "Flair Travel Atomizer 8ml",
    "Flair Essentials",
    "C025",
    12,
    3.6,
    84,
    "8901234514201",
    "#729292",
  ],
  [
    "14202",
    "Nabeel Oud Reed Diffuser",
    "Nabeel",
    "C014",
    24,
    9,
    18,
    "8901234514202",
    "#977352",
  ],
  [
    "14203",
    "Flair Signature Gift Wrap",
    "Flair Essentials",
    "C032",
    5,
    0.85,
    0,
    "8901234514203",
    "#c7a76d",
  ],
];

export function createInventorySeed(): InventoryData {
  const categories: Taxonomy[] = categoryRows.map(
    ([code, name, description, color]) => ({
      id: code,
      code,
      name,
      description,
      color,
    }),
  );
  const brands: Taxonomy[] = brandNames.map((name, i) => ({
    id: "brand-" + i,
    code: "B" + (100 + i),
    name,
    description: name + " fragrance collection",
    color: ["#b69154", "#47665d", "#9d6d6b", "#6c7d91"][i % 4],
  }));
  const locations = createSeedData()
    .locations.filter((l) => l.status !== "inactive")
    .map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      city: l.city,
      type: l.type,
    }));
  const date = "2026-08-28T14:00:00.000Z";
  const products: Product[] = rows.map(
    (
      [
        sku,
        name,
        brand,
        categoryId,
        retailPrice,
        averageCost,
        ,
        barcode,
        color,
      ],
      i,
    ) => ({
      id: "prd-" + sku,
      sku,
      barcode,
      retailUpc: "",
      name,
      description:
        name +
        (categoryId === "C016"
          ? " · Home fragrance spray"
          : " · Authentic fragrance, thoughtfully selected"),
      categoryId,
      brandId: brands.find((b) => b.name === brand)!.id,
      gender:
        categoryId === "C001"
          ? "Women"
          : categoryId === "C007"
            ? "Men"
            : "Unisex",
      concentration:
        categoryId === "C016"
          ? "Room Spray"
          : categoryId === "C025" || categoryId === "C032"
            ? "Accessory"
            : ["10004", "10012", "10015", "10016", "10024"].includes(sku)
              ? "Eau de Toilette"
              : "Eau de Parfum",
      sizeMl:
        categoryId === "C016"
          ? 300
          : sku === "12389"
            ? 4.5
            : sku === "14201"
              ? 8
              : ((
                  {
                    "10001": 90,
                    "10006": 80,
                    "10012": 50,
                    "10013": 75,
                    "10014": 90,
                    "10015": 200,
                    "10017": 200,
                    "10022": 50,
                  } as Record<string, number>
                )[sku] ?? 100),
      unit: "EA",
      packSize: 1,
      status: i === 24 ? "draft" : "active",
      color,
      supplier: i % 2 ? "Famous Fragrance" : "Flair Distribution",
      supplierCode: "SUP-" + sku,
      averageCost,
      lastCost:
        sku === "10000" ? 16 : Math.round(averageCost * 1.02 * 100) / 100,
      retailPrice,
      wholesalePrice:
        sku === "10000" ? 23 : Math.round(retailPrice * 0.68 * 100) / 100,
      vipPrice:
        sku === "10000" ? 22 : Math.round(retailPrice * 0.62 * 100) / 100,
      webPrice:
        sku === "10000" ? 50.03 : Math.round(retailPrice * 0.95 * 100) / 100,
      suggestedPrice: sku === "10000" ? 59 : Math.round(retailPrice * 1.25),
      lowestPrice:
        sku === "10000" ? 16.5 : Math.round(averageCost * 1.12 * 100) / 100,
      reorderPoint: categoryId === "C016" ? 20 : 12,
      minimumStock: 8,
      maximumStock: 120,
      daysOfStock: 30,
      taxable: true,
      taxCode: "TX-STANDARD",
      trackInventory: categoryId !== "C032",
      dropShip: false,
      labelOnReceipt: true,
      notes:
        sku === "10000"
          ? "Reference fields transcribed from the supplied software screenshots. Other stock locations are illustrative."
          : "",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: date,
    }),
  );
  const balances = products.flatMap((product, i) =>
    locations.slice(0, 3).map((location, li) => ({
      productId: product.id,
      locationId: location.id,
      onHand: product.trackInventory
        ? li === 0
          ? rows[i][6]
          : rows[i][6] === 0
            ? 0
            : Math.floor(rows[i][6] * (li === 1 ? 0.4 : 0.15))
        : 0,
      committed: i === 0 && li === 0 ? 16 : i % 5 === 0 && li === 1 ? 2 : 0,
      held: i === 3 && li === 0 ? 2 : 0,
      onOrder: i % 4 === 0 && li === 1 ? 24 : 0,
    })),
  );
  return {
    version: 1,
    products,
    categories,
    brands,
    locations,
    balances,
    operations: [],
    movements: balances
      .filter((b) => b.onHand > 0)
      .map((b, i) => ({
        id: "mov-opening-" + i,
        operationId: "opening",
        reference: "OPENING-2026",
        productId: b.productId,
        locationId: b.locationId,
        type: "opening",
        quantity: b.onHand,
        before: 0,
        after: b.onHand,
        unitCost: products.find((p) => p.id === b.productId)!.averageCost,
        actor: "Opening balance",
        date,
        note: "Initial demonstration stock",
      })),
  };
}

function createDemoSale(
  data: InventoryData,
  options: {
    id: string;
    reference: string;
    createdAt: string;
    customerId: string;
    customerName: string;
    productId: string;
    quantity: number;
    tier: PriceTier;
    tender: "cash" | "external" | "split";
  },
) {
  const product = data.products.find((item) => item.id === options.productId)!;
  const unitPrice =
    options.tier === "wholesale"
      ? product.wholesalePrice
      : options.tier === "vip"
        ? product.vipPrice
        : product.retailPrice;
  const subtotalCents = Math.round(unitPrice * 100) * options.quantity;
  const taxCents = Math.round(subtotalCents * 0.0825);
  const totalCents = subtotalCents + taxCents;
  const tenders =
    options.tender === "split"
      ? [
          { method: "cash" as const, amountCents: 2000, reference: "" },
          {
            method: "external" as const,
            amountCents: totalCents - 2000,
            reference: "VISA-4812",
          },
        ]
      : [
          {
            method: options.tender as "cash" | "external",
            amountCents: totalCents,
            reference: options.tender === "external" ? "CARD-APPROVED" : "",
          },
        ];
  return {
    id: options.id,
    requestId: `demo-${options.id}`,
    reference: options.reference,
    createdAt: options.createdAt,
    actorId: "admin",
    actor: "Admin User",
    shiftId: "shift-demo-closed",
    locationId: data.locations[0].id,
    locationName: data.locations[0].name,
    customerId: options.customerId,
    customerName: options.customerName,
    tier: options.tier,
    note: "Seeded client demonstration sale",
    receiptNote: "Thank you for shopping with Flair.",
    taxBps: 825,
    lines: [
      {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        taxable: product.taxable,
        tracked: product.trackInventory,
        quantity: options.quantity,
        unitPriceCents: Math.round(unitPrice * 100),
        discountBps: 0,
        subtotalCents,
        discountCents: 0,
        taxCents,
        totalCents,
      },
    ],
    subtotalCents,
    discountCents: 0,
    taxCents,
    totalCents,
    tenders,
    changeCents: 0,
  };
}

export function createPosDemoSeed(data: InventoryData): PosData {
  const pos = createPosSeed();
  pos.customers = [
    {
      id: "customer-demo-1",
      name: "Olivia Martin",
      email: "olivia@example.com",
      phone: "+1 713 555 0141",
      notes: "Prefers floral and soft musk fragrances.",
      marketingOptIn: true,
      preferredContact: "both",
      creditCents: 0,
      createdAt: "2026-08-18T16:20:00.000Z",
    },
    {
      id: "customer-demo-2",
      name: "Noah Williams",
      email: "noah@example.com",
      phone: "+1 832 555 0174",
      notes: "VIP customer · interested in new arrivals.",
      marketingOptIn: true,
      preferredContact: "email",
      creditCents: 2500,
      createdAt: "2026-08-22T18:05:00.000Z",
    },
    {
      id: "customer-demo-3",
      name: "Scent Avenue",
      email: "orders@scentavenue.example",
      phone: "+1 281 555 0198",
      notes: "Wholesale account · net 15.",
      marketingOptIn: false,
      preferredContact: "none",
      creditCents: 0,
      createdAt: "2026-08-25T13:10:00.000Z",
    },
  ];
  pos.sales = [
    createDemoSale(data, {
      id: "sale-demo-10480",
      reference: "POS-10480",
      createdAt: "2026-09-06T16:18:00.000Z",
      customerId: "customer-demo-1",
      customerName: "Olivia Martin",
      productId: "prd-10000",
      quantity: 2,
      tier: "retail",
      tender: "split",
    }),
    createDemoSale(data, {
      id: "sale-demo-10481",
      reference: "POS-10481",
      createdAt: "2026-09-06T17:42:00.000Z",
      customerId: "customer-demo-2",
      customerName: "Noah Williams",
      productId: "prd-10014",
      quantity: 1,
      tier: "vip",
      tender: "external",
    }),
    createDemoSale(data, {
      id: "sale-demo-10482",
      reference: "WS-1051",
      createdAt: "2026-09-06T19:05:00.000Z",
      customerId: "customer-demo-3",
      customerName: "Scent Avenue",
      productId: "prd-13275",
      quantity: 12,
      tier: "wholesale",
      tender: "external",
    }),
  ];
  const vipReturnSale = pos.sales.find(
    (sale) => sale.id === "sale-demo-10481",
  )!;
  const wholesaleReturnSale = pos.sales.find(
    (sale) => sale.id === "sale-demo-10482",
  )!;
  const wholesaleCreditCents = Math.round(
    (wholesaleReturnSale.totalCents * 2) / 12,
  );
  pos.returns = [
    {
      id: "return-demo-2041",
      requestId: "demo-return-2041",
      reference: "CN-2041",
      saleId: vipReturnSale.id,
      shiftId: "shift-demo-closed",
      actorId: "admin",
      actor: "Admin User",
      createdAt: "2026-09-06T18:10:00.000Z",
      reason: "Unopened item returned with original receipt",
      method: "external",
      paymentReference: "REFUND-VISA-4812",
      lines: [
        {
          productId: vipReturnSale.lines[0].productId,
          quantity: 1,
          restock: true,
          amountCents: vipReturnSale.totalCents,
        },
      ],
      totalCents: vipReturnSale.totalCents,
    },
    {
      id: "return-demo-2042",
      requestId: "demo-return-2042",
      reference: "CN-2042",
      saleId: wholesaleReturnSale.id,
      shiftId: "shift-demo-closed",
      actorId: "admin",
      actor: "Admin User",
      createdAt: "2026-09-06T20:20:00.000Z",
      reason: "Two damaged units credited to wholesale account",
      method: "credit",
      paymentReference: "",
      lines: [
        {
          productId: wholesaleReturnSale.lines[0].productId,
          quantity: 2,
          restock: false,
          amountCents: wholesaleCreditCents,
        },
      ],
      totalCents: wholesaleCreditCents,
    },
  ];
  pos.customers = pos.customers.map((customer) =>
    customer.id === "customer-demo-3"
      ? { ...customer, creditCents: wholesaleCreditCents }
      : customer,
  );
  const cashSales = pos.sales.reduce(
    (sum, sale) =>
      sum +
      sale.tenders
        .filter((tender) => tender.method === "cash")
        .reduce((tenderSum, tender) => tenderSum + tender.amountCents, 0),
    0,
  );
  pos.shifts = [
    {
      id: "shift-demo-closed",
      locationId: data.locations[0].id,
      register: "Front Register 01",
      actorId: "admin",
      actor: "Admin User",
      openedAt: "2026-09-06T14:00:00.000Z",
      closedAt: "2026-09-06T22:05:00.000Z",
      openingCents: 20000,
      countedCents: 20000 + cashSales,
      expectedCents: 20000 + cashSales,
      varianceCents: 0,
      closingNote: "Seeded balanced closing shift",
      cashEntries: [],
      drawerEvents: [],
    },
  ];
  pos.credits = [
    {
      id: "credit-demo-1",
      customerId: "customer-demo-2",
      reference: "CREDIT-109",
      amountCents: 2500,
      balanceCents: 2500,
      actor: "Admin User",
      createdAt: "2026-09-05T15:10:00.000Z",
    },
    {
      id: "credit-demo-2",
      customerId: "customer-demo-3",
      reference: "CN-2042",
      amountCents: wholesaleCreditCents,
      balanceCents: wholesaleCreditCents,
      actor: "Admin User",
      createdAt: "2026-09-06T20:20:00.000Z",
    },
  ];
  pos.held = [
    {
      id: "held-demo-1",
      label: "Olivia · selecting gift set",
      actorId: "admin",
      locationId: data.locations[0].id,
      customerId: "customer-demo-1",
      tier: "retail",
      promotion: "buy-one-second-half",
      note: "Customer is continuing to shop",
      lines: [
        {
          productId: "prd-10001",
          quantity: 2,
          unitPriceCents: 3900,
          discountBps: 0,
        },
      ],
      createdAt: "2026-09-07T11:25:00.000Z",
    },
  ];
  return pos;
}

function addInventoryDemoHistory(data: InventoryData) {
  if (data.operations.length) return;
  const retail = data.locations[0];
  const warehouse = data.locations[1] ?? data.locations[0];
  data.operations = [
    {
      id: "operation-demo-receipt",
      reference: "RCV-2418",
      type: "receipt",
      status: "posted",
      date: "2026-09-05",
      locationId: warehouse.id,
      destinationId: "",
      supplier: "Famous Fragrance",
      billReference: "INV-FF-8841",
      billTerms: "Net 15",
      dueDate: "2026-09-20",
      freight: 420,
      discount: 75,
      reason: "",
      memo: "Original item cost and transportation retained separately.",
      lines: [
        { productId: "prd-10000", quantity: 120, unitCost: 16 },
        { productId: "prd-10001", quantity: 48, unitCost: 17.25 },
      ],
      actor: "Maya Patel",
      createdAt: "2026-09-05T14:20:00.000Z",
      postedAt: "2026-09-05T15:05:00.000Z",
    },
    {
      id: "operation-demo-transfer",
      reference: "TRF-0906",
      type: "transfer",
      status: "posted",
      date: "2026-09-06",
      locationId: warehouse.id,
      destinationId: retail.id,
      supplier: "",
      billReference: "",
      billTerms: "",
      dueDate: "",
      freight: 0,
      discount: 0,
      reason: "",
      memo: "Weekend replenishment for the Harwin store.",
      lines: [
        { productId: "prd-10014", quantity: 12, unitCost: 54.4 },
        { productId: "prd-13275", quantity: 24, unitCost: 2.2 },
      ],
      actor: "Daniel Brooks",
      createdAt: "2026-09-06T12:10:00.000Z",
      postedAt: "2026-09-06T12:18:00.000Z",
    },
    {
      id: "operation-demo-adjustment",
      reference: "ADJ-0447",
      type: "adjustment",
      status: "posted",
      date: "2026-09-06",
      locationId: retail.id,
      destinationId: "",
      supplier: "",
      billReference: "",
      billTerms: "",
      dueDate: "",
      freight: 0,
      discount: 0,
      reason: "Damaged tester removed after floor review",
      memo: "Approved by store manager.",
      lines: [{ productId: "prd-10015", quantity: -1, unitCost: 65 }],
      actor: "Olivia Chen",
      createdAt: "2026-09-06T18:32:00.000Z",
      postedAt: "2026-09-06T18:35:00.000Z",
    },
    {
      id: "operation-demo-count",
      reference: "CNT-0092",
      type: "count",
      status: "draft",
      date: "2026-09-07",
      locationId: retail.id,
      destinationId: "",
      supplier: "",
      billReference: "",
      billTerms: "",
      dueDate: "",
      freight: 0,
      discount: 0,
      reason: "Monthly fragrance wall count",
      memo: "Three SKUs remain to be counted.",
      lines: [
        { productId: "prd-10000", quantity: 258, unitCost: 15.68 },
        { productId: "prd-10014", quantity: 9, unitCost: 54.4 },
      ],
      actor: "Avery Morgan",
      createdAt: "2026-09-07T11:40:00.000Z",
    },
  ];
  data.movements = [
    {
      id: "movement-demo-adjustment",
      operationId: "operation-demo-adjustment",
      reference: "ADJ-0447",
      productId: "prd-10015",
      locationId: retail.id,
      type: "adjustment",
      quantity: -1,
      before: 10,
      after: 9,
      unitCost: 65,
      actor: "Olivia Chen",
      date: "2026-09-06T18:35:00.000Z",
      note: "Damaged tester removed after floor review",
    },
    {
      id: "movement-demo-transfer-in",
      operationId: "operation-demo-transfer",
      reference: "TRF-0906",
      productId: "prd-10014",
      locationId: retail.id,
      type: "transfer-in",
      quantity: 12,
      before: 9,
      after: 21,
      unitCost: 54.4,
      actor: "Daniel Brooks",
      date: "2026-09-06T12:18:00.000Z",
      note: "Transferred from Houston Main Warehouse",
    },
    {
      id: "movement-demo-transfer-out",
      operationId: "operation-demo-transfer",
      reference: "TRF-0906",
      productId: "prd-10014",
      locationId: warehouse.id,
      type: "transfer-out",
      quantity: -12,
      before: 36,
      after: 24,
      unitCost: 54.4,
      actor: "Daniel Brooks",
      date: "2026-09-06T12:18:00.000Z",
      note: "Transferred to Harwin Flagship Store",
    },
    {
      id: "movement-demo-receipt",
      operationId: "operation-demo-receipt",
      reference: "RCV-2418",
      productId: "prd-10000",
      locationId: warehouse.id,
      type: "receipt",
      quantity: 120,
      before: 80,
      after: 200,
      unitCost: 16,
      actor: "Maya Patel",
      date: "2026-09-05T15:05:00.000Z",
      note: "Supplier invoice INV-FF-8841",
    },
    ...data.movements,
  ];
}

export function createInventoryDemoSeed(): InventoryData {
  const data = createInventorySeed();
  addInventoryDemoHistory(data);
  data.pos = createPosDemoSeed(data);
  return data;
}

export function ensureInventoryDemoData(data: InventoryData) {
  addInventoryDemoHistory(data);
  if (
    !data.pos ||
    (!data.pos.sales.length &&
      !data.pos.customers.length &&
      !data.pos.shifts.length)
  )
    data.pos = createPosDemoSeed(data);
  return data;
}
