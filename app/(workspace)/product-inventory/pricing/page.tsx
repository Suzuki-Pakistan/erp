import { PricingPage } from "@/components/inventory/pricing-page";
import { requirePageAccess } from "@/lib/server/auth";
export const metadata = { title: "Pricing & Margins" };
export default async function Page() {
  await requirePageAccess("inventory");
  return <PricingPage />;
}
