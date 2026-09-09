"use client";

import Image from "next/image";
import Link from "next/link";
import {
  KeyRound,
  MapPin,
  Plus,
  ShieldCheck,
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
                          ? "Live workspace"
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
