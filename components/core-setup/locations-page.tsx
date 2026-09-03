"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Building2,
  Ellipsis,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";

import { LocationDialog } from "@/components/core-setup/dialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { locationTypeLabels } from "@/lib/format";
import { useDemoStore } from "@/store/demo-store";
import type { Location } from "@/types/core-setup";
import { MetricCard, PageHeader, StatusBadge } from "./shared";

type ViewMode = "table" | "cards";

export function LocationsPage() {
  const locations = useDemoStore((state) => state.locations);
  const updateLocation = useDemoStore((state) => state.updateLocation);
  const duplicateLocation = useDemoStore((state) => state.duplicateLocation);
  const deleteLocation = useDemoStore((state) => state.deleteLocation);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [view, setView] = useState<ViewMode>("table");
  const [sortAsc, setSortAsc] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [edit, setEdit] = useState<Location | undefined>();
  const [detail, setDetail] = useState<Location | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Location | undefined>();
  const cities = [...new Set(locations.map((location) => location.city))];
  const filtered = useMemo(
    () =>
      locations
        .filter((location) => {
          const matchesSearch =
            `${location.name} ${location.code} ${location.city} ${location.manager}`
              .toLowerCase()
              .includes(search.toLowerCase());
          const matchesTab =
            tab === "all" ||
            (tab === "retail"
              ? location.type === "retail"
              : location.type !== "retail");
          return (
            matchesSearch &&
            matchesTab &&
            (status === "all" || location.status === status) &&
            (city === "all" || location.city === city)
          );
        })
        .sort((a, b) =>
          sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
        ),
    [locations, search, tab, status, city, sortAsc],
  );
  const filtersActive = Boolean(
    search || tab !== "all" || status !== "all" || city !== "all",
  );
  function clearFilters() {
    setSearch("");
    setTab("all");
    setStatus("all");
    setCity("all");
  }
  function toggleStatus(location: Location) {
    updateLocation(location.id, {
      status: location.status === "active" ? "inactive" : "active",
    });
    toast.success(
      location.status === "active"
        ? "Location marked inactive"
        : "Location activated",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stores & Warehouses"
        description="Manage the physical locations that define how Flair operates across retail and fulfillment."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Add location
          </Button>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Building2}
          label="Total locations"
          value={locations.length}
          meta="Across all operating states"
        />
        <MetricCard
          icon={MapPin}
          label="Retail stores"
          value={locations.filter((item) => item.type === "retail").length}
          meta="Customer-facing locations"
        />
        <MetricCard
          icon={Warehouse}
          label="Warehouses"
          value={locations.filter((item) => item.type !== "retail").length}
          meta="Main & e-commerce"
        />
        <MetricCard
          icon={Building2}
          label="Active locations"
          value={locations.filter((item) => item.status === "active").length}
          meta={`${locations.filter((item) => item.status === "setup").length} still in setup`}
        />
      </section>

      <Card className="overflow-hidden py-0">
        <div className="border-b p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="retail">Retail</TabsTrigger>
                <TabsTrigger value="warehouse">Warehouses</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  placeholder="Search locations…"
                  aria-label="Search locations"
                />
              </div>
              <select
                className="field-select sm:w-36"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="setup">Setup</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                className="field-select sm:w-32"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                aria-label="Filter by city"
              >
                <option value="all">All cities</option>
                {cities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              {filtersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
              <div className="hidden rounded-lg border p-0.5 md:flex">
                <Button
                  size="icon"
                  variant={view === "table" ? "secondary" : "ghost"}
                  className="size-8"
                  aria-label="Table view"
                  onClick={() => setView("table")}
                >
                  <List />
                </Button>
                <Button
                  size="icon"
                  variant={view === "cards" ? "secondary" : "ghost"}
                  className="size-8"
                  aria-label="Card view"
                  onClick={() => setView("cards")}
                >
                  <LayoutGrid />
                </Button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Showing {filtered.length} of {locations.length} locations
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyLocations
            filtered={filtersActive}
            onClear={clearFilters}
            onAdd={() => setCreateOpen(true)}
          />
        ) : (
          <>
            <div
              className={cn("hidden md:block", view !== "table" && "md:hidden")}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="min-w-64"
                      aria-sort={sortAsc ? "ascending" : "descending"}
                    >
                      <button
                        className="flex items-center gap-1.5"
                        onClick={() => setSortAsc((value) => !value)}
                      >
                        Location{" "}
                        {sortAsc ? (
                          <ArrowDownAZ className="size-3.5" />
                        ) : (
                          <ArrowUpAZ className="size-3.5" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((location) => (
                    <TableRow
                      key={location.id}
                      className="cursor-pointer"
                      onClick={() => setDetail(location)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={location.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {location.name}
                            </p>
                            <p className="mt-0.5 max-w-48 truncate text-[11px] text-muted-foreground">
                              {location.address1}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {location.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[10px]"
                        >
                          {locationTypeLabels[location.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {location.city}, {location.state}
                      </TableCell>
                      <TableCell className="max-w-36 truncate text-xs">
                        {location.manager}
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        {location.staffCount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={location.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">
                        {location.updatedAt}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <LocationMenu
                          location={location}
                          onView={() => setDetail(location)}
                          onEdit={() => setEdit(location)}
                          onDuplicate={() => {
                            duplicateLocation(location.id);
                            toast.success("Location duplicated");
                          }}
                          onToggle={() => toggleStatus(location)}
                          onDelete={() => setPendingDelete(location)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div
              className={cn(
                "grid gap-4 p-4 sm:grid-cols-2 md:hidden",
                view === "cards" && "md:grid lg:grid-cols-2 2xl:grid-cols-3",
              )}
            >
              {filtered.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onView={() => setDetail(location)}
                  onEdit={() => setEdit(location)}
                  onDuplicate={() => {
                    duplicateLocation(location.id);
                    toast.success("Location duplicated");
                  }}
                  onToggle={() => toggleStatus(location)}
                  onDelete={() => setPendingDelete(location)}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      <LocationDialog open={createOpen} onOpenChange={setCreateOpen} />
      {edit && (
        <LocationDialog
          open={Boolean(edit)}
          onOpenChange={(open) => !open && setEdit(undefined)}
          location={edit}
        />
      )}
      <LocationDetail
        location={detail}
        onOpenChange={(open) => !open && setDetail(undefined)}
        onEdit={() => {
          if (detail) {
            setEdit(detail);
            setDetail(undefined);
          }
        }}
        onToggle={() => detail && toggleStatus(detail)}
      />
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this location?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the location from the local demo workspace. This
              action cannot be undone unless demo data is reset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  deleteLocation(pendingDelete.id);
                  toast.success("Location deleted");
                  setPendingDelete(undefined);
                }
              }}
            >
              Delete location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LocationMenu({
  location,
  onView,
  onEdit,
  onDuplicate,
  onToggle,
  onDelete,
}: {
  location: Location;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Actions for ${location.name}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={onToggle}>
          {location.status === "active" ? "Mark inactive" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LocationCard({
  location,
  ...actions
}: {
  location: Location;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-[0_8px_30px_-26px_rgba(7,40,53,.45)]">
      <button
        className="relative block h-36 w-full overflow-hidden bg-muted text-left"
        onClick={actions.onView}
      >
        <Image
          src={location.image}
          alt={`${location.name} demo location`}
          fill
          sizes="(max-width:768px) 100vw, 420px"
          className="object-cover transition-transform duration-200 hover:scale-[1.02]"
        />
        <span className="absolute left-3 top-3">
          <StatusBadge status={location.status} />
        </span>
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{location.name}</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {location.code} · {locationTypeLabels[location.type]}
            </p>
          </div>
          <LocationMenu location={location} {...actions} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-[11px]">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="mt-1 font-medium">
              {location.city}, {location.state}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Manager</p>
            <p className="mt-1 truncate font-medium">{location.manager}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Staff</p>
            <p className="mt-1 font-medium">{location.staffCount} assigned</p>
          </div>
          <div>
            <p className="text-muted-foreground">Updated</p>
            <p className="mt-1 font-medium">{location.updatedAt}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function LocationDetail({
  location,
  onOpenChange,
  onEdit,
  onToggle,
}: {
  location?: Location;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <Sheet open={Boolean(location)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[520px]">
        {location && (
          <>
            <div className="relative h-52 w-full bg-muted">
              <Image
                src={location.image}
                alt={`${location.name} demo location`}
                fill
                sizes="520px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
            </div>
            <SheetHeader className="border-b px-6 py-5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md">
                  {locationTypeLabels[location.type]}
                </Badge>
                <StatusBadge status={location.status} />
                {location.fictional && (
                  <Badge variant="outline" className="rounded-md">
                    Demo location
                  </Badge>
                )}
              </div>
              <SheetTitle className="mt-2 text-xl">{location.name}</SheetTitle>
              <SheetDescription>
                {location.code} · Last updated {location.updatedAt}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-6 py-5">
              <DetailBlock title="Contact">
                <DetailRow label="Manager" value={location.manager} />
                <DetailRow label="Phone" value={location.phone} />
                <DetailRow label="Email" value={location.email} />
              </DetailBlock>
              <DetailBlock title="Address">
                <p className="text-sm leading-6">
                  {location.address1}
                  {location.address2 && (
                    <>
                      <br />
                      {location.address2}
                    </>
                  )}
                  <br />
                  {location.city}, {location.state} {location.zip}
                  <br />
                  {location.country}
                </p>
              </DetailBlock>
              <DetailBlock title="Operations">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{location.staffCount} staff</Badge>
                  <Badge variant="secondary">{location.timezone}</Badge>
                  {location.capacityLabel && (
                    <Badge variant="secondary">{location.capacityLabel}</Badge>
                  )}
                  {location.fulfillmentEnabled && (
                    <Badge variant="secondary">Fulfillment enabled</Badge>
                  )}
                </div>
              </DetailBlock>
              {location.note && (
                <DetailBlock title="Notes">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {location.note}
                  </p>
                </DetailBlock>
              )}
            </div>
            <SheetFooter className="sticky bottom-0 border-t bg-card p-4">
              <Button variant="outline" onClick={onToggle}>
                {location.status === "active" ? "Mark inactive" : "Activate"}
              </Button>
              <Button onClick={onEdit}>
                <Pencil />
                Edit location
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] break-words text-right font-medium">
        {value}
      </span>
    </div>
  );
}
function EmptyLocations({
  filtered,
  onClear,
  onAdd,
}: {
  filtered: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <CardContent className="grid min-h-80 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/7 text-primary">
          <Warehouse />
        </span>
        <h3 className="mt-4 text-base font-semibold">
          {filtered ? "Nothing matches this search" : "No locations yet"}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Try a different name, code or filter."
            : "Add a retail store or warehouse to start building the operating structure."}
        </p>
        <Button className="mt-4" onClick={filtered ? onClear : onAdd}>
          {filtered ? "Clear filters" : "Add location"}
        </Button>
      </div>
    </CardContent>
  );
}
