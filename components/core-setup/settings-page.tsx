"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  BellRing,
  Building2,
  Check,
  Globe2,
  ImageIcon,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ResetDemoDialog } from "@/components/core-setup/dialogs";
import { useAppUi } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/store/demo-store";
import type { CompanySettings, CompanyWorkspace } from "@/types/core-setup";
import { PageHeader, SectionTitle } from "./shared";

type Editor = "branding" | "regional" | "defaults" | "notifications" | null;

export function SettingsPage() {
  const searchParams = useSearchParams();
  const settings = useDemoStore((state) => state.companySettings);
  const locations = useDemoStore((state) => state.locations);
  const companies = useDemoStore((state) => state.companies);
  const activeCompanyId = useDemoStore((state) => state.activeCompanyId);
  const activateCompany = useDemoStore((state) => state.activateCompany);
  const { openDialog } = useAppUi();
  const [editor, setEditor] = useState<Editor>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(
    () => searchParams.get("newCompany") === "1",
  );
  const locationName = (id: string) =>
    locations.find((location) => location.id === id)?.name ?? "Not selected";
  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Settings"
        description="Manage company workspaces, business profiles and core defaults used across the ERP experience."
        actions={
          <Button onClick={() => setCompanyOpen(true)}>
            <Plus />
            Add company
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionTitle
              title="Company workspaces"
              description="Create another company from Flair's proven configuration, then maintain its identity and defaults independently."
            />
            <Badge variant="outline" className="rounded-md">
              {companies.length}{" "}
              {companies.length === 1 ? "company" : "companies"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => {
            const active = company.id === activeCompanyId;
            return (
              <button
                key={company.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (!active) {
                    activateCompany(company.id);
                    toast.success(`${company.name} is now the active company`);
                  }
                }}
                className={`flex min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "hover:border-primary/20 hover:bg-muted/30"
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {company.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {company.name}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                    {company.code} · {company.status}
                  </span>
                </span>
                <Badge
                  variant={active ? "default" : "secondary"}
                  className="shrink-0 rounded-md text-[9px]"
                >
                  {active ? "Current" : "Open"}
                </Badge>
              </button>
            );
          })}
        </CardContent>
      </Card>
      <section className="grid gap-5 xl:grid-cols-2">
        <SettingsCard
          icon={Building2}
          title="Business profile"
          description="Public company identity and primary contact information."
          onEdit={() => openDialog("business-profile")}
        >
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-3">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f7f1e7]">
              <Image
                src="/brand/flair-logo.png"
                alt="Flair Cosmetic & Fragrance"
                width={54}
                height={30}
                className="h-auto w-12"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {settings.businessProfile.displayName}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {settings.businessProfile.website}
              </p>
            </div>
          </div>
          <SettingsRows
            rows={[
              ["Email", settings.businessProfile.email],
              ["Phone", settings.businessProfile.phone],
              ["Address", settings.businessProfile.address],
            ]}
          />
        </SettingsCard>
        <SettingsCard
          icon={Palette}
          title="Branding"
          description="The app identity translated from Flair's live brand."
          onEdit={() => setEditor("branding")}
        >
          <div className="brand-preview relative overflow-hidden rounded-xl bg-[var(--brand-ink)] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-[#f7f1e7]">
                <Image
                  src="/brand/flair-logo.png"
                  alt=""
                  width={44}
                  height={25}
                  className="h-auto w-10"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {settings.branding.appDisplayName}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Operations Platform
                </p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-5 size-32 rounded-full border border-[var(--brand-champagne)]/20" />
          </div>
          <SettingsRows
            rows={[
              ["Logo variant", settings.branding.wordmarkVariant],
              ["Accent token", settings.branding.accent],
              ["Source palette", "Live Flair website"],
            ]}
          />
        </SettingsCard>
        <SettingsCard
          icon={Globe2}
          title="Regional & format"
          description="Currency, timezone and display conventions."
          onEdit={() => setEditor("regional")}
        >
          <SettingsRows
            rows={[
              ["Currency", settings.regional.currency],
              ["Timezone", settings.regional.timezone],
              ["Date format", settings.regional.dateFormat],
              ["Time format", settings.regional.timeFormat],
              ["Language", settings.regional.language],
            ]}
          />
        </SettingsCard>
        <SettingsCard
          icon={SlidersHorizontal}
          title="Operational defaults"
          description="Local choices used to preview future module behavior."
          onEdit={() => setEditor("defaults")}
        >
          <SettingsRows
            rows={[
              [
                "Default retail",
                locationName(settings.defaults.retailLocationId),
              ],
              [
                "Main warehouse",
                locationName(settings.defaults.mainWarehouseId),
              ],
              [
                "E-commerce warehouse",
                locationName(settings.defaults.ecommerceWarehouseId),
              ],
              ["New user status", settings.defaults.defaultUserStatus],
              ["Code pattern", settings.defaults.locationCodePattern],
            ]}
          />
        </SettingsCard>
        <SettingsCard
          icon={BellRing}
          title="Notification defaults"
          description="Choose which setup events appear as operational notices."
          onEdit={() => setEditor("notifications")}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Access changes", settings.notificationDefaults.accessChanges],
              ["New users", settings.notificationDefaults.newUsers],
              [
                "Location reminders",
                settings.notificationDefaults.locationReminders,
              ],
              ["Weekly digest", settings.notificationDefaults.weeklyDigest],
            ].map(([label, enabled]) => (
              <div
                key={String(label)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
              >
                <span
                  className={`grid size-5 place-items-center rounded-full ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                >
                  <Check className="size-3" />
                </span>
                {label}
                <Badge
                  variant="secondary"
                  className="ml-auto rounded-md text-[9px]"
                >
                  {enabled ? "On" : "Off"}
                </Badge>
              </div>
            ))}
          </div>
        </SettingsCard>
        <Card className="border-amber-200/80 bg-amber-50/45">
          <CardHeader>
            <SectionTitle
              title="Demo workspace"
              description="This first module is a frontend prototype. Changes are stored in this browser only."
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-amber-200/70 bg-white/65 p-4 text-xs leading-5 text-amber-950/75">
              <strong className="font-semibold text-amber-950">
                Local persistence is active.
              </strong>{" "}
              No backend, account, database or email service is connected. Reset
              restores the original synthetic seed data.
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              <RotateCcw />
              Reset demo data
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setClearOpen(true)}
            >
              <Trash2 />
              Clear local state
            </Button>
          </CardFooter>
        </Card>
      </section>
      {editor === "branding" && (
        <BrandingEditor
          open
          onOpenChange={(open) => !open && setEditor(null)}
        />
      )}
      {editor === "regional" && (
        <RegionalEditor
          open
          onOpenChange={(open) => !open && setEditor(null)}
        />
      )}
      {editor === "defaults" && (
        <DefaultsEditor
          open
          onOpenChange={(open) => !open && setEditor(null)}
        />
      )}
      {editor === "notifications" && (
        <NotificationsEditor
          open
          onOpenChange={(open) => !open && setEditor(null)}
        />
      )}
      <ResetDemoDialog open={resetOpen} onOpenChange={setResetOpen} />
      <ResetDemoDialog open={clearOpen} onOpenChange={setClearOpen} clear />
      {companyOpen && (
        <AddCompanyDialog onClose={() => setCompanyOpen(false)} />
      )}
    </div>
  );
}

