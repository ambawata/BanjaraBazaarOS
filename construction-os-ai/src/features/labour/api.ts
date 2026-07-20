import { supabase } from "@/lib/supabase";
import type {
  Labourer,
  LabourerInsert,
  LabourerUpdate,
  LabourAttendance,
  LabourAttendanceInsert,
  LabourPayment,
  LabourPaymentInsert,
} from "./types";

export async function listLabourers(projectId: string) {
  const { data, error } = await supabase
    .from("labourers")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Labourer[];
}

export async function createLabourer(input: LabourerInsert) {
  const { data, error } = await supabase.from("labourers").insert(input).select().single();
  if (error) throw error;
  return data as Labourer;
}

export async function updateLabourer(id: string, patch: LabourerUpdate) {
  const { data, error } = await supabase
    .from("labourers")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Labourer;
}

export async function listAttendance(labourerId: string) {
  const { data, error } = await supabase
    .from("labour_attendance")
    .select("*")
    .eq("labourer_id", labourerId)
    .order("work_date", { ascending: false });
  if (error) throw error;
  return data as LabourAttendance[];
}

export async function listAttendanceForLabourers(labourerIds: string[]) {
  if (labourerIds.length === 0) return [] as LabourAttendance[];
  const { data, error } = await supabase
    .from("labour_attendance")
    .select("*")
    .in("labourer_id", labourerIds);
  if (error) throw error;
  return data as LabourAttendance[];
}

export async function addAttendance(input: LabourAttendanceInsert) {
  const { data, error } = await supabase
    .from("labour_attendance")
    .upsert(input, { onConflict: "labourer_id,work_date" })
    .select()
    .single();
  if (error) throw error;
  return data as LabourAttendance;
}

export async function deleteAttendance(id: string) {
  const { error } = await supabase.from("labour_attendance").delete().eq("id", id);
  if (error) throw error;
}

export async function listPayments(labourerId: string) {
  const { data, error } = await supabase
    .from("labour_payments")
    .select("*")
    .eq("labourer_id", labourerId)
    .order("paid_on", { ascending: false });
  if (error) throw error;
  return data as LabourPayment[];
}

export async function listPaymentsForLabourers(labourerIds: string[]) {
  if (labourerIds.length === 0) return [] as LabourPayment[];
  const { data, error } = await supabase
    .from("labour_payments")
    .select("*")
    .in("labourer_id", labourerIds);
  if (error) throw error;
  return data as LabourPayment[];
}

export async function addPayment(input: LabourPaymentInsert) {
  const { data, error } = await supabase.from("labour_payments").insert(input).select().single();
  if (error) throw error;
  return data as LabourPayment;
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from("labour_payments").delete().eq("id", id);
  if (error) throw error;
}
