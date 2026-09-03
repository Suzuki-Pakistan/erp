import { WorkspaceLayout } from "@/components/auth/workspace-layout";
import { PosProvider } from "@/components/pos/pos-provider";
export const metadata = {
  title: "Retail POS",
  description: "Flair retail checkout, receipts, customers and cashier shifts.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout module="pos">
      <PosProvider>{children}</PosProvider>
    </WorkspaceLayout>
  );
}
