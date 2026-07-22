import { supabase } from "@/lib/supabase";
import type { Project, ProjectContact, ProjectContactInsert, ProjectInsert, ProjectUpdate } from "./types";

export async function listProjects(organizationId: string, includeArchived = false) {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Project[];
}

export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) throw error;
  return data as Project;
}

export async function createProject(input: ProjectInsert) {
  const { data, error } = await supabase.from("projects").insert(input).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(projectId: string, patch: ProjectUpdate) {
  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function setProjectArchived(projectId: string, isArchived: boolean) {
  return updateProject(projectId, {
    is_archived: isArchived,
    archived_at: isArchived ? new Date().toISOString() : null,
  });
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

export async function duplicateProject(project: Project) {
  const { id, created_at, updated_at, ...rest } = project;
  void id;
  void created_at;
  void updated_at;
  return createProject({ ...rest, name: `${project.name} (Copy)` });
}

export async function listProjectContacts(projectId: string) {
  const { data, error } = await supabase
    .from("project_contacts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as ProjectContact[];
}

// Upserts one row per (project_id, role) — relies on the unique constraint
// in the schema, so concurrent saves merge instead of racing a
// delete-then-insert into duplicate rows. Roles submitted with a blank name
// are treated as "cleared" and deleted instead of upserted.
export async function upsertProjectContacts(
  projectId: string,
  contacts: Omit<ProjectContactInsert, "project_id">[],
) {
  const toUpsert = contacts.filter((c) => c.name.trim() !== "");
  const toDelete = contacts.filter((c) => c.name.trim() === "").map((c) => c.role);

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("project_contacts")
      .delete()
      .eq("project_id", projectId)
      .in("role", toDelete);
    if (deleteError) throw deleteError;
  }

  if (toUpsert.length === 0) return [];

  const { data, error } = await supabase
    .from("project_contacts")
    .upsert(
      toUpsert.map((c) => ({ ...c, project_id: projectId })),
      { onConflict: "project_id,role" },
    )
    .select();
  if (error) throw error;
  return data as ProjectContact[];
}
