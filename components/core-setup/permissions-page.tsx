"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { permissionPresets } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import {
  moduleDefinitions,
  type PermissionAction,
  type PermissionPolicy,
} from "@/types/core-setup";
import { PageHeader, SectionTitle } from "./shared";

const actions: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "export", label: "Export" },
];

const approvedModules = new Set([
  "core",
  "inventory",
  "pos",
  "forecasting",
  "accounting",
]);

const visibilityItems: {
  key: keyof PermissionPolicy["visibility"];
  title: string;
  description: string;
}[] = [
  {
    key: "pricing",
    title: "View pricing",
    description: "Display selling prices and price-related fields.",
  },
  {
    key: "productCost",
    title: "View product cost",
    description: "Display cost and margin fields where available.",
  },
  {
    key: "purchasing",
    title: "View purchasing",
    description: "Access purchase-order and vendor purchasing information.",
  },
  {
    key: "accounting",
    title: "View accounting",
    description: "Access accounting and ledger information.",
  },
  {
    key: "reports",
    title: "View reports",
    description: "Access business reporting and dashboards.",
  },
];

export function PermissionsPage() {
  const roles = useDemoStore((state) => state.roles);
  const users = useDemoStore((state) => state.users);
  const locations = useDemoStore((state) => state.locations);
  const policies = useDemoStore((state) => state.permissions);
  const updatePolicy = useDemoStore((state) => state.updateRolePermissions);
  const [roleId, setRoleId] = useState("role-procurement");
  const [draft, setDraft] = useState<PermissionPolicy>(() =>
    structuredClone(policies["role-procurement"]),
  );
  const [dirty, setDirty] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Procurement focused");
  const role = roles.find((item) => item.id === roleId);

  function selectRole(nextRoleId: string) {
    const nextPolicy = policies[nextRoleId];
    setRoleId(nextRoleId);
    if (nextPolicy) setDraft(structuredClone(nextPolicy));
    setDirty(false);
  }

  function toggleAction(
    moduleId: string,
    action: PermissionAction,
    value: boolean,
  ) {
    setDraft((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.moduleId === moduleId
          ? { ...module, actions: { ...module.actions, [action]: value } }
          : module,
      ),
    }));
    setDirty(true);
  }
  function toggleVisibility(
    key: keyof PermissionPolicy["visibility"],
    value: boolean,
  ) {
    setDraft((current) => ({
      ...current,
      visibility: { ...current.visibility, [key]: value },
    }));
    setDirty(true);
  }
  function save() {
    updatePolicy(roleId, draft);
    setDirty(false);
    toast.success("Permission policy saved");
  }
  function applyPreset() {
    const template =
      permissionPresets[selectedPreset as keyof typeof permissionPresets];
    setDraft({
      ...structuredClone(template),
      roleId,
      updatedAt: draft.updatedAt,
    });
    setDirty(true);
    setPresetOpen(false);
    toast.success("Preset applied");
  }
  const enabledSummary = useMemo(() => {
    const moduleCount = draft.modules.filter(
      (module) => module.actions.view,
    ).length;
    return { moduleCount };
  }, [draft]);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Permissions"
        description="Plan granular role policies. Real sign-in and module access are managed separately in Login Access."
        actions={
          <>
            <Button variant="outline" onClick={() => setPresetOpen(true)}>
              <Sparkles />
              Apply preset
            </Button>
            <Button onClick={save} disabled={!dirty}>
              <Save />
              Save changes
            </Button>
          </>
        }
      />
      <Card className="border-primary/12 bg-primary/[0.025]">
        <CardContent className="grid items-center gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_210px] 2xl:grid-cols-[minmax(200px,1fr)_minmax(380px,1.5fr)_210px]">
          <div className="order-1 flex min-w-0 items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Editing policy for
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{role?.name}</h2>
                {!role?.sourceRole && <Badge variant="outline">Custom</Badge>}
                {dirty && (
                  <Badge
                    className="border-amber-200 bg-amber-50 text-amber-800"
                    variant="outline"
                  >
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="order-3 grid gap-2 sm:col-span-2 sm:grid-cols-3 2xl:order-2 2xl:col-span-1">
            <div className="rounded-xl border bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Users assigned
              </p>
              <p className="mt-1 text-sm font-semibold">
                {users.filter((user) => user.roleId === roleId).length}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Location scope
              </p>
              <p className="mt-1 text-sm font-semibold">
                {draft.locationScope === "all" ? "All locations" : "Selected"}
              </p>
            </div>
            <div className="rounded-xl border bg-card px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Last updated
              </p>
              <p className="mt-1 text-sm font-semibold">
                {policies[roleId]?.updatedAt}
              </p>
            </div>
          </div>
          <div className="relative order-2 min-w-0 2xl:order-3">
            <select
              className="field-select w-full min-w-0 appearance-none pr-9"
              value={roleId}
              onChange={(event) => selectRole(event.target.value)}
              aria-label="Select role"
            >
              {roles.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <SectionTitle
            title="Permission matrix"
            description="Configure granular actions for the current and future ERP modules."
          />
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/45">
                <th className="sticky left-0 z-10 min-w-64 bg-muted/95 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Module
                </th>
                {actions.map((action) => (
                  <th
                    key={action.key}
                    className="w-24 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.modules.map((modulePolicy) => {
                const moduleInfo = moduleDefinitions.find(
                  (item) => item.id === modulePolicy.moduleId,
                )!;
                const approved = approvedModules.has(moduleInfo.id);
                return (
                  <tr key={moduleInfo.id} className="border-b last:border-0">
                    <td className="sticky left-0 z-10 bg-card px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-lg text-[10px] font-semibold",
                            approved
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {moduleInfo.number}
                        </span>
                        <div>
                          <p className="text-xs font-semibold">
                            {moduleInfo.name}
                          </p>
                          {!approved && (
                            <Badge
                              variant="outline"
                              className="mt-1 h-4 rounded px-1 text-[8px] text-muted-foreground"
                            >
                              Locked module
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    {actions.map((action) => (
                      <td key={action.key} className="px-3 py-3 text-center">
                        <Checkbox
                          checked={modulePolicy.actions[action.key]}
                          disabled={!approved}
                          onCheckedChange={(checked) =>
                            toggleAction(
                              moduleInfo.id,
                              action.key,
                              checked === true,
                            )
                          }
                          aria-label={`${role?.name} can ${action.label.toLowerCase()} ${moduleInfo.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader>
            <SectionTitle
              title="Data visibility"
              description="Control access to sensitive commercial and financial information."
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {visibilityItems.map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border p-4"
              >
                <div className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/7 text-primary">
                    <KeyRound className="size-4" />
                  </span>
                  <div>
                    <Label
                      htmlFor={`visibility-${item.key}`}
                      className="text-sm font-semibold"
                    >
                      {item.title}
                    </Label>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={`visibility-${item.key}`}
                  checked={draft.visibility[item.key]}
                  onCheckedChange={(checked) =>
                    toggleVisibility(item.key, checked)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-5 xl:col-span-5">
          <Card>
            <CardHeader>
              <SectionTitle
                title="Location scope"
                description="Choose where this role's policy applies."
              />
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={draft.locationScope}
                onValueChange={(value: "all" | "selected") => {
                  setDraft((current) => ({ ...current, locationScope: value }));
                  setDirty(true);
                }}
                className="gap-3"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
                  <RadioGroupItem
                    value="all"
                    id="scope-all"
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      All locations
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Current and future operating locations.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
                  <RadioGroupItem
                    value="selected"
                    id="scope-selected"
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Selected locations
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Restrict access to named locations.
                    </span>
                  </span>
                </label>
              </RadioGroup>
              {draft.locationScope === "selected" && (
                <div className="mt-3 grid gap-2">
                  {locations.map((location) => (
                    <label
                      key={location.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-muted/55 px-3 py-2 text-xs"
                    >
                      <Checkbox
                        checked={draft.selectedLocationIds.includes(
                          location.id,
                        )}
                        onCheckedChange={(checked) => {
                          setDraft((current) => ({
                            ...current,
                            selectedLocationIds: checked
                              ? [...current.selectedLocationIds, location.id]
                              : current.selectedLocationIds.filter(
                                  (id) => id !== location.id,
                                ),
                          }));
                          setDirty(true);
                        }}
                      />
                      {location.name}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-primary/12 bg-[var(--brand-ink)] text-white [&_h2]:text-white [&_p]:text-white/55">
            <CardHeader>
              <SectionTitle
                title="What this role can currently do"
                description="A plain-language preview of the active draft policy."
              />
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <SummaryItem
                enabled
                text={`View ${enabledSummary.moduleCount} of ${moduleDefinitions.length} module areas`}
              />
              <SummaryItem
                enabled={draft.locationScope === "all"}
                text={
                  draft.locationScope === "all"
                    ? "Work across all locations"
                    : `Work in ${draft.selectedLocationIds.length} selected locations`
                }
              />
              {visibilityItems.map((item) => (
                <SummaryItem
                  key={item.key}
                  enabled={draft.visibility[item.key]}
                  text={`${draft.visibility[item.key] ? "Can" : "Cannot"} ${item.title.toLowerCase()}`}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
      {dirty && (
        <div className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-xl backdrop-blur lg:left-auto lg:right-6 lg:w-[420px]">
          <div>
            <p className="text-xs font-semibold">Unsaved permission changes</p>
            <p className="text-[10px] text-muted-foreground">
              Save to persist this policy in the browser.
            </p>
          </div>
          <Button size="sm" onClick={save}>
            <Save />
            Save
          </Button>
        </div>
      )}
      <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Apply permission preset</DialogTitle>
            <DialogDescription>
              Replace the current draft with a curated source-role policy.
              Review changes before saving.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={selectedPreset}
            onValueChange={setSelectedPreset}
            className="grid gap-2 sm:grid-cols-2"
          >
            {Object.keys(permissionPresets).map((preset) => (
              <label
                key={preset}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-colors",
                  selectedPreset === preset &&
                    "border-primary bg-primary/[0.035]",
                )}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={preset} />
                  <div>
                    <p className="text-sm font-semibold">{preset}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Based on the{" "}
                      {permissionPresets[
                        preset as keyof typeof permissionPresets
                      ].roleId.replace("role-", "")}{" "}
                      source policy.
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>
          <div className="rounded-xl bg-muted/55 p-4 text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">Impact:</span>{" "}
            module actions, data visibility and location scope will update in
            the draft. Nothing is saved until you use Save changes.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyPreset}>
              <Sparkles />
              Apply preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full",
          enabled
            ? "bg-emerald-400/15 text-emerald-200"
            : "bg-white/7 text-white/40",
        )}
      >
        {enabled ? (
          <Check className="size-3" />
        ) : (
          <LockKeyhole className="size-3" />
        )}
      </span>
      <span className={enabled ? "text-white/78" : "text-white/45"}>
        {text}
      </span>
    </div>
  );
}
