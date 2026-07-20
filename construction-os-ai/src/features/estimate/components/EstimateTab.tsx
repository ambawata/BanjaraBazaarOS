import { Download, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganization } from "@/features/organizations/use-organization";
import { useMaterialRates, useProjectEstimate } from "@/features/estimate/hooks";
import {
  computeAreaBreakdown,
  computeCostBreakdown,
  computeStructuralBreakdown,
  DEFAULT_MATERIAL_RATES,
} from "@/features/estimate/engine";
import { AssumptionsForm } from "./AssumptionsForm";
import { LineTable } from "./LineTable";
import { CostBreakdownCard } from "./CostBreakdownCard";
import type { Project } from "@/features/projects/types";

export function EstimateTab({ project }: { project: Project }) {
  const { data: organization } = useOrganization();
  const { data: assumptions, isLoading: assumptionsLoading } = useProjectEstimate(project.id);
  const { data: rates } = useMaterialRates(organization?.id);

  if (!project.built_up_area_sqft || assumptionsLoading || !assumptions) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
            <Ruler className="size-6" />
          </div>
          <div>
            <p className="font-medium">
              {assumptionsLoading ? "Loading estimate…" : "Set a built-up area to see the estimate"}
            </p>
            {!project.built_up_area_sqft && !assumptionsLoading && (
              <p className="mt-1 max-w-md text-sm text-black/50 dark:text-white/45">
                Add the built-up area on the Details tab — the area, structural and cost engines
                all key off it.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const area = computeAreaBreakdown(
    {
      builtUpAreaSqft: project.built_up_area_sqft,
      floorsAboveGround: project.floors_above_ground,
      hasBasement: project.has_basement,
      basementCount: project.basement_count,
    },
    assumptions,
  );
  const structural = computeStructuralBreakdown(area);
  const cost = computeCostBreakdown(area, structural, assumptions, rates ?? DEFAULT_MATERIAL_RATES);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const { generateEstimatePdf } = await import("@/features/estimate/pdf");
            generateEstimatePdf(project, area, structural, cost);
          }}
        >
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>
      <AssumptionsForm projectId={project.id} assumptions={assumptions} />
      <LineTable title="Area breakdown" description="Module 5 — derived from built-up area and openings." lines={area.lines} />
      <LineTable
        title="Structural quantities"
        description="Module 6 — thumb-rule material quantities for an RCC-framed structure."
        lines={structural.lines}
      />
      <CostBreakdownCard organizationId={organization?.id} cost={cost} />
    </div>
  );
}
