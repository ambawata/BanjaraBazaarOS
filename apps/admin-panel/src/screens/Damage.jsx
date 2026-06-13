import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Damage() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <select className="fsel"><option>All Status</option><option>Open</option><option>Under Review</option><option>Vendor Informed</option><option>Deducted</option><option>Closed</option></select>
        <button className="btn btn-primary ml-auto"><i className="ti ti-plus"></i> New Report</button>
      </div>
      <div className="damage-card">
        <div className="damage-icon"><i className="ti ti-alert-triangle"></i></div>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
            <div><div className="mono" style={{fontSize:'11px',color:'var(--text3)'}}>DMG-00088 · 2 days ago · Reported by Ravi Kumar</div><h4 style={{fontSize:'14px',fontWeight:500,margin:'3px 0'}}>Ceramic Vase Set — Hairline cracks</h4><div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'6px'}}>Raj Handicrafts · BB-C-00201</div></div>
            <span className="bp bp-pending">Under Review</span>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'8px'}}><span className="tag">Severity: Minor</span><span className="tag">Handling damage</span><span className="tag">Est. Loss: ₹800</span><span className="tag">Vendor liability: 50%</span></div>
          <div style={{display:'flex',gap:'6px'}}>
            <button className="btn btn-success btn-sm" onClick={() => confirmAction('Approve claim — deduct ₹400 from Raj Handicrafts next settlement?')}><i className="ti ti-check"></i> Approve & Deduct</button>
            <button className="btn btn-sm"><i className="ti ti-send"></i> Notify Vendor</button>
            <button className="btn btn-danger btn-sm"><i className="ti ti-x"></i> Reject</button>
          </div>
        </div>
      </div>
      <div className="damage-card">
        <div className="damage-icon"><i className="ti ti-alert-triangle"></i></div>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
            <div><div className="mono" style={{fontSize:'11px',color:'var(--text3)'}}>DMG-00085 · 5 days ago · Reported by Meena Singh</div><h4 style={{fontSize:'14px',fontWeight:500,margin:'3px 0'}}>Wooden Chair — Leg broken</h4><div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'6px'}}>Sharma Decors · BB-F-00062</div></div>
            <span className="bp bp-active">Deducted</span>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'6px'}}><span className="tag">Severity: Major</span><span className="tag">Customer accident</span><span className="tag">Est. Loss: ₹3,200</span><span className="tag">BB liability: 100%</span></div>
          <div style={{fontSize:'12px',color:'var(--green)'}}><i className="ti ti-check"></i> ₹3,200 charged to BB expenses · Vendor settlement unaffected</div>
        </div>
      </div>
    </div>
  )
}
