import { createSeedData } from "./mock";
import type { InventoryData, Product, Taxonomy } from "@/types/inventory";

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
