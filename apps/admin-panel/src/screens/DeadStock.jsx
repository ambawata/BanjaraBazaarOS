import { useContext } from 'react'
import { AppCtx } from '../App'

export default function DeadStock() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="two-col" style={{marginBottom:'12px'}}>
        <div className="kpi-card kc-red"><div className="klabel">60+ Day Dead Stock</div><div className="kvalue">12</div><div className="ksub">Immediate action required</div></div>
        <div className="kpi-card kc-amber"><div className="klabel">45–59 Day Warning</div><div className="kvalue">8</div><div className="ksub">Monitor closely</div></div>
      </div>
      <div className="slbl" style={{color:'var(--red)'}}><i className="ti ti-clock-exclamation"></i> 60+ Day Dead Stock — Immediate Action Required</div>
      <div className="dead-grid">
        <div className="dead-card dc-red">
          <div className="dead-img"><i className="ti ti-armchair"></i></div>
          <div style={{flex:1}}>
            <span className="days-badge days-red">68 days unsold</span>
            <h4 style={{fontSize:'13px',fontWeight:500,marginBottom:'2px'}}>Outdoor Garden Bench</h4>
            <div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'4px'}}>Nature Craft · BB-O-00038</div>
            <div style={{fontSize:'12px',color:'var(--text3)',fontFamily:'var(--fm)'}}>Base: ₹12,000 · Section O1 · Qty: 1</div>
            <div className="dead-actions">
              <button className="btn btn-danger btn-sm" onClick={() => confirmAction('Request Pickup — status set to pickup_requested, inventory deducted, vendor notified.')}><i className="ti ti-truck"></i> Request Pickup</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Lower base price by 30% to ₹8,400? Admin will be notified and selling price auto-recalculated.')}><i className="ti ti-arrow-down"></i> Lower 30%</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Send reminder to Nature Craft about Outdoor Garden Bench (BB-O-00038)? Vendor will receive a WhatsApp + email notice.')}><i className="ti ti-send"></i> Remind</button>
            </div>
          </div>
        </div>
        <div className="dead-card dc-red">
          <div className="dead-img"><i className="ti ti-plant"></i></div>
          <div style={{flex:1}}>
            <span className="days-badge days-red">62 days unsold</span>
            <h4 style={{fontSize:'13px',fontWeight:500,marginBottom:'2px'}}>Monstera Artificial 6ft</h4>
            <div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'4px'}}>Devi Arts · BB-G-00118</div>
            <div style={{fontSize:'12px',color:'var(--text3)',fontFamily:'var(--fm)'}}>Base: ₹3,800 · Section G2 · Qty: 2</div>
            <div className="dead-actions">
              <button className="btn btn-danger btn-sm" onClick={() => confirmAction('Request Pickup for Monstera 6ft?')}><i className="ti ti-truck"></i> Request Pickup</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Lower base price by 30% to ₹2,660?')}><i className="ti ti-arrow-down"></i> Lower 30%</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Send reminder to Devi Arts about Monstera Artificial 6ft (BB-G-00118)?')}><i className="ti ti-send"></i> Remind</button>
            </div>
          </div>
        </div>
      </div>
      <div className="slbl" style={{color:'var(--amber)',marginTop:'16px'}}><i className="ti ti-clock"></i> 45–59 Day Warning</div>
      <div className="dead-grid">
        <div className="dead-card dc-amber">
          <div className="dead-img"><i className="ti ti-plant"></i></div>
          <div style={{flex:1}}>
            <span className="days-badge days-amber">52 days unsold</span>
            <h4 style={{fontSize:'13px',fontWeight:500,marginBottom:'2px'}}>Monstera Artificial 4ft</h4>
            <div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'4px'}}>Devi Arts · BB-G-00142</div>
            <div style={{fontSize:'12px',color:'var(--text3)',fontFamily:'var(--fm)'}}>Base: ₹2,400 · Section G3 · Qty: 2</div>
            <div className="dead-actions">
              <button className="btn btn-sm" onClick={() => confirmAction('Send 45-day warning to Devi Arts for Monstera 4ft (BB-G-00142)?')}><i className="ti ti-bell"></i> Send Warning</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Force markdown — reduce selling price of Monstera 4ft by 20% to ₹2,400?')}><i className="ti ti-tag"></i> Force Markdown</button>
            </div>
          </div>
        </div>
        <div className="dead-card dc-amber">
          <div className="dead-img"><i className="ti ti-layout-grid"></i></div>
          <div style={{flex:1}}>
            <span className="days-badge days-amber">48 days unsold</span>
            <h4 style={{fontSize:'13px',fontWeight:500,marginBottom:'2px'}}>Terracotta Wall Panel</h4>
            <div style={{fontSize:'12px',color:'var(--text2)',marginBottom:'4px'}}>Nature Craft · BB-A-00155</div>
            <div style={{fontSize:'12px',color:'var(--text3)',fontFamily:'var(--fm)'}}>Base: ₹5,500 · Section A4 · Qty: 1</div>
            <div className="dead-actions">
              <button className="btn btn-sm" onClick={() => confirmAction('Send 45-day warning to Nature Craft for Terracotta Wall Panel (BB-A-00155)?')}><i className="ti ti-bell"></i> Send Warning</button>
              <button className="btn btn-sm" onClick={() => confirmAction('Force markdown — reduce selling price of Terracotta Wall Panel by 20%?')}><i className="ti ti-tag"></i> Force Markdown</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
