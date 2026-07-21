import { Sparkles, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader } from "../preview-ui";

const CONVERSATION = [
  { role: "user" as const, text: "What beam size do I need for a 14 ft span in a residential first floor?" },
  {
    role: "assistant" as const,
    text: "For a 14 ft (4.3 m) clear span carrying a typical residential slab load, a 230 mm × 450 mm RCC beam with 4 bars of 16 mm at the bottom and 2 bars of 12 mm at the top (M20 concrete, Fe500 steel) is a common thumb-rule size. This isn't a substitute for a structural engineer's design check on your actual loads — want me to also estimate the steel and concrete quantity for it?",
  },
  { role: "user" as const, text: "Yes, and how many cement bags for that beam?" },
  {
    role: "assistant" as const,
    text: "For a 14 ft beam at 230×450 mm: concrete volume ≈ 0.147 m³ → about 3.5 bags of cement at a 1:1.5:3 mix. I'll add this as a line item to your Estimate tab once you confirm.",
  },
];

const SUGGESTED_PROMPTS = [
  "How thick should my slab be for a 12x14 room?",
  "Is my staircase riser/tread ratio correct?",
  "What's a safe foundation depth for black cotton soil?",
];

export function AiCivilEngineerPreview() {
  usePageTitle("AI Civil Engineer");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Sparkles}
        title="AI Civil Engineer"
        description="Ask structural, material and code questions about your project — answered in context of your actual numbers."
      />
      <PreviewBanner flag="Needs a paid LLM API (proposed: Claude Sonnet). Rough cost model: ~$3/$15 per million input/output tokens — a typical exchange like this is a fraction of a cent to a few cents. Flagged for provider + billing confirmation before any real call is wired." />

      <Card className="flex h-[520px] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {CONVERSATION.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  msg.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-2.5 text-sm text-white"
                    : "max-w-[80%] rounded-2xl rounded-tl-sm bg-black/[0.04] px-4 py-2.5 text-sm dark:bg-white/[0.06]"
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <CardContent className="border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <span
                key={p}
                className="cursor-not-allowed rounded-full border border-black/[0.08] px-3 py-1.5 text-xs text-black/50 dark:border-white/[0.08] dark:text-white/45"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input disabled placeholder="Ask about your project… (preview only)" className="flex-1" />
            <Button disabled size="icon">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
