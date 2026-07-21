import { TrendingUp, CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, StatCard } from "../preview-ui";

const PRICE_TREND = [
  { month: "Feb", value: 62 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 64 },
  { month: "May", value: 71 },
  { month: "Jun", value: 78 },
  { month: "Jul", value: 82 },
];

export function AiPredictionsPreview() {
  usePageTitle("AI Predictions");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={TrendingUp}
        title="AI Predictions"
        description="Forecasted completion date, cost overrun risk and material price trends for your project."
      />
      <PreviewBanner flag="Needs an LLM/forecasting API and real historical data to be meaningful — usage-based cost, flagged for provider + billing confirmation before wiring, same as the AI Civil Engineer chatbot." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarClock} label="Predicted completion" value="14 Mar 2027" hint="±3 weeks confidence band" />
        <StatCard icon={AlertTriangle} label="Cost overrun risk" value="Medium" hint="12% above current estimate" />
        <StatCard icon={TrendingUp} label="Steel price trend" value="↑ Rising" hint="Next 60 days" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steel price trend (₹/kg)</CardTitle>
          <CardDescription>Sample forecast — last 6 months + projected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-3">
            {PRICE_TREND.map((p, i) => (
              <div key={p.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={
                    i === PRICE_TREND.length - 1
                      ? "w-full rounded-t-md bg-primary-500"
                      : "w-full rounded-t-md bg-primary-200 dark:bg-primary-500/30"
                  }
                  style={{ height: `${(p.value / 82) * 100}%` }}
                />
                <span className="text-xs text-black/45 dark:text-white/40">{p.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
