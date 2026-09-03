import { TaxonomyPage } from "@/components/inventory/taxonomy-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Categories & Brands" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <TaxonomyPage />;
}
