import { useState, useContext, useRef } from 'react'
import { AppCtx } from '../App'

function SettlementCard({ initials, avatarStyle, name, badge, subtitle, stats, advLog, advRunning, bottomStats, isPaid, paidInfo }) {
  const { confirmAction } = useContext(AppCtx)
  const utrRef = useRef(null)
  const [utrErr, setUtrErr] = useState(false)

  const markPaid = () => {
    const val = utrRef.current?.value?.trim()
    if (!val) { setUtrErr(true); utrRef.current?.focus(); return }
    setUtrErr(false)
    confirmAction(`Confirm payment with UTR: ${val}? This will mark the settlement for ${name} as Paid and log to audit.`)
  }

  return (
    <div className="sc">
      <div className="sc-head">
        <div className="vavatar" style={avatarStyle}>{initials}</div>
        <div><div style={{fontWeight:500,fontSize:'14px'}}>{name} {badge}</div><div style={{fontSize:'12px',color:'var(--text3)'}}>{subtitle}</div></div>
        <span className={`bp ${isPaid ? 'bp-active' : 'bp-pending'}`} style={{marginLeft:'auto'}}>{isPaid ? 'Paid' : 'Pending'}</span>
      </div>
      <div className="sc-stats">{stats.map((s,i) => <div key={i} className="sc-stat"><div className="slabel">{s.label}</div><div className={`svalue${s.cls?' '+s.cls:''}`}>{s.value}</div></div>)}</div>
      <div className="adv-log">
        <div className="adv-log-title">Advance Deduction Log — Cumulative History</div>
        {advLog.map((r,i) => <div key={i} className="adv-row" style={r.bold?{fontWeight:500}:{}}><span className="adv-label">{r.label}</span><span className={`adv-val${r.pos?' adv-val-pos':''}`}>{r.value}</span></div>)}
        <div className={`adv-running${advRunning.ok?' adv-running-ok':''}`}>
          <div className="ar-label">{advRunning.label}</div>
          <div className="ar-val">{advRunning.value}</div>
        </div>
      </div>
      <div className="sc-stats" style={{borderTop:'1px solid var(--border)'}}>{bottomStats.map((s,i) => <div key={i} className="sc-stat"><div className="slabel">{s.label}</div><div className={`svalue${s.cls?' '+s.cls:''}`}>{s.value}</div>{s.extra}</div>)}</div>
      <div className="sc-footer">
        {isPaid ? (
          <>{paidInfo}<button className="btn ml-auto"><i className="ti ti-file-invoice"></i> PDF</button></>
        ) : (
          <><input ref={utrRef} type="text" className={`utr-input${utrErr?' err':''}`} placeholder="Enter UTR / Transaction ID (required)" onChange={() => setUtrErr(false)} />
          <button className="btn btn-primary" onClick={markPaid}><i className="ti ti-check"></i> Confirm & Mark Paid</button>
          <button className="btn ml-auto"><i className="ti ti-file-invoice"></i> PDF</button>
          <button className="btn"><i className="ti ti-brand-whatsapp" style={{color:'var(--green)'}}></i> WhatsApp</button></>
        )}
      </div>
    </div>
  )
}

