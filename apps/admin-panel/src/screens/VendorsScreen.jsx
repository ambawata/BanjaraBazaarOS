import { useContext } from 'react'
import { AppCtx } from '../App'

export default function VendorsScreen() {
  const { confirmAction, nav } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search vendor..." /></div>
        <select className="fsel"><option>All Status</option><option>Active</option><option>Suspended</option><option>Onboarding</option></select>
        <select className="fsel"><option>All GST Types</option><option>Regular</option><option>Composition 1%</option><option>Unregistered</option></select>
        <button className="btn btn-primary ml-auto" onClick={() => confirmAction('Add new vendor — you will need: vendor name, GST type, GSTIN (if applicable), phone, email, bank/UPI details, and security deposit amount.')}><i className="ti ti-user-plus"></i> Add Vendor</button>
      </div>
      <div className="panel" style={{margin:0}}>
        <table className="dt"><thead><tr><th>Vendor</th><th>BB Code</th><th>GST Type</th><th>Security Dep.</th><th>Advance Paid</th><th>Advance Remaining</th><th>Products</th><th>Score</th><th>Status</th><th>Action</th></tr></thead><tbody>
          <tr>
            <td><div style={{fontWeight:500}}>Raj Handicrafts</div><div style={{fontSize:'11px',color:'var(--text3)'}}>rajendra.k@gmail.com</div></td>
            <td className="mono">RH-001</td><td><span className="comp-flag">COMP 1%</span></td><td className="mono">₹10,000</td>
            <td className="mono" style={{color:'var(--amber)'}}>₹5,000</td><td className="mono" style={{color:'var(--red)'}}>₹2,600 left</td>
            <td>18</td><td style={{color:'var(--green)'}}>★ 4.8</td><td><span className="bp bp-active">Active</span></td>
            <td><button className="btn btn-sm" onClick={() => nav('settlements')}>Settle</button></td>
          </tr>
          <tr>
            <td><div style={{fontWeight:500}}>Sharma Decors</div><div style={{fontSize:'11px',color:'var(--text3)'}}>sharma.decors@gmail.com</div></td>
            <td className="mono">SD-002</td><td><span className="bp bp-active" style={{fontSize:'10px'}}>Regular</span></td><td className="mono">₹15,000</td>
            <td className="mono" style={{color:'var(--amber)'}}>₹8,500</td><td className="mono" style={{color:'var(--green)'}}>Fully recovered</td>
            <td>12</td><td style={{color:'var(--green)'}}>★ 4.6</td><td><span className="bp bp-active">Active</span></td>
            <td><button className="btn btn-sm" onClick={() => nav('settlements')}>Settle</button></td>
          </tr>
          <tr>
            <td><div style={{fontWeight:500}}>Devi Arts</div><div style={{fontSize:'11px',color:'var(--text3)'}}>deviarts@yahoo.com</div></td>
            <td className="mono">DA-003</td><td><span className="comp-flag">COMP 1%</span></td><td className="mono">₹10,000</td>
            <td className="mono" style={{color:'var(--amber)'}}>₹4,000</td><td className="mono" style={{color:'var(--green)'}}>Fully recovered</td>
            <td>9</td><td style={{color:'var(--amber)'}}>★ 3.9</td><td><span className="bp bp-active">Active</span></td>
            <td><button className="btn btn-sm" onClick={() => nav('settlements')}>Settle</button></td>
          </tr>
          <tr>
            <td><div style={{fontWeight:500}}>Nature Craft</div><div style={{fontSize:'11px',color:'var(--text3)'}}>naturecraft@gmail.com</div></td>
            <td className="mono">NC-004</td><td><span className="bp bp-gray" style={{fontSize:'10px'}}>Unregistered</span></td><td className="mono">₹5,000</td>
            <td className="mono">₹0</td><td className="mono" style={{color:'var(--green)'}}>No advance</td>
            <td>7</td><td style={{color:'var(--amber)'}}>★ 3.5</td><td><span className="bp bp-pending">Review</span></td>
            <td><button className="btn btn-sm" onClick={() => confirmAction('View full profile for Nature Craft (NC-004)? Vendor is under review — 2 dead stock items, score 3.5.')}>View</button></td>
          </tr>
        </tbody></table>
      </div>
    </div>
  )
}
