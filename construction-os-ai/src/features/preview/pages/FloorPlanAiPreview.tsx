import { ScanLine, UploadCloud, CheckCircle2, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Pill } from "../preview-ui";

const DETECTED_ROOMS = [
  { name: "Living room", areaSqft: 220, confidence: 94 },
  { name: "Master bedroom", areaSqft: 168, confidence: 91 },
  { name: "Bedroom 2", areaSqft: 140, confidence: 89 },
  { name: "Kitchen", areaSqft: 96, confidence: 92 },
  { name: "Bathroom 1", areaSqft: 42, confidence: 87 },
  { name: "Bathroom 2", areaSqft: 38, confidence: 85 },
  { name: "Balcony", areaSqft: 60, confidence: 78 },
];

const AUTO_FILLED_FIELDS = [
  { label: "Built-up area", value: "1,940 sq ft" },
  { label: "Doors detected", value: "11" },
  { label: "Windows detected", value: "16" },
  { label: "Wall perimeter (est.)", value: "176 ft" },
];

export function FloorPlanAiPreview() {
  usePageTitle("AI Floor Plan Analysis");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ScanLine}
        title="AI Floor Plan Analysis"
        description="Upload a floor plan photo or PDF — AI detects rooms, areas, doors and windows automatically."
      />
      <PreviewBanner flag="Needs a vision-capable LLM API (e.g. Claude with image input) to actually read the floor plan — real per-image cost, billed on usage. Not wired." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uploaded plan</CardTitle>
            <CardDescription>Skyline Residency — ground floor.jpg</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-control border-2 border-dashed border-black/10 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.03)_75%),linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.03)_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] dark:border-white/10">
              <UploadCloud className="size-8 text-black/25 dark:text-white/25" />
              <p className="text-xs font-medium text-black/40 dark:text-white/35">
                Sample floor plan (placeholder)
              </p>
              <div className="absolute inset-6 rounded-md border border-primary-400/60" />
              <div className="absolute left-9 top-10 h-16 w-20 rounded-sm border border-primary-500/70 bg-primary-500/10" />
              <div className="absolute right-9 top-10 h-16 w-24 rounded-sm border border-primary-500/70 bg-primary-500/10" />
              <div className="absolute bottom-10 left-9 h-20 w-40 rounded-sm border border-primary-500/70 bg-primary-500/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Detected rooms</CardTitle>
            <CardDescription>Sample output — what an AI analysis pass would return.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {DETECTED_ROOMS.map((room) => (
              <div
                key={room.name}
                className="flex items-center justify-between rounded-control border border-black/[0.06] px-3.5 py-2.5 dark:border-white/[0.06]"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="text-sm font-medium">{room.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-black/60 dark:text-white/55">
                    {room.areaSqft} sq ft
                  </span>
                  <Pill variant={room.confidence >= 90 ? "success" : "warning"}>
                    {room.confidence}% confident
                  </Pill>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto-fill project details</CardTitle>
          <CardDescription>
            Once confirmed, these would populate the project's Details tab automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {AUTO_FILLED_FIELDS.map((f) => (
              <div key={f.label} className="rounded-control bg-black/[0.02] px-3.5 py-3 dark:bg-white/[0.03]">
                <p className="text-xs text-black/45 dark:text-white/40">{f.label}</p>
                <p className="mt-0.5 font-display text-base font-semibold">{f.value}</p>
              </div>
            ))}
          </div>
          <Button disabled className="w-fit">
            <Wand2 className="size-4" />
            Apply to project (preview only)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
