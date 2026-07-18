import { useContext, useEffect, useState } from 'react'
import { AppCtx } from '../App'
import { adminApi } from '../lib/api'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

// Reason input for Reject — same inline-reveal pattern as VendorsScreen's
// ReasonRow, reused here at product-card scope instead of a table row.
function RejectForm({ onSubmit, onCancel, busy }) {
  const [reason, setReason] = useState('')
  return (
    <div className="counter-form open">
      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', marginBottom: '6px' }}>REJECT</div>
      <div className="form-group">
        <label>Reason</label>
        <input className="form-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this product rejected?" />
      </div>
      <div className="form-row" style={{ marginTop: '10px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy || !reason.trim()} onClick={() => onSubmit(reason.trim())}>
          {busy ? 'Sending…' : 'Confirm Reject'}
        </button>
        <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </div>
  )
}

// Real product data (id, sku, name, price, tags, vendor_id, images) has no
// negotiable base/selling price pair — the real product model is a single
// `price` field, not the fake base/auto-selling-price split the old mock
// UI had. The Counter-offer flow is dropped entirely for the same reason
// the vanilla-HTML pivot dropped it (see
// docs/LEGACY_VANILLA_HTML_REFERENCE.md) — there's no backend support for
// it, just Approve/Reject.
function ApprovalCard({ product, vendorName, onApprove, onReject, busy }) {
  const [rejecting, setRejecting] = useState(false)
  const image = product.images?.[0]

  return (
    <div className="appr-card">
      <div className="appr-img">
        {image ? <img src={image.file_path} alt={image.alt_text || product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="ti ti-photo"></i>}
      </div>
      <div className="appr-body">
        <div className="appr-sku">{product.sku || product.slug} · Submitted {product.created_at?.slice(0, 10)}</div>
        <div className="appr-name">{product.name}</div>
        <div className="appr-vname">{vendorName}</div>
        <div className="price-row">
          <div className="price-box"><div className="plabel">Price</div><div className="pvalue pvalue-accent">{fmt(product.price)}</div></div>
          <div className="price-box"><div className="plabel">Stock</div><div className="pvalue">{product.stock_quantity}</div></div>
        </div>
        {product.tags?.length > 0 && (
          <div className="meta-tags">{product.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        )}
        {rejecting ? (
          <RejectForm busy={busy} onCancel={() => setRejecting(false)} onSubmit={(reason) => onReject(product.id, reason)} />
        ) : (
          <div className="card-actions">
            <button className="btn btn-success" disabled={busy} onClick={() => onApprove(product.id)}><i className="ti ti-check"></i> Approve</button>
            <button className="btn btn-danger" disabled={busy} onClick={() => setRejecting(true)}><i className="ti ti-x"></i> Reject</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApprovalQueue() {
  const { confirmAction } = useContext(AppCtx)
  const [products, setProducts] = useState(null)
  const [vendorNames, setVendorNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      adminApi.listPendingProducts(),
      // Best-effort vendor-name lookup — matches the vanilla pivot's
      // vendorNameById() cross-reference against its own vendor cache.
      // Falls back to "Vendor #<id>" per-card if this fails, so a broken
      // vendor list doesn't block the approval queue itself.
      adminApi.listVendors().catch(() => []),
    ])
      .then(([productData, vendors]) => {
        setProducts(productData.items || [])
        const map = {}
        for (const v of vendors) map[v.id] = v.profile?.business_name || v.user?.full_name || `Vendor #${v.id}`
        setVendorNames(map)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const runAction = (id, action, ...args) => {
    setBusyId(id)
    action(id, ...args)
      .then(load)
      .catch(e => confirmAction(`Action failed: ${e.message}`))
      .finally(() => setBusyId(null))
  }

  if (loading) {
    return <p className="text-ink3 text-sm">Loading approval queue…</p>
  }

  if (error) {
    return (
      <div className="panel" style={{ padding: '20px' }}>
        <p className="text-red text-sm mb-3">{error}</p>
        <button className="btn btn-primary" onClick={load}>Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div className="filter-row">
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search products..." /></div>
      </div>
      {products.length === 0 ? (
        <div className="panel" style={{ padding: '30px', textAlign: 'center' }}>
          <p className="text-ink3 text-sm">No products awaiting approval.</p>
        </div>
      ) : (
        <div className="appr-grid">
          {products.map(p => (
            <ApprovalCard
              key={p.id}
              product={p}
              vendorName={vendorNames[p.vendor_id] || `Vendor #${p.vendor_id}`}
              busy={busyId === p.id}
              onApprove={(id) => runAction(id, adminApi.approveProduct)}
              onReject={(id, reason) => runAction(id, adminApi.rejectProduct, reason)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
