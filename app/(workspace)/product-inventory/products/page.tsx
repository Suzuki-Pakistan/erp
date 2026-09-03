import { CatalogPage } from "@/components/inventory/catalog-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Product Catalog" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <CatalogPage />;
}
