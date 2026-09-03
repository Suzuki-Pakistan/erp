import { InventoryOverviewPage } from "@/components/inventory/overview-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Product & Inventory" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <InventoryOverviewPage />;
}
