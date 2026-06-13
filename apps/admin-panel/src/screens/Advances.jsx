import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Advances() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="alert-bar al-info" style={{marginBottom:'16px'}}><i className="ti ti-info-circle"></i> Advance = BB pays vendor 10% of first delivery value upfront. It is recovered gradually across future settlements.</div>
      <div className="panel">
        <div className="panel-head"><i className="ti ti-coin" style={{color:'var(--amber)'}}></i><h3>Advance Ledger — All Vendors</h3>
          <button className="btn btn-primary btn-sm ml-auto" onClick={() => confirmAction('Record new advance payment — select vendor, enter amount paid, and delivery reference.')}><i className="ti ti-plus"></i> Record New Advance</button>
        </div>
        <table className="dt"><thead><tr><th>Vendor</th><th>Advance Paid by BB</th><th>Total Recovered</th><th>Remaining</th><th>Recovery Progress</th><th>Status</th></tr></thead><tbody>
          <tr><td><b>Raj Handicrafts</b></td><td className="mono" style={{color:'var(--amber)'}}>₹5,000</td><td className="mono" style={{color:'var(--green)'}}>₹2,400</td><td className="mono" style={{color:'var(--red)'}}>₹2,600</td>
            <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'100px'}}><div className="bar-fill" style={{width:'48%',background:'var(--amber)'}}></div></div><span style={{fontSize:'11px',fontFamily:'var(--fm)'}}>48%</span></div></td>
            <td><span className="bp bp-pending">Recovering</span></td>
          </tr>
          <tr><td><b>Sharma Decors</b></td><td className="mono" style={{color:'var(--amber)'}}>₹8,500</td><td className="mono" style={{color:'var(--green)'}}>₹8,500</td><td className="mono" style={{color:'var(--green)'}}>₹0</td>
            <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'100px'}}><div className="bar-fill" style={{width:'100%',background:'var(--green)'}}></div></div><span style={{fontSize:'11px',fontFamily:'var(--fm)'}}>100%</span></div></td>
            <td><span className="bp bp-active">Recovered</span></td>
          </tr>
          <tr><td><b>Devi Arts</b></td><td className="mono" style={{color:'var(--amber)'}}>₹4,000</td><td className="mono" style={{color:'var(--green)'}}>₹4,000</td><td className="mono" style={{color:'var(--green)'}}>₹0</td>
            <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'100px'}}><div className="bar-fill" style={{width:'100%',background:'var(--green)'}}></div></div><span style={{fontSize:'11px',fontFamily:'var(--fm)'}}>100%</span></div></td>
            <td><span className="bp bp-active">Recovered</span></td>
          </tr>
          <tr><td><b>Nature Craft</b></td><td className="mono">₹0</td><td className="mono">₹0</td><td className="mono">₹0</td>
            <td style={{color:'var(--text3)',fontSize:'12px'}}>—</td><td><span className="bp bp-gray">No Advance</span></td>
          </tr>
        </tbody></table>
      </div>
    </div>
  )
}
