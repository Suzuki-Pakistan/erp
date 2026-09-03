import { OverviewPage } from "@/components/core-setup/overview-page";
import { requirePageAccess } from "@/lib/server/auth";

export default async function Page() {
  await requirePageAccess("core");
  return <OverviewPage />;
}
