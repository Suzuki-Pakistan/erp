"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Landmark,
  LockKeyhole,
  Menu,
  Plus,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  UserRound,
  UsersRound,
  Warehouse,
  X,
  ReceiptText,
  RotateCcw,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { useAppUi } from "@/components/providers/app-providers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { useSessionUser } from "@/components/auth/session-provider";
import { accessRoles, canAccess } from "@/types/auth";

const childRoutes = [
  { name: "Overview", href: "/core-setup", icon: Settings2 },
  {
    name: "Stores & Warehouses",
    href: "/core-setup/stores-warehouses",
    icon: Warehouse,
  },
  { name: "Users & Roles", href: "/core-setup/users-roles", icon: UsersRound },
  { name: "Permissions", href: "/core-setup/permissions", icon: ShieldCheck },
  {
    name: "Company Settings",
    href: "/core-setup/company-settings",
    icon: Building2,
  },
  { name: "Login Access", href: "/core-setup/login-access", icon: LockKeyhole },
];

const inventoryRoutes = [
  { name: "Inventory Overview", href: "/product-inventory", icon: Boxes },
  { name: "Product Catalog", href: "/product-inventory/products", icon: Store },
  { name: "Stock Explorer", href: "/product-inventory/stock", icon: Warehouse },
  {
    name: "Stock Operations",
    href: "/product-inventory/operations",
    icon: ShoppingCart,
  },
  {
    name: "Pricing & Margins",
    href: "/product-inventory/pricing",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Categories & Brands",
    href: "/product-inventory/categories-brands",
    icon: Settings2,
  },
];

const posRoutes = [
  { name: "POS Terminal", href: "/retail-pos", icon: ScanLine },
  { name: "Sales History", href: "/retail-pos/sales", icon: ReceiptText },
  { name: "Returns & Exchanges", href: "/retail-pos/returns", icon: RotateCcw },
  {
    name: "Customer Accounts",
    href: "/retail-pos/customers",
    icon: UsersRound,
  },
  { name: "Cashier Shifts", href: "/retail-pos/shifts", icon: UserRound },
  {
    name: "Cash Reconciliation",
    href: "/retail-pos/reconciliation",
    icon: Wallet,
  },
  { name: "Offline Sync Queue", href: "/retail-pos/sync", icon: RefreshCw },
];
const workspaces = [
  {
    module: "core" as const,
    name: "Core Setup",
    href: "/core-setup",
    icon: Settings2,
    subtitle: "Platform foundation",
  },
  {
    module: "inventory" as const,
    name: "Product & Inventory",
    href: "/product-inventory",
    icon: Boxes,
    subtitle: "Catalog, pricing & stock control",
  },
  {
    module: "pos" as const,
    name: "Retail POS",
    href: "/retail-pos",
    icon: ScanLine,
    subtitle: "Point-of-sale for store counters",
  },
];
const modules = [
  {
    number: "04",
    name: "Purchasing & Vendors",
    subtitle: "From order to vendor bill",
    phase: 1,
    icon: ShoppingCart,
  },
  {
    number: "05",
    name: "Wholesale & B2B Portal",
    subtitle: "Self-service ordering for resellers",
    phase: 2,
    icon: Handshake,
  },
  {
    number: "06",
    name: "E-Commerce Hub",
    subtitle: "Connected sales channels",
    phase: 2,
    icon: Store,
  },
  {
    number: "07",
    name: "Reports & Dashboards",
    subtitle: "See the business at a glance",
    phase: 2,
    icon: ChartNoAxesCombined,
  },
  {
    number: "08",
    name: "Smart Demand Forecasting",
    subtitle: "AI-assisted purchase planning",
    phase: 3,
    icon: Sparkles,
    flagship: true,
  },
  {
    number: "09",
    name: "Accounting & Finance",
    subtitle: "Books that stay in sync",
    phase: 3,
    icon: Landmark,
  },
];

