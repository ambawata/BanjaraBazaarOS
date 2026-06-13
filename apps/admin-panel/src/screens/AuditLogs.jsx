import { useContext } from 'react'
import { AppCtx } from '../App'

export default function AuditLogs() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <select className="fsel"><option>All Actions</option><option>Login</option><option>Product Edit</option><option>Financial Edit</option><option>Permission Change</option><option>Deletion</option></select>
        <select className="fsel"><option>All Users</option><option>Rajesh K. (Admin)</option><option>Priya Sharma</option><option>System / CRON</option></select>
        <button className="btn ml-auto" onClick={() => confirmAction('Export full audit log as CSV?')}><i className="ti ti-download"></i> Export Logs</button>
      </div>
      <div className="panel" style={{margin:0}}><div style={{padding:'0 16px'}}>
        <div className="audit-row"><div className="audit-time">12 May 11:42</div><div className="audit-action">Settlement #14 marked paid for <b>Raj Handicrafts</b> · UTR entered · ₹36,596 · advance ₹600 deducted</div><div className="audit-user">Rajesh K.</div></div>
        <div className="audit-row"><div className="audit-time">12 May 11:18</div><div className="audit-action">Product <b>BB-A-00241</b> approved — Bamboo Table Lamp · Raj Handicrafts</div><div className="audit-user">Rajesh K.</div></div>
        <div className="audit-row"><div className="audit-time">12 May 10:44</div><div className="audit-action">Counter offer sent to Raj Handicrafts for BB-A-00241 · counter price ₹1,100</div><div className="audit-user">Rajesh K.</div></div>
        <div className="audit-row"><div className="audit-time">12 May 09:32</div><div className="audit-action">Damage report DMG-00088 approved · ₹400 deducted from Raj Handicrafts next settlement</div><div className="audit-user">Rajesh K.</div></div>
        <div className="audit-row"><div className="audit-time">12 May 09:02</div><div className="audit-action">Staff login — Priya Sharma checked in · IP 192.168.1.14</div><div className="audit-user">System</div></div>
        <div className="audit-row"><div className="audit-time">12 May 03:00</div><div className="audit-action">Auto backup completed · 4.2 MB · banjara_db full snapshot saved</div><div className="audit-user">CRON</div></div>
        <div className="audit-row"><div className="audit-time">11 May 18:24</div><div className="audit-action">Dead stock flag triggered — BB-O-00038 Garden Bench · 60-day threshold crossed · vendor notified</div><div className="audit-user">CRON</div></div>
        <div className="audit-row"><div className="audit-time">11 May 14:08</div><div className="audit-action">Dead stock warning — BB-G-00142 Monstera 4ft · 45-day warning triggered</div><div className="audit-user">CRON</div></div>
      </div></div>
    </div>
  )
}
