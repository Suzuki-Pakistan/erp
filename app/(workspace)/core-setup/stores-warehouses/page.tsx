import type { Metadata } from "next";
import { LocationsPage } from "@/components/core-setup/locations-page";

export const metadata: Metadata = { title: "Stores & Warehouses" };

export default async function Page() {
  const { requirePageAccess } = await import("@/lib/server/auth");
  await requirePageAccess("core");
  return <LocationsPage />;
}
