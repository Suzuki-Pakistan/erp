import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/auth/session-provider";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/shell/app-shell";
import { getSessionUser } from "@/lib/server/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <SessionProvider user={user}>
      <AppProviders>
        <AppShell>{children}</AppShell>
      </AppProviders>
    </SessionProvider>
  );
}
