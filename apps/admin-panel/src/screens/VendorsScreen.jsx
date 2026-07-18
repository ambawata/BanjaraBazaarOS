import { useContext, useEffect, useState } from 'react'
import { AppCtx } from '../App'
import { adminApi } from '../lib/api'

const statusBadge = {
  active: 'bp-active',
  pending: 'bp-pending',
  rejected: 'bp-red',
  suspended: 'bp-red',
}

// One row's Reject/Suspend reason input — matches the existing
// counter-form inline-reveal pattern from ApprovalQueue.jsx (click an
// action -> a small form opens beneath, Confirm/Cancel) rather than the
// shared confirmAction modal (which has no text-input slot) or a native
// window.prompt().
function ReasonRow({ label, placeholder, onSubmit, onCancel, busy }) {
  const [reason, setReason] = useState('')
  return (
    <div className="counter-form open">
      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', marginBottom: '6px' }}>
        {label.toUpperCase()}
      </div>
      <div className="form-group">
        <label>Reason</label>
        <input
          className="form-input"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div className="form-row" style={{ marginTop: '10px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy || !reason.trim()} onClick={() => onSubmit(reason.trim())}>
          {busy ? 'Sending…' : `Confirm ${label}`}
        </button>
        <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </div>
  )
}

export default function VendorsScreen() {
  const { confirmAction } = useContext(AppCtx)
  const [vendors, setVendors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [reasonRowFor, setReasonRowFor] = useState(null) // { id, action: 'reject'|'suspend' }

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi.listVendors()
      .then(data => setVendors(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const runAction = (id, action, ...args) => {
    setBusyId(id)
    action(id, ...args)
      .then(() => {
        setReasonRowFor(null)
        load()
      })
      .catch(e => confirmAction(`Action failed: ${e.message}`))
      .finally(() => setBusyId(null))
  }

  if (loading) {
    return <p className="text-ink3 text-sm">Loading vendors…</p>
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
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search vendor..." /></div>
        <button className="btn btn-primary ml-auto" onClick={() => confirmAction('Add new vendor — you will need: vendor name, GST type, GSTIN (if applicable), phone, email, bank/UPI details, and security deposit amount.')}><i className="ti ti-user-plus"></i> Add Vendor</button>
      </div>
      <div className="panel" style={{ margin: 0 }}>
        <table className="dt">
          <thead>
            <tr><th>Vendor</th><th>GSTIN</th><th>Business Type</th><th>Applied</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {vendors.length === 0 && (
              <tr><td colSpan={6} className="text-ink3" style={{ padding: '20px', textAlign: 'center' }}>No vendor applications yet.</td></tr>
            )}
            {vendors.map(v => (
              <tr key={v.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.profile.business_name || v.user.full_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{v.user.email}</div>
                </td>
                <td className="mono">{v.profile.gst_number || '—'}</td>
                <td>{v.profile.business_type || '—'}</td>
                <td className="mono">{v.created_at ? v.created_at.slice(0, 10) : '—'}</td>
                <td><span className={`bp ${statusBadge[v.status] || 'bp-gray'}`}>{v.status}</span></td>
                <td>
                  {reasonRowFor?.id === v.id ? (
                    <ReasonRow
                      label={reasonRowFor.action}
                      placeholder={reasonRowFor.action === 'reject' ? 'Why is this application rejected?' : 'Why is this vendor being suspended?'}
                      busy={busyId === v.id}
                      onCancel={() => setReasonRowFor(null)}
                      onSubmit={(reason) =>
                        runAction(v.id, reasonRowFor.action === 'reject' ? adminApi.rejectVendor : adminApi.suspendVendor, reason)
                      }
                    />
                  ) : (
                    <div className="card-actions" style={{ display: 'inline-flex' }}>
                      {v.status !== 'active' && (
                        <button className="btn btn-sm btn-success" disabled={busyId === v.id} onClick={() => runAction(v.id, adminApi.approveVendor)}>
                          <i className="ti ti-check"></i> Approve
                        </button>
                      )}
                      {v.status !== 'rejected' && (
                        <button className="btn btn-sm btn-danger" disabled={busyId === v.id} onClick={() => setReasonRowFor({ id: v.id, action: 'reject' })}>
                          Reject
                        </button>
                      )}
                      {v.status === 'active' && (
                        <button className="btn btn-sm" disabled={busyId === v.id} onClick={() => setReasonRowFor({ id: v.id, action: 'suspend' })}>
                          Suspend
                        </button>
                      )}
                    </div>
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
