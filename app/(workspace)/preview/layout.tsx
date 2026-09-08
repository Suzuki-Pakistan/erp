import type { Metadata } from "next";

import { WorkspaceLayout } from "@/components/auth/workspace-layout";

export const metadata: Metadata = {
  title: "Platform Preview",
  description:
    "Interactive demos for Smart Demand Forecasting and Accounting & Finance.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout module="core">{children}</WorkspaceLayout>;
}
