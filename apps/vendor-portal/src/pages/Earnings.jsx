import { useStore } from '../store/useStore'

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }

export default function Earnings() {
  const settlements = useStore(s => s.settlements)
  const upcoming = settlements.find(s => s.status === 'upcoming')

  return (
    <div className="space-y-5">
      {/* Next payout banner */}
      {upcoming && (
        <div className="bg-greenDim border border-green/30 rounded-xl p-5">
          <p className="text-green text-xs font-medium mb-1">NEXT PAYOUT</p>
          <p className="text-green text-3xl font-bold">{fmt(upcoming.netAmount)}</p>
          <p className="text-ink2 text-sm mt-1">Due on <span className="text-ink1 font-medium">{upcoming.payoutDate}</span></p>
          <div className="mt-3 flex gap-4 text-xs text-ink3">
            <span>Gross: <span className="text-ink2">{fmt(upcoming.grossAmount)}</span></span>
            <span>Advance deducted: <span className="text-red">{fmt(upcoming.advanceDeducted)}</span></span>
            <span>Orders: <span className="text-ink2">{upcoming.ordersCount}</span></span>
          </div>
        </div>
      )}

      {/* Settlement history */}
      <h3 className="text-ink1 font-semibold text-sm">Settlement History</h3>
      <div className="space-y-3">
        {settlements.map(s => (
          <div key={s.id} className="bg-surface rounded-xl border border-surface3 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-ink1 font-semibold">{s.period}</p>
                <p className="text-ink3 text-xs mt-0.5">{s.ordersCount} orders · Payout {s.payoutDate}</p>
              </div>
              {s.status === 'paid'
                ? <span className="px-2 py-0.5 rounded-full bg-greenDim text-green border border-greenMuted text-xs">Paid</span>
                : <span className="px-2 py-0.5 rounded-full bg-amberDim text-amber border border-amberMuted text-xs">Upcoming</span>
              }
            </div>

            {/* Settlement formula: Gross - Advance = Net */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface2 rounded-lg p-3 text-center">
                <p className="text-ink3 text-xs mb-1">Gross Revenue</p>
                <p className="text-ink1 font-semibold">{fmt(s.grossAmount)}</p>
              </div>
              <div className="bg-redDim rounded-lg p-3 text-center">
                <p className="text-ink3 text-xs mb-1">Advance Deducted</p>
                <p className="text-red font-semibold">− {fmt(s.advanceDeducted)}</p>
              </div>
              <div className="bg-greenDim rounded-lg p-3 text-center">
                <p className="text-ink3 text-xs mb-1">You Receive (Net)</p>
                <p className="text-green font-bold text-lg">{fmt(s.netAmount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
