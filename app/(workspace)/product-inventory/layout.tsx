import { WorkspaceLayout } from "@/components/auth/workspace-layout";
import { InventoryProvider } from "@/components/inventory/inventory-provider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout module="inventory">
      <InventoryProvider>{children}</InventoryProvider>
    </WorkspaceLayout>
  );
}
