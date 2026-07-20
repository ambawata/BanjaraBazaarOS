import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Archive, ArchiveRestore, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteProject,
  useDuplicateProject,
  useSetProjectArchived,
  useUpdateProject,
} from "@/features/projects/hooks";
import type { Project } from "@/features/projects/types";

export function ProjectActionsMenu({ project }: { project: Project }) {
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [name, setName] = React.useState(project.name);

  const updateProject = useUpdateProject(project.id);
  const setArchived = useSetProjectArchived(project.organization_id);
  const duplicateProject = useDuplicateProject(project.organization_id);
  const deleteProject = useDeleteProject(project.organization_id);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await updateProject.mutateAsync({ name: name.trim() });
    setRenameOpen(false);
  }

  return (
    <>
      <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/[0.05] hover:text-black/70 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/80"
            aria-label="Project actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-48 rounded-card border border-black/[0.06] bg-white p-1.5 shadow-lifted dark:border-white/[0.08] dark:bg-[#141419]"
          >
            <DropdownMenu.Item
              onSelect={() => setRenameOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm outline-none data-[highlighted]:bg-black/[0.04] dark:data-[highlighted]:bg-white/5"
            >
              <Pencil className="size-4" />
              Rename
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => void duplicateProject.mutateAsync(project)}
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm outline-none data-[highlighted]:bg-black/[0.04] dark:data-[highlighted]:bg-white/5"
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() =>
                void setArchived.mutateAsync({ projectId: project.id, isArchived: !project.is_archived })
              }
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm outline-none data-[highlighted]:bg-black/[0.04] dark:data-[highlighted]:bg-white/5"
            >
              {project.is_archived ? (
                <>
                  <ArchiveRestore className="size-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  Archive
                </>
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" />
            <DropdownMenu.Item
              onSelect={() => setDeleteOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger/10"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="flex flex-col gap-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{project.name}"?</DialogTitle>
            <DialogDescription>
              This permanently deletes the project and everything in it. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteProject.isPending}
              onClick={() => void deleteProject.mutateAsync(project.id)}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
