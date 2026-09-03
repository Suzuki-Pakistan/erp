import type { Metadata } from "next";
import { UsersRolesPage } from "@/components/core-setup/users-roles-page";

export const metadata: Metadata = { title: "Users & Roles" };

export default async function Page() {
  const { requirePageAccess } = await import("@/lib/server/auth");
  await requirePageAccess("core");
  return <UsersRolesPage />;
}
