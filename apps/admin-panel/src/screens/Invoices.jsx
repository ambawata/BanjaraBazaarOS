import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Invoices() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="filter-row">
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search invoice..." /></div>
        <select className="fsel"><option>All Types</option><option>GST Invoice</option><option>Non-GST</option><option>Return</option></select>
        <button className="btn btn-primary ml-auto" onClick={() => confirmAction('Open new invoice form — select products, customer, and payment method to generate a GST/non-GST invoice.')}><i className="ti ti-plus"></i> New Invoice</button>
      </div>
      <div className="panel" style={{margin:0}}><table className="dt"><thead><tr><th>Invoice No.</th><th>Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>GST</th><th>Mode</th><th>Actions</th></tr></thead><tbody>
        <tr><td className="mono">INV-2847</td><td style={{fontSize:'12px'}}>12 May 2025</td><td>Walk-in</td><td>1</td><td className="mono">₹3,200</td><td><span className="bp bp-gray">Non-GST</span></td><td><span className="bp bp-active">UPI</span></td><td><button className="btn btn-sm" onClick={() => confirmAction('Print invoice INV-2847 — Fiber Ganesha Statue · ₹3,200 · Walk-in customer · UPI')}><i className="ti ti-printer"></i></button></td></tr>
        <tr><td className="mono">INV-2844</td><td style={{fontSize:'12px'}}>12 May 2025</td><td>Neha Sharma</td><td>2</td><td className="mono">₹6,100</td><td><span className="bp bp-blue">GST 18%</span></td><td><span className="bp bp-active">UPI</span></td><td><button className="btn btn-sm" onClick={() => confirmAction('Print invoice INV-2844 — 2 items · ₹6,100 · Neha Sharma · GST 18% · UPI')}><i className="ti ti-printer"></i></button></td></tr>
      </tbody></table></div>
    </div>
  )
}
