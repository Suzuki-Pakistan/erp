"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  CreditCard,
  FileUp,
  KeyRound,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  Warehouse,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import { useAppUi } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { moduleDefinitions } from "@/types/core-setup";
import { roadmapModules } from "@/components/roadmap/roadmap-config";
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from "./shared";
import { locationTypeLabels } from "@/lib/format";

const roleColors = [
  "#072835",
  "#b69154",
  "#47665d",
  "#a76f48",
  "#6d7d86",
  "#b98a86",
  "#826e54",
  "#385966",
];

export function OverviewPage() {
  const locations = useDemoStore((state) => state.locations);
  const users = useDemoStore((state) => state.users);
  const roles = useDemoStore((state) => state.roles);
  const activity = useDemoStore((state) => state.activity);
  const { openDialog } = useAppUi();
  const activeUsers = users.filter((user) => user.status === "active").length;
  const chartData = roles
    .map((role) => ({
      name: role.name,
      value: users.filter((user) => user.roleId === role.id).length,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Core Setup"
        description="Configure locations, people, permissions and the business settings that power every future module."
        actions={
          <>
            <Button variant="outline" onClick={() => openDialog("reset")}>
              Reset demo
            </Button>
            <Button onClick={() => openDialog("location")}>
              <Plus />
              Quick add
            </Button>
          </>
        }
      />

      <section className="readiness-card relative overflow-hidden rounded-2xl border border-primary/10 bg-[var(--brand-ink)] p-5 text-white shadow-[0_20px_60px_-36px_rgba(7,40,53,.8)] sm:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden lg:block">
          <Image
            src="/demo/locations/harwin-store.webp"
            alt="Flair retail interior"
            fill
            sizes="42vw"
            priority
            loading="eager"
            className="object-cover opacity-28 [mask-image:linear-gradient(to_right,transparent,black_42%)]"
          />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/12 bg-white/9 text-white">
                Phase One demo
              </Badge>
              <Badge
                variant="outline"
                className="border-[var(--brand-champagne)]/35 bg-[var(--brand-champagne)]/8 text-[var(--brand-champagne)]"
              >
                No dependencies
              </Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              Phase One is ready for client review
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/58">
              Explore Core Setup, Product & Inventory and Retail POS as working
              modules, then use Smart Demand Forecasting and Accounting &
              Finance for the approved decision-support demonstrations.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Progress
                value={86}
                className="h-2 max-w-md bg-white/10 [&>div]:bg-[var(--brand-champagne)]"
              />
              <span className="text-xs font-semibold text-[var(--brand-champagne)]">
                86%
              </span>
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-white/8 bg-black/12 p-3 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-1">
            {[
              "Locations",
              "Users",
              "Roles",
              "Permissions",
              "Company profile",
            ].map((item) => {
              const review = item === "Permissions";
              return (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs"
                >
                  <span className="text-white/70">{item}</span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-medium",
                      review ? "text-amber-200" : "text-emerald-200",
                    )}
                  >
                    {review ? (
                      <CircleDashed className="size-3.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    {review ? "Review needed" : "Complete"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle
          title="Client demo · start here"
          description="Four working Phase One flows with seeded products, prices, stock, locations and staff. Open any card and try the action during the presentation."
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              step: "01",
              icon: CreditCard,
              title: "Split cash + card",
              detail:
                "$600 sale · enter $400 card and the remaining $200 stays cash.",
              meta: "8.25% tax · exact tender audit",
              href: "/retail-pos",
            },
            {
              step: "02",
              icon: TrendingUp,
              title: "Compare product margins",
              detail:
                "Review retail, wholesale, e-commerce and VIP profit by SKU.",
              meta: "26 seeded products · 4 price tiers",
              href: "/product-inventory/pricing",
            },
            {
              step: "03",
              icon: FileUp,
              title: "Run a bulk import",
              detail:
                "Upload products, categories, brands or starting inventory by CSV.",
              meta: "Templates · validation · error preview",
              href: "/product-inventory/products?import=1",
            },
            {
              step: "04",
              icon: Sparkles,
              title: "Build a smart reorder",
              detail:
                "Turn forecast demand, safety stock and lead time into a purchase recommendation.",
              meta: "Demand signal · reorder quantity · confidence",
              href: "/preview/forecasting/smart-reorder",
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="group rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_14px_34px_-28px_rgba(7,40,53,.7)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/7 text-primary">
                  <item.icon className="size-4" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  Step {item.step}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-1.5 min-h-10 text-[11px] leading-5 text-muted-foreground">
                {item.detail}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-[9px] text-muted-foreground">
                  {item.meta}
                </span>
                <span className="shrink-0 text-[10px] font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Try now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Warehouse}
          label="Locations"
          value={locations.length}
          meta={`${locations.filter((item) => item.type === "retail").length} retail · ${locations.filter((item) => item.type !== "retail").length} warehouse`}
        />
        <MetricCard
          icon={UsersRound}
          label="Active staff"
          value={activeUsers}
          meta={`${users.filter((item) => item.status === "invited").length} invited · ${users.filter((item) => item.status === "inactive").length} inactive`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Roles"
          value={roles.length}
          meta="Source-defined + custom roles"
        />
        <MetricCard
          icon={KeyRound}
          label="Access policies"
          value={roles.length * 7}
          meta="Across modules & visibility"
          tone="attention"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <SectionTitle
              title="Location network"
              description="Active and in-progress locations across the demo operating structure."
              action={
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  <Link href="/core-setup/stores-warehouses">
                    View all locations
                  </Link>
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {locations.slice(0, 4).map((location) => (
              <Link
                key={location.id}
                href="/core-setup/stores-warehouses"
                className="group flex min-w-0 gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={location.image}
                    alt=""
                    fill
                    sizes="64px"
                    loading={location.id === "loc-harwin" ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {location.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {location.code} · {locationTypeLabels[location.type]}
                      </p>
                    </div>
                    <StatusBadge status={location.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {location.city}
                    </span>
                    <span>{location.staffCount} staff</span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <SectionTitle
              title="Role distribution"
              description="Current demo users across operating roles."
            />
          </CardHeader>
          <CardContent className="grid min-h-[245px] items-center gap-2 sm:grid-cols-[200px_1fr] xl:grid-cols-[170px_1fr]">
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={roleColors[index % roleColors.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 10,
                      borderColor: "#e5ded3",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        background: roleColors[index % roleColors.length],
                      }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader>
            <SectionTitle
              title="Recent setup activity"
              description="A deterministic local audit trail for the Core Setup demo."
            />
          </CardHeader>
          <CardContent className="space-y-0">
            {activity.slice(0, 6).map((item, index) => (
              <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < 5 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-26px)] w-px bg-border" />
                )}
                <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-card text-[10px] font-semibold text-primary">
                  {item.actor
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs leading-5">
                    <span className="font-semibold">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-5 rounded-md px-1.5 text-[9px]"
                    >
                      {item.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:col-span-5">
          <Card>
            <CardHeader>
              <SectionTitle
                title="Quick actions"
                description="Open a focused workflow without leaving the overview."
              />
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {[
                {
                  label: "Add location",
                  icon: Warehouse,
                  action: () => openDialog("location"),
                },
                {
                  label: "Add user",
                  icon: UsersRound,
                  action: () => openDialog("user"),
                },
                {
                  label: "Create role",
                  icon: ShieldCheck,
                  action: () => openDialog("role"),
                },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-11 justify-start gap-3 px-3 text-xs"
                  onClick={action.action}
                >
                  <span className="grid size-7 place-items-center rounded-md bg-primary/7 text-primary">
                    <action.icon className="size-3.5" />
                  </span>
                  {action.label}
                </Button>
              ))}
              <Button
                asChild
                variant="outline"
                className="h-11 justify-start gap-3 px-3 text-xs"
              >
                <Link href="/core-setup/permissions">
                  <span className="grid size-7 place-items-center rounded-md bg-amber-50 text-amber-700">
                    <KeyRound className="size-3.5" />
                  </span>
                  Review permissions
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionTitle
                title="Platform roadmap"
                description="Five approved modules, with future areas visibly locked."
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {moduleDefinitions.map((module, index) => {
                const preview = roadmapModules.find(
                  (item) =>
                    item.id ===
                    (module.id === "accounting" ? "finance" : module.id),
                );
                const content = (
                  <>
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-md text-[9px] font-semibold",
                        index < 3 || preview?.locked === false
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {module.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {module.name}
                    </span>
                    <Badge
                      variant={
                        index < 3 || preview?.locked === false
                          ? "default"
                          : "secondary"
                      }
                      className="h-5 rounded-md text-[9px]"
                    >
                      {index < 3
                        ? "Live demo"
                        : preview?.locked === false
                          ? "Open demo"
                          : "Locked"}
                    </Badge>
                  </>
                );
                return preview && !preview.locked ? (
                  <Link
                    key={module.id}
                    href={preview.href}
                    className="flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-muted/60"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={module.id}
                    className="flex items-center gap-3 rounded-lg px-1 py-1.5"
                  >
                    {content}
                  </div>
                );
              })}
            </CardContent>
            <Separator />
            <CardFooter className="pt-4">
              <p className="text-[11px] leading-5 text-muted-foreground">
                Core Setup, Product & Inventory, Retail POS, Smart Demand
                Forecasting and Accounting & Finance are available. Purchasing,
                E-Commerce and Reports remain locked.
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
