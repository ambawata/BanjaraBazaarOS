const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const currencyGroupFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

// jsPDF's built-in fonts (Helvetica/Times/Courier) only cover WinAnsi glyphs
// and have no ₹ glyph, so PDF output needs a plain-ASCII currency format.
export function formatCurrencyForPdf(value: number) {
  return `Rs. ${currencyGroupFormatter.format(value)}`;
}
