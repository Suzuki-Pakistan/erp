import { notFound, redirect } from "next/navigation";

import { DecisionSuitePage } from "@/components/decision-intelligence/decision-suite-page";
import {
  getRoadmapModule,
  getRoadmapRoute,
} from "@/components/roadmap/roadmap-config";

export default async function Page({
  params,
}: {
  params: Promise<{ module: string; view?: string[] }>;
}) {
  const { module: moduleId, view } = await params;
  const moduleConfig = getRoadmapModule(moduleId);
  if (!moduleConfig || (view?.length ?? 0) > 1) notFound();
  if (moduleConfig.locked) redirect("/core-setup");

  const route = getRoadmapRoute(moduleConfig, view?.[0]);
  if (view?.[0] && route.key !== view[0]) notFound();

  if (moduleConfig.id !== "forecasting" && moduleConfig.id !== "finance") {
    redirect("/core-setup");
  }

  return <DecisionSuitePage moduleId={moduleConfig.id} view={route.key} />;
}
