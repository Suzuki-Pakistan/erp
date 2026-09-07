import type { Metadata } from "next";

import { WorkspaceLayout } from "@/components/auth/workspace-layout";

export const metadata: Metadata = {
  title: "Platform Preview",
  description:
    "Interface previews for purchasing, wholesale, e-commerce, reporting, forecasting and finance.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout module="core">{children}</WorkspaceLayout>;
}
