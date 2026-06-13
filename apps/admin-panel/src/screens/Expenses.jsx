import { useContext } from 'react'
import { AppCtx } from '../App'

export default function Expenses() {
  const { confirmAction } = useContext(AppCtx)
  return (
    <div>
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi-card kc-red"><div className="klabel">This Month</div><div className="kvalue">₹84,200</div></div>
        <div className="kpi-card"><div className="klabel">Rent</div><div className="kvalue">₹45,000</div></div>
        <div className="kpi-card"><div className="klabel">Salary</div><div className="kvalue">₹28,000</div></div>
        <div className="kpi-card"><div className="klabel">Utilities + Misc</div><div className="kvalue">₹11,200</div></div>
      </div>
      <div className="panel">
        <div className="panel-head"><i className="ti ti-wallet" style={{color:'var(--red)'}}></i><h3>Expense Ledger</h3>
          <button className="btn btn-primary btn-sm ml-auto" onClick={() => confirmAction('Add new expense — enter category, description, amount, and date.')}><i className="ti ti-plus"></i> Add Expense</button>
        </div>
        <div style={{padding:'8px 16px'}}>
          <div className="exp-row"><span className="exp-cat">Rent</span><div style={{flex:1,padding:'0 10px'}}>Office + showroom — May 2025</div><span className="mono" style={{color:'var(--red)'}}>− ₹45,000</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>1 May</span></div>
          <div className="exp-row"><span className="exp-cat">Salary</span><div style={{flex:1,padding:'0 10px'}}>6 staff — May 2025</div><span className="mono" style={{color:'var(--red)'}}>− ₹28,000</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>1 May</span></div>
          <div className="exp-row"><span className="exp-cat">Electricity</span><div style={{flex:1,padding:'0 10px'}}>April bill</div><span className="mono" style={{color:'var(--red)'}}>− ₹4,800</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>5 May</span></div>
          <div className="exp-row"><span className="exp-cat">Marketing</span><div style={{flex:1,padding:'0 10px'}}>WhatsApp campaign + flyers</div><span className="mono" style={{color:'var(--red)'}}>− ₹3,200</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>8 May</span></div>
          <div className="exp-row"><span className="exp-cat">Repairs</span><div style={{flex:1,padding:'0 10px'}}>AC service</div><span className="mono" style={{color:'var(--red)'}}>− ₹1,800</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>10 May</span></div>
          <div className="exp-row"><span className="exp-cat">Misc</span><div style={{flex:1,padding:'0 10px'}}>Stationery + packaging</div><span className="mono" style={{color:'var(--red)'}}>− ₹1,400</span><span style={{color:'var(--text3)',fontSize:'11px',marginLeft:'12px'}}>11 May</span></div>
        </div>
      </div>
    </div>
  )
}
