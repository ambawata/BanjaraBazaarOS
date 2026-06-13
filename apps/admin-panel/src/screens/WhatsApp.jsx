import { useContext } from 'react'
import { AppCtx } from '../App'

export default function WhatsApp() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <button className="btn btn-primary" onClick={() => confirmAction('Create new WhatsApp campaign — select template, audience segment, and schedule.')}><i className="ti ti-plus"></i> New Campaign</button>
        <button className="btn" onClick={() => confirmAction('Open WhatsApp message templates — view, edit, or create new approved templates.')}><i className="ti ti-template"></i> Templates</button>
      </div>
      <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Campaign</th><th>Sent To</th><th>Date</th><th>Delivered</th><th>Read Rate</th><th>Status</th></tr></thead><tbody>
        <tr><td>Mother's Day Sale</td><td>342 customers</td><td className="mono">10 May 2025</td><td style={{color:'var(--green)'}}>98%</td><td style={{color:'var(--blue)'}}>64%</td><td><span className="bp bp-active">Sent</span></td></tr>
        <tr><td>New Arrivals — May</td><td>1,284 customers</td><td className="mono">1 May 2025</td><td style={{color:'var(--green)'}}>96%</td><td style={{color:'var(--blue)'}}>58%</td><td><span className="bp bp-active">Sent</span></td></tr>
      </tbody></table></div>
    </div>
  )
}
