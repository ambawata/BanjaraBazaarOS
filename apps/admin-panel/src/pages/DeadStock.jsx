import { useStore } from '../store/useStore'
import { IconFlag, IconAlertTriangle } from '@tabler/icons-react'

function AgeBadge({ days }) {
  if (days >= 60) return <span className="px-2 py-0.5 rounded-full bg-redDim text-red border border-redMuted text-xs font-medium">{days}d 🔴</span>
  if (days >= 45) return <span className="px-2 py-0.5 rounded-full bg-amberDim text-amber border border-amberMuted text-xs font-medium">{days}d 🟡</span>
  return <span className="px-2 py-0.5 rounded-full bg-surface2 text-ink2 text-xs">{days}d</span>
}

export default function DeadStock() {
  const { deadStock, flagDeadStock, addToast } = useStore()

  const handleFlag = (item) => {
    flagDeadStock(item.id)
    addToast(`${item.sku} flagged for return`, 'warning')
  }

  const totalValue = deadStock.reduce((a, d) => a + d.costValue, 0)
  const critical = deadStock.filter(d => d.daysSinceLastSale >= 60).length
  const warning = deadStock.filter(d => d.daysSinceLastSale >= 45 && d.daysSinceLastSale < 60).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-surface3 p-4">
          <p className="text-ink3 text-xs mb-1">Total Stuck Value</p>
          <p className="text-ink1 text-xl font-semibold">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-redDim rounded-xl border border-red/30 p-4">
          <p className="text-red text-xs mb-1">Critical (60d+)</p>
          <p className="text-red text-xl font-semibold">{critical} SKUs</p>
        </div>
        <div className="bg-amberDim rounded-xl border border-amber/30 p-4">
          <p className="text-amber text-xs mb-1">Warning (45–60d)</p>
          <p className="text-amber text-xl font-semibold">{warning} SKUs</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-right px-4 py-3 font-medium">Stock</th>
              <th className="text-right px-4 py-3 font-medium">Cost Value</th>
              <th className="text-left px-4 py-3 font-medium">Last Sold</th>
              <th className="text-left px-4 py-3 font-medium">Age</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface3">
            {deadStock.map(d => (
              <tr key={d.id} className={`hover:bg-surface2 transition-colors ${d.daysSinceLastSale >= 60 ? 'bg-redDim/30' : ''}`}>
                <td className="px-5 py-3.5 text-ink1 font-medium">{d.name}</td>
                <td className="px-4 py-3.5 font-mono text-ink2 text-xs">{d.sku}</td>
                <td className="px-4 py-3.5 text-ink2">{d.vendorName}</td>
                <td className="px-4 py-3.5 text-right text-ink1">{d.stock}</td>
                <td className="px-4 py-3.5 text-right text-ink1 font-medium">₹{d.costValue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-ink2 text-xs">{d.lastSoldAt}</td>
                <td className="px-4 py-3.5"><AgeBadge days={d.daysSinceLastSale} /></td>
                <td className="px-4 py-3.5">
                  {d.flagged ? (
                    <span className="text-ink3 text-xs italic">Flagged</span>
                  ) : (
                    <button
                      onClick={() => handleFlag(d)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amberDim text-amber text-xs hover:bg-amber/20 transition-colors"
                    >
                      <IconFlag size={13} /> Flag for return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
