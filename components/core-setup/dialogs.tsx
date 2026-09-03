"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImagePlus,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRoundPlus,
  Warehouse,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { createSeedData } from "@/data/mock";
import { makeId } from "@/lib/format";
import { useDemoStore } from "@/store/demo-store";
import type {
  CompanySettings,
  Location,
  LocationType,
  Role,
  User,
} from "@/types/core-setup";

const locationSchema = z.object({
  name: z.string().min(2, "Enter a location name."),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Use at least 2 characters.")
    .max(10, "Use no more than 10 characters.")
    .regex(/^[A-Z0-9-]+$/, "Use letters, numbers and hyphens only."),
  type: z.enum(["retail", "main-warehouse", "ecommerce-warehouse"]),
  status: z.enum(["active", "setup", "inactive"]),
  address1: z.string().min(3, "Enter an address."),
  address2: z.string().optional(),
  city: z.string().min(2, "Enter a city."),
  state: z.string().min(2, "Enter a state."),
  zip: z.string().min(4, "Enter a ZIP code."),
  country: z.string().min(2, "Enter a country."),
  manager: z.string().min(2, "Assign a manager or enter Unassigned."),
  phone: z.string().min(7, "Enter a phone number."),
  email: z.email("Enter a valid email."),
  timezone: z.string().min(2),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  capacityLabel: z.string().optional(),
  note: z.string().optional(),
});

type LocationValues = z.infer<typeof locationSchema>;

