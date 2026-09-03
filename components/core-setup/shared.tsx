"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CircleAlert, CircleCheck, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RecordStatus, UserStatus } from "@/types/core-setup";

export function PageHeader({
  eyebrow = "Module 01 · Core Setup",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/75">
          {eyebrow}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  meta,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  meta: string;
  tone?: "default" | "attention";
}) {
  return (
    <Card className="metric-card group overflow-hidden py-0">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-[30px] font-semibold tracking-[-0.04em] text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
        </div>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg border bg-primary/6 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
            tone === "attention" &&
              "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </span>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: RecordStatus | UserStatus }) {
  const config = {
    active: {
      label: "Active",
      icon: CircleCheck,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    setup: {
      label: "Setup",
      icon: Clock3,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    invited: {
      label: "Invited",
      icon: Clock3,
      className: "border-sky-200 bg-sky-50 text-sky-700",
    },
    inactive: {
      label: "Inactive",
      icon: CircleAlert,
      className: "border-stone-200 bg-stone-100 text-stone-600",
    },
  }[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1 rounded-md px-2 text-[11px] font-medium",
        config.className,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function TextAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 px-2 text-xs text-primary"
      onClick={onClick}
    >
      {children}
      <ArrowUpRight className="size-3.5" />
    </Button>
  );
}
