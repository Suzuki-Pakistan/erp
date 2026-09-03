import { StockPage } from "@/components/inventory/stock-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Stock Explorer" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <StockPage />;
}