function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 text-xs font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function LocationDialog({
  open,
  onOpenChange,
  location,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location;
}) {
  const locations = useDemoStore((state) => state.locations);
  const addLocation = useDemoStore((state) => state.addLocation);
  const updateLocation = useDemoStore((state) => state.updateLocation);
  const [previewName, setPreviewName] = useState("");
  const defaults: LocationValues = location
    ? {
        name: location.name,
        code: location.code,
        type: location.type,
        status: location.status,
        address1: location.address1,
        address2: location.address2 ?? "",
        city: location.city,
        state: location.state,
        zip: location.zip,
        country: location.country,
        manager: location.manager,
        phone: location.phone,
        email: location.email,
        timezone: location.timezone,
        openingTime: location.openingTime ?? "10:00",
        closingTime: location.closingTime ?? "20:00",
        capacityLabel: location.capacityLabel ?? "",
        note: location.note ?? "",
      }
    : {
        name: "",
        code: "",
        type: "retail",
        status: "setup",
        address1: "",
        address2: "",
        city: "Houston",
        state: "TX",
        zip: "",
        country: "USA",
        manager: "Unassigned",
        phone: "",
        email: "",
        timezone: "America/Chicago",
        openingTime: "10:00",
        closingTime: "20:00",
        capacityLabel: "",
        note: "",
      };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    values: defaults,
  });
  const type = useWatch({ control, name: "type" });

  async function onSubmit(values: LocationValues) {
    if (
      locations.some(
        (item) => item.code === values.code && item.id !== location?.id,
      )
    ) {
      setError("code", { message: "This location code already exists." });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const imageByType: Record<LocationType, string> = {
      retail: "/demo/locations/dallas-store.webp",
      "main-warehouse": "/demo/locations/overflow-warehouse.webp",
      "ecommerce-warehouse": "/demo/locations/ecom-warehouse.webp",
    };
    if (location) {
      updateLocation(location.id, {
        ...values,
        code: values.code.toUpperCase(),
      });
      toast.success("Location updated");
    } else {
      addLocation({
        ...values,
        id: makeId("loc"),
        code: values.code.toUpperCase(),
        staffCount: 0,
        image: imageByType[values.type],
        updatedAt: "Just now",
        fictional: true,
      });
      toast.success("Location added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[760px]">
        <DialogHeader className="shrink-0 border-b px-5 py-5 pr-12 sm:pl-6">
          <DialogTitle>
            {location ? `Edit ${location.name}` : "Add location"}
          </DialogTitle>
          <DialogDescription>
            Define the location profile and operational defaults used across
            Flair ERP.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <FormSection
              icon={MapPin}
              title="Basics"
              description="Location identity and current operating state."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Location name"
                  error={errors.name?.message}
                  required
                >
                  <Input
                    autoFocus
                    {...register("name")}
                    placeholder="Harwin Flagship Store"
                  />
                </Field>
                <Field
                  label="Location code"
                  error={errors.code?.message}
                  required
                >
                  <Input
                    {...register("code")}
                    className="uppercase"
                    placeholder="HOU-RT01"
                  />
                </Field>
                <Field
                  label="Location type"
                  error={errors.type?.message}
                  required
                >
                  <select className="field-select" {...register("type")}>
                    <option value="retail">Retail Store</option>
                    <option value="main-warehouse">Main Warehouse</option>
                    <option value="ecommerce-warehouse">
                      E-Commerce Warehouse
                    </option>
                  </select>
                </Field>
                <Field label="Status" error={errors.status?.message} required>
                  <select className="field-select" {...register("status")}>
                    <option value="active">Active</option>
                    <option value="setup">Setup</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>
            </FormSection>
            <FormSection
              icon={MapPin}
              title="Address"
              description="Physical location details shown to operations teams."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  className="sm:col-span-2"
                  label="Address line 1"
                  error={errors.address1?.message}
                  required
                >
                  <Input {...register("address1")} />
                </Field>
                <Field
                  className="sm:col-span-2"
                  label="Address line 2"
                  error={errors.address2?.message}
                >
                  <Input {...register("address2")} />
                </Field>
                <Field label="City" error={errors.city?.message} required>
                  <Input {...register("city")} />
                </Field>
                <Field label="State" error={errors.state?.message} required>
                  <Input {...register("state")} />
                </Field>
                <Field label="ZIP code" error={errors.zip?.message} required>
                  <Input {...register("zip")} />
                </Field>
                <Field label="Country" error={errors.country?.message} required>
                  <Input {...register("country")} />
                </Field>
              </div>
            </FormSection>
            <FormSection
              icon={Warehouse}
              title="Operations"
              description="Coverage, contact and default operating hours."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Manager" error={errors.manager?.message} required>
                  <Input {...register("manager")} />
                </Field>
                <Field
                  label="Timezone"
                  error={errors.timezone?.message}
                  required
                >
                  <select className="field-select" {...register("timezone")}>
                    <option>America/Chicago</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </Field>
                <Field label="Phone" error={errors.phone?.message} required>
                  <Input {...register("phone")} />
                </Field>
                <Field label="Email" error={errors.email?.message} required>
                  <Input type="email" {...register("email")} />
                </Field>
                <Field label="Default opening">
                  <Input type="time" {...register("openingTime")} />
                </Field>
                <Field label="Default closing">
                  <Input type="time" {...register("closingTime")} />
                </Field>
                {type !== "retail" && (
                  <Field className="sm:col-span-2" label="Approximate capacity">
                    <Input
                      {...register("capacityLabel")}
                      placeholder="70% utilized"
                    />
                  </Field>
                )}
                <Field className="sm:col-span-2" label="Notes">
                  <Textarea {...register("note")} rows={3} />
                </Field>
              </div>
            </FormSection>
            <FormSection
              icon={ImagePlus}
              title="Location image"
              description="Preview-only in this frontend demo; no file leaves this browser."
            >
              <label className="relative flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-primary/25 bg-primary/[0.025] p-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:bg-primary/[0.05]">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary">
                  <ImagePlus className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {previewName || "Choose a local image"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    PNG, JPG or WebP · preview only
                  </span>
                </span>
                {/* Keep the native input's focus target inside the scrollable control. */}
                <input
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  type="file"
                  aria-label="Choose a location image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setPreviewName(event.target.files?.[0]?.name ?? "")
                  }
                />
              </label>
            </FormSection>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 border-t bg-muted/30 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {location ? "Save changes" : "Add location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const userSchema = z.object({
  firstName: z.string().min(2, "Enter a first name."),
  lastName: z.string().min(2, "Enter a last name."),
  employeeId: z.string().min(4, "Enter an employee ID."),
  email: z.email("Enter a valid email."),
  phone: z.string().min(7, "Enter a phone number."),
  roleId: z.string().min(1),
  status: z.enum(["active", "invited", "inactive"]),
  timezone: z.string().min(1),
  operationalNotifications: z.boolean(),
  passwordResetRequired: z.boolean(),
});
type UserValues = z.infer<typeof userSchema>;

export function UserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}) {
  const roles = useDemoStore((state) => state.roles);
  const locations = useDemoStore((state) => state.locations);
  const users = useDemoStore((state) => state.users);
  const addUser = useDemoStore((state) => state.addUser);
  const updateUser = useDemoStore((state) => state.updateUser);
  const [locationIds, setLocationIds] = useState<string[]>(
    user?.locationIds ?? [locations[0]?.id].filter(Boolean),
  );
  const defaults: UserValues = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        status: user.status,
        timezone: user.timezone,
        operationalNotifications: user.operationalNotifications,
        passwordResetRequired: user.passwordResetRequired,
      }
    : {
        firstName: "",
        lastName: "",
        employeeId: "",
        email: "",
        phone: "",
        roleId: "role-sales",
        status: "invited",
        timezone: "America/Chicago",
        operationalNotifications: true,
        passwordResetRequired: true,
      };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    values: defaults,
  });

  async function onSubmit(values: UserValues) {
    if (
      users.some(
        (item) =>
          item.email.toLowerCase() === values.email.toLowerCase() &&
          item.id !== user?.id,
      )
    ) {
      setError("email", {
        message: "This email already belongs to a demo user.",
      });
      return;
    }
    if (
      users.some(
        (item) =>
          item.employeeId.toLowerCase() === values.employeeId.toLowerCase() &&
          item.id !== user?.id,
      )
    ) {
      setError("employeeId", {
        message: "This employee ID is already in use.",
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 280));
    if (user) {
      updateUser(user.id, { ...values, locationIds });
      toast.success("User updated");
    } else {
      const avatarNumber = (users.length % 12) + 1;
      addUser({
        ...values,
        id: makeId("usr"),
        locationIds,
        lastActive: "Never",
        addedAt: "2026-08-30",
        avatar: `/demo/avatars/avatar-${String(avatarNumber).padStart(2, "0")}.svg`,
        mfaState: "Not enabled",
      });
      toast.success("User added to demo workspace");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[720px]">
        <DialogHeader className="shrink-0 border-b px-5 py-5 pr-12 sm:pl-6">
          <DialogTitle>
            {user ? `Edit ${user.firstName} ${user.lastName}` : "Add user"}
          </DialogTitle>
          <DialogDescription>
            Add a frontend-only staff profile and assign operational access.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <FormSection
              icon={UserRoundPlus}
              title="Identity"
              description="Basic staff profile details."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  error={errors.firstName?.message}
                  required
                >
                  <Input autoFocus {...register("firstName")} />
                </Field>
                <Field
                  label="Last name"
                  error={errors.lastName?.message}
                  required
                >
                  <Input {...register("lastName")} />
                </Field>
                <Field
                  label="Employee ID"
                  error={errors.employeeId?.message}
                  required
                >
                  <Input {...register("employeeId")} placeholder="FLR-1040" />
                </Field>
                <Field label="Phone" error={errors.phone?.message} required>
                  <Input {...register("phone")} />
                </Field>
                <Field
                  className="sm:col-span-2"
                  label="Email"
                  error={errors.email?.message}
                  required
                >
                  <Input type="email" {...register("email")} />
                </Field>
              </div>
            </FormSection>
            <FormSection
              icon={ShieldCheck}
              title="Access"
              description="Role, location coverage and current account state."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role" error={errors.roleId?.message} required>
                  <select className="field-select" {...register("roleId")}>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status" error={errors.status?.message} required>
                  <select className="field-select" {...register("status")}>
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
                <Field className="sm:col-span-2" label="Assigned locations">
                  <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
                    {locations.map((location) => (
                      <label
                        key={location.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={locationIds.includes(location.id)}
                          onCheckedChange={(checked) =>
                            setLocationIds((current) =>
                              checked
                                ? [...current, location.id]
                                : current.filter((id) => id !== location.id),
                            )
                          }
                        />
                        <span className="truncate">{location.name}</span>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </FormSection>
            <FormSection
              icon={ShieldCheck}
              title="Preferences"
              description="Demo account preferences; no real authentication is created."
            >
              <div className="space-y-3">
                <Field label="Timezone">
                  <select className="field-select" {...register("timezone")}>
                    <option>America/Chicago</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </Field>
                <label className="flex items-start gap-3 rounded-xl border p-3">
                  <Checkbox
                    defaultChecked={defaults.operationalNotifications}
                    {...register("operationalNotifications")}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Operational notifications
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Show setup changes and reminders in the demo workspace.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border p-3">
                  <Checkbox
                    defaultChecked={defaults.passwordResetRequired}
                    {...register("passwordResetRequired")}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Require password reset
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Display-only preference for the first sign-in experience.
                    </span>
                  </span>
                </label>
              </div>
            </FormSection>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 border-t bg-muted/30 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {user ? "Save changes" : "Add user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const roleSchema = z.object({
  name: z.string().min(2, "Enter a role name."),
  description: z.string().min(8, "Add a short purpose statement."),
  templateId: z.string(),
  locationScope: z.enum(["all", "selected"]),
});
type RoleValues = z.infer<typeof roleSchema>;

export function RoleDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
}) {
  const roles = useDemoStore((state) => state.roles);
  const permissions = useDemoStore((state) => state.permissions);
  const addRole = useDemoStore((state) => state.addRole);
  const updateRole = useDemoStore((state) => state.updateRole);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    values: role
      ? {
          name: role.name,
          description: role.description,
          templateId: role.id,
          locationScope: role.locationScope,
        }
      : {
          name: "",
          description: "",
          templateId: "role-sales",
          locationScope: "selected",
        },
  });
  async function onSubmit(values: RoleValues) {
    if (
      roles.some(
        (item) =>
          item.name.toLowerCase() === values.name.toLowerCase() &&
          item.id !== role?.id,
      )
    ) {
      setError("name", { message: "A role with this name already exists." });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (role) {
      updateRole(role.id, values);
      toast.success("Role updated");
    } else {
      const id = makeId("role");
      const template = structuredClone(
        permissions[values.templateId] ?? permissions["role-sales"],
      );
      addRole(
        {
          id,
          name: values.name,
          description: values.description,
          sourceRole: false,
          accessLevel: "Custom",
          locationScope: values.locationScope,
          permissionHighlights: ["Custom policy", "Configurable", "Demo role"],
        },
        {
          ...template,
          roleId: id,
          locationScope: values.locationScope,
          updatedAt: "Just now",
        },
      );
      toast.success("Role created");
    }
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {role ? `Edit ${role.name}` : "Create role"}
          </DialogTitle>
          <DialogDescription>
            Extend the six source-defined roles with a custom demo policy.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Role name" error={errors.name?.message} required>
            <Input autoFocus {...register("name")} />
          </Field>
          <Field
            label="Description"
            error={errors.description?.message}
            required
          >
            <Textarea rows={3} {...register("description")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Base role template">
              <select className="field-select" {...register("templateId")}>
                {roles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location scope">
              <select className="field-select" {...register("locationScope")}>
                <option value="all">All locations</option>
                <option value="selected">Selected locations</option>
              </select>
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {role ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const businessSchema = z.object({
  displayName: z.string().min(2),
  legalName: z.string().min(2),
  website: z.string().min(3),
  email: z.email(),
  phone: z.string().min(7),
  address: z.string().min(8),
  description: z.string().min(10),
});

export function BusinessProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const profile = useDemoStore(
    (state) => state.companySettings.businessProfile,
  );
  const updateSettings = useDemoStore((state) => state.updateCompanySettings);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanySettings["businessProfile"]>({
    resolver: zodResolver(businessSchema),
    values: profile,
  });
  async function onSubmit(values: CompanySettings["businessProfile"]) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    updateSettings("businessProfile", values);
    toast.success("Business profile updated");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Edit business profile</DialogTitle>
          <DialogDescription>
            Update the public-facing profile details used throughout this
            frontend demo.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name" error={errors.displayName?.message}>
              <Input {...register("displayName")} />
            </Field>
            <Field label="Legal name" error={errors.legalName?.message}>
              <Input {...register("legalName")} />
            </Field>
            <Field label="Website" error={errors.website?.message}>
              <Input {...register("website")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Address"
              error={errors.address?.message}
            >
              <Input {...register("address")} />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Business description"
              error={errors.description?.message}
            >
              <Textarea rows={4} {...register("description")} />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}Save profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ResetDemoDialog({
  open,
  onOpenChange,
  clear = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clear?: boolean;
}) {
  const reset = useDemoStore((state) => state.resetDemoData);
  const clearState = useDemoStore((state) => state.clearDemoState);
  function confirm() {
    if (clear) clearState();
    else reset();
    toast.success(clear ? "Local demo state cleared" : "Demo data restored");
    onOpenChange(false);
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {clear ? "Clear local demo state?" : "Reset all demo data?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {clear
              ? "This clears local browser changes and starts again from the original seed workspace."
              : "Every local change made in this browser will be replaced with the original seed data."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm}>
            {clear ? "Clear state" : "Reset demo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/7 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function DemoModeBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-amber-200 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
    >
      <span className="size-1.5 rounded-full bg-amber-500" />
      Local demo
    </Badge>
  );
}

export function sourceSeedProfile() {
  return createSeedData().companySettings.businessProfile;
}
