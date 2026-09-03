import { OperationsPage } from "@/components/inventory/operations-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Stock Operations" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <OperationsPage />;
}
