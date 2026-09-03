import { Suspense } from "react";
import { TerminalPage } from "@/components/pos/terminal-page";
export default function Page() {
  return (
    <Suspense>
      <TerminalPage />
    </Suspense>
  );
}
