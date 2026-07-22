import * as React from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/app/page-title";
import { useOrganization } from "@/features/organizations/use-organization";
import { useProjects } from "@/features/projects/hooks";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";
import { cn } from "@/lib/utils";

export function ProjectsListPage() {
  usePageTitle("Projects");
  const { data: organization } = useOrganization();
  const [showArchived, setShowArchived] = React.useState(false);
  const { data: projects, isLoading } = useProjects(organization?.id, showArchived);

  const visibleProjects = showArchived
    ? projects
    : projects?.filter((p) => !p.is_archived);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-control bg-black/[0.04] p-1 dark:bg-white/[0.05]">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={cn(
              "rounded-[0.65rem] px-3.5 py-1.5 text-sm font-medium transition-colors",
              !showArchived
                ? "bg-white text-black/90 shadow-soft dark:bg-white/10 dark:text-white/95"
                : "text-black/50 dark:text-white/45",
            )}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={cn(
              "rounded-[0.65rem] px-3.5 py-1.5 text-sm font-medium transition-colors",
              showArchived
                ? "bg-white text-black/90 shadow-soft dark:bg-white/10 dark:text-white/95"
                : "text-black/50 dark:text-white/45",
            )}
          >
            All (incl. archived)
          </button>
        </div>

        <NewProjectDialog organizationId={organization?.id}>
          <Button>
            <Plus className="size-4" />
            New project
          </Button>
        </NewProjectDialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : visibleProjects && visibleProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
              <FolderKanban className="size-6" />
            </div>
            <div>
              <p className="font-medium">
                {showArchived ? "No projects yet" : "No active projects"}
              </p>
              <p className="mt-1 text-sm text-black/50 dark:text-white/45">
                Create a project to start planning your build.
              </p>
            </div>
            <NewProjectDialog organizationId={organization?.id}>
              <Button className="mt-2">
                <Plus className="size-4" />
                Create project
              </Button>
            </NewProjectDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
