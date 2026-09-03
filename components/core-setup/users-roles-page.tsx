"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Ellipsis,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { RoleDialog, UserDialog } from "@/components/core-setup/dialogs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/lib/format";
import { useDemoStore } from "@/store/demo-store";
import type { Role, User } from "@/types/core-setup";
import { MetricCard, PageHeader, StatusBadge } from "./shared";

export function UsersRolesPage() {
  const users = useDemoStore((state) => state.users);
  const roles = useDemoStore((state) => state.roles);
  const locations = useDemoStore((state) => state.locations);
  const updateUser = useDemoStore((state) => state.updateUser);
  const duplicateRole = useDemoStore((state) => state.duplicateRole);
  const deleteRole = useDemoStore((state) => state.deleteCustomRole);
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [createUser, setCreateUser] = useState(false);
  const [createRole, setCreateRole] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [detailUser, setDetailUser] = useState<User | undefined>();
  const [editRole, setEditRole] = useState<Role | undefined>();
  const [deactivateUser, setDeactivateUser] = useState<User | undefined>();
  const [deleteCustomRole, setDeleteCustomRole] = useState<Role | undefined>();
  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          `${user.firstName} ${user.lastName} ${user.email} ${user.employeeId}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (roleFilter === "all" || user.roleId === roleFilter) &&
          (statusFilter === "all" || user.status === statusFilter) &&
          (locationFilter === "all" ||
            user.locationIds.includes(locationFilter))
        );
      }),
    [users, search, roleFilter, statusFilter, locationFilter],
  );
  const filtersActive = Boolean(
    search ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    locationFilter !== "all",
  );
  const roleById = (id: string) => roles.find((role) => role.id === id);
  const clear = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setLocationFilter("all");
  };
  function toggleUser(user: User) {
    const next = user.status === "inactive" ? "active" : "inactive";
    updateUser(user.id, { status: next });
    toast.success(next === "active" ? "User activated" : "User deactivated");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage staff access, role assignment and location coverage across the ERP."
        actions={
          <>
            <Button variant="outline" onClick={() => setCreateRole(true)}>
              <ShieldCheck />
              Create role
            </Button>
            <Button onClick={() => setCreateUser(true)}>
              <Plus />
              Add user
            </Button>
          </>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Total users"
          value={users.length}
          meta="Synthetic demo profiles"
        />
        <MetricCard
          icon={UserCheck}
          label="Active"
          value={users.filter((user) => user.status === "active").length}
          meta="Operational access"
        />
        <MetricCard
          icon={Mail}
          label="Invited"
          value={users.filter((user) => user.status === "invited").length}
          meta="No email is sent"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Roles"
          value={roles.length}
          meta={`${roles.filter((role) => !role.sourceRole).length} custom role${roles.filter((role) => !role.sourceRole).length === 1 ? "" : "s"}`}
        />
      </section>
      <Tabs value={tab} onValueChange={setTab} className="gap-5">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-0">
          <Card className="overflow-hidden py-0">
            <div className="border-b p-4 sm:p-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
                <div className="relative min-w-0 flex-1 lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email or ID…"
                    className="pl-9"
                  />
                </div>
                <select
                  className="field-select lg:w-40"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="all">All roles</option>
                  {roles.map((role) => (
                    <option value={role.id} key={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <select
                  className="field-select lg:w-36"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  className="field-select lg:w-52"
                  value={locationFilter}
                  onChange={(event) => setLocationFilter(event.target.value)}
                >
                  <option value="all">All locations</option>
                  {locations.map((location) => (
                    <option value={location.id} key={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {filtersActive && (
                  <Button variant="ghost" size="sm" onClick={clear}>
                    Clear filters
                  </Button>
                )}
                <Button
                  size="sm"
                  className="lg:ml-auto"
                  onClick={() => setCreateUser(true)}
                >
                  <Plus />
                  Add user
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Showing {filtered.length} of {users.length} users
              </p>
            </div>
            {filtered.length === 0 ? (
              <EmptyUsers onClear={clear} onAdd={() => setCreateUser(true)} />
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Locations</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last active</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer"
                          onClick={() => setDetailUser(user)}
                        >
                          <TableCell>
                            <UserIdentity user={user} />
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {user.employeeId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="rounded-md text-[10px]"
                            >
                              {roleById(user.roleId)?.name ?? "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-48 text-xs">
                            <span className="block truncate">
                              {user.locationIds
                                .map(
                                  (id) =>
                                    locations.find(
                                      (location) => location.id === id,
                                    )?.name,
                                )
                                .filter(Boolean)
                                .join(", ") || "No location"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {user.lastActive}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.addedAt}
                          </TableCell>
                          <TableCell
                            onClick={(event) => event.stopPropagation()}
                          >
                            <UserMenu
                              user={user}
                              onView={() => setDetailUser(user)}
                              onEdit={() => setEditUser(user)}
                              onToggle={() =>
                                user.status === "inactive"
                                  ? toggleUser(user)
                                  : setDeactivateUser(user)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-3 p-4 md:hidden">
                  {filtered.map((user) => (
                    <article key={user.id} className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <UserIdentity user={user} compact />
                        <div className="ml-auto">
                          <UserMenu
                            user={user}
                            onView={() => setDetailUser(user)}
                            onEdit={() => setEditUser(user)}
                            onToggle={() =>
                              user.status === "inactive"
                                ? toggleUser(user)
                                : setDeactivateUser(user)
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-md">
                          {roleById(user.roleId)?.name}
                        </Badge>
                        <StatusBadge status={user.status} />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-[11px]">
                        <div>
                          <p className="text-muted-foreground">Employee ID</p>
                          <p className="mt-1 font-mono font-medium">
                            {user.employeeId}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last active</p>
                          <p className="mt-1 font-medium">{user.lastActive}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">
                            Location coverage
                          </p>
                          <p className="mt-1 truncate font-medium">
                            {user.locationIds
                              .map(
                                (id) =>
                                  locations.find(
                                    (location) => location.id === id,
                                  )?.name,
                              )
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="roles" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => {
              const count = users.filter(
                (user) => user.roleId === role.id,
              ).length;
              return (
                <Card
                  key={role.id}
                  className="transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/7 text-primary">
                        <ShieldCheck className="size-5" />
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Actions for ${role.name}`}
                          >
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href="/core-setup/permissions">
                              <KeyRound />
                              View permissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditRole(role)}>
                            <Pencil />
                            Edit role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              duplicateRole(role.id);
                              toast.success("Role duplicated");
                            }}
                          >
                            Duplicate role
                          </DropdownMenuItem>
                          {!role.sourceRole && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteCustomRole(role)}
                              >
                                <Trash2 />
                                Delete custom role
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <h3 className="text-base font-semibold">{role.name}</h3>
                      {!role.sourceRole && (
                        <Badge
                          variant="outline"
                          className="rounded-md text-[9px]"
                        >
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="min-h-10 text-xs leading-5 text-muted-foreground">
                      {role.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Users</p>
                        <p className="mt-1 font-semibold">{count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Access</p>
                        <p className="mt-1 font-semibold">{role.accessLevel}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {role.permissionHighlights.slice(0, 3).map((item) => (
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[9px]"
                          key={item}
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="mt-5 w-full">
                      <Link href="/core-setup/permissions">
                        Inspect permission policy
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            <button
              className="grid min-h-64 place-items-center rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center transition-colors hover:bg-primary/[0.045]"
              onClick={() => setCreateRole(true)}
            >
              <span>
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/7 text-primary">
                  <Plus />
                </span>
                <span className="mt-3 block text-sm font-semibold">
                  Create custom role
                </span>
                <span className="mx-auto mt-1 block max-w-xs text-xs leading-5 text-muted-foreground">
                  Start from a source-defined template and tailor it in
                  Permissions.
                </span>
              </span>
            </button>
          </div>
        </TabsContent>
      </Tabs>
      <UserDialog open={createUser} onOpenChange={setCreateUser} />
      {editUser && (
        <UserDialog
          open={Boolean(editUser)}
          onOpenChange={(open) => !open && setEditUser(undefined)}
          user={editUser}
        />
      )}
      <RoleDialog open={createRole} onOpenChange={setCreateRole} />
      {editRole && (
        <RoleDialog
          open={Boolean(editRole)}
          onOpenChange={(open) => !open && setEditRole(undefined)}
          role={editRole}
        />
      )}
      <UserDetail
        user={detailUser}
        role={detailUser ? roleById(detailUser.roleId) : undefined}
        onOpenChange={(open) => !open && setDetailUser(undefined)}
        onEdit={() => {
          if (detailUser) {
            setEditUser(detailUser);
            setDetailUser(undefined);
          }
        }}
        onToggle={() => {
          if (detailUser) {
            if (detailUser.status === "inactive") toggleUser(detailUser);
            else setDeactivateUser(detailUser);
            setDetailUser(undefined);
          }
        }}
      />
      <AlertDialog
        open={Boolean(deactivateUser)}
        onOpenChange={(open) => !open && setDeactivateUser(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this user?</AlertDialogTitle>
            <AlertDialogDescription>
              The user will remain visible in the demo but their status will
              change to inactive. No real account is affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deactivateUser) {
                  toggleUser(deactivateUser);
                  setDeactivateUser(undefined);
                }
              }}
            >
              Deactivate user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={Boolean(deleteCustomRole)}
        onOpenChange={(open) => !open && setDeleteCustomRole(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this custom role?</AlertDialogTitle>
            <AlertDialogDescription>
              Assigned demo users will move to the Sales role. Source-defined
              roles cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteCustomRole) {
                  deleteRole(deleteCustomRole.id);
                  toast.success("Custom role deleted");
                  setDeleteCustomRole(undefined);
                }
              }}
            >
              Delete role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserIdentity({
  user,
  compact = false,
}: {
  user: User;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={compact ? "size-10" : "size-9"}>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>
          {initials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {user.email}
        </p>
      </div>
    </div>
  );
}
function UserMenu({
  user,
  onView,
  onEdit,
  onToggle,
}: {
  user: User;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Actions for ${user.firstName} ${user.lastName}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Edit user
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={
            user.status === "inactive"
              ? ""
              : "text-destructive focus:text-destructive"
          }
          onClick={onToggle}
        >
          {user.status === "inactive" ? <UserCheck /> : <UserRoundX />}
          {user.status === "inactive" ? "Activate user" : "Deactivate user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserDetail({
  user,
  role,
  onOpenChange,
  onEdit,
  onToggle,
}: {
  user?: User;
  role?: Role;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const locations = useDemoStore((state) => state.locations);
  return (
    <Sheet open={Boolean(user)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[500px]">
        {user && (
          <>
            <SheetHeader className="text-left">
              <div className="flex items-start gap-4">
                <Avatar className="size-14">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {initials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="text-xl">
                    {user.firstName} {user.lastName}
                  </SheetTitle>
                  <SheetDescription className="mt-1 break-all">
                    {user.email}
                  </SheetDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={user.status} />
                    <Badge variant="secondary" className="rounded-md">
                      {role?.name}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <Detail title="Account">
                <Row label="Employee ID" value={user.employeeId} />
                <Row label="Phone" value={user.phone} />
                <Row label="Last active" value={user.lastActive} />
                <Row label="Added" value={user.addedAt} />
                <Row label="MFA" value={user.mfaState} />
              </Detail>
              <Detail title="Location coverage">
                <div className="space-y-2">
                  {user.locationIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-lg border p-2.5 text-sm"
                    >
                      <MapPin className="size-4 text-primary" />
                      {locations.find((location) => location.id === id)?.name ??
                        "Removed location"}
                    </div>
                  ))}
                </div>
              </Detail>
              <Detail title="Permission summary">
                <div className="flex flex-wrap gap-2">
                  {role?.permissionHighlights.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Policy is inherited from the {role?.name} role and scoped to
                  assigned locations.
                </p>
              </Detail>
            </div>
            <SheetFooter className="mt-8">
              <Button variant="outline" onClick={onToggle}>
                {user.status === "inactive" ? "Activate" : "Deactivate"}
              </Button>
              <Button onClick={onEdit}>
                <Pencil />
                Edit user
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
function Detail({
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
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
function EmptyUsers({
  onClear,
  onAdd,
}: {
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <CardContent className="grid min-h-80 place-items-center text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/7 text-primary">
          <UsersRound />
        </span>
        <h3 className="mt-4 font-semibold">No users found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try changing the filters or add a new staff account.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
          <Button onClick={onAdd}>Add user</Button>
        </div>
      </div>
    </CardContent>
  );
}
