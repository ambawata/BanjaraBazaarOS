export default function CashFlow() {
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi-card kc-green"><div className="klabel">Inflow This Month</div><div className="kvalue">₹8,42,000</div></div>
        <div className="kpi-card kc-red"><div className="klabel">Outflow This Month</div><div className="kvalue">₹2,08,400</div></div>
        <div className="kpi-card kc-accent"><div className="klabel">Net Cash Flow</div><div className="kvalue">₹6,33,600</div></div>
        <div className="kpi-card"><div className="klabel">Bank Balance</div><div className="kvalue">₹2,14,800</div><div className="ksub">As of today</div></div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Cash Flow Breakdown</h3><button className="btn btn-sm ml-auto"><i className="ti ti-download"></i> Export</button></div>
        <div className="panel-body">
          <div className="bar-row"><div className="bar-label">Product Sales (in)</div><div className="bar-track"><div className="bar-fill" style={{width:'100%',background:'var(--green)'}}></div></div><div className="bar-val">₹8,42,000</div></div>
          <div className="bar-row"><div className="bar-label">Vendor Payouts (out)</div><div className="bar-track"><div className="bar-fill" style={{width:'65%',background:'var(--red)'}}></div></div><div className="bar-val">−₹1,24,200</div></div>
          <div className="bar-row"><div className="bar-label">Operating Expenses</div><div className="bar-track"><div className="bar-fill" style={{width:'40%',background:'var(--red)'}}></div></div><div className="bar-val">−₹84,200</div></div>
          <div className="bar-row"><div className="bar-label">GST Payable</div><div className="bar-track"><div className="bar-fill" style={{width:'18%',background:'var(--amber)'}}></div></div><div className="bar-val">−₹13,600</div></div>
        </div>
      </div>
    </div>
  )
}
