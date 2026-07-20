import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/features/auth/auth-context";
import { useCreateProject } from "@/features/projects/hooks";
import { CONSTRUCTION_CATEGORY_LABEL } from "@/features/projects/types";
import type { ConstructionCategory } from "@/types/database";

const schema = z.object({
  name: z.string().min(2, "Give your project a name"),
  constructionCategory: z.custom<ConstructionCategory>(),
});

type FormValues = z.infer<typeof schema>;

export function NewProjectDialog({
  organizationId,
  children,
}: {
  organizationId: string | undefined;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProject = useCreateProject(organizationId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", constructionCategory: "residential" },
  });

  async function onSubmit(values: FormValues) {
    if (!organizationId) return;
    const project = await createProject.mutateAsync({
      organization_id: organizationId,
      created_by: user?.id ?? null,
      name: values.name,
      construction_category: values.constructionCategory,
    });
    setOpen(false);
    reset();
    navigate(`/projects/${project.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Give it a name — you can fill in every other detail afterwards.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Sharma Residence, Whitefield"
              autoFocus
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Construction type</Label>
            <Controller
              control={control}
              name="constructionCategory"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONSTRUCTION_CATEGORY_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !organizationId}>
              {isSubmitting ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
