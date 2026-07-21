import { Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader } from "../preview-ui";

interface Row {
  label: string;
  value: string;
  formula: string;
}

function EngineTable({ title, description, rows }: { title: string; description: string; rows: Row[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-control border border-black/[0.06] dark:border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs uppercase tracking-wide text-black/40 dark:border-white/[0.06] dark:text-white/35">
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2.5 font-medium">{r.label}</td>
                  <td className="px-4 py-2.5 tabular-nums text-black/70 dark:text-white/65">{r.value}</td>
                  <td className="px-4 py-2.5 text-xs text-black/45 dark:text-white/40">{r.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function MepFinishingPreview() {
  usePageTitle("MEP & Finishing");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Wrench}
        title="MEP & Finishing Engines"
        description="Electrical, plumbing and finishing quantities — same deterministic thumb-rule pattern as the Estimate engine."
      />
      <PreviewBanner flag="No AI needed here — this extends the existing engine.ts pattern with more thumb-rule constants. Purely a build-time decision, no cost/API flag." />

      <EngineTable
        title="Electrical"
        description="Sample output for Skyline Residency (1,940 sq ft, 2 floors)"
        rows={[
          { label: "Light points", value: "34 nos", formula: "1 per 60 sq ft" },
          { label: "Power sockets", value: "22 nos", formula: "1 per 90 sq ft" },
          { label: "MCB distribution boards", value: "2 nos", formula: "1 per floor" },
          { label: "Wiring (copper)", value: "1,120 m", formula: "0.58 m per sq ft" },
          { label: "Conduit pipe", value: "640 m", formula: "0.33 m per sq ft" },
        ]}
      />
      <EngineTable
        title="Plumbing"
        description="Fixtures and pipework"
        rows={[
          { label: "CP fittings sets", value: "4 sets", formula: "1 per bathroom/kitchen" },
          { label: "PVC pipe (drainage)", value: "180 ft", formula: "Fixture count × 45 ft" },
          { label: "CPVC pipe (supply)", value: "260 ft", formula: "Fixture count × 65 ft" },
          { label: "Overhead tank", value: "1,000 L", formula: "500 L per floor" },
        ]}
      />
      <EngineTable
        title="Finishing"
        description="Flooring, paint tier and false ceiling"
        rows={[
          { label: "Vitrified tile flooring", value: "1,455 sq ft", formula: "Carpet area (2'x2' tiles)" },
          { label: "Interior paint (premium)", value: "3,120 sq ft", formula: "Wall area × 2 faces" },
          { label: "False ceiling (gypsum)", value: "420 sq ft", formula: "Living + bedrooms" },
          { label: "Modular kitchen (linear)", value: "18 ft", formula: "Kitchen perimeter thumb-rule" },
        ]}
      />
    </div>
  );
}
