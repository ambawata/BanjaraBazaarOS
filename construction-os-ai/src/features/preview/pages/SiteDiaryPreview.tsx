import { ClipboardList, Cloud, CloudRain, Sun, Users2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Pill } from "../preview-ui";

const ENTRIES = [
  {
    date: "20 Jul 2026",
    weather: "sunny" as const,
    workers: 14,
    note: "First floor slab shuttering completed. Steel binding for beams started.",
    milestone: "Slab work",
    photos: 4,
  },
  {
    date: "19 Jul 2026",
    weather: "cloudy" as const,
    workers: 12,
    note: "Column casting on ground floor finished, curing started. Electrical conduit laid for ground floor walls.",
    milestone: "Column casting",
    photos: 3,
  },
  {
    date: "17 Jul 2026",
    weather: "rain" as const,
    workers: 6,
    note: "Rain delayed masonry work. Only indoor plumbing rough-in continued.",
    milestone: undefined,
    photos: 1,
  },
];

const WEATHER_ICON = { sunny: Sun, cloudy: Cloud, rain: CloudRain };

export function SiteDiaryPreview() {
  usePageTitle("Site Diary");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ClipboardList}
        title="Site Diary"
        description="Daily progress log — weather, headcount, notes and site photos, in one timeline."
      />
      <PreviewBanner flag="No AI needed. Needs Supabase Storage wiring for real photo uploads — straightforward, no new decision to flag." />

      <Card>
        <CardHeader>
          <CardTitle>Skyline Residency — timeline</CardTitle>
          <CardDescription>Sample daily log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {ENTRIES.map((entry, i) => {
              const WeatherIcon = WEATHER_ICON[entry.weather];
              return (
                <div key={entry.date} className="relative flex gap-4 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                      <WeatherIcon className="size-4" />
                    </div>
                    {i < ENTRIES.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{entry.date}</p>
                      {entry.milestone && <Pill variant="primary">{entry.milestone}</Pill>}
                      <span className="flex items-center gap-1 text-xs text-black/45 dark:text-white/40">
                        <Users2 className="size-3.5" />
                        {entry.workers} workers
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-black/65 dark:text-white/60">{entry.note}</p>
                    <div className="mt-2.5 flex gap-2">
                      {Array.from({ length: entry.photos }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex size-14 items-center justify-center rounded-control bg-black/[0.04] text-black/25 dark:bg-white/[0.05] dark:text-white/25"
                        >
                          <ImageIcon className="size-5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
