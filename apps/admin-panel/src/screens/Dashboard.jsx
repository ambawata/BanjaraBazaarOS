import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Dashboard() {
  const { confirmAction, nav } = useContext(AppCtx)
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        <div className="kpi-card kc-accent"><div className="klabel">Today Sales</div><div className="kvalue">₹42,800</div><div className="ksub">↑ 12% vs yesterday</div></div>
        <div className="kpi-card kc-green"><div className="klabel">Monthly Revenue</div><div className="kvalue">₹8.4L</div><div className="ksub">14 days remaining</div></div>
        <div className="kpi-card"><div className="klabel">Pending Approvals</div><div className="kvalue">7</div><div className="ksub">3 new today</div></div>
        <div className="kpi-card kc-red"><div className="klabel">Dead Stock</div><div className="kvalue">12</div><div className="ksub">4 need action</div></div>
        <div className="kpi-card"><div className="klabel">Active Vendors</div><div className="kvalue">24</div><div className="ksub">2 pending onboarding</div></div>
      </div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        <div className="kpi-card"><div className="klabel">Pending Settlements</div><div className="kvalue">₹1.2L</div><div className="ksub">Due in 3 days</div></div>
        <div className="kpi-card kc-green"><div className="klabel">BB Margin Today</div><div className="kvalue">₹9,800</div><div className="ksub">Avg 22.9%</div></div>
        <div className="kpi-card"><div className="klabel">Low Stock Alerts</div><div className="kvalue">8</div><div className="ksub">Restock needed</div></div>
        <div className="kpi-card"><div className="klabel">Active Staff</div><div className="kvalue">6/8</div><div className="ksub">2 on leave</div></div>
        <div className="kpi-card"><div className="klabel">Cash in Drawer</div><div className="kvalue">₹14,200</div><div className="ksub">Reconciled 9am</div></div>
      </div>
      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><i className="ti ti-activity" style={{color:'var(--accent)'}}></i><h3>Live Sales Feed</h3><span style={{marginLeft:'auto',fontSize:'11px',color:'var(--text3)',fontFamily:'var(--fm)'}}>2min ago</span></div>
          <div style={{padding:'8px 16px'}}>
            <div className="feed-row"><div className="feed-dot" style={{background:'var(--green)'}}></div><span className="mono">INV-2847</span><span style={{flex:1,padding:'0 8px',color:'var(--text2)'}}>Fiber Ganesha Statue</span><span style={{color:'var(--text2)'}}>Priya S.</span><span style={{fontFamily:'var(--fm)',color:'var(--accent)',marginLeft:'8px'}}>₹3,200</span><span className="bp bp-active" style={{marginLeft:'6px',fontSize:'10px'}}>UPI</span></div>
            <div className="feed-row"><div className="feed-dot" style={{background:'var(--green)'}}></div><span className="mono">INV-2846</span><span style={{flex:1,padding:'0 8px',color:'var(--text2)'}}>Ceramic Planter Set</span><span style={{color:'var(--text2)'}}>Amit R.</span><span style={{fontFamily:'var(--fm)',color:'var(--accent)',marginLeft:'8px'}}>₹1,450</span><span className="bp bp-blue" style={{marginLeft:'6px',fontSize:'10px'}}>Card</span></div>
            <div className="feed-row"><div className="feed-dot" style={{background:'var(--amber)'}}></div><span className="mono">INV-2845</span><span style={{flex:1,padding:'0 8px',color:'var(--text2)'}}>Teak Wood Chair</span><span style={{color:'var(--text2)'}}>Priya S.</span><span style={{fontFamily:'var(--fm)',color:'var(--accent)',marginLeft:'8px'}}>₹8,500</span><span className="bp bp-gray" style={{marginLeft:'6px',fontSize:'10px'}}>Cash</span></div>
            <div className="feed-row"><div className="feed-dot" style={{background:'var(--green)'}}></div><span className="mono">INV-2844</span><span style={{flex:1,padding:'0 8px',color:'var(--text2)'}}>Wall Macrame</span><span style={{color:'var(--text2)'}}>Ravi K.</span><span style={{fontFamily:'var(--fm)',color:'var(--accent)',marginLeft:'8px'}}>₹2,100</span><span className="bp bp-active" style={{marginLeft:'6px',fontSize:'10px'}}>UPI</span></div>
            <div className="feed-row"><div className="feed-dot" style={{background:'var(--green)'}}></div><span className="mono">INV-2843</span><span style={{flex:1,padding:'0 8px',color:'var(--text2)'}}>Outdoor Planter</span><span style={{color:'var(--text2)'}}>Amit R.</span><span style={{fontFamily:'var(--fm)',color:'var(--accent)',marginLeft:'8px'}}>₹4,800</span><span className="bp bp-active" style={{marginLeft:'6px',fontSize:'10px'}}>UPI</span></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><i className="ti ti-bell-exclamation" style={{color:'var(--red)'}}></i><h3>Alerts Center</h3></div>
          <div style={{padding:'8px 16px'}}>
            <div className="alert-bar al-err"><i className="ti ti-clock-exclamation"></i> 4 products crossed 60-day dead stock threshold</div>
            <div className="alert-bar al-warn"><i className="ti ti-clock"></i> 8 products approaching 45-day warning</div>
            <div className="alert-bar al-warn"><i className="ti ti-truck"></i> 2 pickup requests unassigned for 48hrs</div>
            <div className="alert-bar al-info"><i className="ti ti-checks"></i> 7 products awaiting approval in queue</div>
            <div className="alert-bar al-info"><i className="ti ti-credit-card"></i> Settlement cycle due in 3 days — ₹1.2L pending</div>
            <div className="alert-bar al-ok"><i className="ti ti-check"></i> Daily backup completed at 3:00 AM</div>
          </div>
        </div>
      </div>
      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><i className="ti ti-chart-bar" style={{color:'var(--blue)'}}></i><h3>Weekly Sales by Category</h3></div>
          <div className="panel-body">
            <div className="bar-row"><div className="bar-label">Home Decor (BB-A)</div><div className="bar-track"><div className="bar-fill" style={{width:'82%',background:'var(--accent)'}}></div></div><div className="bar-val">₹1,24,000</div></div>
            <div className="bar-row"><div className="bar-label">Furniture (BB-F)</div><div className="bar-track"><div className="bar-fill" style={{width:'65%',background:'var(--blue)'}}></div></div><div className="bar-val">₹98,500</div></div>
            <div className="bar-row"><div className="bar-label">Fiber Statue (BB-P)</div><div className="bar-track"><div className="bar-fill" style={{width:'55%',background:'var(--purple)'}}></div></div><div className="bar-val">₹83,200</div></div>
            <div className="bar-row"><div className="bar-label">Crockery (BB-C)</div><div className="bar-track"><div className="bar-fill" style={{width:'42%',background:'var(--green)'}}></div></div><div className="bar-val">₹63,700</div></div>
            <div className="bar-row"><div className="bar-label">Furnishing (BB-T)</div><div className="bar-track"><div className="bar-fill" style={{width:'35%',background:'var(--blue)'}}></div></div><div className="bar-val">₹53,100</div></div>
            <div className="bar-row"><div className="bar-label">Outdoor (BB-O)</div><div className="bar-track"><div className="bar-fill" style={{width:'28%',background:'var(--green)'}}></div></div><div className="bar-val">₹42,800</div></div>
            <div className="bar-row"><div className="bar-label">Art Plants (BB-G)</div><div className="bar-track"><div className="bar-fill" style={{width:'18%',background:'var(--amber)'}}></div></div><div className="bar-val">₹27,200</div></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><i className="ti ti-users" style={{color:'var(--green)'}}></i><h3>Staff Status</h3></div>
          <div style={{padding:'8px 16px'}}>
            <div className="staff-row"><div className="savatar" style={{background:'var(--green-dim)',color:'var(--green)'}}>PS</div><div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:500}}>Priya Sharma</div><div style={{fontSize:'11px',color:'var(--text3)'}}>Senior Staff · Floor 1</div></div><span className="bp bp-active">Checked In</span></div>
            <div className="staff-row"><div className="savatar" style={{background:'var(--green-dim)',color:'var(--green)'}}>AR</div><div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:500}}>Amit Rao</div><div style={{fontSize:'11px',color:'var(--text3)'}}>Cashier · POS</div></div><span className="bp bp-active">Checked In</span></div>
            <div className="staff-row"><div className="savatar" style={{background:'var(--amber-dim)',color:'var(--amber)'}}>RK</div><div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:500}}>Ravi Kumar</div><div style={{fontSize:'11px',color:'var(--text3)'}}>Floor Staff</div></div><span className="bp bp-pending">On Break</span></div>
            <div className="staff-row"><div className="savatar" style={{background:'var(--green-dim)',color:'var(--green)'}}>MS</div><div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:500}}>Meena Singh</div><div style={{fontSize:'11px',color:'var(--text3)'}}>Floor Staff · Floor 2</div></div><span className="bp bp-active">Checked In</span></div>
            <div className="staff-row"><div className="savatar" style={{background:'var(--red-dim)',color:'var(--red)'}}>VT</div><div style={{flex:1}}><div style={{fontSize:'13px',fontWeight:500}}>Vinod Tiwari</div><div style={{fontSize:'11px',color:'var(--text3)'}}>Warehouse</div></div><span className="bp bp-red">Leave</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