export default function Settlements() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi-card kc-accent"><div className="klabel">Total Pending Payout</div><div className="kvalue">₹1,24,800</div><div className="ksub">4 vendors</div></div>
        <div className="kpi-card"><div className="klabel">BB Margin This Cycle</div><div className="kvalue">₹31,200</div></div>
        <div className="kpi-card"><div className="klabel">Advance Outstanding</div><div className="kvalue">₹2,600</div><div className="ksub">1 vendor (RH-001)</div></div>
        <div className="kpi-card kc-green"><div className="klabel">Cycle Due Date</div><div className="kvalue">15 May</div><div className="ksub">3 days remaining</div></div>
      </div>
      <div className="filter-row">
        <select className="fsel"><option>Cycle: 1–15 May 2025</option><option>Cycle: 16–30 Apr 2025</option><option>Cycle: 1–15 Apr 2025</option></select>
        <button className="btn ml-auto" onClick={() => confirmAction('Export all settlements for Cycle 1–15 May 2025 as CSV?')}><i className="ti ti-file-spreadsheet"></i> Export All CSV</button>
        <button className="btn" onClick={() => confirmAction('Generate PDF settlement statements for all 3 vendors this cycle?')}><i className="ti ti-file-invoice"></i> Generate All PDFs</button>
      </div>
      <SettlementCard
        initials="RH" avatarStyle={{}} name="Raj Handicrafts"
        badge={<span className="comp-flag" style={{marginLeft:'6px'}}>COMP 1%</span>}
        subtitle="RH-001 · Settlement #14 · Cycle 1–15 May 2025"
        stats={[{label:'Gross Sales',value:'₹48,200'},{label:'BB Margin (22%)',value:'− ₹10,604',cls:'sv-red'},{label:'Damage Deduction',value:'− ₹400',cls:'sv-red'},{label:'Gross Vendor Earning',value:'₹37,196'}]}
        advLog={[{label:'Initial advance paid by BB on 1st delivery (10%)',value:'+ ₹5,000 paid out to vendor',pos:true},{label:'Settlement #11 — advance deducted',value:'− ₹600'},{label:'Settlement #12 — advance deducted',value:'− ₹600'},{label:'Settlement #13 — advance deducted',value:'− ₹600'},{label:'Settlement #14 (this cycle) — deducting now',value:'− ₹600',bold:true}]}
        advRunning={{label:'Advance remaining after this settlement',value:'₹2,600 still to recover',ok:false}}
        bottomStats={[{label:'Advance Deduction (this)',value:'− ₹600',cls:'sv-red'},{label:'Final Payout',value:'₹36,596',cls:'sv-accent'},{label:'Payment Method',value:'UPI'},{label:'WhatsApp',extra:<label className="wa-check"><input type="checkbox" /> Send statement</label>,value:''}]}
        isPaid={false}
      />
      <SettlementCard
        initials="SD" avatarStyle={{background:'var(--blue-dim)',color:'var(--blue)'}} name="Sharma Decors"
        badge={null} subtitle="SD-002 · Settlement #9 · Cycle 1–15 May 2025"
        stats={[{label:'Gross Sales',value:'₹64,500'},{label:'BB Margin (18%)',value:'− ₹11,610',cls:'sv-red'},{label:'Damage Deduction',value:'₹0'},{label:'Gross Vendor Earning',value:'₹52,890'}]}
        advLog={[{label:'Initial advance paid by BB on 1st delivery (10%)',value:'+ ₹8,500 paid out to vendor',pos:true},{label:'Settlements #1 through #8 — total recovered',value:'− ₹8,500 (₹1,062.50 per settlement)'}]}
        advRunning={{label:'Advance status',value:'Fully Recovered ✓',ok:true}}
        bottomStats={[{label:'Advance Deduction (this)',value:'₹0 — cleared',cls:'sv-green'},{label:'Final Payout',value:'₹52,890',cls:'sv-accent'},{label:'Payment Method',value:'UPI'},{label:'WhatsApp',extra:<label className="wa-check"><input type="checkbox" defaultChecked /> Send statement</label>,value:''}]}
        isPaid={false}
      />
      <SettlementCard
        initials="DA" avatarStyle={{background:'var(--purple-dim)',color:'var(--purple)'}} name="Devi Arts"
        badge={<span className="comp-flag" style={{marginLeft:'6px'}}>COMP 1%</span>}
        subtitle="DA-003 · Settlement #6 · Cycle 1–15 May 2025"
        stats={[{label:'Gross Sales',value:'₹28,400'},{label:'BB Margin (25%)',value:'− ₹7,100',cls:'sv-red'},{label:'Damage Deduction',value:'₹0'},{label:'Gross Vendor Earning',value:'₹21,300'}]}
        advLog={[{label:'Initial advance paid by BB on 1st delivery (10%)',value:'+ ₹4,000 paid out to vendor',pos:true},{label:'Settlement #4 — low sales that cycle',value:'− ₹0 (skipped, insufficient earnings)'},{label:'Settlement #5 — low sales that cycle',value:'− ₹0 (skipped, insufficient earnings)'},{label:'Settlement #6 (this) — full recovery',value:'− ₹4,000',bold:true}]}
        advRunning={{label:'Advance status after this settlement',value:'Fully Recovered ✓',ok:true}}
        bottomStats={[{label:'Advance Deduction (this)',value:'− ₹4,000',cls:'sv-red'},{label:'Final Payout',value:'₹17,300',cls:'sv-accent'},{label:'UTR',value:'',extra:<div className="svalue mono" style={{fontSize:'12px',color:'var(--green)'}}>UTR24051200189</div>},{label:'WhatsApp',extra:<div style={{fontSize:'12px',color:'var(--green)'}}><i className="ti ti-check"></i> Sent</div>,value:''}]}
        isPaid={true}
        paidInfo={<div style={{fontSize:'12px',color:'var(--green)'}}><i className="ti ti-check"></i> Paid 12 May 2025 · UTR24051200189</div>}
      />
    </div>
  )
}
