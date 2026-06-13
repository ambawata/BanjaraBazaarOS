import { useStore } from '../store/useStore'
import { IconCheck, IconX } from '@tabler/icons-react'

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }

function StatusBadge({ status }) {
  const map = {
    active: 'bg-greenDim text-green border-greenMuted',
    pending: 'bg-amberDim text-amber border-amberMuted',
    rejected: 'bg-redDim text-red border-redMuted',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[status] || ''}`}>
      {status}
    </span>
  )
}

export default function Vendors() {
  const { vendors, approveVendor, rejectVendor, addToast } = useStore()

  const handleApprove = (v) => {
    approveVendor(v.id)
    addToast(`${v.name} approved`, 'success')
  }

  const handleReject = (v) => {
    rejectVendor(v.id)
    addToast(`${v.name} rejected`, 'error')
  }

  return (
    <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Vendor</th>
            <th className="text-left px-4 py-3 font-medium">GSTIN</th>
            <th className="text-left px-4 py-3 font-medium">City</th>
            <th className="text-right px-4 py-3 font-medium">Products</th>
            <th className="text-right px-4 py-3 font-medium">Revenue</th>
            <th className="text-left px-4 py-3 font-medium">Joined</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface3">
          {vendors.map(v => (
            <tr key={v.id} className="hover:bg-surface2 transition-colors">
              <td className="px-5 py-3.5">
                <p className="text-ink1 font-medium">{v.name}</p>
                <p className="text-ink3 text-xs">{v.phone}</p>
              </td>
              <td className="px-4 py-3.5 font-mono text-ink2 text-xs">{v.gstin}</td>
              <td className="px-4 py-3.5 text-ink2">{v.city}</td>
              <td className="px-4 py-3.5 text-right text-ink1">{v.totalProducts}</td>
              <td className="px-4 py-3.5 text-right text-green font-medium">{fmt(v.revenue)}</td>
              <td className="px-4 py-3.5 text-ink2 text-xs">{v.joinedAt}</td>
              <td className="px-4 py-3.5"><StatusBadge status={v.status} /></td>
              <td className="px-4 py-3.5">
                {v.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApprove(v)}
                      className="p-1.5 rounded-lg bg-greenDim text-green hover:bg-green/20 transition-colors"
                      title="Approve"
                    >
                      <IconCheck size={14} />
                    </button>
                    <button
                      onClick={() => handleReject(v)}
                      className="p-1.5 rounded-lg bg-redDim text-red hover:bg-red/20 transition-colors"
                      title="Reject"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
