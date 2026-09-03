import { requirePageAccess } from "@/lib/server/auth";
import type { AppModule } from "@/types/auth";
export async function WorkspaceLayout({
  module,
  children,
}: {
  module: AppModule;
  children: React.ReactNode;
}) {
  // Keep module authorization here; the persistent parent owns the shell.
  await requirePageAccess(module);
  return children;
}
