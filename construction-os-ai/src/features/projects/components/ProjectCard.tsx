import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import {
  CONSTRUCTION_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  type Project,
} from "@/features/projects/types";
import { ProjectActionsMenu } from "@/features/projects/components/ProjectActionsMenu";

const STATUS_VARIANT: Record<Project["status"], NonNullable<VariantProps<typeof badgeVariants>["variant"]>> = {
  planning: "neutral",
  in_progress: "primary",
  on_hold: "warning",
  completed: "success",
  archived: "neutral",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
      <Link to={`/projects/${project.id}`}>
        <Card className="h-full p-5 transition-shadow hover:shadow-lifted">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold tracking-tight">
              {project.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <Badge variant={STATUS_VARIANT[project.status]}>
                {PROJECT_STATUS_LABEL[project.status]}
              </Badge>
              <ProjectActionsMenu project={project} />
            </div>
          </div>

          <p className="mt-1 text-sm text-black/50 dark:text-white/45">
            {CONSTRUCTION_CATEGORY_LABEL[project.construction_category]}
          </p>

          <div className="mt-5 flex flex-col gap-2 text-sm text-black/60 dark:text-white/55">
            {project.location_address && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0 text-black/35 dark:text-white/35" />
                <span className="truncate">{project.location_address}</span>
              </div>
            )}
            {project.built_up_area_sqft != null && (
              <div className="flex items-center gap-2">
                <Ruler className="size-3.5 shrink-0 text-black/35 dark:text-white/35" />
                <span>{project.built_up_area_sqft.toLocaleString()} sq ft built-up</span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
