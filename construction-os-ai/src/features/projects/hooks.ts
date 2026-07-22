import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  duplicateProject,
  getProject,
  listProjectContacts,
  listProjects,
  setProjectArchived,
  updateProject,
  upsertProjectContacts,
} from "./api";
import type { Project, ProjectContactInsert, ProjectInsert, ProjectUpdate } from "./types";

const projectsKey = (organizationId?: string) => ["projects", organizationId] as const;
const projectKey = (projectId: string) => ["project", projectId] as const;
const projectContactsKey = (projectId: string) => ["project-contacts", projectId] as const;

export function useProjects(organizationId: string | undefined, includeArchived = false) {
  return useQuery({
    queryKey: [...projectsKey(organizationId), { includeArchived }],
    enabled: !!organizationId,
    queryFn: () => listProjects(organizationId!, includeArchived),
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKey(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => getProject(projectId!),
  });
}

export function useProjectContacts(projectId: string | undefined) {
  return useQuery({
    queryKey: projectContactsKey(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => listProjectContacts(projectId!),
  });
}

export function useCreateProject(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInsert) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey(organizationId) });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProjectUpdate) => updateProject(projectId, patch),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(projectKey(projectId), project);
      queryClient.invalidateQueries({ queryKey: projectsKey(project.organization_id) });
    },
  });
}

export function useSetProjectArchived(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, isArchived }: { projectId: string; isArchived: boolean }) =>
      setProjectArchived(projectId, isArchived),
    onSuccess: (project: Project) => {
      queryClient.setQueryData(projectKey(project.id), project);
      queryClient.invalidateQueries({ queryKey: projectsKey(organizationId) });
    },
  });
}

export function useDeleteProject(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey(organizationId) });
    },
  });
}

export function useDuplicateProject(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Project) => duplicateProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKey(organizationId) });
    },
  });
}

export function useSaveProjectContacts(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contacts: Omit<ProjectContactInsert, "project_id">[]) =>
      upsertProjectContacts(projectId, contacts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectContactsKey(projectId) });
    },
  });
}
