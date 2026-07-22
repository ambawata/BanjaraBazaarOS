import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import {
  useAddAttendance,
  useAddPayment,
  useAttendance,
  useDeleteAttendance,
  useDeletePayment,
  usePayments,
} from "@/features/labour/hooks";
import { SHIFT_DAY_VALUE, SHIFT_LABEL, summarizeLabourer, type Labourer } from "@/features/labour/types";
import type { LabourShift } from "@/types/database";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function LabourerDetailDialog({
  projectId,
  labourer,
  open,
  onOpenChange,
}: {
  projectId: string;
  labourer: Labourer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: attendance = [] } = useAttendance(labourer.id);
  const { data: payments = [] } = usePayments(labourer.id);
  const addAttendance = useAddAttendance(projectId, labourer.id);
  const deleteAttendance = useDeleteAttendance(projectId, labourer.id);
  const addPayment = useAddPayment(projectId, labourer.id);
  const deletePayment = useDeletePayment(projectId, labourer.id);

  const [date, setDate] = React.useState(todayIso());
  const [shift, setShift] = React.useState<LabourShift>("full_day");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(todayIso());

  const summary = summarizeLabourer(labourer, attendance, payments);

  async function markAttendance() {
    await addAttendance.mutateAsync({ work_date: date, shift });
  }

  async function recordPayment() {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await addPayment.mutateAsync({ amount, paid_on: paymentDate });
    setPaymentAmount("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{labourer.name}</DialogTitle>
          <DialogDescription>
            {labourer.trade || "Worker"} · {formatCurrency(labourer.daily_rate)}/day
          </DialogDescription>
        </DialogHeader>

        <div className="mb-5 grid grid-cols-4 gap-3 rounded-control bg-black/[0.03] p-3 text-center dark:bg-white/[0.04]">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/40 dark:text-white/35">Days</p>
            <p className="font-display text-sm font-semibold">{summary.daysWorked}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/40 dark:text-white/35">Due</p>
            <p className="font-display text-sm font-semibold">{formatCurrency(summary.wagesDue)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/40 dark:text-white/35">Paid</p>
            <p className="font-display text-sm font-semibold">{formatCurrency(summary.totalPaid)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-black/40 dark:text-white/35">Balance</p>
            <p
              className={`font-display text-sm font-semibold ${summary.balance > 0 ? "text-warning" : "text-success"}`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-semibold">Attendance</p>
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-36" />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Shift</Label>
                <Select value={shift} onValueChange={(v) => setShift(v as LabourShift)}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SHIFT_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={markAttendance} disabled={addAttendance.isPending}>
                Mark
              </Button>
            </div>
            {attendance.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/35">No attendance recorded yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{a.work_date}</span>
                    <span className="text-black/55 dark:text-white/50">
                      {SHIFT_LABEL[a.shift]} · {SHIFT_DAY_VALUE[a.shift]} day
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteAttendance.mutate(a.id)}
                      className="text-black/30 hover:text-danger"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Payments</p>
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-9 w-36"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="h-9 w-28"
                />
              </div>
              <Button size="sm" onClick={recordPayment} disabled={addPayment.isPending}>
                Record
              </Button>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/35">No payments recorded yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{p.paid_on}</span>
                    <span className="text-black/55 dark:text-white/50">{formatCurrency(p.amount)}</span>
                    <button
                      type="button"
                      onClick={() => deletePayment.mutate(p.id)}
                      className="text-black/30 hover:text-danger"
                      aria-label="Delete payment"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
