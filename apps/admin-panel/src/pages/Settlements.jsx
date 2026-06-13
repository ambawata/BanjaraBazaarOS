import { useStore } from '../store/useStore'
import { IconCheck } from '@tabler/icons-react'

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }

export default function Settlements() {
  const { settlements, markSettled, addToast } = useStore()

  const pending = settlements.filter(s => s.status === 'pending')
  const settled = settlements.filter(s => s.status === 'settled')
  const pendingTotal = pending.reduce((a, s) => a + s.netPayable, 0)

  const handleSettle = (s) => {
    markSettled(s.id)
    addToast(`Settlement paid to ${s.vendorName} — ${fmt(s.netPayable)}`, 'success')
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      {pending.length > 0 && (
        <div className="bg-amberDim border border-amber/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-amber font-medium text-sm">{pending.length} settlements pending</p>
            <p className="text-ink2 text-xs mt-0.5">Total payable: {fmt(pendingTotal)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Period</th>
              <th className="text-right px-4 py-3 font-medium">Orders</th>
              <th className="text-right px-4 py-3 font-medium">Gross</th>
              <th className="text-right px-4 py-3 font-medium">Platform Fee</th>
              <th className="text-right px-4 py-3 font-medium">Net Payable</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface3">
            {settlements.map(s => (
              <tr key={s.id} className="hover:bg-surface2 transition-colors">
                <td className="px-5 py-3.5 text-ink1 font-medium">{s.vendorName}</td>
                <td className="px-4 py-3.5 text-ink2">{s.period}</td>
                <td className="px-4 py-3.5 text-right text-ink2">{s.ordersCount}</td>
                <td className="px-4 py-3.5 text-right text-ink1">{fmt(s.grossRevenue)}</td>
                <td className="px-4 py-3.5 text-right text-red">{fmt(s.platformFee)}</td>
                <td className="px-4 py-3.5 text-right text-green font-semibold">{fmt(s.netPayable)}</td>
                <td className="px-4 py-3.5">
                  {s.status === 'pending' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amberDim text-amber border border-amberMuted text-xs">Pending</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-greenDim text-green border border-greenMuted text-xs">Settled</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {s.status === 'pending' && (
                    <button
                      onClick={() => handleSettle(s)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-greenDim text-green text-xs hover:bg-green/20 transition-colors"
                    >
                      <IconCheck size={13} /> Mark settled
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
