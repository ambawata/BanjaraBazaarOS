import { useContext } from 'react'
import { AppCtx } from '../App'

export default function ActiveProducts() {
  const { confirmAction, nav, openEditProduct } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search SKU or name..." /></div>
        <select className="fsel"><option>All Categories</option><option>BB-A</option><option>BB-F</option><option>BB-G</option><option>BB-C</option><option>BB-O</option></select>
        <select className="fsel"><option>All Status</option><option>Active</option><option>Warning</option><option>Dead Stock</option></select>
        <button className="btn btn-primary ml-auto" onClick={() => confirmAction('Print QR batch for all 4 active products? This will generate a printable QR sheet with SKU labels.')}><i className="ti ti-printer"></i> Print QR Batch</button>
      </div>
      <div className="panel" style={{margin:0}}>
        <table className="dt">
          <thead><tr><th>Product</th><th>SKU</th><th>Vendor</th><th>Base Price</th><th>Selling Price</th><th>Margin</th><th>Stock</th><th>Days</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr>
              <td><div style={{fontWeight:500}}>Bamboo Table Lamp</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-A · Section A2</div></td>
              <td className="mono">BB-A-00210</td><td>Raj Handicrafts</td><td className="mono">₹1,200</td><td className="mono">₹1,464</td>
              <td><span className="bp bp-active">22%</span></td><td>8</td><td>12</td><td><span className="bp bp-active">Active</span></td>
              <td><div style={{display:'flex',gap:'4px'}}>
                <button className="btn btn-sm" onClick={() => confirmAction('Print QR label for BB-A-00210 — Bamboo Table Lamp?')} title="Print QR"><i className="ti ti-qrcode"></i></button>
                <button className="btn btn-sm" onClick={() => openEditProduct('BB-A-00210','Bamboo Table Lamp','Raj Handicrafts',1200,1464,22,8,'A2','Active')} title="Edit"><i className="ti ti-edit"></i></button>
              </div></td>
            </tr>
            <tr>
              <td><div style={{fontWeight:500}}>Sheesham Bench</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-F · Section F1</div></td>
              <td className="mono">BB-F-00076</td><td>Sharma Decors</td><td className="mono">₹8,500</td><td className="mono">₹10,370</td>
              <td><span className="bp bp-active">18%</span></td><td>3</td><td>28</td><td><span className="bp bp-active">Active</span></td>
              <td><div style={{display:'flex',gap:'4px'}}>
                <button className="btn btn-sm" onClick={() => confirmAction('Print QR label for BB-F-00076 — Sheesham Bench?')} title="Print QR"><i className="ti ti-qrcode"></i></button>
                <button className="btn btn-sm" onClick={() => openEditProduct('BB-F-00076','Sheesham Bench','Sharma Decors',8500,10370,18,3,'F1','Active')} title="Edit"><i className="ti ti-edit"></i></button>
              </div></td>
            </tr>
            <tr>
              <td><div style={{fontWeight:500}}>Monstera 4ft</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-G · Section G3</div></td>
              <td className="mono">BB-G-00142</td><td>Devi Arts</td><td className="mono">₹2,400</td><td className="mono">₹3,000</td>
              <td><span className="bp bp-active">25%</span></td><td>2</td><td>44</td><td><span className="bp bp-pending">Warning</span></td>
              <td><div style={{display:'flex',gap:'4px'}}>
                <button className="btn btn-sm" onClick={() => confirmAction('Print QR label for BB-G-00142 — Monstera 4ft?')} title="Print QR"><i className="ti ti-qrcode"></i></button>
                <button className="btn btn-sm btn-danger" onClick={() => nav('dead-stock')} title="View Dead Stock Alert"><i className="ti ti-alert-triangle"></i></button>
              </div></td>
            </tr>
            <tr>
              <td><div style={{fontWeight:500}}>Garden Bench</div><div style={{fontSize:'11px',color:'var(--text3)'}}>BB-O · Section O1</div></td>
              <td className="mono">BB-O-00038</td><td>Nature Craft</td><td className="mono">₹12,000</td><td className="mono">₹14,400</td>
              <td><span className="bp bp-active">20%</span></td><td>1</td><td>63</td><td><span className="bp bp-red">Dead Stock</span></td>
              <td><div style={{display:'flex',gap:'4px'}}>
                <button className="btn btn-sm btn-danger" onClick={() => nav('dead-stock')} title="View Dead Stock"><i className="ti ti-clock-exclamation"></i></button>
                <button className="btn btn-sm" onClick={() => openEditProduct('BB-O-00038','Garden Bench','Nature Craft',12000,14400,20,1,'O1','Dead Stock')} title="Edit"><i className="ti ti-edit"></i></button>
              </div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
