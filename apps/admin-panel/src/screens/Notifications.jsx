import { useState } from 'react'

export default function Notifications() {
  const [allRead, setAllRead] = useState(false)
  return (
    <div>
      <div className="filter-row">
        <select className="fsel"><option>All Types</option><option>Dead Stock</option><option>Vendor</option><option>Settlement</option><option>Staff</option><option>System</option></select>
        <button className="btn ml-auto" onClick={() => setAllRead(true)} disabled={allRead}><i className="ti ti-checks"></i> {allRead ? 'All Read' : 'Mark All Read'}</button>
      </div>
      <div className="panel" style={{margin:0}}><div style={{padding:'0 16px',opacity: allRead ? .5 : 1}}>
        <div className="notif-item"><div className="notif-icon" style={{background:'var(--red-dim)',color:'var(--red)'}}><i className="ti ti-clock-exclamation"></i></div><div style={{flex:1}}><div className="notif-title">Garden Bench crossed 60-day threshold</div><div className="notif-sub">Nature Craft · BB-O-00038 · Section O1 — requires vendor action</div></div><div className="notif-time">1 hr ago</div></div>
        <div className="notif-item"><div className="notif-icon" style={{background:'var(--amber-dim)',color:'var(--amber)'}}><i className="ti ti-clock"></i></div><div style={{flex:1}}><div className="notif-title">8 products approaching 45-day warning</div><div className="notif-sub">Review Dead Stock screen for details</div></div><div className="notif-time">2 hrs ago</div></div>
        <div className="notif-item"><div className="notif-icon" style={{background:'var(--blue-dim)',color:'var(--blue)'}}><i className="ti ti-checks"></i></div><div style={{flex:1}}><div className="notif-title">7 products in approval queue</div><div className="notif-sub">3 submitted today — review needed</div></div><div className="notif-time">3 hrs ago</div></div>
        <div className="notif-item"><div className="notif-icon" style={{background:'var(--green-dim)',color:'var(--green)'}}><i className="ti ti-credit-card"></i></div><div style={{flex:1}}><div className="notif-title">Settlement cycle opens in 3 days</div><div className="notif-sub">₹1,24,800 pending across 3 vendors</div></div><div className="notif-time">Today 9am</div></div>
        <div className="notif-item"><div className="notif-icon" style={{background:'var(--purple-dim)',color:'var(--purple)'}}><i className="ti ti-database"></i></div><div style={{flex:1}}><div className="notif-title">Daily backup completed successfully</div><div className="notif-sub">Auto backup — 3:00 AM · banjara_db · 4.2 MB</div></div><div className="notif-time">Today 3am</div></div>
      </div></div>
    </div>
  )
}
