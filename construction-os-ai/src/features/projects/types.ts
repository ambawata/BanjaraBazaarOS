import type {
  ConstructionCategory,
  Database,
  ProjectContactRole,
  ProjectStatus,
} from "@/types/database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type ProjectContact = Database["public"]["Tables"]["project_contacts"]["Row"];
export type ProjectContactInsert = Database["public"]["Tables"]["project_contacts"]["Insert"];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

export const CONSTRUCTION_CATEGORY_LABEL: Record<ConstructionCategory, string> = {
  residential: "Residential",
  villa: "Villa",
  apartment: "Apartment",
  commercial: "Commercial",
  factory: "Factory",
  school: "School",
  hospital: "Hospital",
  other: "Other",
};

export const PROJECT_CONTACT_ROLE_LABEL: Record<ProjectContactRole, string> = {
  owner: "Owner",
  architect: "Architect",
  engineer: "Engineer",
  contractor: "Contractor",
  other: "Other",
};
