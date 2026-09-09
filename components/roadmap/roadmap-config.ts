import type { LucideIcon } from "lucide-react";
import {
  BanknoteArrowDown,
  BarChart3,
  BookOpenText,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  FileChartColumn,
  Landmark,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

export interface RoadmapRoute {
  key: string;
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface RoadmapModule {
  id: string;
  number: string;
  name: string;
  shortName: string;
  subtitle: string;
  phase: number;
  href: string;
  icon: LucideIcon;
  flagship?: boolean;
  locked?: boolean;
  routes: RoadmapRoute[];
}

function route(
  module: string,
  key: string,
  name: string,
  icon: LucideIcon,
  description: string,
): RoadmapRoute {
  return {
    key,
    name,
    href:
      key === "overview" ? `/preview/${module}` : `/preview/${module}/${key}`,
    icon,
    description,
  };
}

export const roadmapModules: RoadmapModule[] = [
  {
    id: "purchasing",
    number: "04",
    name: "Purchasing & Vendors",
    shortName: "Purchasing",
    subtitle: "From order to vendor bill",
    phase: 1,
    locked: true,
    href: "/preview/purchasing",
    icon: ShoppingCart,
    routes: [
      route(
        "purchasing",
        "overview",
        "Purchasing Overview",
        ClipboardList,
        "A live view of purchase commitments, inbound stock and landed cost.",
      ),
      route(
        "purchasing",
        "purchase-orders",
        "Purchase Orders",
        PackageCheck,
        "Track orders from draft through receipt with invoice-level cost history.",
      ),
      route(
        "purchasing",
        "vendors",
        "Vendors & Costs",
        Truck,
        "Compare vendor performance, original purchase price and transport cost.",
      ),
    ],
  },
  {
    id: "ecommerce",
    number: "05",
    name: "E-Commerce Hub",
    shortName: "E-Commerce",
    subtitle: "Connected sales channels",
    phase: 2,
    locked: true,
    href: "/preview/ecommerce",
    icon: Store,
    routes: [
      route(
        "ecommerce",
        "overview",
        "Commerce Overview",
        ChartNoAxesCombined,
        "See digital revenue, conversion and fulfillment health across channels.",
      ),
      route(
        "ecommerce",
        "channels",
        "Sales Channels",
        Store,
        "Manage channel connections, catalog sync and available-to-sell stock.",
      ),
      route(
        "ecommerce",
        "orders",
        "Online Orders",
        Boxes,
        "Coordinate online orders, payments and warehouse fulfillment.",
      ),
    ],
  },
  {
    id: "reports",
    number: "06",
    name: "Reports & Dashboards",
    shortName: "Reports",
    subtitle: "See the business at a glance",
    phase: 2,
    locked: true,
    href: "/preview/reports",
    icon: ChartNoAxesCombined,
    routes: [
      route(
        "reports",
        "overview",
        "Executive Dashboard",
        FileChartColumn,
        "A consolidated operating view across retail, wholesale and inventory.",
      ),
      route(
        "reports",
        "sales",
        "Sales Reports",
        ReceiptText,
        "Compare retail and wholesale sales, margin, discounts and tax.",
      ),
      route(
        "reports",
        "closing",
        "Closing Reports",
        BookOpenText,
        "Review daily closing totals for retail and wholesale operations.",
      ),
    ],
  },
  {
    id: "forecasting",
    number: "07",
    name: "Smart Demand Forecasting",
    shortName: "Forecasting",
    subtitle: "AI-assisted purchase planning",
    phase: 3,
    locked: false,
    href: "/preview/forecasting",
    icon: Sparkles,
    flagship: true,
    routes: [
      route(
        "forecasting",
        "overview",
        "Forecast Overview",
        Sparkles,
        "See forecast accuracy, projected demand and stock-out exposure.",
      ),
      route(
        "forecasting",
        "demand-forecast",
        "Demand Forecast",
        ChartNoAxesCombined,
        "Compare projected demand with actual sales by product and location.",
      ),
      route(
        "forecasting",
        "smart-reorder",
        "Smart Reorder Recommendation",
        PackageCheck,
        "Turn demand signals into explainable suggested purchase orders.",
      ),
    ],
  },
  {
    id: "finance",
    number: "08",
    name: "Accounting & Finance",
    shortName: "Finance",
    subtitle: "Books that stay in sync",
    phase: 3,
    locked: false,
    href: "/preview/finance",
    icon: Landmark,
    routes: [
      route(
        "finance",
        "overview",
        "Finance Overview",
        Landmark,
        "Understand revenue, profitability, cash and current obligations.",
      ),
      route(
        "finance",
        "ledgers",
        "Customer & Vendor Ledgers",
        BanknoteArrowDown,
        "Track customer balances, vendor bills, due dates and settlement history.",
      ),
      route(
        "finance",
        "live-pnl",
        "Live P&L / Financial Dashboard",
        BarChart3,
        "Monitor revenue, cost, profit, cash and tax as transactions are posted.",
      ),
    ],
  },
];

export function getRoadmapModule(slug: string) {
  return roadmapModules.find((module) => module.id === slug);
}

export function getRoadmapRoute(module: RoadmapModule, view?: string) {
  return (
    module.routes.find((item) => item.key === (view ?? "overview")) ??
    module.routes[0]
  );
}

export const roadmapOverviewIcons = {
  revenue: CircleDollarSign,
  location: Building2,
};
