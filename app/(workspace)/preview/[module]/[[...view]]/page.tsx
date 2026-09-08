import { notFound, redirect } from "next/navigation";

import { ModulePreviewPage } from "@/components/roadmap/module-preview-page";
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

  return <ModulePreviewPage moduleId={moduleConfig.id} view={route.key} />;
}
