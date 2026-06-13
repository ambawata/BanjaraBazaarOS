import { useState, useContext } from 'react'
import { AppCtx } from '../App'

function ApprovalCard({ icon, sku, name, vname, vbadge, basePrice, autoLabel, autoPrice, tags, margin, defaultBase, defaultSell }) {
  const { confirmAction } = useContext(AppCtx)
  const [counterOpen, setCounterOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  const [base, setBase] = useState(defaultBase)
  const [selling, setSelling] = useState(defaultSell)
  const [marginText, setMarginText] = useState(`Margin: ${margin}% · Vendor: ₹${defaultBase.toLocaleString('en-IN')} · BB earns: ₹${(defaultSell - defaultBase).toLocaleString('en-IN')} per unit`)

  const calcMargin = (val) => {
    const b = parseFloat(val) || 0
    const m = margin / 100
    const s = Math.round(b / (1 - m))
    setBase(b); setSelling(s)
    setMarginText(`Margin: ${margin}% · Vendor: ₹${b.toLocaleString('en-IN')} · BB earns: ₹${(s - b).toLocaleString('en-IN')} per unit`)
  }

  const sendCounter = () => {
    confirmAction(`Send counter offer for "${name}"?\nCounter base: ₹${base.toLocaleString('en-IN')} · Selling: ₹${selling.toLocaleString('en-IN')}\n${marginText}\n\nVendor will be notified and must accept or reject.`)
    setCounterOpen(false)
  }

  const quickApprove = () => {
    setApproved(true)
    confirmAction(`Approved: ${name} — moved to Active Products. Staff will be notified to receive stock.`)
  }

  return (
    <div className="appr-card" style={approved ? {opacity:.45,pointerEvents:'none'} : {}}>
      <div className="appr-img"><i className={`ti ti-${icon}`}></i></div>
      <div className="appr-body">
        <div className="appr-sku">{sku}</div>
        <div className="appr-name">{name}</div>
        <div className="appr-vname">{vname} · {vbadge}</div>
        <div className="price-row">
          <div className="price-box"><div className="plabel">Vendor Base Price</div><div className="pvalue">₹{basePrice.toLocaleString('en-IN')}</div></div>
          <div className="price-box"><div className="plabel">{autoLabel}</div><div className="pvalue pvalue-accent">₹{autoPrice.toLocaleString('en-IN')}</div></div>
        </div>
        <div className="meta-tags">{tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        <div className="card-actions">
          <button className="btn btn-success" onClick={quickApprove}><i className="ti ti-check"></i> Approve</button>
          <button className="btn" onClick={() => setCounterOpen(!counterOpen)}><i className="ti ti-arrows-exchange"></i> Counter</button>
          <button className="btn btn-danger" onClick={() => confirmAction(`Reject ${name}? Vendor will be notified.`)}><i className="ti ti-x"></i> Reject</button>
        </div>
        <div className={`counter-form${counterOpen ? ' open' : ''}`}>
          <div style={{fontSize:'11px',color:'var(--text3)',fontFamily:'var(--fm)',marginBottom:'6px'}}>COUNTER OFFER</div>
          <div className="form-row">
            <div className="form-group"><label>Counter Base (₹)</label><input type="number" className="form-input" value={base} onChange={e => calcMargin(e.target.value)} /></div>
            <div className="form-group"><label>Selling Price (₹)</label><input type="number" className="form-input" value={selling} readOnly /></div>
          </div>
          <div className="margin-preview">{marginText}</div>
          <div className="form-row" style={{marginTop:'10px'}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={sendCounter}>Send Counter</button>
            <button className="btn" onClick={() => setCounterOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalQueue() {
  return (
    <div>
      <div className="filter-row">
        <div className="search-wrap"><i className="ti ti-search"></i><input type="text" className="search-input" placeholder="Search products..." /></div>
        <select className="fsel"><option>All Categories</option><option>BB-A Home Decor</option><option>BB-F Furniture</option><option>BB-P Fiber Statue</option><option>BB-C Crockery</option></select>
        <select className="fsel"><option>All Vendors</option><option>Raj Handicrafts</option><option>Devi Arts</option><option>Sharma Decors</option></select>
        <select className="fsel"><option>All GST Types</option><option>Regular</option><option>Composition 1%</option><option>Unregistered</option></select>
      </div>
      <div className="appr-grid">
        <ApprovalCard icon="lamp" sku="SKU: BB-A-00241 · Submitted 2 hrs ago" name="Bamboo Table Lamp with Jute Shade" vname="Raj Handicrafts" vbadge={<span className="comp-flag">COMP 1%</span>} basePrice={1200} autoLabel="Auto Selling (22%)" autoPrice={1464} tags={['Bamboo','Jute','H:45 W:22cm','Min Qty:5','BB-A']} margin={22} defaultBase={1100} defaultSell={1410} />
        <ApprovalCard icon="sofa" sku="SKU: BB-F-00089 · Submitted 5 hrs ago" name="Sheesham Wood 2-Seater Bench" vname="Sharma Decors" vbadge={<span className="bp bp-active" style={{fontSize:'10px'}}>Regular GST</span>} basePrice={8500} autoLabel="Auto Selling (18%)" autoPrice={10370} tags={['Sheesham','Natural Finish','H:45 W:120cm','24kg','Min Qty:2']} margin={18} defaultBase={7800} defaultSell={9516} />
        <ApprovalCard icon="plant" sku="SKU: BB-G-00156 · Submitted 1 day ago" name="Monstera Artificial Plant 4ft" vname="Devi Arts" vbadge={<span className="comp-flag">COMP 1%</span>} basePrice={2400} autoLabel="Auto Selling (25%)" autoPrice={3000} tags={['Plastic+Fabric','Green','H:120cm','Min Qty:3','BB-G']} margin={25} defaultBase={2200} defaultSell={2750} />
        <ApprovalCard icon="tools-kitchen-2" sku="SKU: BB-C-00312 · Submitted 2 days ago" name="Ceramic Dinner Set 18pc Blue Pottery" vname="Jaipur Pots" vbadge={<span className="bp bp-gray" style={{fontSize:'10px'}}>Unregistered</span>} basePrice={3800} autoLabel="Auto Selling (20%)" autoPrice={4560} tags={['Ceramic','Blue Glaze','Set of 18','Min Qty:4','BB-C']} margin={20} defaultBase={3500} defaultSell={4200} />
      </div>
    </div>
  )
}
