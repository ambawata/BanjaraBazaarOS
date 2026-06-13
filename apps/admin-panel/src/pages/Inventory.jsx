import { useStore } from '../store/useStore'

function MarginBadge({ margin }) {
  if (margin < 15) return <span className="text-red font-semibold text-xs">{margin.toFixed(1)}% ⚠</span>
  return <span className="text-green font-semibold text-xs">{margin.toFixed(1)}%</span>
}

export default function Inventory() {
  const products = useStore(s => s.products)

  return (
    <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Product</th>
            <th className="text-left px-4 py-3 font-medium">SKU</th>
            <th className="text-left px-4 py-3 font-medium">Vendor</th>
            <th className="text-left px-4 py-3 font-medium">Category</th>
            <th className="text-right px-4 py-3 font-medium">Cost Price</th>
            <th className="text-right px-4 py-3 font-medium">Margin</th>
            <th className="text-right px-4 py-3 font-medium">Stock</th>
            <th className="text-right px-4 py-3 font-medium">Sold</th>
            <th className="text-left px-4 py-3 font-medium">Last Sold</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface3">
          {products.map(p => (
            <tr key={p.id} className="hover:bg-surface2 transition-colors">
              <td className="px-5 py-3.5 text-ink1 font-medium">{p.name}</td>
              <td className="px-4 py-3.5 font-mono text-ink2 text-xs">{p.sku}</td>
              <td className="px-4 py-3.5 text-ink2">{p.vendorName}</td>
              <td className="px-4 py-3.5 text-ink2">{p.category}</td>
              <td className="px-4 py-3.5 text-right text-ink1">₹{p.costPrice.toLocaleString('en-IN')}</td>
              <td className="px-4 py-3.5 text-right"><MarginBadge margin={p.margin} /></td>
              <td className="px-4 py-3.5 text-right text-ink1">{p.stock}</td>
              <td className="px-4 py-3.5 text-right text-ink2">{p.sold}</td>
              <td className="px-4 py-3.5 text-ink2 text-xs">{p.lastSoldAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
