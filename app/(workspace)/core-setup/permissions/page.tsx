import type { Metadata } from "next";
import { PermissionsPage } from "@/components/core-setup/permissions-page";
import { requirePageAccess } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Permissions" };

export default async function Page() {
  await requirePageAccess("core");
  return <PermissionsPage />;
}
