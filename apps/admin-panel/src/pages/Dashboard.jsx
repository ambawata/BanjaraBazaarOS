import { useStore } from '../store/useStore'
import { dashboardStats } from '../data/mockData'
import {
  IconBuilding, IconClock, IconPackageOff, IconCoinRupee,
  IconTrendingUp, IconAlertTriangle
} from '@tabler/icons-react'

function StatCard({ label, value, sub, icon: Icon, accent = 'brand' }) {
  const accentMap = {
    brand: 'text-brand bg-brandDim',
    green: 'text-green bg-greenDim',
    amber: 'text-amber bg-amberDim',
    red: 'text-red bg-redDim',
  }
  return (
    <div className="bg-surface rounded-xl border border-surface3 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-ink1 text-2xl font-semibold">{value}</p>
      <p className="text-ink2 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-ink3 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function Dashboard() {
  const vendors = useStore(s => s.vendors)
  const approvals = useStore(s => s.approvals)
  const deadStock = useStore(s => s.deadStock)
  const settlements = useStore(s => s.settlements)

  const pendingVendors = vendors.filter(v => v.status === 'pending').length
  const pendingProducts = approvals.filter(p => p.status === 'pending').length
  const pendingSettlements = settlements.filter(s => s.status === 'pending')
  const pendingAmt = pendingSettlements.reduce((a, s) => a + s.netPayable, 0)
  const deadValue = deadStock.reduce((a, d) => a + d.costValue, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Vendors" value={vendors.filter(v => v.status === 'active').length} sub={`${pendingVendors} pending approval`} icon={IconBuilding} accent="brand" />
        <StatCard label="Pending Approvals" value={pendingProducts} sub="Products awaiting review" icon={IconClock} accent={pendingProducts > 0 ? 'amber' : 'green'} />
        <StatCard label="Dead Stock Value" value={fmt(deadValue)} sub={`${deadStock.length} SKUs stagnant`} icon={IconPackageOff} accent="red" />
        <StatCard label="Pending Settlements" value={fmt(pendingAmt)} sub={`${pendingSettlements.length} vendors`} icon={IconCoinRupee} accent="green" />
      </div>

      {/* Recent Approvals */}
      <div className="bg-surface rounded-xl border border-surface3">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface3">
          <h2 className="text-ink1 font-semibold text-sm">Recent Approval Queue</h2>
          <a href="/approvals" className="text-brand text-xs hover:underline">View all</a>
        </div>
        <div className="divide-y divide-surface3">
          {approvals.filter(p => p.status === 'pending').slice(0, 3).map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-ink1 text-sm font-medium truncate">{p.name}</p>
                <p className="text-ink3 text-xs">{p.vendorName} · <span className="font-mono">{p.sku}</span></p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${p.margin < 15 ? 'text-red' : 'text-green'}`}>
                  {p.margin.toFixed(1)}%
                </p>
                <p className="text-ink3 text-xs">margin</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amberDim text-amber text-xs border border-amberMuted">Pending</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dead Stock Alert */}
      {deadStock.length > 0 && (
        <div className="bg-redDim border border-red/30 rounded-xl p-4 flex items-start gap-3">
          <IconAlertTriangle size={18} className="text-red mt-0.5 shrink-0" />
          <div>
            <p className="text-red font-medium text-sm">{deadStock.length} SKUs with stagnant inventory</p>
            <p className="text-ink2 text-xs mt-0.5">
              Total stuck value: {fmt(deadValue)} — review dead stock for markdown or return.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
