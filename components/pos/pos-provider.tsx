"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useSessionUser } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import type { PosSnapshot } from "@/types/pos";
import {
  checkoutSchema,
  type CheckoutCommand,
  type PosCommand,
} from "@/lib/pos-schema";

export interface QueuedSale {
  command: CheckoutCommand;
  createdAt: string;
  error: string;
}
interface Result {
  id?: string;
  queued?: boolean;
  data?: PosSnapshot;
}
interface Context {
  data: PosSnapshot;
  busy: boolean;
  online: boolean;
  queue: QueuedSale[];
  mutate: (command: PosCommand, allowQueue?: boolean) => Promise<Result | null>;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  removeQueued: (id: string) => void;
}
const PosContext = createContext<Context | null>(null);
export function usePos() {
  const value = useContext(PosContext);
  if (!value) throw new Error("POS provider missing");
  return value;
}

export function PosProvider({ children }: { children: React.ReactNode }) {
  const user = useSessionUser();
  const router = useRouter();
  const [data, setData] = useState<PosSnapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedSale[]>([]);
  const queued = useRef<QueuedSale[]>([]);
  const lock = useRef(false);
  const revision = useRef(0);
  const key = "flair-pos-queue-v1:" + user.id;
  const cacheKey = "flair-pos-snapshot-v1:" + user.id;
  const accept = useCallback(
    (snapshot: PosSnapshot) => {
      revision.current++;
      setData(snapshot);
      setError("");
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(snapshot));
      } catch {
        /* The current session can continue without an offline cache. */
      }
    },
    [cacheKey],
  );
  const saveQueue = useCallback(
    (entries: QueuedSale[]) => {
      // Persist before clearing a cart or acknowledging a queued transaction.
      const stored = JSON.parse(
        localStorage.getItem(key) || "[]",
      ) as QueuedSale[];
      const removed = new Set(
        queued.current
          .filter(
            (q) =>
              !entries.some((e) => e.command.requestId === q.command.requestId),
          )
          .map((q) => q.command.requestId),
      );
      const merged = new Map(
        stored
          .filter(
            (q) =>
              checkoutSchema.safeParse(q.command).success &&
              !removed.has(q.command.requestId),
          )
          .map((q) => [q.command.requestId, q]),
      );
      for (const entry of entries) merged.set(entry.command.requestId, entry);
      const next = [...merged.values()];
      localStorage.setItem(key, JSON.stringify(next));
      queued.current = next;
      setQueue(next);
    },
    [key],
  );
  const send = useCallback(
    async (command: PosCommand) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch("/api/pos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
          signal: controller.signal,
        });
      } catch (error) {
        if (controller.signal.aborted)
          throw new TypeError(
            "Server confirmation timed out. Retry with the same checkout reference.",
          );
        throw error;
      } finally {
        clearTimeout(timeout);
      }
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        throw new Error(
          "Sign in again. Your pending checkout has not been discarded.",
        );
      }
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to save this transaction.");
      return result as { data: PosSnapshot; id?: string; message: string };
    },
    [router],
  );
  const refresh = useCallback(async () => {
    const before = revision.current;
    try {
      const response = await fetch("/api/pos", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (before === revision.current) accept(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "POS unavailable");
    }
  }, [accept, router]);
  const sync = useCallback(async () => {
    if (lock.current || !navigator.onLine || !queued.current.length) return;
    lock.current = true;
    setBusy(true);
    try {
      for (const entry of [...queued.current]) {
        try {
          const result = await send(entry.command);
          accept(result.data);
          saveQueue(
            queued.current.filter(
              (q) => q.command.requestId !== entry.command.requestId,
            ),
          );
          toast.success("Pending sale posted", {
            description: "Find the final receipt in Sales History.",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unable to sync";
          saveQueue(
            queued.current.map((q) =>
              q.command.requestId === entry.command.requestId
                ? { ...q, error: message }
                : q,
            ),
          );
          if (err instanceof TypeError) break;
        }
      }
    } catch {
      toast.error(
        "Unable to update this device's queue. Do not clear browser storage; retry sync safely.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [send, accept, saveQueue]);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setOnline(navigator.onLine);
      try {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(stored)) {
          const entries = stored.filter(
            (e) => checkoutSchema.safeParse(e.command).success,
          );
          queued.current = entries;
          setQueue(entries);
        }
        const cached = sessionStorage.getItem(cacheKey);
        if (cached && !navigator.onLine) setData(JSON.parse(cached));
      } catch {
        setError(
          "This device's saved POS data could not be read. Do not clear storage if you have pending sales.",
        );
      }
      void refresh();
      if (navigator.onLine) void sync();
    });
    const connected = () => {
      setOnline(true);
      void sync();
      void refresh();
    };
    const disconnected = () => setOnline(false);
    const storageChanged = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        const entries = JSON.parse(event.newValue || "[]") as QueuedSale[];
        queued.current = entries.filter(
          (q) => checkoutSchema.safeParse(q.command).success,
        );
        setQueue(queued.current);
      } catch {
        setError(
          "Unable to read pending sales from another tab. Keep this device's storage intact.",
        );
      }
    };
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    window.addEventListener("storage", storageChanged);
    return () => {
      active = false;
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
      window.removeEventListener("storage", storageChanged);
    };
  }, [key, cacheKey, refresh, sync]);
  async function mutate(
    command: PosCommand,
    allowQueue = false,
  ): Promise<Result | null> {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    try {
      const result = await send(command);
      accept(result.data);
      toast.success(result.message);
      return result;
    } catch (err) {
      if (err instanceof TypeError)
        setError(
          "The server could not confirm the transaction. Check pending sales before retrying.",
        );
      if (
        allowQueue &&
        command.action === "sale.checkout" &&
        err instanceof TypeError &&
        !command.tenders.some((t) => t.method !== "cash")
      ) {
        try {
          if (
            !queued.current.some(
              (q) => q.command.requestId === command.requestId,
            )
          )
            saveQueue([
              ...queued.current,
              {
                command,
                createdAt: new Date().toISOString(),
                error: "Awaiting server confirmation",
              },
            ]);
          toast.warning("Checkout pending — not a completed sale", {
            description:
              "Do not collect payment or release goods until the server confirms it. Check the Sync Queue.",
          });
          return { queued: true };
        } catch {
          toast.error(
            "Cannot save the offline queue. Keep this cart open and reconnect.",
          );
          return null;
        }
      }
      toast.error(err instanceof Error ? err.message : "Unable to save");
      return null;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function removeQueued(id: string) {
    if (lock.current) return;
    try {
      saveQueue(queued.current.filter((q) => q.command.requestId !== id));
    } catch {
      toast.error("Unable to update the queue.");
    }
  }
  if (!data)
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div className="max-w-md space-y-4">
          {error ? (
            <>
              <AlertCircle className="mx-auto size-8 text-destructive" />
              <h1 className="text-xl font-semibold">POS is unavailable</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={refresh}>
                <RefreshCw />
                Retry connection
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto size-7 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Preparing your retail workspace…
              </p>
            </>
          )}
        </div>
      </div>
    );
  return (
    <PosContext.Provider
      value={{ data, busy, online, queue, mutate, refresh, sync, removeQueued }}
    >
      {(!online || error) && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <WifiOff className="mt-0.5 size-4 shrink-0" />
          <div>
            <strong>
              {online
                ? "Connection needs attention"
                : "Offline · using the last loaded catalog"}
            </strong>
            <p className="mt-1 text-xs">
              Cash checkouts can be queued for review. Stock and payment are not
              final until confirmed by the server.
            </p>
          </div>
        </div>
      )}
      {children}
    </PosContext.Provider>
  );
}
