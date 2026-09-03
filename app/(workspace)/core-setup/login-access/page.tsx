import { AccountsPage } from "@/components/auth/accounts-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Login Access" };
export default async function Page() {
  await requirePageAccess("core");
  return <AccountsPage />;
}
