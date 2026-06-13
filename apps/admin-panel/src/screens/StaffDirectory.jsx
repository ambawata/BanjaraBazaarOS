import { useContext } from 'react'
import { AppCtx } from '../App'

export default function StaffDirectory() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <select className="fsel"><option>All Roles</option><option>Admin</option><option>Senior Staff</option><option>Floor Staff</option><option>Cashier</option><option>Warehouse</option></select>
        <button className="btn btn-primary ml-auto" onClick={() => confirmAction('Add new staff member — this will open the staff onboarding form.')}><i className="ti ti-user-plus"></i> Add Staff</button>
      </div>
      <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Staff</th><th>Role</th><th>Shift</th><th>Today</th><th>Sales This Month</th><th>Attendance</th><th>Action</th></tr></thead><tbody>
        <tr>
          <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="savatar" style={{background:'var(--green-dim)',color:'var(--green)',width:'28px',height:'28px',fontSize:'11px'}}>PS</div><div><div style={{fontWeight:500}}>Priya Sharma</div><div style={{fontSize:'11px',color:'var(--text3)'}}>priya@bb.com</div></div></div></td>
          <td><span className="bp bp-blue">Senior Staff</span></td><td>9am–6pm</td><td><span className="bp bp-active">In</span></td><td className="mono">₹18,400</td>
          <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'70px'}}><div className="bar-fill" style={{width:'92%',background:'var(--green)'}}></div></div><span style={{fontSize:'11px'}}>92%</span></div></td>
          <td><button className="btn btn-sm" onClick={() => confirmAction('Priya Sharma · Senior Staff · Floor 1\nCheck-in: 9:02 AM · Attendance: 92% · Sales this month: ₹18,400 · Damage reports: 0')}>View</button></td>
        </tr>
        <tr>
          <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="savatar" style={{background:'var(--blue-dim)',color:'var(--blue)',width:'28px',height:'28px',fontSize:'11px'}}>AR</div><div><div style={{fontWeight:500}}>Amit Rao</div><div style={{fontSize:'11px',color:'var(--text3)'}}>amit@bb.com</div></div></div></td>
          <td><span className="bp bp-gray">Cashier</span></td><td>10am–7pm</td><td><span className="bp bp-active">In</span></td><td className="mono">₹0</td>
          <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'70px'}}><div className="bar-fill" style={{width:'88%',background:'var(--green)'}}></div></div><span style={{fontSize:'11px'}}>88%</span></div></td>
          <td><button className="btn btn-sm" onClick={() => confirmAction('Amit Rao · Cashier · POS Station\nCheck-in: 10:05 AM · Attendance: 88%')}>View</button></td>
        </tr>
        <tr>
          <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="savatar" style={{background:'var(--red-dim)',color:'var(--red)',width:'28px',height:'28px',fontSize:'11px'}}>VT</div><div><div style={{fontWeight:500}}>Vinod Tiwari</div><div style={{fontSize:'11px',color:'var(--text3)'}}>vinod@bb.com</div></div></div></td>
          <td><span className="bp bp-gray">Warehouse</span></td><td>8am–5pm</td><td><span className="bp bp-red">Leave</span></td><td className="mono">₹0</td>
          <td><div style={{display:'flex',alignItems:'center',gap:'6px'}}><div className="bar-track" style={{width:'70px'}}><div className="bar-fill" style={{width:'74%',background:'var(--amber)'}}></div></div><span style={{fontSize:'11px'}}>74%</span></div></td>
          <td><button className="btn btn-sm" onClick={() => confirmAction('Vinod Tiwari · Warehouse\nStatus: On Leave today · Attendance this month: 74%')}>View</button></td>
        </tr>
      </tbody></table></div>
    </div>
  )
}
