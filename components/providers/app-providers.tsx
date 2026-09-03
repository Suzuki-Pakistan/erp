"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

import {
  BusinessProfileDialog,
  LocationDialog,
  ResetDemoDialog,
  RoleDialog,
  UserDialog,
} from "@/components/core-setup/dialogs";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDemoStore } from "@/store/demo-store";

type GlobalDialog =
  "location" | "user" | "role" | "business-profile" | "reset" | null;

interface AppUiContextValue {
  openDialog: (dialog: Exclude<GlobalDialog, null>) => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) throw new Error("useAppUi must be used inside AppProviders");
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useDemoStore((state) => state.hasHydrated);
  const [dialog, setDialog] = useState<GlobalDialog>(null);

  useEffect(() => {
    void useDemoStore.persist.rehydrate();
  }, []);

  const context = useMemo(
    () => ({
      openDialog: (nextDialog: Exclude<GlobalDialog, null>) =>
        setDialog(nextDialog),
    }),
    [],
  );

  return (
    <TooltipProvider delayDuration={250}>
      <AppUiContext.Provider value={context}>
        {hydrated ? children : <AppLoadingShell />}
        <LocationDialog
          open={dialog === "location"}
          onOpenChange={(open) => !open && setDialog(null)}
        />
        <UserDialog
          open={dialog === "user"}
          onOpenChange={(open) => !open && setDialog(null)}
        />
        <RoleDialog
          open={dialog === "role"}
          onOpenChange={(open) => !open && setDialog(null)}
        />
        <BusinessProfileDialog
          open={dialog === "business-profile"}
          onOpenChange={(open) => !open && setDialog(null)}
        />
        <ResetDemoDialog
          open={dialog === "reset"}
          onOpenChange={(open) => !open && setDialog(null)}
        />
        <Toaster
          position={
            pathname.startsWith("/retail-pos") ? "top-center" : "bottom-right"
          }
          richColors
          closeButton
        />
      </AppUiContext.Provider>
    </TooltipProvider>
  );
}

function AppLoadingShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-[280px] bg-primary p-5 xl:block">
        <Skeleton className="h-16 bg-white/10" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-11 bg-white/8" />
          ))}
        </div>
      </div>
      <main className="flex-1 p-5 sm:p-8">
        <div className="mx-auto max-w-[1560px]">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
          <Skeleton className="mt-6 h-[440px]" />
        </div>
      </main>
    </div>
  );
}
