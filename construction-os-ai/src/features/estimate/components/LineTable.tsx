import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { Line } from "@/features/estimate/engine";

export function LineTable({
  title,
  description,
  lines,
}: {
  title: string;
  description: string;
  lines: Line[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center justify-between gap-4 px-6 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">{line.label}</p>
                <p className="truncate text-xs text-black/45 dark:text-white/40">{line.formula}</p>
              </div>
              <p className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
                {formatNumber(line.value)} <span className="font-normal text-black/45 dark:text-white/40">{line.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
