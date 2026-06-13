import { useContext } from 'react'
import { AppCtx } from '../App'

export default function InventoryScreen() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi-card kc-green"><div className="klabel">Active Stock</div><div className="kvalue">847</div><div className="ksub">units on floor</div></div>
        <div className="kpi-card"><div className="klabel">Reserved</div><div className="kvalue">34</div></div>
        <div className="kpi-card kc-red"><div className="klabel">Damaged</div><div className="kvalue">12</div></div>
        <div className="kpi-card"><div className="klabel">Pickup Pending</div><div className="kvalue">8</div></div>
      </div>
      <div className="panel" style={{margin:0}}>
        <div className="panel-head"><i className="ti ti-box" style={{color:'var(--blue)'}}></i><h3>Live Inventory</h3>
          <div className="ml-auto" style={{display:'flex',gap:'8px'}}>
            <button className="btn btn-sm"><i className="ti ti-qrcode"></i> Scan QR</button>
            <button className="btn btn-primary btn-sm" onClick={() => confirmAction('Start inventory audit?')}><i className="ti ti-clipboard-check"></i> Start Audit</button>
          </div>
        </div>
        <table className="dt"><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Vendor</th><th>Section</th><th>Stock</th><th>Days</th><th>State</th></tr></thead><tbody>
          <tr><td className="mono">BB-A-00210</td><td>Bamboo Table Lamp</td><td>BB-A</td><td>Raj Handicrafts</td><td>A2</td><td>8</td><td>12</td><td><span className="bp bp-active">Active</span></td></tr>
          <tr><td className="mono">BB-F-00076</td><td>Sheesham Bench</td><td>BB-F</td><td>Sharma Decors</td><td>F1</td><td>3</td><td>28</td><td><span className="bp bp-active">Active</span></td></tr>
          <tr><td className="mono">BB-G-00142</td><td>Monstera 4ft</td><td>BB-G</td><td>Devi Arts</td><td>G3</td><td>2</td><td>44</td><td><span className="bp bp-pending">Warning</span></td></tr>
          <tr><td className="mono">BB-O-00038</td><td>Garden Bench</td><td>BB-O</td><td>Nature Craft</td><td>O1</td><td>1</td><td>63</td><td><span className="bp bp-red">Dead Stock</span></td></tr>
        </tbody></table>
      </div>
    </div>
  )
}
