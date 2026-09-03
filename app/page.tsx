import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { landingPath } from "@/types/auth";

export default async function Home() {
  const user = await getSessionUser();
  redirect(user ? landingPath(user) : "/login");
}
