import * as React from "react";
import { useForm } from "react-hook-form";
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
import { useCreateLabourer } from "@/features/labour/hooks";

const schema = z.object({
  name: z.string().min(2, "Enter a name"),
  trade: z.string(),
  phone: z.string(),
  dailyRate: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function NewLabourerDialog({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const createLabourer = useCreateLabourer(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const rate = Number(values.dailyRate);
    await createLabourer.mutateAsync({
      project_id: projectId,
      name: values.name,
      trade: values.trade || null,
      phone: values.phone || null,
      daily_rate: Number.isFinite(rate) && rate > 0 ? rate : 0,
    });
    setOpen(false);
    reset();
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
          <DialogTitle>Add worker</DialogTitle>
          <DialogDescription>They'll appear in the labour ledger for this project.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="labourer-name">Name</Label>
            <Input id="labourer-name" placeholder="e.g. Ramesh Kumar" autoFocus {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="labourer-trade">Trade</Label>
              <Input id="labourer-trade" placeholder="Mason, helper…" {...register("trade")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="labourer-rate">Daily rate</Label>
              <Input id="labourer-rate" type="number" min={0} step="1" {...register("dailyRate")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="labourer-phone">Phone</Label>
            <Input id="labourer-phone" {...register("phone")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
