import { FlaskConical } from "lucide-react";

// Shown at the top of every /preview/* page. These pages render static,
// hardcoded sample data only — no Supabase table, no AI call, no live wiring
// behind them. They exist purely so a build direction can be reviewed before
// any real implementation work starts.
export function PreviewBanner({ flag }: { flag: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-warning/20 bg-warning/[0.06] px-4 py-3.5">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="text-sm">
        <p className="font-medium text-warning">
          Preview only — static sample data, nothing here is wired up yet
        </p>
        <p className="mt-0.5 text-black/55 dark:text-white/50">{flag}</p>
      </div>
    </div>
  );
}
