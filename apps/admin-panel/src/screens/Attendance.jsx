import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Attendance() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div className="panel">
      <div className="panel-head"><i className="ti ti-calendar-check" style={{color:'var(--green)'}}></i><h3>Attendance — 12 May 2025</h3>
        <button className="btn btn-sm ml-auto" onClick={() => confirmAction('Export attendance for May 2025 as CSV?')}><i className="ti ti-download"></i> Export Month</button>
      </div>
      <table className="dt"><thead><tr><th>Staff</th><th>Check-In</th><th>Check-Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>
        <tr><td>Priya Sharma</td><td className="mono">09:02 AM</td><td className="mono">—</td><td>—</td><td><span className="bp bp-active">Present</span></td></tr>
        <tr><td>Amit Rao</td><td className="mono">10:05 AM</td><td className="mono">—</td><td>—</td><td><span className="bp bp-active">Present</span></td></tr>
        <tr><td>Ravi Kumar</td><td className="mono">09:18 AM</td><td className="mono">—</td><td>—</td><td><span className="bp bp-pending">On Break</span></td></tr>
        <tr><td>Meena Singh</td><td className="mono">09:45 AM</td><td className="mono">—</td><td>—</td><td><span className="bp bp-active">Present</span></td></tr>
        <tr><td>Vinod Tiwari</td><td className="mono">—</td><td className="mono">—</td><td>—</td><td><span className="bp bp-red">Leave</span></td></tr>
      </tbody></table>
    </div>
  )
}
