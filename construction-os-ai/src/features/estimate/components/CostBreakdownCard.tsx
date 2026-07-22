import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useSaveMaterialRate } from "@/features/estimate/hooks";
import type { CostBreakdown } from "@/features/estimate/engine";
import type { MaterialKey } from "@/types/database";

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "muted" | "strong";
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span
        className={
          emphasis === "strong"
            ? "font-display text-base font-semibold"
            : emphasis === "muted"
              ? "text-sm text-black/50 dark:text-white/45"
              : "text-sm"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis === "strong"
            ? "font-display text-lg font-semibold tabular-nums text-primary-600 dark:text-primary-300"
            : "text-sm font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function CostBreakdownCard({
  organizationId,
  cost,
}: {
  organizationId: string | undefined;
  cost: CostBreakdown;
}) {
  const saveRate = useSaveMaterialRate(organizationId);
  const [editingKey, setEditingKey] = React.useState<MaterialKey | null>(null);
  const [draftRate, setDraftRate] = React.useState("");

  function commitRate(key: MaterialKey) {
    const rate = Number(draftRate);
    if (Number.isFinite(rate) && rate >= 0) {
      saveRate.mutate({ materialKey: key, rate });
    }
    setEditingKey(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost estimate</CardTitle>
        <CardDescription>Material quantities from the engines above × your rates. Click a rate to edit it.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="overflow-x-auto rounded-control border border-black/[0.06] dark:border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs uppercase tracking-wide text-black/40 dark:border-white/[0.06] dark:text-white/35">
                <th className="px-4 py-2.5 font-medium">Material</th>
                <th className="px-4 py-2.5 font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Rate</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {cost.materials.map((m) => (
                <tr key={m.key}>
                  <td className="px-4 py-2.5 font-medium">{m.label}</td>
                  <td className="px-4 py-2.5 text-black/60 dark:text-white/55">
                    {formatNumber(m.quantity)} {m.unit}
                  </td>
                  <td className="px-4 py-2.5">
                    {editingKey === m.key ? (
                      <Input
                        autoFocus
                        type="number"
                        min={0}
                        value={draftRate}
                        onChange={(e) => setDraftRate(e.target.value)}
                        onBlur={() => commitRate(m.key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRate(m.key);
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                        className="h-8 w-24"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKey(m.key);
                          setDraftRate(m.rate.toString());
                        }}
                        className="rounded-md px-2 py-1 text-black/70 underline decoration-dotted underline-offset-4 hover:bg-black/[0.04] dark:text-white/65 dark:hover:bg-white/5"
                      >
                        {formatCurrency(m.rate)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">{formatCurrency(m.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          <SummaryRow label="Material cost" value={formatCurrency(cost.materialCost)} emphasis="muted" />
          <SummaryRow label="Labour" value={formatCurrency(cost.labourCost)} emphasis="muted" />
          <SummaryRow label="Machinery" value={formatCurrency(cost.machineCost)} emphasis="muted" />
          <SummaryRow label="Transport" value={formatCurrency(cost.transportCost)} emphasis="muted" />
          <SummaryRow label="Subtotal" value={formatCurrency(cost.subtotal)} />
          <SummaryRow label="Contingency" value={formatCurrency(cost.contingencyAmount)} emphasis="muted" />
          <SummaryRow label="GST" value={formatCurrency(cost.gstAmount)} emphasis="muted" />
          <SummaryRow label="Contractor margin" value={formatCurrency(cost.marginAmount)} emphasis="muted" />
          <SummaryRow label="Grand total" value={formatCurrency(cost.grandTotal)} emphasis="strong" />
          <SummaryRow label="Cost per sq ft" value={formatCurrency(cost.costPerSqft)} emphasis="strong" />
        </div>
      </CardContent>
    </Card>
  );
}
