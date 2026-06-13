import { useState, useContext } from 'react'
import { AppCtx } from '../App'

export default function Negotiations() {
  const { confirmAction } = useContext(AppCtx)
  const [tab, setTab] = useState('neg-waiting')
  return (
    <div>
      <div className="tabs">
        <div className={`tab-btn${tab==='neg-waiting'?' active':''}`} onClick={() => setTab('neg-waiting')}>Waiting Response <span className="bp bp-pending" style={{marginLeft:'4px',fontSize:'10px'}}>4</span></div>
        <div className={`tab-btn${tab==='neg-rejected'?' active':''}`} onClick={() => setTab('neg-rejected')}>Vendor Rejected <span className="bp bp-red" style={{marginLeft:'4px',fontSize:'10px'}}>2</span></div>
        <div className={`tab-btn${tab==='neg-accepted'?' active':''}`} onClick={() => setTab('neg-accepted')}>Accepted <span className="bp bp-active" style={{marginLeft:'4px',fontSize:'10px'}}>8</span></div>
      </div>
      {tab === 'neg-waiting' && (
        <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Product</th><th>Vendor</th><th>Original Base</th><th>Counter Sent</th><th>Margin</th><th>Sent</th><th>Status</th><th>Action</th></tr></thead><tbody>
          <tr><td><div style={{fontWeight:500}}>Rattan Basket Set</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A-00188</div></td><td>Raj Handicrafts</td><td className="mono">₹2,800</td><td className="mono" style={{color:'var(--accent)'}}>₹2,500</td><td><span className="bp bp-active">20%</span></td><td style={{color:'var(--text3)',fontSize:'12px'}}>2 days ago</td><td><span className="bp bp-pending">Awaiting</span></td><td><button className="btn btn-sm" onClick={() => confirmAction('Revise counter offer for Rattan Basket Set (BB-A-00188) sent to Raj Handicrafts?')}>Revise</button></td></tr>
          <tr><td><div style={{fontWeight:500}}>Wall Mirror Ornate</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A-00192</div></td><td>Devi Arts</td><td className="mono">₹4,200</td><td className="mono" style={{color:'var(--accent)'}}>₹3,800</td><td><span className="bp bp-active">22%</span></td><td style={{color:'var(--text3)',fontSize:'12px'}}>3 days ago</td><td><span className="bp bp-pending">Awaiting</span></td><td><button className="btn btn-sm" onClick={() => confirmAction('Revise counter offer for Wall Mirror Ornate (BB-A-00192) sent to Devi Arts?')}>Revise</button></td></tr>
        </tbody></table></div>
      )}
      {tab === 'neg-rejected' && (
        <div>
          <div className="alert-bar al-err" style={{marginBottom:'12px'}}><i className="ti ti-info-circle"></i> These vendors rejected your counter. You can revise or approve at original price.</div>
          <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Product</th><th>Vendor</th><th>Original Base</th><th>Counter Sent</th><th>Vendor Reason</th><th>Action</th></tr></thead><tbody>
            <tr><td><div style={{fontWeight:500}}>Terracotta Pot Large</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A-00177</div></td><td>Nature Craft</td><td className="mono">₹1,800</td><td className="mono" style={{color:'var(--red)'}}>₹1,500</td><td style={{color:'var(--text3)',fontSize:'12px'}}>Price too low</td><td><div style={{display:'flex',gap:'6px'}}><button className="btn btn-success btn-sm">Approve Original</button><button className="btn btn-sm">New Counter</button></div></td></tr>
          </tbody></table></div>
        </div>
      )}
      {tab === 'neg-accepted' && (
        <div>
          <div className="alert-bar al-ok" style={{marginBottom:'12px'}}><i className="ti ti-check"></i> These products are approved and ready for staff receiving.</div>
          <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Product</th><th>Vendor</th><th>Final Base</th><th>Final Selling</th><th>Margin</th><th>Accepted</th><th>Status</th></tr></thead><tbody>
            <tr><td><div style={{fontWeight:500}}>Brass Diya Set of 6</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A-00201</div></td><td>Raj Handicrafts</td><td className="mono">₹1,100</td><td className="mono" style={{color:'var(--accent)'}}>₹1,342</td><td><span className="bp bp-active">22%</span></td><td style={{color:'var(--text3)',fontSize:'12px'}}>Today</td><td><span className="bp bp-blue">Pending Delivery</span></td></tr>
            <tr><td><div style={{fontWeight:500}}>Jute Wall Art 3pc</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A-00204</div></td><td>Devi Arts</td><td className="mono">₹2,200</td><td className="mono" style={{color:'var(--accent)'}}>₹2,750</td><td><span className="bp bp-active">20%</span></td><td style={{color:'var(--text3)',fontSize:'12px'}}>Yesterday</td><td><span className="bp bp-blue">Pending Delivery</span></td></tr>
          </tbody></table></div>
        </div>
      )}
    </div>
  )
}
