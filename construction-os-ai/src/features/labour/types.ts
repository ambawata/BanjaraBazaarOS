import type { Database, LabourShift } from "@/types/database";

export type Labourer = Database["public"]["Tables"]["labourers"]["Row"];
export type LabourerInsert = Database["public"]["Tables"]["labourers"]["Insert"];
export type LabourerUpdate = Database["public"]["Tables"]["labourers"]["Update"];

export type LabourAttendance = Database["public"]["Tables"]["labour_attendance"]["Row"];
export type LabourAttendanceInsert = Database["public"]["Tables"]["labour_attendance"]["Insert"];

export type LabourPayment = Database["public"]["Tables"]["labour_payments"]["Row"];
export type LabourPaymentInsert = Database["public"]["Tables"]["labour_payments"]["Insert"];

export const SHIFT_LABEL: Record<LabourShift, string> = {
  half_day: "Half day",
  full_day: "Full day",
  overtime: "Overtime",
};

export const SHIFT_DAY_VALUE: Record<LabourShift, number> = {
  half_day: 0.5,
  full_day: 1,
  overtime: 1,
};

export interface LabourerSummary {
  labourer: Labourer;
  daysWorked: number;
  wagesDue: number;
  totalPaid: number;
  balance: number;
}

export function summarizeLabourer(
  labourer: Labourer,
  attendance: LabourAttendance[],
  payments: LabourPayment[],
): LabourerSummary {
  const daysWorked = attendance.reduce((sum, a) => sum + SHIFT_DAY_VALUE[a.shift], 0);
  const wagesDue = daysWorked * labourer.daily_rate;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  return { labourer, daysWorked, wagesDue, totalPaid, balance: wagesDue - totalPaid };
}
