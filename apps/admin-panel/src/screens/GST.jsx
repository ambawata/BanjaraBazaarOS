import { useContext } from 'react'
import { AppCtx } from '../App'

export default function GST() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div className="two-col">
      <div className="panel">
        <div className="panel-head"><i className="ti ti-report-money" style={{color:'var(--green)'}}></i><h3>GST Summary — May 2025</h3>
          <button className="btn btn-sm ml-auto" onClick={() => confirmAction('Export GST summary for May 2025?')}><i className="ti ti-download"></i> Export</button>
        </div>
        <div className="panel-body">
          <div className="bar-row"><div className="bar-label">CGST Collected</div><div className="bar-track"><div className="bar-fill" style={{width:'60%',background:'var(--blue)'}}></div></div><div className="bar-val">₹8,400</div></div>
          <div className="bar-row"><div className="bar-label">SGST Collected</div><div className="bar-track"><div className="bar-fill" style={{width:'60%',background:'var(--blue)'}}></div></div><div className="bar-val">₹8,400</div></div>
          <div className="bar-row"><div className="bar-label">Input Tax Credit</div><div className="bar-track"><div className="bar-fill" style={{width:'25%',background:'var(--green)'}}></div></div><div className="bar-val">₹3,200</div></div>
          <div className="bar-row"><div className="bar-label" style={{fontWeight:500}}>Net GST Payable</div><div className="bar-track"><div className="bar-fill" style={{width:'45%',background:'var(--accent)'}}></div></div><div className="bar-val" style={{color:'var(--accent)'}}>₹13,600</div></div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><i className="ti ti-alert-triangle" style={{color:'var(--amber)'}}></i><h3>Vendor GST Warnings</h3></div>
        <div className="panel-body">
          <div className="alert-bar al-warn"><i className="ti ti-info-circle"></i> Raj Handicrafts — Composition 1%. Do NOT issue full GST invoice.</div>
          <div className="alert-bar al-warn"><i className="ti ti-info-circle"></i> Devi Arts — Composition 1%. Restricted invoicing rules apply.</div>
          <div className="alert-bar al-err"><i className="ti ti-alert-triangle"></i> Jaipur Pots — Unregistered. No ITC claimable on their goods.</div>
          <div className="alert-bar al-ok"><i className="ti ti-check"></i> Sharma Decors — Regular GST. Normal invoicing applies.</div>
        </div>
      </div>
    </div>
  )
}
