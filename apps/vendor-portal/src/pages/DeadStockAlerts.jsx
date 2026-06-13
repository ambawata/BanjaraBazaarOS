import { useStore } from '../store/useStore'

function AgeBadge({ days }) {
  if (days >= 60) return <span className="px-2 py-0.5 rounded-full bg-redDim text-red border border-redMuted text-xs font-medium">{days} days 🔴</span>
  return <span className="px-2 py-0.5 rounded-full bg-amberDim text-amber border border-amberMuted text-xs font-medium">{days} days 🟡</span>
}

export default function DeadStockAlerts() {
  const { products, requestPickup, acceptMarkdown, addToast } = useStore()
  const dead = products.filter(p => p.daysSinceLastSale !== null && p.daysSinceLastSale >= 45)

  const handlePickup = (p) => {
    requestPickup(p.id)
    addToast(`Pickup requested for ${p.name}`, 'info')
  }

  const handleMarkdown = (p) => {
    acceptMarkdown(p.id)
    addToast(`30% markdown applied to ${p.name}`, 'warning')
  }

  if (dead.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">✓</p>
        <p className="text-ink1 font-semibold">No dead stock alerts</p>
        <p className="text-ink3 text-sm mt-1">All products have recent sales activity.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-amberDim border border-amber/30 rounded-xl p-4">
        <p className="text-amber font-medium text-sm">⚠ {dead.length} product{dead.length > 1 ? 's' : ''} flagged for dead stock</p>
        <p className="text-ink2 text-xs mt-0.5">Products unsold for 45+ days. Take action to avoid warehouse fees.</p>
      </div>

      <div className="space-y-3">
        {dead.map(p => (
          <div key={p.id} className={`bg-surface rounded-xl border p-5 ${p.daysSinceLastSale >= 60 ? 'border-red/30' : 'border-amber/30'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-ink1 font-semibold">{p.name}</p>
                {/* SKU in monospace */}
                <p className="text-ink3 text-xs font-mono mt-0.5">{p.sku}</p>
              </div>
              <AgeBadge days={p.daysSinceLastSale} />
            </div>

            <div className="flex gap-4 text-sm text-ink2 mb-4">
              <span>Category: <span className="text-ink1">{p.category}</span></span>
              {/* base_price only — no selling_price */}
              <span>Base price: <span className="text-ink1 font-mono">₹{p.basePrice.toLocaleString('en-IN')}</span></span>
              <span>Stock: <span className="text-ink1">{p.stock} units</span></span>
            </div>

            {p.lastSoldAt && (
              <p className="text-ink3 text-xs mb-4">Last sold: {p.lastSoldAt}</p>
            )}

            {p.deadStockAction ? (
              <p className="text-ink3 text-sm italic">
                {p.deadStockAction === 'pickup_requested' ? '✓ Pickup requested — team will contact you' : '✓ 30% markdown accepted — price updated'}
              </p>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handlePickup(p)}
                  className="px-4 py-2 rounded-lg bg-surface2 border border-surface3 text-ink1 text-sm hover:bg-brand hover:border-brand hover:text-white transition-colors"
                >
                  Request Pickup
                </button>
                <button
                  onClick={() => handleMarkdown(p)}
                  className="px-4 py-2 rounded-lg bg-amberDim border border-amberMuted text-amber text-sm hover:bg-amber/20 transition-colors"
                >
                  Accept 30% Markdown
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