const pageTitles: Record<string, string> = {
  "/core-setup": "Overview",
  "/core-setup/stores-warehouses": "Stores & Warehouses",
  "/core-setup/users-roles": "Users & Roles",
  "/core-setup/permissions": "Permissions",
  "/core-setup/company-settings": "Company Settings",
  "/core-setup/login-access": "Login Access",
  ...Object.fromEntries(
    inventoryRoutes.map((route) => [route.href, route.name]),
  ),
  ...Object.fromEntries(posRoutes.map((route) => [route.href, route.name])),
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const modulePath = pathname.split("/")[1];
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only reset the document, never the independently scrolling sidebar.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = contentRef.current?.animate(
      [{ opacity: 0.45 }, { opacity: 1 }],
      { duration: 180, easing: "ease-out" },
    );
    return () => animation?.cancel();
  }, [modulePath]);
  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-white/7 bg-[var(--brand-ink)] text-white transition-[width] duration-200 ease-out xl:block",
          collapsed ? "w-[80px]" : "w-[280px]",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={() => undefined}
        />
        <button
          type="button"
          className="absolute -right-3 top-[30px] grid size-7 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </aside>
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200 ease-out",
          collapsed ? "xl:pl-[80px]" : "xl:pl-[280px]",
        )}
      >
        <Topbar
          mobileTrigger={
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="!w-[min(310px,86vw)] !max-w-none border-0 bg-[var(--brand-ink)] p-0 text-white"
              >
                <SheetTitle className="sr-only">ERP navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate your available workspaces and view the platform
                  roadmap.
                </SheetDescription>
                <SidebarContent
                  collapsed={false}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          }
        />
        <main className="px-4 pb-10 pt-6 sm:px-6 sm:pt-8 xl:px-8">
          <div ref={contentRef} className="mx-auto w-full max-w-[1560px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const user = useSessionUser();
  const inventory = pathname.startsWith("/product-inventory");
  const pos = pathname.startsWith("/retail-pos");
  const currentModule = pos ? "pos" : inventory ? "inventory" : "core";
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigationScroll = useRef<number | null>(null);

  function handleNavigate() {
    navigationScroll.current =
      scrollAreaRef.current?.querySelector<HTMLElement>(
        '[data-slot="scroll-area-viewport"]',
      )?.scrollTop ?? null;
    onNavigate();
  }

  useLayoutEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    const position = navigationScroll.current;
    if (!viewport || position === null) return;
    viewport.scrollTop = position;
    const frame = requestAnimationFrame(() => {
      viewport.scrollTop = position;
      navigationScroll.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "flex h-[90px] shrink-0 items-center border-b border-white/7",
          collapsed ? "justify-center px-3" : "gap-3 px-5",
        )}
      >
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f8f2e8]">
          <Image
            src="/brand/flair-mark.png"
            alt="Flair Cosmetic & Fragrance"
            width={40}
            height={40}
            className="size-10 object-contain"
            priority
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
              Flair ERP
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48">
              Operations Platform
            </p>
          </div>
        )}
      </div>
      <ScrollArea
        ref={scrollAreaRef}
        className="erp-sidebar-scroll min-h-0 flex-1"
      >
        <nav
          className={cn("py-5", collapsed ? "px-3" : "px-4")}
          aria-label="ERP modules"
        >
          {!collapsed && (
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Workspaces
            </p>
          )}
          <div className="space-y-2" data-slot="workspace-switcher">
            {workspaces
              .filter((workspace) => canAccess(user, workspace.module))
              .map((workspace) => {
                const active = workspace.module === currentModule;
                const expanded = active && !collapsed;
                const moduleRoutes =
                  workspace.module === "pos"
                    ? posRoutes
                    : workspace.module === "inventory"
                      ? inventoryRoutes
                      : childRoutes;
                return (
                  <div
                    key={workspace.module}
                    data-module={workspace.module}
                    className={cn(
                      "overflow-hidden rounded-xl border transition-colors duration-200 ease-out",
                      active
                        ? "border-white/10 bg-white/[0.055]"
                        : "border-transparent",
                    )}
                  >
                    <Link
                      href={workspace.href}
                      scroll={false}
                      onClick={handleNavigate}
                      aria-label={workspace.name}
                      aria-current={active ? "location" : undefined}
                      title={collapsed ? workspace.name : undefined}
                      className={cn(
                        "group flex h-16 items-center rounded-xl transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--brand-champagne)]",
                        collapsed ? "justify-center" : "gap-2.5 px-2.5",
                        active
                          ? "text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 ease-out",
                          active
                            ? "bg-[var(--brand-champagne)] text-[var(--brand-ink)]"
                            : "bg-white/5 text-white/60",
                        )}
                      >
                        <workspace.icon className="size-4" />
                      </span>
                      {!collapsed && (
                        <>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {workspace.name}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-white/40">
                              {String(
                                workspaces.indexOf(workspace) + 1,
                              ).padStart(2, "0")}{" "}
                              · {workspace.subtitle}
                            </p>
                          </div>
                          <ChevronRight
                            className={cn(
                              "size-3.5 shrink-0 transition-transform duration-250 ease-out",
                              active &&
                                "rotate-90 text-[var(--brand-champagne)]",
                            )}
                          />
                        </>
                      )}
                    </Link>
                    <div
                      data-slot="module-navigation"
                      aria-label={`${workspace.name} pages`}
                      aria-hidden={!expanded}
                      inert={!expanded}
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
                        expanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="space-y-0.5 px-1.5 pb-1.5">
                          {moduleRoutes.map((route) => (
                            <Link
                              key={route.href}
                              href={route.href}
                              onClick={handleNavigate}
                              scroll={false}
                              aria-current={
                                pathname === route.href ? "page" : undefined
                              }
                              className={cn(
                                "flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-medium text-white/60 transition-colors duration-200 ease-out hover:bg-white/7 hover:text-white",
                                pathname === route.href &&
                                  "bg-white/10 text-white shadow-[inset_2px_0_0_var(--brand-champagne)]",
                              )}
                            >
                              <route.icon className="size-3.5 shrink-0" />
                              {route.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {!collapsed && (
            <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Platform roadmap
            </p>
          )}
          <div className={cn("space-y-1", collapsed && "mt-5")}>
            {modules.map((module) => (
              <PlannedModule
                key={module.number}
                module={module}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>
      </ScrollArea>
      <div
        className={cn(
          "shrink-0 border-t border-white/7 py-4",
          collapsed ? "px-3" : "px-4",
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-xl bg-white/[0.045]",
            collapsed ? "justify-center p-2" : "gap-3 p-2.5",
          )}
        >
          <Avatar className="size-9 border border-white/10">
            <AvatarFallback className="bg-[var(--brand-champagne)] text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/45">
                {accessRoles[user.role].label}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlannedModule({
  module,
  collapsed,
}: {
  module: (typeof modules)[number];
  collapsed: boolean;
}) {
  function unavailable() {
    toast.info(
      "This module is included in the roadmap and is not part of the current frontend build.",
      { description: `Coming in Phase ${module.phase}` },
    );
  }
  const button = (
    <button
      type="button"
      aria-disabled="true"
      onClick={unavailable}
      className={cn(
        "group flex w-full items-center rounded-xl text-left text-white/50 transition-colors hover:bg-white/[0.055] hover:text-white/75",
        collapsed ? "justify-center py-2.5" : "gap-3 px-2.5 py-2",
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/[0.035]">
        <module.icon className="size-4" />
      </span>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold text-white/30">
              {module.number}
            </span>
            <p className="truncate text-xs font-medium">{module.name}</p>
            {module.flagship && (
              <Badge className="h-4 border border-[var(--brand-champagne)]/25 bg-[var(--brand-champagne)]/10 px-1 text-[7px] text-[var(--brand-champagne)]">
                FLAGSHIP
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-[10px] text-white/28">
            {module.subtitle}
          </p>
        </div>
      )}
      {!collapsed && <LockKeyhole className="size-3 text-white/24" />}
    </button>
  );
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">
        {module.name} · Coming in Phase {module.phase}
      </TooltipContent>
    </Tooltip>
  ) : (
    button
  );
}

function Topbar({ mobileTrigger }: { mobileTrigger: React.ReactNode }) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const title = pageTitles[pathname] ?? "Core Setup";
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/75 bg-background/94 px-3 backdrop-blur-xl sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {mobileTrigger}
          <div className="hidden items-center gap-2 text-xs xl:flex">
            <span className="text-muted-foreground">ERP</span>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="whitespace-nowrap text-muted-foreground">
              {pathname.startsWith("/retail-pos")
                ? "Retail POS"
                : pathname.startsWith("/product-inventory")
                  ? "Inventory"
                  : "Core Setup"}
            </span>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="truncate font-medium text-foreground">
              {title}
            </span>
          </div>
          <span className="truncate text-sm font-semibold xl:hidden">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="hidden h-9 w-56 justify-start gap-2 bg-muted/35 px-3 text-xs font-normal text-muted-foreground xl:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="size-3.5" />
            Search workspace
            <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 font-sans text-[10px]">
              ⌘K
            </kbd>
          </Button>
          <QuickAdd />
          <Notifications />
          <ProfileMenu />
        </div>
      </header>
      <GlobalCommand open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

function QuickAdd() {
  const { openDialog } = useAppUi();
  const user = useSessionUser();
  const router = useRouter();
  const inventory = usePathname().startsWith("/product-inventory");
  const pos = usePathname().startsWith("/retail-pos");
  const actions = [
    { label: "Add location", icon: Warehouse, dialog: "location" as const },
    { label: "Add user", icon: UserRoundPlusIcon, dialog: "user" as const },
    { label: "Create role", icon: ShieldCheck, dialog: "role" as const },
    {
      label: "Edit business profile",
      icon: Building2,
      dialog: "business-profile" as const,
    },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5 px-3">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Quick add</span>
          <ChevronDown className="hidden size-3 opacity-60 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {pos
            ? "Retail POS shortcuts"
            : inventory
              ? "Inventory shortcuts"
              : "Create in Core Setup"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pos ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/retail-pos")}>
              <ScanLine />
              Open checkout
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/retail-pos/customers")}
            >
              <UsersRound />
              Customer accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/retail-pos/shifts")}>
              <Wallet />
              Manage shift
            </DropdownMenuItem>
          </>
        ) : inventory ? (
          <>
            <DropdownMenuItem
              onClick={() => router.push("/product-inventory/products?new=1")}
              disabled={user.role === "inventory-viewer"}
            >
              <Plus />
              Add product
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push("/product-inventory/operations?new=receipt")
              }
              disabled={user.role === "inventory-viewer"}
            >
              <Warehouse />
              Receive stock
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/product-inventory/stock")}
            >
              <Search />
              Find stock
            </DropdownMenuItem>
          </>
        ) : (
          actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={() => openDialog(action.dialog)}
            >
              <action.icon />
              {action.label}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const UserRoundPlusIcon = UserRound;

function Notifications() {
  const notifications = useDemoStore((state) => state.notifications);
  const markRead = useDemoStore((state) => state.markNotificationRead);
  const markAll = useDemoStore((state) => state.markAllNotificationsRead);
  const unread = notifications.filter((item) => !item.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={`${unread} unread notifications`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(380px,calc(100vw-24px))] p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unread
                ? `${unread} unread setup updates`
                : "You're all caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => {
                markAll();
                toast.success("All notifications marked as read");
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[440px] overflow-y-auto p-2">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "relative w-full rounded-lg p-3 text-left transition-colors hover:bg-muted",
                !item.read && "bg-primary/[0.035]",
              )}
              onClick={() => {
                markRead(item.id);
                if (!item.read) toast.success("Notification marked as read");
              }}
            >
              <div className="flex gap-3">
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    item.read
                      ? "bg-border"
                      : item.tone === "attention"
                        ? "bg-amber-500"
                        : item.tone === "success"
                          ? "bg-emerald-500"
                          : "bg-sky-500",
                  )}
                />
                <div>
                  <p className="text-xs font-medium leading-5">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                    {item.detail}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground/75">
                    {item.time}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const { openDialog } = useAppUi();
  const user = useSessionUser();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:pr-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-[var(--brand-champagne)]/30 text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left xl:block">
            <p className="text-[11px] font-semibold leading-none">
              {user.name}
            </p>
            <p className="mt-1 text-[9px] leading-none text-muted-foreground">
              {accessRoles[user.role].label}
            </p>
          </div>
          <ChevronDown className="hidden size-3 text-muted-foreground xl:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <p>{user.name}</p>
          <p className="mt-1 text-[10px] font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            toast.info("Profile settings are represented in Module 01 only.")
          }
        >
          <UserRound />
          Profile & settings
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem onClick={() => openDialog("business-profile")}>
            <Building2 />
            Company profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => openDialog("reset")}
          >
            <X />
            Reset demo data
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={async () => {
            try {
              const response = await fetch("/api/auth/logout", {
                method: "POST",
              });
              if (!response.ok)
                throw new Error("Unable to sign out. Please try again.");
              router.replace("/login");
              router.refresh();
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to sign out.",
              );
            }
          }}
        >
          <LockKeyhole />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const locations = useDemoStore((state) => state.locations);
  const users = useDemoStore((state) => state.users);
  const roles = useDemoStore((state) => state.roles);
  const run = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[640px]">
        <DialogTitle className="sr-only">Search Flair ERP</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate pages or find locations, people and roles.
        </DialogDescription>
        <Command className="rounded-none">
          <CommandInput placeholder="Search pages, locations, people and roles…" />
          <CommandList className="max-h-[480px]">
            <CommandEmpty>Nothing matches this search.</CommandEmpty>
            <CommandGroup heading="Navigate">
              {[
                ...(sessionUser.role === "admin" ? childRoutes : []),
                ...(canAccess(sessionUser, "inventory") ? inventoryRoutes : []),
                ...(canAccess(sessionUser, "pos") ? posRoutes : []),
              ].map((route) => (
                <CommandItem
                  key={route.href}
                  onSelect={() => run(() => router.push(route.href))}
                >
                  <route.icon />
                  {route.name}
                  {route.href === "/core-setup" && (
                    <CommandShortcut>Module 01</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {sessionUser.role === "admin" && (
              <>
                <CommandGroup heading="Locations">
                  {locations.map((location) => (
                    <CommandItem
                      key={location.id}
                      onSelect={() =>
                        run(() => router.push("/core-setup/stores-warehouses"))
                      }
                    >
                      <Warehouse />
                      {location.name}
                      <CommandShortcut>{location.code}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="People">
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() =>
                        run(() => router.push("/core-setup/users-roles"))
                      }
                    >
                      <UserRound />
                      {user.firstName} {user.lastName}
                      <CommandShortcut>{user.employeeId}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Roles">
                  {roles.map((role) => (
                    <CommandItem
                      key={role.id}
                      onSelect={() =>
                        run(() =>
                          router.push("/core-setup/users-roles?tab=roles"),
                        )
                      }
                    >
                      <ShieldCheck />
                      {role.name}
                      <CommandShortcut>{role.accessLevel}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            <CommandGroup heading="Planned modules">
              {modules.map((module) => (
                <CommandItem
                  key={module.number}
                  onSelect={() =>
                    run(() =>
                      toast.info(
                        "This module is included in the roadmap and is not part of the current frontend build.",
                      ),
                    )
                  }
                  disabled
                >
                  <module.icon />
                  {module.number} · {module.name}
                  <CommandShortcut>Coming later</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
