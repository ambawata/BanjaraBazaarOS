import { useState } from 'react'
import { useStore } from '../store/useStore'

function StatusBadge({ status }) {
  const map = {
    approved:   'bg-greenDim text-green border-greenMuted',
    pending:    'bg-amberDim text-amber border-amberMuted',
    rejected:   'bg-redDim text-red border-redMuted',
    dead_stock: 'bg-redDim text-red border-redMuted',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[status] || 'bg-surface2 text-ink2'}`}>{status.replace('_', ' ')}</span>
}

export default function MyProducts() {
  const products = useStore(s => s.products)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter)

  return (
    <div className="space-y-4">
      {/* NOTE: selling_price is NEVER shown to vendors */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'approved', 'pending', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f ? 'bg-brand text-white' : 'bg-surface text-ink2 border border-surface3 hover:text-ink1'
            }`}
          >
            {f} {f === 'all' ? `(${products.length})` : `(${products.filter(p => p.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Base Price</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Submitted</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface3">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-ink3 py-10">No products</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-surface2 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-ink1 font-medium">{p.name}</p>
                  {p.status === 'rejected' && p.rejectReason && (
                    <p className="text-red text-xs mt-0.5 italic">{p.rejectReason}</p>
                  )}
                </td>
                {/* SKU always in monospace */}
                <td className="px-4 py-3.5 font-mono text-ink2 text-xs whitespace-nowrap">{p.sku}</td>
                <td className="px-4 py-3.5 text-ink2">{p.category}</td>
                {/* base_price only — selling_price NEVER shown */}
                <td className="px-4 py-3.5 text-right text-ink1 font-medium">₹{p.basePrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-right text-ink2">{p.stock ?? '—'}</td>
                <td className="px-4 py-3.5 text-ink3 text-xs">{p.submittedAt}</td>
                <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
