import { jsPDF } from "jspdf";
import { __createTable, __drawTable, type UserOptions } from "jspdf-autotable";
import { formatCurrencyForPdf, formatNumber } from "@/lib/format";
import { CONSTRUCTION_CATEGORY_LABEL, type Project } from "@/features/projects/types";
import type { AreaBreakdown, CostBreakdown, StructuralBreakdown } from "./engine";

const PRIMARY: [number, number, number] = [108, 76, 241];
const INK: [number, number, number] = [22, 22, 26];
const MUTED: [number, number, number] = [110, 110, 120];

// jspdf-autotable's functional API (autoTable()) doesn't return the table,
// only the plugin-patched doc.lastAutoTable does — and that patch has no
// type declarations. Drawing via __createTable/__drawTable directly gives a
// properly typed Table with .finalY, so the next section can lay out below it.
function drawTable(doc: jsPDF, options: UserOptions): number {
  const table = __createTable(doc, options);
  __drawTable(doc, table);
  return table.finalY ?? (typeof options.startY === "number" ? options.startY : 0);
}

export function generateEstimatePdf(
  project: Project,
  area: AreaBreakdown,
  structural: StructuralBreakdown,
  cost: CostBreakdown,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(margin, 32, 22, 22, 5, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("C", margin + 11, 47, { align: "center" });

  doc.setTextColor(...INK);
  doc.setFontSize(16);
  doc.text("ConstructionOS AI", margin + 32, 43);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Plan better. Build smarter. Spend less.", margin + 32, 55);

  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`,
    pageWidth - margin,
    43,
    { align: "right" },
  );

  doc.setDrawColor(230, 230, 235);
  doc.line(margin, 72, pageWidth - margin, 72);

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${project.name} — Cost Estimate`, margin, 100);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const infoLines = [
    `Construction type: ${CONSTRUCTION_CATEGORY_LABEL[project.construction_category]}`,
    project.location_address ? `Location: ${project.location_address}` : null,
    `Built-up area: ${formatNumber(area.builtUpAreaSqft)} sq ft · ${area.floorsCount} floor(s)`,
    project.plot_size_sqft ? `Plot size: ${formatNumber(project.plot_size_sqft)} sq ft` : null,
  ].filter((line): line is string => Boolean(line));
  doc.text(infoLines, margin, 120);

  let cursorY = 120 + infoLines.length * 14 + 16;

  const sectionHeading = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(text, margin, y);
    return y + 10;
  };

  cursorY = sectionHeading("Area breakdown", cursorY);
  cursorY =
    drawTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Item", "Formula", "Value"]],
      body: area.lines.map((l) => [l.label, l.formula, `${formatNumber(l.value)} ${l.unit}`]),
      theme: "plain",
      styles: { fontSize: 9, textColor: INK, cellPadding: { top: 4, bottom: 4, left: 0, right: 6 } },
      headStyles: { textColor: MUTED, fontStyle: "bold" },
      columnStyles: { 2: { halign: "right" } },
    }) + 24;

  cursorY = sectionHeading("Structural quantities", cursorY);
  cursorY =
    drawTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Item", "Formula", "Value"]],
      body: structural.lines.map((l) => [l.label, l.formula, `${formatNumber(l.value)} ${l.unit}`]),
      theme: "plain",
      styles: { fontSize: 9, textColor: INK, cellPadding: { top: 4, bottom: 4, left: 0, right: 6 } },
      headStyles: { textColor: MUTED, fontStyle: "bold" },
      columnStyles: { 2: { halign: "right" } },
    }) + 24;

  if (cursorY > 620) {
    doc.addPage();
    cursorY = 50;
  }

  cursorY = sectionHeading("Cost estimate", cursorY);
  cursorY =
    drawTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Material", "Quantity", "Rate", "Cost"]],
      body: cost.materials.map((m) => [
        m.label,
        `${formatNumber(m.quantity)} ${m.unit}`,
        formatCurrencyForPdf(m.rate),
        formatCurrencyForPdf(m.cost),
      ]),
      theme: "plain",
      styles: { fontSize: 9, textColor: INK, cellPadding: { top: 4, bottom: 4, left: 0, right: 6 } },
      headStyles: { textColor: MUTED, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    }) + 16;

  const summaryRows: [string, string, boolean?][] = [
    ["Material cost", formatCurrencyForPdf(cost.materialCost)],
    ["Labour", formatCurrencyForPdf(cost.labourCost)],
    ["Machinery", formatCurrencyForPdf(cost.machineCost)],
    ["Transport", formatCurrencyForPdf(cost.transportCost)],
    ["Subtotal", formatCurrencyForPdf(cost.subtotal)],
    ["Contingency", formatCurrencyForPdf(cost.contingencyAmount)],
    ["GST", formatCurrencyForPdf(cost.gstAmount)],
    ["Contractor margin", formatCurrencyForPdf(cost.marginAmount)],
    ["Grand total", formatCurrencyForPdf(cost.grandTotal), true],
    ["Cost per sq ft", formatCurrencyForPdf(cost.costPerSqft), true],
  ];

  if (cursorY > 700) {
    doc.addPage();
    cursorY = 50;
  }

  const summaryX = pageWidth - margin - 220;
  for (const [label, value, strong] of summaryRows) {
    doc.setFont("helvetica", strong ? "bold" : "normal");
    doc.setFontSize(strong ? 11 : 10);
    doc.setTextColor(...(strong ? PRIMARY : MUTED));
    doc.text(label, summaryX, cursorY);
    doc.setTextColor(...(strong ? PRIMARY : INK));
    doc.text(value, pageWidth - margin, cursorY, { align: "right" });
    cursorY += strong ? 20 : 16;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Estimate based on standard thumb-rule construction ratios and your material rates — not a substitute for a structural engineer's BOQ.",
    margin,
    doc.internal.pageSize.getHeight() - 30,
    { maxWidth: pageWidth - margin * 2 },
  );

  doc.save(`${project.name.replace(/[^a-z0-9]+/gi, "-")}-estimate.pdf`);
}
