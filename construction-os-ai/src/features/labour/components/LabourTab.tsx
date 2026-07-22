import * as React from "react";
import { Plus, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { useLabourLedger } from "@/features/labour/hooks";
import { NewLabourerDialog } from "./NewLabourerDialog";
import { LabourerDetailDialog } from "./LabourerDetailDialog";
import type { LabourerSummary } from "@/features/labour/types";

export function LabourTab({ projectId }: { projectId: string }) {
  const { data: ledger, isLoading } = useLabourLedger(projectId);
  const [selected, setSelected] = React.useState<LabourerSummary | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const totals = (ledger ?? []).reduce(
    (acc, s) => ({
      due: acc.due + s.wagesDue,
      paid: acc.paid + s.totalPaid,
      balance: acc.balance + s.balance,
    }),
    { due: 0, paid: 0, balance: 0 },
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-black/45 dark:text-white/40">Wages due</p>
            <p className="font-display text-lg font-semibold">{formatCurrency(totals.due)}</p>
          </div>
          <div>
            <p className="text-xs text-black/45 dark:text-white/40">Paid</p>
            <p className="font-display text-lg font-semibold">{formatCurrency(totals.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-black/45 dark:text-white/40">Balance</p>
            <p className="font-display text-lg font-semibold text-warning">{formatCurrency(totals.balance)}</p>
          </div>
        </div>
        <NewLabourerDialog projectId={projectId}>
          <Button size="sm">
            <Plus className="size-4" />
            Add worker
          </Button>
        </NewLabourerDialog>
      </div>

      {!ledger || ledger.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
              <Users2 className="size-6" />
            </div>
            <div>
              <p className="font-medium">No workers yet</p>
              <p className="mt-1 text-sm text-black/50 dark:text-white/45">
                Add your site team to start tracking attendance and payments.
              </p>
            </div>
            <NewLabourerDialog projectId={projectId}>
              <Button className="mt-2">
                <Plus className="size-4" />
                Add worker
              </Button>
            </NewLabourerDialog>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs uppercase tracking-wide text-black/40 dark:border-white/[0.06] dark:text-white/35">
                  <th className="px-5 py-3 font-medium">Worker</th>
                  <th className="px-5 py-3 font-medium">Rate/day</th>
                  <th className="px-5 py-3 font-medium">Days</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {ledger.map((s) => (
                  <tr
                    key={s.labourer.id}
                    onClick={() => setSelected(s)}
                    className="cursor-pointer transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.labourer.name}</span>
                        {s.labourer.trade && <Badge variant="neutral">{s.labourer.trade}</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-black/60 dark:text-white/55">
                      {formatCurrency(s.labourer.daily_rate)}
                    </td>
                    <td className="px-5 py-3 text-black/60 dark:text-white/55">{s.daysWorked}</td>
                    <td className="px-5 py-3 text-black/60 dark:text-white/55">{formatCurrency(s.wagesDue)}</td>
                    <td className="px-5 py-3 text-black/60 dark:text-white/55">{formatCurrency(s.totalPaid)}</td>
                    <td
                      className={`px-5 py-3 text-right font-medium ${s.balance > 0 ? "text-warning" : "text-success"}`}
                    >
                      {formatCurrency(s.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <LabourerDetailDialog
          projectId={projectId}
          labourer={selected.labourer}
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </div>
  );
}
