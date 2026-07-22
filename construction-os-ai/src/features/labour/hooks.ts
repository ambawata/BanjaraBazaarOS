import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAttendance,
  addPayment,
  createLabourer,
  deleteAttendance,
  deletePayment,
  listAttendance,
  listAttendanceForLabourers,
  listLabourers,
  listPayments,
  listPaymentsForLabourers,
  updateLabourer,
} from "./api";
import { summarizeLabourer, type LabourAttendanceInsert, type LabourerInsert, type LabourerUpdate, type LabourPaymentInsert } from "./types";

const labourersKey = (projectId: string) => ["labourers", projectId] as const;
const attendanceKey = (labourerId: string) => ["labour-attendance", labourerId] as const;
const paymentsKey = (labourerId: string) => ["labour-payments", labourerId] as const;
const ledgerKey = (projectId: string) => ["labour-ledger", projectId] as const;

export function useLabourers(projectId: string) {
  return useQuery({
    queryKey: labourersKey(projectId),
    queryFn: () => listLabourers(projectId),
  });
}

// One row per worker with days worked / wages due / paid / balance, computed
// from a bulk fetch (two IN() queries) rather than one round trip per worker.
export function useLabourLedger(projectId: string) {
  return useQuery({
    queryKey: ledgerKey(projectId),
    queryFn: async () => {
      const labourers = await listLabourers(projectId);
      const ids = labourers.map((l) => l.id);
      const [attendance, payments] = await Promise.all([
        listAttendanceForLabourers(ids),
        listPaymentsForLabourers(ids),
      ]);
      return labourers.map((labourer) =>
        summarizeLabourer(
          labourer,
          attendance.filter((a) => a.labourer_id === labourer.id),
          payments.filter((p) => p.labourer_id === labourer.id),
        ),
      );
    },
  });
}

export function useCreateLabourer(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LabourerInsert) => createLabourer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labourersKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}

export function useUpdateLabourer(projectId: string, labourerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: LabourerUpdate) => updateLabourer(labourerId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labourersKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}

export function useAttendance(labourerId: string) {
  return useQuery({
    queryKey: attendanceKey(labourerId),
    queryFn: () => listAttendance(labourerId),
  });
}

export function useAddAttendance(projectId: string, labourerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<LabourAttendanceInsert, "labourer_id">) =>
      addAttendance({ ...input, labourer_id: labourerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKey(labourerId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}

export function useDeleteAttendance(projectId: string, labourerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKey(labourerId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}

export function usePayments(labourerId: string) {
  return useQuery({
    queryKey: paymentsKey(labourerId),
    queryFn: () => listPayments(labourerId),
  });
}

export function useAddPayment(projectId: string, labourerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<LabourPaymentInsert, "labourer_id">) =>
      addPayment({ ...input, labourer_id: labourerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(labourerId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}

export function useDeletePayment(projectId: string, labourerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKey(labourerId) });
      queryClient.invalidateQueries({ queryKey: ledgerKey(projectId) });
    },
  });
}
