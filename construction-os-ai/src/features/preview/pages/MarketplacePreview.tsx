import { Store, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Pill } from "../preview-ui";

const LISTINGS = [
  { name: "Ambuja Cement — OPC 53", type: "Material", price: 400, unit: "bag", rating: 4.6, location: "Whitefield, Bengaluru" },
  { name: "Kumar Builders & Contractors", type: "Contractor", price: undefined, unit: undefined, rating: 4.8, location: "Bengaluru East" },
  { name: "Kajaria Vitrified Tiles", type: "Material", price: 82, unit: "sq ft", rating: 4.4, location: "Sarjapur Road" },
  { name: "Ar. Priya Nair — Architecture Studio", type: "Professional", price: undefined, unit: undefined, rating: 4.9, location: "Indiranagar" },
  { name: "JSW TMT Steel — 12mm", type: "Material", price: 66, unit: "kg", rating: 4.5, location: "Peenya Industrial Area" },
  { name: "Suresh Electricals", type: "Contractor", price: undefined, unit: undefined, rating: 4.3, location: "Marathahalli" },
];

export function MarketplacePreview() {
  usePageTitle("Marketplace");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Store}
        title="Marketplace"
        description="Materials, contractors and professionals — browse and get quotes for your project."
      />
      <PreviewBanner flag="Catalog/listing UI only. Payment collection is a separate decision point — not wired up, and won't be without explicit confirmation." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LISTINGS.map((item) => (
          <Card key={item.name}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <Pill variant="neutral">{item.type}</Pill>
                <span className="flex items-center gap-1 text-xs font-medium text-black/60 dark:text-white/55">
                  <Star className="size-3.5 fill-warning text-warning" />
                  {item.rating}
                </span>
              </div>
              <p className="font-medium leading-tight">{item.name}</p>
              <p className="flex items-center gap-1 text-xs text-black/45 dark:text-white/40">
                <MapPin className="size-3.5" />
                {item.location}
              </p>
              {item.price && (
                <p className="font-display text-lg font-semibold text-primary-600 dark:text-primary-300">
                  {formatCurrency(item.price)}
                  <span className="text-sm font-normal text-black/45 dark:text-white/40"> / {item.unit}</span>
                </p>
              )}
              <Button variant="outline" size="sm" disabled className="mt-1">
                Contact (preview only)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
