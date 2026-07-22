import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Sparkles, ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/app/page-title";
import { useAuth } from "@/features/auth/auth-context";
import { useOrganization } from "@/features/organizations/use-organization";
import { useProjects } from "@/features/projects/hooks";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { NewProjectDialog } from "@/features/projects/components/NewProjectDialog";

export function HomePage() {
  usePageTitle("Home");
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const { data: projects, isLoading } = useProjects(organization?.id);

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";
  const recentProjects = projects?.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-8 py-12 text-white shadow-lifted md:px-12"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/70">Welcome back, {firstName}</p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Plan better. Build smarter. Spend less.
          </h1>
          <p className="mt-3 max-w-lg text-white/75">
            Every project, estimate and site update in one calm, beautiful place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <NewProjectDialog organizationId={organization?.id}>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary-700 hover:bg-white/90"
              >
                <Plus className="size-4" />
                New project
              </Button>
            </NewProjectDialog>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" disabled>
              <Sparkles className="size-4" />
              Ask AI Civil Engineer
              <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Soon
              </span>
            </Button>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">Recent projects</h2>
          {!!projects?.length && (
            <Link
              to="/projects"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                <FolderKanban className="size-6" />
              </div>
              <div>
                <p className="font-medium">No projects yet</p>
                <p className="mt-1 text-sm text-black/50 dark:text-white/45">
                  Create your first project to start planning.
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
      </section>
    </div>
  );
}