function AddCompanyDialog({ onClose }: { onClose: () => void }) {
  const source = useDemoStore((state) => state.companySettings);
  const companies = useDemoStore((state) => state.companies);
  const addCompany = useDemoStore((state) => state.addCompany);
  const [form, setForm] = useState({
    displayName: "",
    legalName: "",
    code: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });
  const [error, setError] = useState("");
  const field = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const code = form.code.trim().toUpperCase();
    if (
      !form.displayName.trim() ||
      !form.legalName.trim() ||
      !code ||
      !form.email.includes("@") ||
      form.phone.trim().length < 7 ||
      form.address.trim().length < 8
    ) {
      setError("Complete the required company and contact fields.");
      return;
    }
    if (
      companies.some(
        (company) => company.code.toLowerCase() === code.toLowerCase(),
      )
    ) {
      setError("That company code is already in use.");
      return;
    }
    const settings = structuredClone(source);
    settings.businessProfile = {
      displayName: form.displayName.trim(),
      legalName: form.legalName.trim(),
      website: form.website.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      description:
        form.description.trim() ||
        `${form.displayName.trim()} company workspace.`,
    };
    settings.branding.appDisplayName = `${form.displayName.trim()} ERP`;
    const company: CompanyWorkspace = {
      id: crypto.randomUUID(),
      name: settings.businessProfile.displayName,
      code,
      status: "setup",
      settings,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    addCompany(company);
    toast.success(`${company.name} created and opened`);
    onClose();
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90svh] flex-col overflow-hidden sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Add a company</DialogTitle>
          <DialogDescription>
            Start with the same regional, notification and operational defaults
            as the current Flair company, then manage the new profile
            separately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name *">
                <Input
                  required
                  value={form.displayName}
                  onChange={(event) => field("displayName", event.target.value)}
                  placeholder="New company"
                />
              </Field>
              <Field label="Legal name *">
                <Input
                  required
                  value={form.legalName}
                  onChange={(event) => field("legalName", event.target.value)}
                />
              </Field>
              <Field label="Company code *">
                <Input
                  required
                  maxLength={12}
                  value={form.code}
                  onChange={(event) =>
                    field(
                      "code",
                      event.target.value
                        .replace(/[^A-Za-z0-9-]/g, "")
                        .toUpperCase(),
                    )
                  }
                  placeholder="COMPANY"
                />
              </Field>
              <Field label="Website">
                <Input
                  value={form.website}
                  onChange={(event) => field("website", event.target.value)}
                  placeholder="company.com"
                />
              </Field>
              <Field label="Email *">
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => field("email", event.target.value)}
                />
              </Field>
              <Field label="Phone *">
                <Input
                  required
                  value={form.phone}
                  onChange={(event) => field("phone", event.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address *">
                  <Input
                    required
                    value={form.address}
                    onChange={(event) => field("address", event.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <Input
                    value={form.description}
                    onChange={(event) =>
                      field("description", event.target.value)
                    }
                    placeholder="What this company does"
                  />
                </Field>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs leading-5 text-emerald-950">
              Regional formats, operational defaults, branding and notification
              preferences are copied from the current company. Business identity
              fields remain unique to this workspace.
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/5 p-3 text-xs text-destructive"
              >
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="mt-5 shrink-0 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Create & open company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  onEdit,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/7 text-primary">
              <Icon className="size-4" />
            </span>
            <SectionTitle title={title} description={description} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 text-xs"
            onClick={onEdit}
          >
            <Pencil />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
function SettingsRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="divide-y rounded-xl border">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-start justify-between gap-4 px-3 py-2.5 text-xs"
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="max-w-[65%] break-words text-right font-medium capitalize">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BrandingEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const current = useDemoStore((state) => state.companySettings.branding);
  const update = useDemoStore((state) => state.updateCompanySettings);
  const [draft, setDraft] = useState(current);
  const [file, setFile] = useState("");
  function save() {
    update("branding", draft);
    toast.success("Branding updated");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit branding</DialogTitle>
          <DialogDescription>
            Adjust the local app identity while preserving Flair&apos;s official
            logo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border p-4">
            <div className="grid size-16 place-items-center rounded-xl bg-[#f7f1e7]">
              <Image
                src="/brand/flair-logo.png"
                alt="Flair logo"
                width={58}
                height={34}
                className="h-auto w-14"
              />
            </div>
            <label className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <ImageIcon />
                  {file || "Choose preview"}
                </span>
              </Button>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFile(event.target.files?.[0]?.name ?? "")
                }
              />
            </label>
          </div>
          <Field label="App display name">
            <Input
              value={draft.appDisplayName}
              onChange={(event) =>
                setDraft({ ...draft, appDisplayName: event.target.value })
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Wordmark variant">
              <select
                className="field-select"
                value={draft.wordmarkVariant}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    wordmarkVariant: event.target
                      .value as CompanySettings["branding"]["wordmarkVariant"],
                  })
                }
              >
                <option>Full wordmark</option>
                <option>Symbol</option>
              </select>
            </Field>
            <Field label="Accent token">
              <select
                className="field-select"
                value={draft.accent}
                onChange={(event) =>
                  setDraft({ ...draft, accent: event.target.value })
                }
              >
                <option>Deep teal</option>
                <option>Champagne</option>
                <option>Amber</option>
              </select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save branding</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegionalEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const current = useDemoStore((state) => state.companySettings.regional);
  const update = useDemoStore((state) => state.updateCompanySettings);
  const [draft, setDraft] = useState(current);
  const save = () => {
    update("regional", draft);
    toast.success("Regional settings updated");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit regional & format</DialogTitle>
          <DialogDescription>
            Set the default display conventions for this local demo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Currency"
            value={draft.currency}
            options={["USD", "CAD", "GBP"]}
            onChange={(value) => setDraft({ ...draft, currency: value })}
          />
          <SelectField
            label="Timezone"
            value={draft.timezone}
            options={[
              "America/Chicago",
              "America/New_York",
              "America/Los_Angeles",
            ]}
            onChange={(value) => setDraft({ ...draft, timezone: value })}
          />
          <SelectField
            label="Date format"
            value={draft.dateFormat}
            options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
            onChange={(value) => setDraft({ ...draft, dateFormat: value })}
          />
          <SelectField
            label="Time format"
            value={draft.timeFormat}
            options={["12-hour", "24-hour"]}
            onChange={(value) => setDraft({ ...draft, timeFormat: value })}
          />
          <SelectField
            label="Language"
            value={draft.language}
            options={["English", "Spanish"]}
            onChange={(value) => setDraft({ ...draft, language: value })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save formats</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DefaultsEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const current = useDemoStore((state) => state.companySettings.defaults);
  const locations = useDemoStore((state) => state.locations);
  const update = useDemoStore((state) => state.updateCompanySettings);
  const [draft, setDraft] = useState(current);
  const save = () => {
    update("defaults", draft);
    toast.success("Operational defaults updated");
    onOpenChange(false);
  };
  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Edit operational defaults</DialogTitle>
          <DialogDescription>
            Choose the default records future modules will reference in this
            demo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <SelectOptionsField
            label="Default retail location"
            value={draft.retailLocationId}
            options={locationOptions.filter(
              (item) =>
                locations.find((location) => location.id === item.value)
                  ?.type === "retail",
            )}
            onChange={(value) =>
              setDraft({ ...draft, retailLocationId: value })
            }
          />
          <SelectOptionsField
            label="Default main warehouse"
            value={draft.mainWarehouseId}
            options={locationOptions.filter(
              (item) =>
                locations.find((location) => location.id === item.value)
                  ?.type === "main-warehouse",
            )}
            onChange={(value) => setDraft({ ...draft, mainWarehouseId: value })}
          />
          <SelectOptionsField
            label="Default e-commerce warehouse"
            value={draft.ecommerceWarehouseId}
            options={locationOptions.filter(
              (item) =>
                locations.find((location) => location.id === item.value)
                  ?.type === "ecommerce-warehouse",
            )}
            onChange={(value) =>
              setDraft({ ...draft, ecommerceWarehouseId: value })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Default user status"
              value={draft.defaultUserStatus}
              options={["invited", "active", "inactive"]}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  defaultUserStatus:
                    value as CompanySettings["defaults"]["defaultUserStatus"],
                })
              }
            />
            <Field label="Location code pattern">
              <Input
                value={draft.locationCodePattern}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    locationCodePattern: event.target.value.toUpperCase(),
                  })
                }
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save defaults</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotificationsEditor({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const current = useDemoStore(
    (state) => state.companySettings.notificationDefaults,
  );
  const update = useDemoStore((state) => state.updateCompanySettings);
  const [draft, setDraft] = useState(current);
  const save = () => {
    update("notificationDefaults", draft);
    toast.success("Notification defaults updated");
    onOpenChange(false);
  };
  const rows: [keyof typeof draft, string, string][] = [
    [
      "accessChanges",
      "Access change notifications",
      "Notify when role or permission access changes.",
    ],
    [
      "newUsers",
      "New user notifications",
      "Show new demo user and invitation activity.",
    ],
    [
      "locationReminders",
      "Location setup reminders",
      "Surface locations that still need setup.",
    ],
    [
      "weeklyDigest",
      "Weekly configuration digest",
      "Summarize Core Setup changes once a week.",
    ],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit notification defaults</DialogTitle>
          <DialogDescription>
            Choose the local activity types shown in the demo notification
            center.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {rows.map(([key, title, description]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <Label htmlFor={`notify-${key}`} className="font-semibold">
                  {title}
                </Label>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
              <Switch
                id={`notify-${key}`}
                checked={draft[key]}
                onCheckedChange={(checked) =>
                  setDraft({ ...draft, [key]: checked })
                }
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save notifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        className="field-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}
function SelectOptionsField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        className="field-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
