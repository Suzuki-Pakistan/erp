"use client";

import type { LucideIcon } from "lucide-react";
import { Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { csvValue } from "@/lib/decision-intelligence";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  change,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  change?: string;
  tone?: "default" | "attention" | "success";
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl border bg-primary/5 text-primary",
              tone === "attention" &&
                "border-amber-200 bg-amber-50 text-amber-700",
              tone === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">
          {value}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2 text-[10px] text-muted-foreground">
          <span className="truncate">{detail}</span>
          {change && (
            <span className="shrink-0 font-semibold text-emerald-700">
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9 text-xs"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 min-w-36 text-xs", className)}>
        <span className="sr-only">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "attention" | "info" | "danger";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md px-2 text-[9px] font-semibold capitalize",
        tone === "neutral" && "border-stone-200 bg-stone-50 text-stone-600",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "attention" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-700",
        tone === "danger" && "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {label.replaceAll("-", " ")}
    </Badge>
  );
}

export function ExportButton({
  filename,
  rows,
}: {
  filename: string;
  rows: Array<Array<string | number>>;
}) {
  return (
    <Button
      variant="outline"
      className="h-9 gap-2 text-xs"
      onClick={() => downloadCsv(filename, rows)}
    >
      <Download className="size-3.5" />
      Export CSV
    </Button>
  );
}

export function downloadCsv(
  filename: string,
  rows: Array<Array<string | number>>,
) {
  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DecisionWorkspaceLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b pb-6">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  );
}
