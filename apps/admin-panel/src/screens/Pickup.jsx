import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Pickup() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <select className="fsel"><option>All Status</option><option>Requested</option><option>Scheduled</option><option>Assigned</option><option>Collected</option><option>Closed</option></select>
        <button className="btn ml-auto" onClick={() => confirmAction('Print pickup slips for all scheduled pickups?')}><i className="ti ti-printer"></i> Print Pickup Slips</button>
      </div>
      <div className="pickup-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><div className="mono" style={{fontSize:'11px',color:'var(--text3)'}}>PKP-00041 · Raised 1 day ago</div><h4 style={{fontSize:'14px',margin:'4px 0 2px'}}>Outdoor Garden Bench</h4><div style={{fontSize:'12px',color:'var(--text2)'}}>Nature Craft · BB-O-00038 · Section O1 · Qty: 1</div></div>
          <span className="bp bp-pending">Scheduled</span>
        </div>
        <div className="tracker">
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Requested</div></div>
          <div className="tline tline-done"></div>
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Scheduled</div></div>
          <div className="tline"></div>
          <div className="tstep"><div className="tdot tdot-current">3</div><div className="tstep-label">Assigned</div></div>
          <div className="tline"></div>
          <div className="tstep"><div className="tdot tdot-todo">4</div><div className="tstep-label">Collected</div></div>
          <div className="tline"></div>
          <div className="tstep"><div className="tdot tdot-todo">5</div><div className="tstep-label">Closed</div></div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn btn-primary btn-sm" onClick={() => confirmAction('Assign staff to this pickup?')}><i className="ti ti-user-check"></i> Assign Staff</button>
          <button className="btn btn-sm"><i className="ti ti-printer"></i> Print Slip</button>
          <button className="btn btn-sm"><i className="ti ti-camera"></i> Upload Proof</button>
        </div>
      </div>
      <div className="pickup-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><div className="mono" style={{fontSize:'11px',color:'var(--text3)'}}>PKP-00039 · Raised 3 days ago</div><h4 style={{fontSize:'14px',margin:'4px 0 2px'}}>Monstera Artificial 6ft</h4><div style={{fontSize:'12px',color:'var(--text2)'}}>Devi Arts · BB-G-00118 · Section G2 · Qty: 2</div></div>
          <span className="bp bp-blue">Collected</span>
        </div>
        <div className="tracker">
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Requested</div></div>
          <div className="tline tline-done"></div>
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Scheduled</div></div>
          <div className="tline tline-done"></div>
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Assigned</div></div>
          <div className="tline tline-done"></div>
          <div className="tstep"><div className="tdot tdot-done"><i className="ti ti-check" style={{fontSize:'10px'}}></i></div><div className="tstep-label">Collected</div></div>
          <div className="tline"></div>
          <div className="tstep"><div className="tdot tdot-current">5</div><div className="tstep-label">Closed</div></div>
        </div>
        <button className="btn btn-success btn-sm" onClick={() => confirmAction('Mark PKP-00039 as Closed?')}><i className="ti ti-check"></i> Close Pickup</button>
      </div>
    </div>
  )
}
