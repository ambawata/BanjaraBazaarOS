import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Sales() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi-card kc-accent"><div className="klabel">Today Revenue</div><div className="kvalue">₹42,800</div><div className="ksub">14 transactions</div></div>
        <div className="kpi-card"><div className="klabel">UPI</div><div className="kvalue">₹28,400</div><div className="ksub">66%</div></div>
        <div className="kpi-card"><div className="klabel">Cash</div><div className="kvalue">₹9,800</div><div className="ksub">23%</div></div>
        <div className="kpi-card"><div className="klabel">Card</div><div className="kvalue">₹4,600</div><div className="ksub">11%</div></div>
      </div>
      <div className="panel" style={{margin:0}}>
        <div className="panel-head"><i className="ti ti-receipt" style={{color:'var(--accent)'}}></i><h3>Today's Transactions</h3>
          <button className="btn btn-sm ml-auto" onClick={() => confirmAction("Export today's transactions as CSV?")}><i className="ti ti-file-spreadsheet"></i> Export</button>
        </div>
        <table className="dt"><thead><tr><th>Invoice</th><th>Time</th><th>Product</th><th>Staff</th><th>Amount</th><th>Mode</th><th>BB Margin</th></tr></thead><tbody>
          <tr><td className="mono">INV-2847</td><td style={{color:'var(--text3)',fontSize:'12px'}}>11:42 AM</td><td>Fiber Ganesha Statue</td><td>Priya S.</td><td className="mono">₹3,200</td><td><span className="bp bp-active">UPI</span></td><td className="mono" style={{color:'var(--accent)'}}>₹640</td></tr>
          <tr><td className="mono">INV-2846</td><td style={{color:'var(--text3)',fontSize:'12px'}}>11:18 AM</td><td>Ceramic Planter Set</td><td>Amit R.</td><td className="mono">₹1,450</td><td><span className="bp bp-blue">Card</span></td><td className="mono" style={{color:'var(--accent)'}}>₹290</td></tr>
          <tr><td className="mono">INV-2845</td><td style={{color:'var(--text3)',fontSize:'12px'}}>10:55 AM</td><td>Teak Wood Chair</td><td>Priya S.</td><td className="mono">₹8,500</td><td><span className="bp bp-gray">Cash</span></td><td className="mono" style={{color:'var(--accent)'}}>₹1,530</td></tr>
          <tr><td className="mono">INV-2844</td><td style={{color:'var(--text3)',fontSize:'12px'}}>10:22 AM</td><td>Wall Macrame</td><td>Ravi K.</td><td className="mono">₹2,100</td><td><span className="bp bp-active">UPI</span></td><td className="mono" style={{color:'var(--accent)'}}>₹420</td></tr>
        </tbody></table>
      </div>
    </div>
  )
}
