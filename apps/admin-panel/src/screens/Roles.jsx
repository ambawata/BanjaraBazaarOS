import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Roles() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div className="panel">
      <div className="panel-head"><h3>Roles & Permissions</h3>
        <button className="btn btn-primary btn-sm ml-auto" onClick={() => confirmAction('Create new role — define a name and assign module-level permissions.')}><i className="ti ti-plus"></i> Add Role</button>
      </div>
      <table className="dt"><thead><tr><th>Role</th><th>Approval Queue</th><th>Settlements</th><th>Staff Mgmt</th><th>System Settings</th><th>Backup</th><th>Users</th></tr></thead><tbody>
        <tr><td><span className="bp bp-red">Admin</span></td><td style={{color:'var(--green)'}}>✓ Full</td><td style={{color:'var(--green)'}}>✓ Full</td><td style={{color:'var(--green)'}}>✓ Full</td><td style={{color:'var(--green)'}}>✓ Full</td><td style={{color:'var(--green)'}}>✓ Full</td><td>2</td></tr>
        <tr><td><span className="bp bp-blue">Senior Staff</span></td><td style={{color:'var(--green)'}}>✓ View</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--amber)'}}>✓ View</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td>3</td></tr>
        <tr><td><span className="bp bp-gray">Floor Staff</span></td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td>4</td></tr>
        <tr><td><span className="bp bp-gray">Cashier</span></td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td>2</td></tr>
        <tr><td><span className="bp bp-purple">Vendor</span></td><td style={{color:'var(--text3)'}}>Portal only</td><td style={{color:'var(--amber)'}}>Own only</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td style={{color:'var(--text3)'}}>✗</td><td>24</td></tr>
      </tbody></table>
    </div>
  )
}
