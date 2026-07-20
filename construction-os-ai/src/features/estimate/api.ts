import { supabase } from "@/lib/supabase";
import type { MaterialKey } from "@/types/database";
import { DEFAULT_ASSUMPTIONS, DEFAULT_MATERIAL_RATES, type EstimateAssumptions } from "./engine";

export async function getProjectEstimate(projectId: string): Promise<EstimateAssumptions> {
  const { data, error } = await supabase
    .from("project_estimates")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return DEFAULT_ASSUMPTIONS;

  return {
    floorHeightFt: data.floor_height_ft,
    doorCount: data.door_count,
    windowCount: data.window_count,
    labourCostPct: data.labour_cost_pct,
    machineCostPct: data.machine_cost_pct,
    transportCostPct: data.transport_cost_pct,
    contingencyPct: data.contingency_pct,
    gstPct: data.gst_pct,
    contractorMarginPct: data.contractor_margin_pct,
  };
}

export async function saveProjectEstimate(projectId: string, assumptions: EstimateAssumptions) {
  const { error } = await supabase.from("project_estimates").upsert(
    {
      project_id: projectId,
      floor_height_ft: assumptions.floorHeightFt,
      door_count: assumptions.doorCount,
      window_count: assumptions.windowCount,
      labour_cost_pct: assumptions.labourCostPct,
      machine_cost_pct: assumptions.machineCostPct,
      transport_cost_pct: assumptions.transportCostPct,
      contingency_pct: assumptions.contingencyPct,
      gst_pct: assumptions.gstPct,
      contractor_margin_pct: assumptions.contractorMarginPct,
    },
    { onConflict: "project_id" },
  );
  if (error) throw error;
}

export async function listMaterialRates(
  organizationId: string,
): Promise<Record<MaterialKey, number>> {
  const { data, error } = await supabase
    .from("material_rates")
    .select("material_key, rate")
    .eq("organization_id", organizationId);

  if (error) throw error;

  const rates = { ...DEFAULT_MATERIAL_RATES };
  for (const row of data) {
    rates[row.material_key] = row.rate;
  }
  return rates;
}

export async function saveMaterialRate(organizationId: string, materialKey: MaterialKey, rate: number) {
  const { error } = await supabase.from("material_rates").upsert(
    { organization_id: organizationId, material_key: materialKey, rate },
    { onConflict: "organization_id,material_key" },
  );
  if (error) throw error;
}
