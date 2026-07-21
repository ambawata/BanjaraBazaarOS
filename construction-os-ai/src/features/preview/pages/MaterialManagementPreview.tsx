import { Boxes, AlertTriangle, PackageCheck, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { usePageTitle } from "@/app/page-title";
import { PreviewBanner } from "../PreviewBanner";
import { PageHeader, Pill, StatCard } from "../preview-ui";

const INVENTORY = [
  { material: "Cement (OPC 53)", stock: 420, unit: "bags", reorder: 150, rate: 400, status: "ok" as const, supplier: "Ambuja Dealer, Whitefield" },
  { material: "TMT Steel (12mm)", stock: 1800, unit: "kg", reorder: 2000, rate: 66, status: "low" as const, supplier: "JSW Steel Distributor" },
  { material: "River sand", stock: 320, unit: "cft", reorder: 200, rate: 46, status: "ok" as const, supplier: "Local quarry" },
  { material: "Red bricks", stock: 4200, unit: "nos", reorder: 5000, rate: 8, status: "low" as const, supplier: "Karnataka Brick Works" },
  { material: "Vitrified tiles (2x2)", stock: 0, unit: "sq ft", reorder: 500, rate: 82, status: "out" as const, supplier: "Kajaria Showroom" },
];

const PURCHASE_LOG = [
  { date: "18 Jul 2026", material: "Cement (OPC 53)", qty: "100 bags", amount: 40000 },
  { date: "15 Jul 2026", material: "River sand", qty: "150 cft", amount: 6900 },
  { date: "10 Jul 2026", material: "TMT Steel (12mm)", qty: "500 kg", amount: 33000 },
];

const STATUS_LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock" } as const;
const STATUS_VARIANT = { ok: "success", low: "warning", out: "danger" } as const;

export function MaterialManagementPreview() {
  usePageTitle("Material Management");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Boxes}
        title="Material Management"
        description="Stock levels, reorder points and a running purchase log per project."
      />
      <PreviewBanner flag="No AI needed. Decision to make before building: manual stock entry only, or a vendor/barcode integration for automatic updates?" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={PackageCheck} label="Inventory value" value={formatCurrency(612400)} />
        <StatCard icon={AlertTriangle} label="Low / out of stock" value="3 materials" hint="Bricks, tiles, steel" />
        <StatCard icon={ClipboardList} label="Pending purchase orders" value="2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock on site</CardTitle>
          <CardDescription>Skyline Residency — sample inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-control border border-black/[0.06] dark:border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs uppercase tracking-wide text-black/40 dark:border-white/[0.06] dark:text-white/35">
                  <th className="px-4 py-2.5 font-medium">Material</th>
                  <th className="px-4 py-2.5 font-medium">In stock</th>
                  <th className="px-4 py-2.5 font-medium">Reorder level</th>
                  <th className="px-4 py-2.5 font-medium">Rate</th>
                  <th className="px-4 py-2.5 font-medium">Supplier</th>
                  <th className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {INVENTORY.map((item) => (
                  <tr key={item.material}>
                    <td className="px-4 py-2.5 font-medium">{item.material}</td>
                    <td className="px-4 py-2.5 tabular-nums text-black/70 dark:text-white/65">
                      {item.stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-black/50 dark:text-white/45">
                      {item.reorder.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-2.5 text-xs text-black/50 dark:text-white/45">{item.supplier}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Pill variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent purchases</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {PURCHASE_LOG.map((p) => (
            <div key={p.date + p.material} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium">{p.material}</p>
                <p className="text-xs text-black/45 dark:text-white/40">{p.date} · {p.qty}</p>
              </div>
              <p className="text-sm font-medium tabular-nums">{formatCurrency(p.amount)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
