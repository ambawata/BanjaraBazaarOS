import { useStore } from '../store/useStore'
import { dashboardKPIs } from '../data/mockData'

function KPICard({ label, value, sub, accent }) {
  const accentMap = {
    brand: 'border-brand/40 bg-brandDim/30',
    green: 'border-green/40 bg-greenDim',
    amber: 'border-amber/40 bg-amberDim',
    red:   'border-red/40 bg-redDim',
  }
  const textMap = {
    brand: 'text-brand',
    green: 'text-green',
    amber: 'text-amber',
    red:   'text-red',
  }
  return (
    <div className={`rounded-xl border p-5 ${accentMap[accent] || 'border-surface3 bg-surface'}`}>
      <p className="text-ink3 text-xs mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${textMap[accent] || 'text-ink1'}`}>{value}</p>
      {sub && <p className="text-ink3 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n) { return '₹' + n.toLocaleString('en-IN') }

export default function Dashboard() {
  const vendor = useStore(s => s.vendor)
  const products = useStore(s => s.products)
  const active = products.filter(p => p.status === 'approved').length
  const pending = products.filter(p => p.status === 'pending').length
  const deadCount = products.filter(p => p.daysSinceLastSale !== null && p.daysSinceLastSale >= 45).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-ink1 font-semibold text-lg">Welcome back, {vendor?.ownerName?.split(' ')[0]} 👋</h2>
        <p className="text-ink3 text-sm mt-0.5">{vendor?.businessName} · <span className="font-mono">{vendor?.id}</span></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Products" value={active} sub="Listed on marketplace" accent="brand" />
        <KPICard label="Pending Approval" value={pending} sub="Awaiting admin review" accent={pending > 0 ? 'amber' : 'green'} />
        <KPICard label="Next Settlement" value={fmt(dashboardKPIs.nextSettlementAmount)} sub={`Due ${dashboardKPIs.nextSettlementDate}`} accent="green" />
        <KPICard label="Earnings This Month" value={fmt(dashboardKPIs.earningsThisMonth)} sub="Gross revenue May 2026" accent="brand" />
      </div>

      {deadCount > 0 && (
        <div className="bg-amberDim border border-amber/30 rounded-xl p-4">
          <p className="text-amber font-medium text-sm">⚠ {deadCount} product{deadCount > 1 ? 's' : ''} with dead stock</p>
          <p className="text-ink2 text-xs mt-0.5">Products unsold for 45+ days need attention. <a href="/deadstock" className="text-amber underline">View alerts →</a></p>
        </div>
      )}

      {/* Recent products */}
      <div className="bg-surface rounded-xl border border-surface3">
        <div className="px-5 py-4 border-b border-surface3 flex items-center justify-between">
          <h3 className="text-ink1 font-semibold text-sm">Recent Products</h3>
          <a href="/products" className="text-brand text-xs hover:underline">View all</a>
        </div>
        <div className="divide-y divide-surface3">
          {products.slice(0, 4).map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-ink1 text-sm font-medium truncate">{p.name}</p>
                <p className="text-ink3 text-xs font-mono">{p.sku}</p>
              </div>
              <p className="text-ink1 text-sm font-medium">₹{p.basePrice.toLocaleString('en-IN')}</p>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    approved:   'bg-greenDim text-green border-greenMuted',
    pending:    'bg-amberDim text-amber border-amberMuted',
    rejected:   'bg-redDim text-red border-redMuted',
    dead_stock: 'bg-redDim text-red border-redMuted',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${map[status] || 'bg-surface2 text-ink2'}`}>{status.replace('_', ' ')}</span>
}
