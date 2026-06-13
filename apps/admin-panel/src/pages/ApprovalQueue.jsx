import { useState } from 'react'
import { useStore } from '../store/useStore'
import { IconCheck, IconX, IconPhoto } from '@tabler/icons-react'

function MarginBadge({ margin }) {
  if (margin < 15) return <span className="text-red font-semibold">{margin.toFixed(1)}% ⚠</span>
  return <span className="text-green font-semibold">{margin.toFixed(1)}%</span>
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amberDim text-amber border-amberMuted',
    approved: 'bg-greenDim text-green border-greenMuted',
    rejected: 'bg-redDim text-red border-redMuted',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[status] || ''}`}>
      {status}
    </span>
  )
}

export default function ApprovalQueue() {
  const { approvals, approveProduct, rejectProduct, addToast } = useStore()
  const [filter, setFilter] = useState('pending')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = approvals.filter(p => filter === 'all' ? true : p.status === filter)

  const handleApprove = (p) => {
    if (p.margin < 15) {
      addToast(`Warning: margin is ${p.margin.toFixed(1)}% (below 15%)`, 'warning')
    }
    approveProduct(p.id)
    addToast(`${p.name} approved`, 'success')
  }

  const handleReject = () => {
    if (!rejectReason.trim()) return
    rejectProduct(rejectModal.id, rejectReason)
    addToast(`${rejectModal.name} rejected`, 'error')
    setRejectModal(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f ? 'bg-brand text-white' : 'bg-surface text-ink2 border border-surface3 hover:text-ink1'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">SKU</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-right px-4 py-3 font-medium">Cost Price</th>
              <th className="text-right px-4 py-3 font-medium">Margin</th>
              <th className="text-left px-4 py-3 font-medium">Images</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface3">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center text-ink3 py-10">No items</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-surface2 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-ink1 font-medium">{p.name}</p>
                  <p className="text-ink3 text-xs">{p.category}</p>
                </td>
                <td className="px-4 py-3.5 font-mono text-ink2 text-xs">{p.sku}</td>
                <td className="px-4 py-3.5 text-ink2">{p.vendorName}</td>
                <td className="px-4 py-3.5 text-right text-ink1">₹{p.costPrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3.5 text-right"><MarginBadge margin={p.margin} /></td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1 text-ink2 text-xs">
                    <IconPhoto size={13} /> {p.images}
                  </span>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3.5">
                  {p.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApprove(p)}
                        className="p-1.5 rounded-lg bg-greenDim text-green hover:bg-green/20 transition-colors"
                        title="Approve"
                      >
                        <IconCheck size={14} />
                      </button>
                      <button
                        onClick={() => setRejectModal(p)}
                        className="p-1.5 rounded-lg bg-redDim text-red hover:bg-red/20 transition-colors"
                        title="Reject"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  )}
                  {p.status === 'rejected' && p.rejectReason && (
                    <span className="text-ink3 text-xs italic">{p.rejectReason}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-surface3 p-6 w-full max-w-md">
            <h3 className="text-ink1 font-semibold mb-1">Reject Product</h3>
            <p className="text-ink3 text-sm mb-4">{rejectModal.name}</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={3}
              className="w-full bg-surface2 border border-surface3 rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="px-4 py-2 rounded-lg bg-surface2 text-ink2 text-sm hover:text-ink1 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-red text-white text-sm hover:bg-red/90 disabled:opacity-40 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
