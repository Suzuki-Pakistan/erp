"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Boxes,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  Gauge,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/core-setup/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getRoadmapModule,
  getRoadmapRoute,
  type RoadmapModule,
} from "@/components/roadmap/roadmap-config";

interface PreviewMetric {
  label: string;
  value: string;
  detail: string;
  change: string;
  direction: "up" | "down" | "neutral";
  icon: LucideIcon;
}

interface PreviewTable {
  title: string;
  description: string;
  columns: string[];
  rows: Array<{
    cells: string[];
    status: string;
    tone: "success" | "attention" | "info" | "neutral";
  }>;
}

interface PreviewData {
  heroTitle: string;
  heroDescription: string;
  pulseLabel: string;
  pulseValue: string;
  pulseDetail: string;
  primaryLabel: string;
  secondaryLabel: string;
  chartValue: "currency" | "number" | "percent";
  trend: Array<{ period: string; primary: number; secondary: number }>;
  metrics: PreviewMetric[];
  tables: Record<string, PreviewTable>;
  queueTitle: string;
  queueDescription: string;
  queue: Array<{
    title: string;
    detail: string;
    value: string;
    status: string;
    tone: "success" | "attention" | "info" | "neutral";
  }>;
  insightTitle: string;
  insight: string;
}

const previewData: Record<string, PreviewData> = {
  purchasing: {
    heroTitle: "Protect margin before inventory reaches the shelf.",
    heroDescription:
      "Keep invoice price, freight, duty and delivery charges separate, then calculate a traceable landed and average cost for every receipt.",
    pulseLabel: "Open commitment",
    pulseValue: "$48,760",
    pulseDetail: "Across 7 active purchase orders",
    primaryLabel: "Purchase value",
    secondaryLabel: "Landed cost",
    chartValue: "currency",
    trend: [
      { period: "Apr", primary: 28200, secondary: 30120 },
      { period: "May", primary: 34800, secondary: 37040 },
      { period: "Jun", primary: 31700, secondary: 34350 },
      { period: "Jul", primary: 42900, secondary: 45880 },
      { period: "Aug", primary: 38100, secondary: 40940 },
      { period: "Sep", primary: 48760, secondary: 52210 },
    ],
    metrics: [
      {
        label: "Open purchase orders",
        value: "7",
        detail: "3 expected this week",
        change: "+2 this month",
        direction: "up",
        icon: PackageCheck,
      },
      {
        label: "Goods in transit",
        value: "1,286",
        detail: "Units across 4 shipments",
        change: "62% allocated",
        direction: "neutral",
        icon: Truck,
      },
      {
        label: "Freight & duties",
        value: "$3,450",
        detail: "Kept separate from item price",
        change: "6.6% of landed cost",
        direction: "neutral",
        icon: ReceiptText,
      },
      {
        label: "Cost variance",
        value: "+2.8%",
        detail: "Against previous invoice",
        change: "Needs review",
        direction: "down",
        icon: Gauge,
      },
    ],
    tables: {
      overview: {
        title: "Purchase pipeline",
        description:
          "Current commitments with transparent landed-cost tracking.",
        columns: ["Order", "Vendor", "Arrival", "Original", "Landed"],
        rows: [
          {
            cells: [
              "PO-2418",
              "Famous Fragrance",
              "Sep 10",
              "$12,640",
              "$13,510",
            ],
            status: "In transit",
            tone: "info",
          },
          {
            cells: [
              "PO-2416",
              "Paris Beauty Supply",
              "Sep 12",
              "$9,870",
              "$10,420",
            ],
            status: "Confirmed",
            tone: "success",
          },
          {
            cells: ["PO-2413", "Gulf Cosmetics", "Sep 08", "$6,220", "$6,814"],
            status: "Receiving",
            tone: "attention",
          },
          {
            cells: ["PO-2409", "Premier Brands", "Sep 18", "$5,940", "$6,302"],
            status: "Approved",
            tone: "neutral",
          },
        ],
      },
      "purchase-orders": {
        title: "Purchase order control",
        description:
          "Approval, receiving and vendor invoice status at a glance.",
        columns: ["Order", "Items", "Received", "Invoice", "Total"],
        rows: [
          {
            cells: ["PO-2418", "28 SKUs", "0 / 420", "Pending", "$13,510"],
            status: "In transit",
            tone: "info",
          },
          {
            cells: ["PO-2416", "18 SKUs", "0 / 310", "Matched", "$10,420"],
            status: "Confirmed",
            tone: "success",
          },
          {
            cells: ["PO-2413", "11 SKUs", "164 / 220", "Variance", "$6,814"],
            status: "Receiving",
            tone: "attention",
          },
          {
            cells: ["PO-2409", "9 SKUs", "0 / 144", "Not received", "$6,302"],
            status: "Approved",
            tone: "neutral",
          },
        ],
      },
      vendors: {
        title: "Vendor and cost comparison",
        description:
          "Compare lead time, invoice price and cost movement without opening paper invoices.",
        columns: ["Vendor", "Lead time", "Last invoice", "Freight", "Variance"],
        rows: [
          {
            cells: ["Famous Fragrance", "9 days", "$12,640", "$690", "+1.8%"],
            status: "Preferred",
            tone: "success",
          },
          {
            cells: [
              "Paris Beauty Supply",
              "12 days",
              "$9,870",
              "$420",
              "-0.6%",
            ],
            status: "On target",
            tone: "success",
          },
          {
            cells: ["Gulf Cosmetics", "16 days", "$6,220", "$510", "+4.9%"],
            status: "Review",
            tone: "attention",
          },
          {
            cells: ["Premier Brands", "14 days", "$5,940", "$280", "+1.2%"],
            status: "Active",
            tone: "info",
          },
        ],
      },
    },
    queueTitle: "Cost allocation",
    queueDescription: "Charges waiting to be finalized before receipt posting.",
    queue: [
      {
        title: "PO-2418 · Air freight",
        detail: "Allocate by quantity",
        value: "$690",
        status: "Ready",
        tone: "success",
      },
      {
        title: "PO-2413 · Import duty",
        detail: "Invoice document missing",
        value: "$384",
        status: "Review",
        tone: "attention",
      },
      {
        title: "PO-2416 · Local delivery",
        detail: "Allocate by weight",
        value: "$130",
        status: "Draft",
        tone: "neutral",
      },
    ],
    insightTitle: "Landed-cost insight",
    insight:
      "Separating freight and duty exposes a 2.8% cost increase that would be hidden inside average cost alone.",
  },
  wholesale: {
    heroTitle: "Give every reseller the right price, terms and service level.",
    heroDescription:
      "Bring account-specific pricing, bulk orders, credit control and fulfillment into one focused B2B workspace.",
    pulseLabel: "Wholesale sales",
    pulseValue: "$73,280",
    pulseDetail: "September month to date",
    primaryLabel: "Net sales",
    secondaryLabel: "Gross profit",
    chartValue: "currency",
    trend: [
      { period: "Apr", primary: 51200, secondary: 17400 },
      { period: "May", primary: 58400, secondary: 19860 },
      { period: "Jun", primary: 54800, secondary: 18420 },
      { period: "Jul", primary: 64700, secondary: 22400 },
      { period: "Aug", primary: 68900, secondary: 23810 },
      { period: "Sep", primary: 73280, secondary: 26140 },
    ],
    metrics: [
      {
        label: "Open B2B orders",
        value: "18",
        detail: "$31,420 order value",
        change: "+11.8%",
        direction: "up",
        icon: ShoppingBag,
      },
      {
        label: "Active accounts",
        value: "46",
        detail: "8 VIP-tier resellers",
        change: "+4 this quarter",
        direction: "up",
        icon: UsersRound,
      },
      {
        label: "Receivables",
        value: "$28,940",
        detail: "$4,210 overdue",
        change: "14.5% overdue",
        direction: "down",
        icon: Banknote,
      },
      {
        label: "Average order",
        value: "$1,184",
        detail: "Across all price tiers",
        change: "+6.2%",
        direction: "up",
        icon: BadgeDollarSign,
      },
    ],
    tables: {
      overview: {
        title: "Wholesale activity",
        description: "Priority accounts and orders requiring attention.",
        columns: ["Order", "Account", "Tier", "Due", "Total"],
        rows: [
          {
            cells: ["B2B-5814", "Beauty Depot", "VIP", "Sep 08", "$4,820"],
            status: "Picking",
            tone: "info",
          },
          {
            cells: ["B2B-5812", "Scent House", "Wholesale", "Sep 09", "$2,760"],
            status: "Approved",
            tone: "success",
          },
          {
            cells: ["B2B-5807", "Noor Cosmetics", "VIP", "Sep 07", "$6,140"],
            status: "Credit hold",
            tone: "attention",
          },
          {
            cells: [
              "B2B-5804",
              "The Perfume Shop",
              "Wholesale",
              "Sep 12",
              "$1,980",
            ],
            status: "Confirmed",
            tone: "neutral",
          },
        ],
      },
      orders: {
        title: "B2B order fulfillment",
        description: "Order progress with allocation and delivery commitments.",
        columns: ["Order", "Lines", "Allocated", "Ship via", "Total"],
        rows: [
          {
            cells: ["B2B-5814", "22", "100%", "Local courier", "$4,820"],
            status: "Picking",
            tone: "info",
          },
          {
            cells: ["B2B-5812", "14", "86%", "Customer pickup", "$2,760"],
            status: "Approved",
            tone: "success",
          },
          {
            cells: ["B2B-5807", "31", "100%", "Freight", "$6,140"],
            status: "Credit hold",
            tone: "attention",
          },
          {
            cells: ["B2B-5804", "9", "72%", "Local courier", "$1,980"],
            status: "Confirmed",
            tone: "neutral",
          },
        ],
      },
      accounts: {
        title: "Account health",
        description:
          "Credit exposure, pricing tiers and recent purchase activity.",
        columns: [
          "Account",
          "Price tier",
          "Credit limit",
          "Balance",
          "Last order",
        ],
        rows: [
          {
            cells: ["Beauty Depot", "VIP", "$25,000", "$8,420", "Today"],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: [
              "Scent House",
              "Wholesale",
              "$15,000",
              "$5,180",
              "Yesterday",
            ],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: ["Noor Cosmetics", "VIP", "$20,000", "$21,240", "Sep 04"],
            status: "Over limit",
            tone: "attention",
          },
          {
            cells: [
              "The Perfume Shop",
              "Wholesale",
              "$10,000",
              "$3,670",
              "Sep 02",
            ],
            status: "Active",
            tone: "info",
          },
        ],
      },
    },
    queueTitle: "Account attention",
    queueDescription: "Credit and fulfillment decisions for the team.",
    queue: [
      {
        title: "Noor Cosmetics",
        detail: "Credit limit exceeded",
        value: "$1,240",
        status: "Review",
        tone: "attention",
      },
      {
        title: "Beauty Depot",
        detail: "VIP reorder submitted",
        value: "$4,820",
        status: "Approve",
        tone: "info",
      },
      {
        title: "Scent House",
        detail: "Payment received",
        value: "$2,000",
        status: "Cleared",
        tone: "success",
      },
    ],
    insightTitle: "Wholesale insight",
    insight:
      "VIP accounts are 17% of active resellers but contribute 38% of current wholesale gross profit.",
  },
  ecommerce: {
    heroTitle: "One catalog and stock position across every online channel.",
    heroDescription:
      "Connect digital storefronts, protect available-to-sell inventory and move orders into a single fulfillment queue.",
    pulseLabel: "Digital revenue",
    pulseValue: "$41,960",
    pulseDetail: "12.6% ahead of last month",
    primaryLabel: "Revenue",
    secondaryLabel: "Fulfilled value",
    chartValue: "currency",
    trend: [
      { period: "Apr", primary: 28400, secondary: 26900 },
      { period: "May", primary: 31100, secondary: 29820 },
      { period: "Jun", primary: 30600, secondary: 28750 },
      { period: "Jul", primary: 34700, secondary: 33180 },
      { period: "Aug", primary: 37260, secondary: 35890 },
      { period: "Sep", primary: 41960, secondary: 39120 },
    ],
    metrics: [
      {
        label: "Online orders",
        value: "326",
        detail: "September month to date",
        change: "+12.6%",
        direction: "up",
        icon: ShoppingBag,
      },
      {
        label: "Awaiting fulfillment",
        value: "24",
        detail: "7 priority shipments",
        change: "3.1h average age",
        direction: "neutral",
        icon: Boxes,
      },
      {
        label: "Conversion rate",
        value: "3.84%",
        detail: "Across connected stores",
        change: "+0.42 pts",
        direction: "up",
        icon: BarChart3,
      },
      {
        label: "Catalog sync",
        value: "98.7%",
        detail: "1,482 products current",
        change: "19 need review",
        direction: "down",
        icon: Store,
      },
    ],
    tables: {
      overview: {
        title: "Channel performance",
        description: "Sales and operating health by connected storefront.",
        columns: ["Channel", "Orders", "Revenue", "Conversion", "Sync"],
        rows: [
          {
            cells: ["Flair online", "184", "$24,680", "4.12%", "100%"],
            status: "Live",
            tone: "success",
          },
          {
            cells: ["Instagram Shop", "76", "$8,940", "3.66%", "99.4%"],
            status: "Live",
            tone: "success",
          },
          {
            cells: ["Marketplace", "52", "$6,870", "2.91%", "96.1%"],
            status: "Review",
            tone: "attention",
          },
          {
            cells: ["Click & collect", "14", "$1,470", "—", "100%"],
            status: "Live",
            tone: "info",
          },
        ],
      },
      channels: {
        title: "Channel connections",
        description: "Catalog, price and inventory synchronization status.",
        columns: [
          "Channel",
          "Products",
          "Price sync",
          "Stock sync",
          "Last sync",
        ],
        rows: [
          {
            cells: ["Flair online", "1,506", "Current", "Current", "2 min ago"],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: [
              "Instagram Shop",
              "1,482",
              "Current",
              "Current",
              "8 min ago",
            ],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: [
              "Marketplace",
              "1,421",
              "19 errors",
              "38 min old",
              "38 min ago",
            ],
            status: "Review",
            tone: "attention",
          },
          {
            cells: [
              "Click & collect",
              "1,506",
              "Current",
              "Current",
              "5 min ago",
            ],
            status: "Healthy",
            tone: "info",
          },
        ],
      },
      orders: {
        title: "Online fulfillment queue",
        description:
          "Paid orders moving through picking, packing and delivery.",
        columns: ["Order", "Channel", "Items", "Promise", "Total"],
        rows: [
          {
            cells: ["WEB-90218", "Flair online", "3", "Today", "$318"],
            status: "Packing",
            tone: "info",
          },
          {
            cells: ["IG-18442", "Instagram Shop", "2", "Today", "$184"],
            status: "Picking",
            tone: "info",
          },
          {
            cells: ["MKT-44107", "Marketplace", "1", "Overdue", "$109"],
            status: "Exception",
            tone: "attention",
          },
          {
            cells: ["WEB-90211", "Flair online", "4", "Tomorrow", "$462"],
            status: "Allocated",
            tone: "success",
          },
        ],
      },
    },
    queueTitle: "Fulfillment pulse",
    queueDescription: "Orders and channel tasks that need attention.",
    queue: [
      {
        title: "7 priority orders",
        detail: "Same-day promise",
        value: "$1,280",
        status: "Pack now",
        tone: "attention",
      },
      {
        title: "Marketplace sync",
        detail: "19 price exceptions",
        value: "19",
        status: "Review",
        tone: "attention",
      },
      {
        title: "Instagram Shop",
        detail: "Catalog synchronized",
        value: "1,482",
        status: "Healthy",
        tone: "success",
      },
    ],
    insightTitle: "Commerce insight",
    insight:
      "Flair Online converts 42% better than marketplace traffic and carries the strongest average order value.",
  },
  reports: {
    heroTitle:
      "A single operating truth for retail, wholesale and online sales.",
    heroDescription:
      "Combine sales, discounts, tax, margin and inventory signals into clear daily and management reporting.",
    pulseLabel: "Net sales",
    pulseValue: "$128,420",
    pulseDetail: "All channels · September MTD",
    primaryLabel: "Net sales",
    secondaryLabel: "Gross profit",
    chartValue: "currency",
    trend: [
      { period: "Apr", primary: 98200, secondary: 42100 },
      { period: "May", primary: 107400, secondary: 46100 },
      { period: "Jun", primary: 103800, secondary: 43900 },
      { period: "Jul", primary: 116900, secondary: 50800 },
      { period: "Aug", primary: 121600, secondary: 53700 },
      { period: "Sep", primary: 128420, secondary: 57615 },
    ],
    metrics: [
      {
        label: "Retail sales",
        value: "$55,140",
        detail: "42.9% of total sales",
        change: "+8.4%",
        direction: "up",
        icon: Store,
      },
      {
        label: "Wholesale sales",
        value: "$73,280",
        detail: "57.1% of total sales",
        change: "+11.8%",
        direction: "up",
        icon: ShoppingBag,
      },
      {
        label: "Gross margin",
        value: "44.9%",
        detail: "$57,615 gross profit",
        change: "+1.3 pts",
        direction: "up",
        icon: BadgeDollarSign,
      },
      {
        label: "Sales tax",
        value: "$8,994",
        detail: "8.25% configured rate",
        change: "Fully reconciled",
        direction: "neutral",
        icon: ReceiptText,
      },
    ],
    tables: {
      overview: {
        title: "Channel summary",
        description: "Current performance by sales channel and customer type.",
        columns: ["Channel", "Gross sales", "Discounts", "Net sales", "Margin"],
        rows: [
          {
            cells: ["Retail POS", "$58,960", "$3,820", "$55,140", "47.2%"],
            status: "On target",
            tone: "success",
          },
          {
            cells: ["Wholesale", "$76,440", "$3,160", "$73,280", "35.7%"],
            status: "On target",
            tone: "success",
          },
          {
            cells: ["E-Commerce", "$41,960", "$2,240", "$39,720", "51.8%"],
            status: "Preview",
            tone: "info",
          },
          {
            cells: ["Returns", "-$4,280", "$0", "-$4,280", "—"],
            status: "Normal",
            tone: "neutral",
          },
        ],
      },
      sales: {
        title: "Sales and discount analysis",
        description:
          "Discount effectiveness with margin protection by channel.",
        columns: [
          "Segment",
          "Transactions",
          "Avg. sale",
          "Discount",
          "Net margin",
        ],
        rows: [
          {
            cells: ["Retail full price", "281", "$148", "0.0%", "52.4%"],
            status: "Strong",
            tone: "success",
          },
          {
            cells: ["Buy 1, second 50%", "84", "$196", "16.8%", "44.1%"],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: ["Wholesale", "62", "$1,184", "4.1%", "35.7%"],
            status: "On target",
            tone: "info",
          },
          {
            cells: ["VIP", "38", "$382", "9.6%", "39.8%"],
            status: "Review",
            tone: "attention",
          },
        ],
      },
      closing: {
        title: "Daily closing report",
        description:
          "Retail and wholesale close totals with tender reconciliation.",
        columns: ["Business", "Cash", "Card", "Tax", "Net sales"],
        rows: [
          {
            cells: ["Harwin Retail", "$3,840", "$7,490", "$858", "$10,402"],
            status: "Closed",
            tone: "success",
          },
          {
            cells: ["Hillcroft Retail", "$2,180", "$4,260", "$487", "$5,902"],
            status: "Closed",
            tone: "success",
          },
          {
            cells: ["Wholesale desk", "$1,200", "$12,640", "$0", "$13,840"],
            status: "Closed",
            tone: "success",
          },
          {
            cells: ["Online", "$0", "$6,280", "$475", "$5,805"],
            status: "Preview",
            tone: "info",
          },
        ],
      },
    },
    queueTitle: "Management signals",
    queueDescription: "Exceptions surfaced from today’s operating reports.",
    queue: [
      {
        title: "Hillcroft drawer",
        detail: "$18 under expected cash",
        value: "-$18",
        status: "Review",
        tone: "attention",
      },
      {
        title: "Retail discount rate",
        detail: "Within approved threshold",
        value: "6.5%",
        status: "Healthy",
        tone: "success",
      },
      {
        title: "Wholesale receivables",
        detail: "4 invoices due this week",
        value: "$8,420",
        status: "Monitor",
        tone: "info",
      },
    ],
    insightTitle: "Executive insight",
    insight:
      "Wholesale leads revenue, while Retail POS contributes the higher gross margin and stronger cash conversion.",
  },
  forecasting: {
    heroTitle: "Know what will sell before stock runs short.",
    heroDescription:
      "Blend sales velocity, seasonality, lead time and safety stock into explainable forecasts and suggested replenishment.",
    pulseLabel: "30-day forecast",
    pulseValue: "1,842 units",
    pulseDetail: "88.4% model accuracy",
    primaryLabel: "Actual demand",
    secondaryLabel: "Forecast demand",
    chartValue: "number",
    trend: [
      { period: "Wk 1", primary: 286, secondary: 301 },
      { period: "Wk 2", primary: 318, secondary: 326 },
      { period: "Wk 3", primary: 352, secondary: 344 },
      { period: "Wk 4", primary: 381, secondary: 397 },
      { period: "Wk 5", primary: 422, secondary: 438 },
      { period: "Wk 6", primary: 0, secondary: 462 },
    ],
    metrics: [
      {
        label: "Forecast demand",
        value: "1,842",
        detail: "Units over next 30 days",
        change: "+14.2%",
        direction: "up",
        icon: Sparkles,
      },
      {
        label: "Stock-out risk",
        value: "6 SKUs",
        detail: "$8,940 revenue at risk",
        change: "2 urgent",
        direction: "down",
        icon: CircleAlert,
      },
      {
        label: "Suggested purchase",
        value: "$18,760",
        detail: "14 products · 3 vendors",
        change: "Ready to review",
        direction: "neutral",
        icon: PackageCheck,
      },
      {
        label: "Forecast accuracy",
        value: "88.4%",
        detail: "Trailing 8-week accuracy",
        change: "+3.1 pts",
        direction: "up",
        icon: Gauge,
      },
    ],
    tables: {
      overview: {
        title: "Demand watchlist",
        description:
          "Products with the strongest opportunity or inventory risk.",
        columns: [
          "Product",
          "On hand",
          "30-day demand",
          "Cover",
          "Opportunity",
        ],
        rows: [
          {
            cells: [
              "Lattafa Yara Pink 3.4oz",
              "42",
              "126",
              "10 days",
              "$4,284",
            ],
            status: "Reorder now",
            tone: "attention",
          },
          {
            cells: ["Gucci Bamboo 2.5oz", "18", "54", "10 days", "$5,886"],
            status: "Reorder now",
            tone: "attention",
          },
          {
            cells: ["Burberry Weekend 1.6oz", "76", "61", "37 days", "$2,989"],
            status: "Healthy",
            tone: "success",
          },
          {
            cells: [
              "Armaf Club de Nuit 3.6oz",
              "94",
              "82",
              "34 days",
              "$4,018",
            ],
            status: "Healthy",
            tone: "success",
          },
        ],
      },
      "demand-planner": {
        title: "Forecast versus actual",
        description:
          "Explainable demand drivers and location-level planning confidence.",
        columns: [
          "Product",
          "Actual 30d",
          "Forecast 30d",
          "Accuracy",
          "Signal",
        ],
        rows: [
          {
            cells: [
              "Lattafa Yara Pink 3.4oz",
              "118",
              "126",
              "93.7%",
              "Velocity rising",
            ],
            status: "High confidence",
            tone: "success",
          },
          {
            cells: [
              "Gucci Bamboo 2.5oz",
              "47",
              "54",
              "87.0%",
              "Promotion lift",
            ],
            status: "High confidence",
            tone: "success",
          },
          {
            cells: [
              "Burberry Weekend 1.6oz",
              "70",
              "61",
              "85.2%",
              "Trend softening",
            ],
            status: "Monitor",
            tone: "info",
          },
          {
            cells: [
              "Armaf Club de Nuit 3.6oz",
              "75",
              "82",
              "91.5%",
              "Seasonal lift",
            ],
            status: "High confidence",
            tone: "success",
          },
        ],
      },
      replenishment: {
        title: "Suggested replenishment",
        description:
          "Recommended quantities using lead time, cover and minimum order rules.",
        columns: [
          "Product",
          "Vendor",
          "Suggested",
          "Cost",
          "After-order cover",
        ],
        rows: [
          {
            cells: [
              "Lattafa Yara Pink 3.4oz",
              "Famous Fragrance",
              "120 units",
              "$1,920",
              "38 days",
            ],
            status: "Urgent",
            tone: "attention",
          },
          {
            cells: [
              "Gucci Bamboo 2.5oz",
              "Premier Brands",
              "48 units",
              "$3,120",
              "37 days",
            ],
            status: "Urgent",
            tone: "attention",
          },
          {
            cells: [
              "Afnan Turathi Red 3.0oz",
              "Gulf Cosmetics",
              "72 units",
              "$2,232",
              "42 days",
            ],
            status: "Suggested",
            tone: "info",
          },
          {
            cells: [
              "Jimmy Choo I Want Choo",
              "Paris Beauty Supply",
              "36 units",
              "$2,016",
              "39 days",
            ],
            status: "Suggested",
            tone: "info",
          },
        ],
      },
    },
    queueTitle: "AI recommendations",
    queueDescription: "Explainable actions ranked by revenue protection.",
    queue: [
      {
        title: "Lattafa Yara Pink",
        detail: "10 days of cover remaining",
        value: "120 units",
        status: "Urgent",
        tone: "attention",
      },
      {
        title: "Gucci Bamboo",
        detail: "Promotion demand detected",
        value: "48 units",
        status: "Urgent",
        tone: "attention",
      },
      {
        title: "Burberry Weekend",
        detail: "Demand cooling 8%",
        value: "Hold",
        status: "Monitor",
        tone: "info",
      },
    ],
    insightTitle: "Forecast insight",
    insight:
      "Two early purchase orders could protect approximately $10,170 in sales during the next 30 days.",
  },
  finance: {
    heroTitle: "See profitability and cash without waiting for month end.",
    heroDescription:
      "Keep sales, cost, tax, purchasing and tender activity connected so finance always reflects the operating day.",
    pulseLabel: "Net operating profit",
    pulseValue: "$33,635",
    pulseDetail: "26.2% operating margin",
    primaryLabel: "Revenue",
    secondaryLabel: "Operating expenses",
    chartValue: "currency",
    trend: [
      { period: "Apr", primary: 98200, secondary: 21800 },
      { period: "May", primary: 107400, secondary: 22400 },
      { period: "Jun", primary: 103800, secondary: 23100 },
      { period: "Jul", primary: 116900, secondary: 22900 },
      { period: "Aug", primary: 121600, secondary: 23500 },
      { period: "Sep", primary: 128420, secondary: 23980 },
    ],
    metrics: [
      {
        label: "Net revenue",
        value: "$128,420",
        detail: "September month to date",
        change: "+10.1%",
        direction: "up",
        icon: BarChart3,
      },
      {
        label: "Gross profit",
        value: "$57,615",
        detail: "44.9% blended margin",
        change: "+1.3 pts",
        direction: "up",
        icon: BadgeDollarSign,
      },
      {
        label: "Operating expenses",
        value: "$23,980",
        detail: "18.7% of revenue",
        change: "1.1% below plan",
        direction: "up",
        icon: ReceiptText,
      },
      {
        label: "Cash position",
        value: "$84,640",
        detail: "Across cash and bank accounts",
        change: "+$12,480",
        direction: "up",
        icon: WalletCards,
      },
    ],
    tables: {
      overview: {
        title: "Profitability snapshot",
        description: "Current-period results compared with the previous month.",
        columns: ["Account", "September", "August", "Change", "Margin"],
        rows: [
          {
            cells: ["Net sales", "$128,420", "$121,600", "+5.6%", "100%"],
            status: "Ahead",
            tone: "success",
          },
          {
            cells: [
              "Cost of goods sold",
              "$70,805",
              "$67,900",
              "+4.3%",
              "55.1%",
            ],
            status: "On plan",
            tone: "info",
          },
          {
            cells: ["Gross profit", "$57,615", "$53,700", "+7.3%", "44.9%"],
            status: "Ahead",
            tone: "success",
          },
          {
            cells: [
              "Operating expenses",
              "$23,980",
              "$23,500",
              "+2.0%",
              "18.7%",
            ],
            status: "On plan",
            tone: "neutral",
          },
        ],
      },
      "profit-loss": {
        title: "Profit & loss by channel",
        description:
          "Revenue and contribution after channel-specific cost and discounts.",
        columns: ["Channel", "Net sales", "COGS", "Gross profit", "Margin"],
        rows: [
          {
            cells: ["Retail POS", "$55,140", "$29,120", "$26,020", "47.2%"],
            status: "Strong",
            tone: "success",
          },
          {
            cells: ["Wholesale", "$73,280", "$47,140", "$26,140", "35.7%"],
            status: "On target",
            tone: "success",
          },
          {
            cells: [
              "E-Commerce preview",
              "$39,720",
              "$19,150",
              "$20,570",
              "51.8%",
            ],
            status: "Preview",
            tone: "info",
          },
          {
            cells: ["Returns & refunds", "-$4,280", "-$2,100", "-$2,180", "—"],
            status: "Normal",
            tone: "neutral",
          },
        ],
      },
      "cash-flow": {
        title: "Cash movement",
        description:
          "Cash, card settlements and purchasing commitments in one view.",
        columns: ["Account", "Opening", "Inflows", "Outflows", "Closing"],
        rows: [
          {
            cells: [
              "Operating bank",
              "$42,180",
              "$78,640",
              "$54,920",
              "$65,900",
            ],
            status: "Reconciled",
            tone: "success",
          },
          {
            cells: ["Card clearing", "$4,620", "$31,840", "$30,190", "$6,270"],
            status: "Pending settle",
            tone: "info",
          },
          {
            cells: ["Retail cash", "$6,440", "$14,280", "$8,250", "$12,470"],
            status: "Reconciled",
            tone: "success",
          },
          {
            cells: ["Purchase commitments", "$0", "$0", "$48,760", "-$48,760"],
            status: "Planned",
            tone: "neutral",
          },
        ],
      },
    },
    queueTitle: "Finance attention",
    queueDescription:
      "Reconciliations and obligations approaching their due date.",
    queue: [
      {
        title: "Card settlement",
        detail: "Expected Sep 08",
        value: "$6,270",
        status: "Pending",
        tone: "info",
      },
      {
        title: "Sales tax payable",
        detail: "8.25% · due Sep 20",
        value: "$8,994",
        status: "Scheduled",
        tone: "neutral",
      },
      {
        title: "Vendor bills",
        detail: "3 due within 7 days",
        value: "$14,820",
        status: "Review",
        tone: "attention",
      },
    ],
    insightTitle: "Finance insight",
    insight:
      "Gross profit is growing faster than revenue while operating expenses remain below plan, lifting operating margin to 26.2%.",
  },
};

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  attention: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-stone-200 bg-stone-100 text-stone-600",
};

