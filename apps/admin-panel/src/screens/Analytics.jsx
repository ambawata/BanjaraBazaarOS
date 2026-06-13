import { useState } from 'react'

export default function Analytics() {
  const [tab, setTab] = useState('an-sales')
  return (
    <div>
      <div className="tabs">
        <div className={`tab-btn${tab==='an-sales'?' active':''}`} onClick={() => setTab('an-sales')}>Sales</div>
        <div className={`tab-btn${tab==='an-vendor'?' active':''}`} onClick={() => setTab('an-vendor')}>Vendors</div>
        <div className={`tab-btn${tab==='an-inventory'?' active':''}`} onClick={() => setTab('an-inventory')}>Inventory</div>
        <div className={`tab-btn${tab==='an-staff'?' active':''}`} onClick={() => setTab('an-staff')}>Staff</div>
      </div>
      {tab === 'an-sales' && (
        <div>
          <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
            <div className="kpi-card kc-accent"><div className="klabel">Monthly Revenue</div><div className="kvalue">₹8.4L</div></div>
            <div className="kpi-card kc-green"><div className="klabel">BB Profit</div><div className="kvalue">₹1.84L</div><div className="ksub">21.9% avg margin</div></div>
            <div className="kpi-card"><div className="klabel">Transactions</div><div className="kvalue">284</div></div>
            <div className="kpi-card"><div className="klabel">Avg Ticket</div><div className="kvalue">₹2,958</div></div>
          </div>
          <div className="panel"><div className="panel-head"><h3>Revenue by Category</h3></div><div className="panel-body">
            <div className="bar-row"><div className="bar-label">Home Decor (BB-A)</div><div className="bar-track"><div className="bar-fill" style={{width:'82%',background:'var(--accent)'}}></div></div><div className="bar-val">₹1,24,000</div></div>
            <div className="bar-row"><div className="bar-label">Furniture (BB-F)</div><div className="bar-track"><div className="bar-fill" style={{width:'65%',background:'var(--blue)'}}></div></div><div className="bar-val">₹98,500</div></div>
            <div className="bar-row"><div className="bar-label">Fiber Statue (BB-P)</div><div className="bar-track"><div className="bar-fill" style={{width:'55%',background:'var(--purple)'}}></div></div><div className="bar-val">₹83,200</div></div>
            <div className="bar-row"><div className="bar-label">Crockery (BB-C)</div><div className="bar-track"><div className="bar-fill" style={{width:'42%',background:'var(--green)'}}></div></div><div className="bar-val">₹63,700</div></div>
            <div className="bar-row"><div className="bar-label">Furnishing (BB-T)</div><div className="bar-track"><div className="bar-fill" style={{width:'35%',background:'var(--blue)'}}></div></div><div className="bar-val">₹53,100</div></div>
          </div></div>
        </div>
      )}
      {tab === 'an-vendor' && (
        <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Vendor</th><th>Total Sales</th><th>Dead Stock %</th><th>Return Rate</th><th>Avg Margin</th><th>Score</th></tr></thead><tbody>
          <tr><td><b>Sharma Decors</b></td><td className="mono">₹64,500</td><td style={{color:'var(--green)'}}>0%</td><td style={{color:'var(--green)'}}>0.4%</td><td className="mono">18%</td><td style={{color:'var(--green)'}}>★ 4.8</td></tr>
          <tr><td><b>Raj Handicrafts</b></td><td className="mono">₹48,200</td><td style={{color:'var(--amber)'}}>5%</td><td style={{color:'var(--green)'}}>0.8%</td><td className="mono">22%</td><td style={{color:'var(--green)'}}>★ 4.6</td></tr>
          <tr><td><b>Devi Arts</b></td><td className="mono">₹28,400</td><td style={{color:'var(--red)'}}>14%</td><td style={{color:'var(--amber)'}}>2.1%</td><td className="mono">25%</td><td style={{color:'var(--amber)'}}>★ 3.9</td></tr>
        </tbody></table></div>
      )}
      {tab === 'an-inventory' && (
        <div className="two-col">
          <div className="panel"><div className="panel-head"><h3>Fast Movers</h3></div><div className="panel-body">
            <div className="bar-row"><div className="bar-label">Fiber Ganesha</div><div className="bar-track"><div className="bar-fill" style={{width:'90%',background:'var(--green)'}}></div></div><div className="bar-val">24 sold</div></div>
            <div className="bar-row"><div className="bar-label">Ceramic Mugs</div><div className="bar-track"><div className="bar-fill" style={{width:'78%',background:'var(--green)'}}></div></div><div className="bar-val">18 sold</div></div>
            <div className="bar-row"><div className="bar-label">Bamboo Lamp</div><div className="bar-track"><div className="bar-fill" style={{width:'65%',background:'var(--green)'}}></div></div><div className="bar-val">14 sold</div></div>
          </div></div>
          <div className="panel"><div className="panel-head"><h3>Slow Movers</h3></div><div className="panel-body">
            <div className="bar-row"><div className="bar-label">Garden Bench</div><div className="bar-track"><div className="bar-fill" style={{width:'5%',background:'var(--red)'}}></div></div><div className="bar-val">0 sold</div></div>
            <div className="bar-row"><div className="bar-label">Monstera 6ft</div><div className="bar-track"><div className="bar-fill" style={{width:'12%',background:'var(--amber)'}}></div></div><div className="bar-val">1 sold</div></div>
            <div className="bar-row"><div className="bar-label">Wall Panel</div><div className="bar-track"><div className="bar-fill" style={{width:'15%',background:'var(--amber)'}}></div></div><div className="bar-val">1 sold</div></div>
          </div></div>
        </div>
      )}
      {tab === 'an-staff' && (
        <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Staff</th><th>Sales Contribution</th><th>Transactions</th><th>Attendance</th><th>Damage Reports</th></tr></thead><tbody>
          <tr><td><b>Priya Sharma</b></td><td className="mono" style={{color:'var(--green)'}}>₹18,400</td><td>8</td><td style={{color:'var(--green)'}}>92%</td><td>0</td></tr>
          <tr><td><b>Meena Singh</b></td><td className="mono">₹12,200</td><td>6</td><td style={{color:'var(--green)'}}>88%</td><td>1</td></tr>
          <tr><td><b>Ravi Kumar</b></td><td className="mono">₹8,400</td><td>4</td><td style={{color:'var(--amber)'}}>80%</td><td>0</td></tr>
        </tbody></table></div>
      )}
    </div>
  )
}
