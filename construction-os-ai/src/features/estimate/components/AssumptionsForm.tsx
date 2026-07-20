import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSaveProjectEstimate } from "@/features/estimate/hooks";
import type { EstimateAssumptions } from "@/features/estimate/engine";

const schema = z.object({
  floorHeightFt: z.string(),
  doorCount: z.string(),
  windowCount: z.string(),
  labourCostPct: z.string(),
  machineCostPct: z.string(),
  transportCostPct: z.string(),
  contingencyPct: z.string(),
  gstPct: z.string(),
  contractorMarginPct: z.string(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(a: EstimateAssumptions): FormValues {
  return {
    floorHeightFt: a.floorHeightFt.toString(),
    doorCount: a.doorCount.toString(),
    windowCount: a.windowCount.toString(),
    labourCostPct: a.labourCostPct.toString(),
    machineCostPct: a.machineCostPct.toString(),
    transportCostPct: a.transportCostPct.toString(),
    contingencyPct: a.contingencyPct.toString(),
    gstPct: a.gstPct.toString(),
    contractorMarginPct: a.contractorMarginPct.toString(),
  };
}

function toAssumptions(v: FormValues): EstimateAssumptions {
  const num = (s: string, fallback: number) => {
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return {
    floorHeightFt: num(v.floorHeightFt, 10),
    doorCount: Math.round(num(v.doorCount, 0)),
    windowCount: Math.round(num(v.windowCount, 0)),
    labourCostPct: num(v.labourCostPct, 0),
    machineCostPct: num(v.machineCostPct, 0),
    transportCostPct: num(v.transportCostPct, 0),
    contingencyPct: num(v.contingencyPct, 0),
    gstPct: num(v.gstPct, 0),
    contractorMarginPct: num(v.contractorMarginPct, 0),
  };
}

export function AssumptionsForm({
  projectId,
  assumptions,
}: {
  projectId: string;
  assumptions: EstimateAssumptions;
}) {
  const saveEstimate = useSaveProjectEstimate(projectId);
  const [saved, setSaved] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    resetOptions: { keepDirtyValues: true },
    values: toFormValues(assumptions),
  });

  async function onSubmit(values: FormValues) {
    await saveEstimate.mutateAsync(toAssumptions(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assumptions</CardTitle>
        <CardDescription>
          Every number below drives the estimate and can be changed to match your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Floor height (ft)</Label>
              <Input type="number" min={0} step="0.5" {...register("floorHeightFt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Doors</Label>
              <Input type="number" min={0} {...register("doorCount")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Windows</Label>
              <Input type="number" min={0} {...register("windowCount")} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/35">
              Cost add-ons (% of material cost, unless noted)
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>Labour</Label>
                <Input type="number" min={0} step="0.5" {...register("labourCostPct")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Machinery</Label>
                <Input type="number" min={0} step="0.5" {...register("machineCostPct")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Transport</Label>
                <Input type="number" min={0} step="0.5" {...register("transportCostPct")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Contingency</Label>
                <Input type="number" min={0} step="0.5" {...register("contingencyPct")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>GST (on subtotal)</Label>
                <Input type="number" min={0} step="0.5" {...register("gstPct")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Contractor margin</Label>
                <Input type="number" min={0} step="0.5" {...register("contractorMarginPct")} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving…" : "Save assumptions"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" />
                Saved
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
