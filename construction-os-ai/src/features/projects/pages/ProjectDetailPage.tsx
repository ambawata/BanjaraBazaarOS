import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { VariantProps } from "class-variance-authority";
import { usePageTitle } from "@/app/page-title";
import { useProject } from "@/features/projects/hooks";
import { PROJECT_STATUS_LABEL, type Project } from "@/features/projects/types";
import { ProjectActionsMenu } from "@/features/projects/components/ProjectActionsMenu";
import { ProjectOverview } from "@/features/projects/components/ProjectOverview";
import { ProjectDetailsForm } from "@/features/projects/components/ProjectDetailsForm";

const STATUS_VARIANT: Record<Project["status"], NonNullable<VariantProps<typeof badgeVariants>["variant"]>> = {
  planning: "neutral",
  in_progress: "primary",
  on_hold: "warning",
  completed: "success",
  archived: "neutral",
};

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);

  usePageTitle(project?.name ?? "Project");

  if (isLoading || !project) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/projects"
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-black/50 hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
        >
          <ArrowLeft className="size-3.5" />
          Projects
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant={STATUS_VARIANT[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
          </div>
          <ProjectActionsMenu project={project} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProjectOverview project={project} />
        </TabsContent>
        <TabsContent value="details">
          <ProjectDetailsForm project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
