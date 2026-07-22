import { Compass, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, StatCard } from "../preview-ui";

const GRID = [
  { dir: "NW", room: "Guest bedroom", ok: true },
  { dir: "N", room: "Living room", ok: true },
  { dir: "NE", room: "Pooja room", ok: true },
  { dir: "W", room: "Bedroom 2", ok: true },
  { dir: "Center", room: "Courtyard / open", ok: true },
  { dir: "E", room: "Entrance", ok: true },
  { dir: "SW", room: "Master bedroom", ok: true },
  { dir: "S", room: "Staircase", ok: true },
  { dir: "SE", room: "Kitchen", ok: true },
];

const SUGGESTIONS = [
  { text: "Kitchen placed in South-East — compliant with the fire-element rule.", ok: true },
  { text: "Master bedroom in South-West — compliant, brings stability.", ok: true },
  { text: "Pooja room in North-East — compliant, the ideal placement.", ok: true },
  { text: "Toilet is attached to the Master bedroom on the SW wall — consider shifting the fixture layout away from the exact SW corner.", ok: false },
];

export function VastuStudioPreview() {
  usePageTitle("Vastu Studio");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Compass}
        title="Vastu Studio"
        description="Room-direction compliance for your project, checked against classical Vastu placement rules."
      />
      <PreviewBanner flag="Standalone within ConstructionOS AI — a deterministic rules engine, no AI needed. Not connected to the separate Vastu Griha product; that integration is a future decision, not part of this build." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Compliance score" value="89%" hint="8 of 9 zones compliant" />
        <StatCard icon={Compass} label="Facing direction" value="East" />
        <StatCard icon={AlertTriangle} label="Flagged zones" value="1" hint="Master bathroom placement" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Direction grid</CardTitle>
            <CardDescription>3×3 compass layout of the plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1.5">
              {GRID.map((cell) => (
                <div
                  key={cell.dir}
                  className={
                    cell.ok
                      ? "flex aspect-square flex-col items-center justify-center rounded-control bg-success/10 p-2 text-center"
                      : "flex aspect-square flex-col items-center justify-center rounded-control bg-warning/10 p-2 text-center"
                  }
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
                    {cell.dir}
                  </span>
                  <span className="mt-1 text-xs font-medium leading-tight">{cell.room}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
            <CardDescription>Rule-based, generated from room placement</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {SUGGESTIONS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-control border border-black/[0.06] px-3.5 py-2.5 text-sm dark:border-white/[0.06]">
                {s.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                )}
                <span className="text-black/70 dark:text-white/65">{s.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
