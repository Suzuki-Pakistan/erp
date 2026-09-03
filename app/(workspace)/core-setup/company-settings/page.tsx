import type { Metadata } from "next";
import { SettingsPage } from "@/components/core-setup/settings-page";

export const metadata: Metadata = { title: "Company Settings" };

export default async function Page() {
  const { requirePageAccess } = await import("@/lib/server/auth");
  await requirePageAccess("core");
  return <SettingsPage />;
}
