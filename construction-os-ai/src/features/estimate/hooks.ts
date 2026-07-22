import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectEstimate, listMaterialRates, saveMaterialRate, saveProjectEstimate } from "./api";
import type { EstimateAssumptions } from "./engine";
import type { MaterialKey } from "@/types/database";

const estimateKey = (projectId: string) => ["project-estimate", projectId] as const;
const materialRatesKey = (organizationId?: string) => ["material-rates", organizationId] as const;

export function useProjectEstimate(projectId: string | undefined) {
  return useQuery({
    queryKey: estimateKey(projectId ?? ""),
    enabled: !!projectId,
    queryFn: () => getProjectEstimate(projectId!),
  });
}

export function useSaveProjectEstimate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assumptions: EstimateAssumptions) => saveProjectEstimate(projectId, assumptions),
    onSuccess: (_data, assumptions) => {
      queryClient.setQueryData(estimateKey(projectId), assumptions);
    },
  });
}

export function useMaterialRates(organizationId: string | undefined) {
  return useQuery({
    queryKey: materialRatesKey(organizationId),
    enabled: !!organizationId,
    queryFn: () => listMaterialRates(organizationId!),
  });
}

export function useSaveMaterialRate(organizationId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ materialKey, rate }: { materialKey: MaterialKey; rate: number }) =>
      saveMaterialRate(organizationId!, materialKey, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialRatesKey(organizationId) });
    },
  });
}
