"use client";
import { useEffect, useState } from "react";
import { Plus, ShieldCheck, KeyRound, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/core-setup/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField, InventoryBadge } from "@/components/inventory/shared";
import { accessRoles, type SessionUser, type AccessRole } from "@/types/auth";
import { useSessionUser } from "./session-provider";
export function AccountsPage() {
  const current = useSessionUser();
  const [accounts, setAccounts] = useState<SessionUser[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    role: "inventory-manager" as AccessRole,
    active: true,
    password: "",
  });
  async function load() {
    try {
      const response = await fetch("/api/auth/accounts");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAccounts(result.accounts);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load accounts.",
      );
    }
  }
  useEffect(() => {
    let active = true;
    fetch("/api/auth/accounts")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (active) setAccounts(result.accounts);
      })
      .catch((error: Error) => {
        if (active) toast.error(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  function edit(account?: SessionUser) {
    setForm(
      account
        ? { ...account, password: "" }
        : {
            id: "",
            name: "",
            username: "",
            email: "",
            role: "inventory-manager",
            active: true,
            password: "",
          },
    );
    setOpen(true);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/auth/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: form.id || undefined,
          password: form.password || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success("Login access saved");
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save account.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Login Access"
        description="Manage real workspace sign-ins, active sessions and module-level access."
        actions={
          <Button onClick={() => edit()}>
            <Plus />
            Create login
          </Button>
        }
      />
      <div className="rounded-xl border border-primary/10 bg-primary/4 p-4 text-sm leading-6">
        <ShieldCheck className="mr-2 inline size-4 text-primary" />
        These are server-validated login accounts. Core Setup staff profiles and
        permission matrices remain demonstration records; login access is
        enforced by the roles below.
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(accessRoles).map(([id, role]) => (
          <Card key={id}>
            <CardContent className="p-5">
              <KeyRound className="mb-4 size-5 text-primary/60" />
              <h2 className="font-semibold">{role.label}</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {role.description}
              </p>
              <p className="mt-4 text-2xl font-semibold">
                {accounts.filter((a) => a.role === id).length}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  accounts
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden py-0">
        <div className="divide-y">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center gap-4 p-5"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/8 text-sm font-semibold">
                {account.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {account.name}
                  {account.id === current.id && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {account.username} · {account.email}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {accessRoles[account.role].label}
              </span>
              <InventoryBadge status={account.active ? "active" : "inactive"} />
              <Button
                variant="outline"
                size="sm"
                disabled={account.id === current.id}
                onClick={() => edit(account)}
              >
                <Pencil />
                Edit access
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit login access" : "Create login account"}
            </DialogTitle>
            <DialogDescription>
              Passwords are hashed on the server. Editing an account revokes its
              existing sessions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name">
                <Input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FormField>
              <FormField label="Username">
                <Input
                  required
                  minLength={3}
                  pattern="[a-zA-Z0-9._-]+"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </FormField>
            </div>
            <FormField label="Email">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Access role">
              <select
                className="field-select"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AccessRole })
                }
              >
                {Object.entries(accessRoles).map(([id, role]) => (
                  <option key={id} value={id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label={
                form.id
                  ? "New password (leave blank to keep current)"
                  : "Password (minimum 8 characters)"
              }
            >
              <Input
                type="password"
                autoComplete="new-password"
                required={!form.id}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Account is active
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="animate-spin" />}Save login
                access
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
