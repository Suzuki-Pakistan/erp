import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck, Boxes, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/server/auth";
import { landingPath } from "@/types/auth";
export const metadata = { title: "Sign in" };
export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(landingPath(user));
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.08fr_1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Image
          src="/demo/locations/harwin-store.webp"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary/30 via-primary/40 to-primary" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-[#f8f2e8]">
            <Image
              src="/brand/flair-mark.png"
              alt="Flair"
              width={44}
              height={44}
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Flair ERP</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
              Operations platform
            </p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs">
            <Sparkles className="size-3.5 text-[var(--brand-champagne)]" /> A
            clearer view of every operation
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.035em] xl:text-5xl">
            Good operations.
            <br />
            <span className="text-[var(--brand-champagne)]">
              Exceptional Flair.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            One connected workspace for your people, products and locations.
            Thoughtfully built for the way fragrance retail moves.
          </p>
          <div className="mt-9 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
            <div className="flex gap-3">
              <Boxes className="size-5 text-[var(--brand-champagne)]" />
              <div>
                <p className="text-sm font-medium">Every product, in view</p>
                <p className="mt-1 text-xs text-white/50">
                  Catalog to stock movement
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-[var(--brand-champagne)]" />
              <div>
                <p className="text-sm font-medium">Access with intention</p>
                <p className="mt-1 text-xs text-white/50">
                  Role-aware workspaces
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-white/35">
          Flair Cosmetic & Fragrance · Internal workspace
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[390px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Image
              src="/brand/flair-mark.png"
              alt="Flair"
              width={42}
              height={42}
            />
            <p className="font-semibold">Flair ERP</p>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/65">
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Sign in to your workspace
          </h2>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            Everything you need to keep Flair moving, in one place.
          </p>
          <LoginForm />
          <div className="mt-9 flex items-center justify-center gap-2 border-t pt-6 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Server-validated session ·
            12-hour access window
          </div>
        </div>
      </section>
    </main>
  );
}
