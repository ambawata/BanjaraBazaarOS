export default function Customers() {
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="kpi-card"><div className="klabel">Total Customers</div><div className="kvalue">1,284</div></div>
        <div className="kpi-card kc-accent"><div className="klabel">Repeat Customers</div><div className="kvalue">342</div><div className="ksub">26.6% rate</div></div>
        <div className="kpi-card kc-green"><div className="klabel">Avg Ticket Size</div><div className="kvalue">₹3,840</div></div>
      </div>
      <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Customer</th><th>Phone</th><th>Total Spent</th><th>Visits</th><th>Loyalty Points</th><th>Last Visit</th></tr></thead><tbody>
        <tr><td>Neha Sharma</td><td className="mono">98765 43210</td><td className="mono">₹28,400</td><td>7</td><td style={{color:'var(--accent)'}}>284 pts</td><td style={{color:'var(--text3)',fontSize:'12px'}}>Today</td></tr>
        <tr><td>Rahul Mehta</td><td className="mono">87654 32109</td><td className="mono">₹14,200</td><td>4</td><td style={{color:'var(--accent)'}}>142 pts</td><td style={{color:'var(--text3)',fontSize:'12px'}}>3 days ago</td></tr>
        <tr><td>Sunita Patel</td><td className="mono">76543 21098</td><td className="mono">₹9,800</td><td>2</td><td style={{color:'var(--accent)'}}>98 pts</td><td style={{color:'var(--text3)',fontSize:'12px'}}>1 week ago</td></tr>
      </tbody></table></div>
    </div>
  )
}
