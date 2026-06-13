import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Settings() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div className="two-col">
      <div className="panel">
        <div className="panel-head"><h3>Business Rules</h3></div>
        <div className="panel-body">
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>Minimum Margin %</label><input type="number" className="form-input" defaultValue="15" style={{width:'130px'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>Dead Stock Warning (days)</label><input type="number" className="form-input" defaultValue="45" style={{width:'130px'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>Dead Stock Threshold (days)</label><input type="number" className="form-input" defaultValue="60" style={{width:'130px'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>Settlement Cycle (days)</label><input type="number" className="form-input" defaultValue="15" style={{width:'130px'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>First Delivery Advance %</label><input type="number" className="form-input" defaultValue="10" style={{width:'130px'}} /></div>
          <button className="btn btn-primary" style={{marginTop:'6px'}}><i className="ti ti-device-floppy"></i> Save Rules</button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>BB Store Identity</h3></div>
        <div className="panel-body">
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>Store Name</label><input type="text" className="form-input" defaultValue="BanjaraBazaar" /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>BB GSTIN</label><input type="text" className="form-input" defaultValue="27AABCB1234F1ZX" style={{fontFamily:'var(--fm)'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>UPI ID for Vendor Settlements</label><input type="text" className="form-input" defaultValue="banjarabazaar@upi" style={{fontFamily:'var(--fm)'}} /></div>
          <div style={{marginBottom:'12px'}}><label style={{fontSize:'12px',color:'var(--text3)',display:'block',marginBottom:'4px',fontFamily:'var(--fm)'}}>WhatsApp Business Number</label><input type="text" className="form-input" defaultValue="+91 98765 43210" style={{fontFamily:'var(--fm)'}} /></div>
          <button className="btn btn-primary" style={{marginTop:'6px'}}><i className="ti ti-device-floppy"></i> Save Identity</button>
        </div>
      </div>
    </div>
  )
}
