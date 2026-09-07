import { notFound } from "next/navigation";

import { ModulePreviewPage } from "@/components/roadmap/module-preview-page";
import {
  getRoadmapModule,
  getRoadmapRoute,
  roadmapModules,
} from "@/components/roadmap/roadmap-config";

export function generateStaticParams() {
  return roadmapModules.flatMap((module) => [
    { module: module.id },
    ...module.routes
      .filter((route) => route.key !== "overview")
      .map((route) => ({ module: module.id, view: [route.key] })),
  ]);
}

export default async function Page({
  params,
}: {
  params: Promise<{ module: string; view?: string[] }>;
}) {
  const { module: moduleId, view } = await params;
  const moduleConfig = getRoadmapModule(moduleId);
  if (!moduleConfig || (view?.length ?? 0) > 1) notFound();

  const route = getRoadmapRoute(moduleConfig, view?.[0]);
  if (view?.[0] && route.key !== view[0]) notFound();

  return <ModulePreviewPage moduleId={moduleConfig.id} view={route.key} />;
}
