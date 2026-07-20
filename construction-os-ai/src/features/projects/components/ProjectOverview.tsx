import { Building2, Calendar, LayoutGrid, Ruler, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CONSTRUCTION_CATEGORY_LABEL, type Project } from "@/features/projects/types";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-black/50 dark:text-white/45">{label}</p>
          <p className="truncate font-display text-lg font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function ProjectOverview({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Construction type"
          value={CONSTRUCTION_CATEGORY_LABEL[project.construction_category]}
        />
        <StatCard
          icon={Ruler}
          label="Built-up area"
          value={project.built_up_area_sqft ? `${project.built_up_area_sqft.toLocaleString()} sq ft` : "Not set"}
        />
        <StatCard
          icon={LayoutGrid}
          label="Floors"
          value={`${project.floors_above_ground} above ground${project.has_basement ? ` · ${project.basement_count} basement` : ""}`}
        />
        <StatCard
          icon={Calendar}
          label="Last updated"
          value={new Date(project.updated_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
            <Sparkles className="size-6" />
          </div>
          <div>
            <p className="font-medium">Cost estimate, BOQ and AI insights are on the way</p>
            <p className="mt-1 max-w-md text-sm text-black/50 dark:text-white/45">
              The area, structural, MEP and cost engines will appear here once they land — this
              project's data is already structured to support them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
