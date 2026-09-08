import type { Metadata } from "next";

import { WorkspaceLayout } from "@/components/auth/workspace-layout";

export const metadata: Metadata = {
  title: "Decision Intelligence",
  description:
    "Operational Smart Demand Forecasting and Accounting & Finance workspaces.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout module="core">{children}</WorkspaceLayout>;
}
