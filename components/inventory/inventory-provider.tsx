"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InventoryData } from "@/types/inventory";
import type { InventoryCommand } from "@/lib/inventory-schema";
import { useSessionUser } from "@/components/auth/session-provider";
import { canManageInventory } from "@/types/auth";

interface InventoryContextValue {
  data: InventoryData;
  canWrite: boolean;
  costsVisible: boolean;
  refresh: () => Promise<void>;
  mutate: (command: InventoryCommand) => Promise<boolean>;
  busy: boolean;
}
const InventoryContext = createContext<InventoryContextValue | null>(null);
async function fetchInventory(): Promise<InventoryData> {
  const response = await fetch("/api/inventory", { cache: "no-store" });
  const result = await response.json();
  if (!response.ok)
    throw new Error(response.status === 401 ? "SESSION_EXPIRED" : result.error);
  return result.data;
}
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("Inventory provider missing.");
  return context;
}
export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const user = useSessionUser();
  const router = useRouter();
  const [data, setData] = useState<InventoryData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      setData(await fetchInventory());
      setError("");
    } catch (err) {
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        router.replace("/login");
        router.refresh();
        return;
      }
      setError(
        err instanceof Error ? err.message : "Unable to load inventory.",
      );
    }
  }
  useEffect(() => {
    let active = true;
    fetchInventory()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: Error) => {
        if (!active) return;
        if (err.message === "SESSION_EXPIRED") {
          router.replace("/login");
          router.refresh();
        } else setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [router]);
  async function mutate(command: InventoryCommand) {
    if (busy) return false;
    setBusy(true);
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return false;
      }
      if (!response.ok) throw new Error(result.error);
      setData(result.data);
      toast.success(result.message);
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to save changes.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (error && !data)
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 size-9 text-destructive" />
          <h1 className="text-xl font-semibold">Inventory is unavailable</h1>
          <p className="my-3 text-sm text-muted-foreground">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw />
            Try again
          </Button>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading your inventory workspace…
      </div>
    );
  return (
    <InventoryContext.Provider
      value={{
        data,
        canWrite: canManageInventory(user),
        costsVisible: user.role !== "inventory-viewer",
        refresh,
        mutate,
        busy,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}