function compact(value: number, style: PreviewData["chartValue"]) {
  if (style === "currency") {
    return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
  }
  if (style === "percent") return `${value}%`;
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ModulePreviewPage({
  moduleId,
  view,
}: {
  moduleId: string;
  view?: string;
}) {
  const moduleConfig = getRoadmapModule(moduleId) as RoadmapModule;
  const route = getRoadmapRoute(moduleConfig, view);
  const data = previewData[moduleConfig.id];
  const [period, setPeriod] = useState("mtd");
  const [location, setLocation] = useState("all");
  const table = data.tables[route.key] ?? data.tables.overview;
  const chartTitle =
    route.key === "overview"
      ? `${data.primaryLabel} trend`
      : `${route.name} trend`;
  const scale = period === "quarter" ? 1.12 : period === "year" ? 1.28 : 1;
  const trend = useMemo(
    () =>
      data.trend.map((item) => ({
        ...item,
        primary: Math.round(item.primary * scale),
        secondary: Math.round(item.secondary * scale),
      })),
    [data.trend, scale],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Module ${moduleConfig.number} · ${moduleConfig.name}`}
        title={route.name}
        description={route.description}
        actions={
          <>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-9 min-w-[150px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="harwin">Harwin Retail</SelectItem>
                <SelectItem value="hillcroft">Hillcroft Retail</SelectItem>
                <SelectItem value="warehouse">Main Warehouse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 min-w-[142px] bg-card">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">Month to date</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="year">Year to date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-9 bg-card"
              onClick={() =>
                toast.info("Export is represented in this interface preview.", {
                  description: "Live exports will be enabled with this module.",
                })
              }
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </>
        }
      />

      <section className="relative overflow-hidden rounded-2xl bg-[var(--brand-ink)] p-5 text-white shadow-[0_20px_60px_-38px_rgba(7,40,53,.88)] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[var(--brand-champagne)]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 size-56 rounded-full bg-cyan-300/7 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/12 bg-white/9 text-white">
                Interface preview
              </Badge>
              <Badge
                variant="outline"
                className="border-[var(--brand-champagne)]/35 bg-[var(--brand-champagne)]/8 text-[var(--brand-champagne)]"
              >
                Phase {moduleConfig.phase}
              </Badge>
              {moduleConfig.flagship && (
                <Badge className="border-violet-300/20 bg-violet-300/10 text-violet-100">
                  <Sparkles className="size-3" /> Flagship
                </Badge>
              )}
            </div>
            <h2 className="mt-4 max-w-2xl font-heading text-2xl font-semibold tracking-[-0.03em] sm:text-[30px] sm:leading-9">
              {data.heroTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
              {data.heroDescription}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/45">
              <span className="flex items-center gap-1.5">
                <CircleCheck className="size-3.5 text-emerald-300" /> Demo data
                connected
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-[var(--brand-champagne)]" />{" "}
                Refreshed just now
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
              {data.pulseLabel}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {data.pulseValue}
            </p>
            <p className="mt-2 text-xs text-white/50">{data.pulseDetail}</p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[78%] rounded-full bg-[var(--brand-champagne)]" />
            </div>
            <p className="mt-2 text-[10px] text-white/35">
              Illustrative performance ·{" "}
              {location === "all" ? "All locations" : "Selected location"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <Card key={metric.label} className="metric-card py-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-[27px] font-semibold tracking-[-0.04em]">
                    {metric.value}
                  </p>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-primary/6 text-primary">
                  <metric.icon className="size-4" strokeWidth={1.8} />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-[11px]">
                <span className="truncate text-muted-foreground">
                  {metric.detail}
                </span>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 font-medium",
                    metric.direction === "up"
                      ? "text-emerald-700"
                      : metric.direction === "down"
                        ? "text-amber-700"
                        : "text-primary/70",
                  )}
                >
                  {metric.direction === "up" && (
                    <ArrowUpRight className="size-3" />
                  )}
                  {metric.direction === "down" && (
                    <ArrowDownRight className="size-3" />
                  )}
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader className="border-b pb-4">
            <SectionTitle
              title={chartTitle}
              description={`${data.primaryLabel} compared with ${data.secondaryLabel.toLowerCase()} using illustrative demo data.`}
              action={
                <Badge
                  variant="outline"
                  className="h-6 rounded-md bg-background text-[10px] text-muted-foreground"
                >
                  {period === "mtd"
                    ? "6-month view"
                    : period === "quarter"
                      ? "Quarter scenario"
                      : "Annual scenario"}
                </Badge>
              }
            />
          </CardHeader>
          <CardContent className="px-2 pb-1 pt-4 sm:px-5">
            <div className="h-[286px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trend}
                  margin={{ top: 8, right: 12, left: -8, bottom: 2 }}
                >
                  <defs>
                    <linearGradient
                      id={`primary-${moduleConfig.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#0b4254"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor="#0b4254"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    vertical={false}
                    stroke="#e8e2d9"
                  />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#7a7d7d" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(value) =>
                      compact(Number(value), data.chartValue)
                    }
                    tick={{ fontSize: 10, fill: "#8a8d8d" }}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      compact(Number(value), data.chartValue),
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      borderColor: "#e2ddd4",
                      boxShadow: "0 14px 36px -24px rgba(7,40,53,.45)",
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="primary"
                    name={data.primaryLabel}
                    stroke="#0b4254"
                    strokeWidth={2.25}
                    fill={`url(#primary-${moduleConfig.id})`}
                  />
                  <Area
                    type="monotone"
                    dataKey="secondary"
                    name={data.secondaryLabel}
                    stroke="#b69154"
                    strokeWidth={2}
                    fill="transparent"
                    strokeDasharray="4 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:col-span-4">
          <Card className="bg-[var(--brand-ink)] text-white ring-white/8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--brand-champagne)]/14 text-[var(--brand-champagne)]">
                  <Sparkles className="size-4" />
                </span>
                <SectionTitle
                  title={data.insightTitle}
                  className="[&_h2]:text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-white/62">{data.insight}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 -ml-2 h-8 text-[11px] text-[var(--brand-champagne)] hover:bg-white/7 hover:text-white"
                onClick={() =>
                  toast.info(
                    "This insight is based on illustrative preview data.",
                  )
                }
              >
                View explanation <ArrowUpRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionTitle
                title={data.queueTitle}
                description={data.queueDescription}
              />
            </CardHeader>
            <CardContent className="space-y-1">
              {data.queue.map((item) => (
                <button
                  type="button"
                  key={item.title}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/65"
                  onClick={() =>
                    toast.info(`${item.title} is shown as preview data.`)
                  }
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      item.tone === "success"
                        ? "bg-emerald-500"
                        : item.tone === "attention"
                          ? "bg-amber-500"
                          : item.tone === "info"
                            ? "bg-sky-500"
                            : "bg-stone-400",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs font-semibold tabular-nums">
                      {item.value}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-muted-foreground">
                      {item.status}
                    </span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b pb-4">
          <SectionTitle
            title={table.title}
            description={table.description}
            action={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-primary"
                onClick={() =>
                  toast.info(
                    "Detailed drill-down is part of the full module build.",
                  )
                }
              >
                Open full view <ArrowUpRight className="size-3.5" />
              </Button>
            }
          />
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/35 hover:bg-muted/35">
                {table.columns.map((column) => (
                  <TableHead
                    key={column}
                    className="h-10 px-4 text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {column}
                  </TableHead>
                ))}
                <TableHead className="h-10 px-4 text-right text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row, index) => (
                <TableRow key={`${row.cells[0]}-${index}`}>
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell
                      key={`${cell}-${cellIndex}`}
                      className={cn(
                        "px-4 py-3 text-xs",
                        cellIndex === 0
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                        cellIndex >= 2 && "tabular-nums",
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                  <TableCell className="px-4 py-3 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 rounded-md px-2 text-[10px] font-medium",
                        toneClasses[row.tone],
                      )}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/25 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Preview mode uses illustrative business data and does not create
          accounting or operational records.
        </p>
        <Button
          asChild
          variant="link"
          size="sm"
          className="h-auto justify-start p-0 text-xs sm:justify-end"
        >
          <Link href="/core-setup">Return to Phase One overview</Link>
        </Button>
      </div>
    </div>
  );
}
