import { useStore } from '../store/useStore'

const actionColors = {
  PRODUCT_APPROVED: 'text-green bg-greenDim',
  PRODUCT_REJECTED: 'text-red bg-redDim',
  VENDOR_APPROVED: 'text-brand bg-brandDim',
  VENDOR_REJECTED: 'text-red bg-redDim',
  SETTLEMENT_PAID: 'text-teal bg-surface2',
  DEADSTOCK_FLAGGED: 'text-amber bg-amberDim',
}

export default function AuditLogs() {
  const auditLogs = useStore(s => s.auditLogs)

  return (
    <div className="bg-surface rounded-xl border border-surface3 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface3 text-ink3 text-xs uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Timestamp</th>
            <th className="text-left px-4 py-3 font-medium">Actor</th>
            <th className="text-left px-4 py-3 font-medium">Action</th>
            <th className="text-left px-4 py-3 font-medium">Target</th>
            <th className="text-left px-4 py-3 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface3">
          {auditLogs.map(log => (
            <tr key={log.id} className="hover:bg-surface2 transition-colors">
              <td className="px-5 py-3.5 text-ink3 text-xs font-mono whitespace-nowrap">
                {new Date(log.ts).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-3.5 text-ink2 text-xs">{log.actor}</td>
              <td className="px-4 py-3.5">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || 'text-ink2 bg-surface2'}`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3.5 font-mono text-ink2 text-xs">{log.target}</td>
              <td className="px-4 py-3.5 text-ink2 text-xs">{log.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
