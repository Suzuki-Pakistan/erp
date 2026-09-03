import { WorkspaceLayout } from "@/components/auth/workspace-layout";

export default function CoreSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout module="core">{children}</WorkspaceLayout>;
}
