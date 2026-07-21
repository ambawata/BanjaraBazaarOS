import { Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Pill } from "../preview-ui";

const ROOMS = [
  {
    room: "Living room",
    style: "Modern minimal",
    palette: ["#EDE7DD", "#B7A99A", "#3A3A3A", "#C9A66B"],
    budget: "₹4.2L – 5.8L",
  },
  {
    room: "Master bedroom",
    style: "Warm contemporary",
    palette: ["#F3EDE4", "#8C7A6B", "#2E2622", "#A6763B"],
    budget: "₹2.6L – 3.5L",
  },
  {
    room: "Kitchen",
    style: "Scandinavian",
    palette: ["#FFFFFF", "#DCE3E0", "#3F4A44", "#B8C4BE"],
    budget: "₹5.5L – 7.2L",
  },
];

export function InteriorDesignerPreview() {
  usePageTitle("Interior Designer");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Palette}
        title="Interior Designer"
        description="Mood boards, material palettes and budget ranges per room."
      />
      <PreviewBanner flag="The mood-board UI and manual palette picker need no AI. AI-generated style suggestions are a separate, later decision point (same LLM-cost flag as the AI Civil Engineer chatbot)." />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {ROOMS.map((r) => (
          <Card key={r.room}>
            <CardHeader>
              <CardTitle>{r.room}</CardTitle>
              <CardDescription>Suggested style</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Pill variant="primary">{r.style}</Pill>
              <div className="flex overflow-hidden rounded-control">
                {r.palette.map((color) => (
                  <div key={color} className="h-14 flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/50 dark:text-white/45">Est. budget</span>
                <span className="font-medium tabular-nums">{r.budget}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
