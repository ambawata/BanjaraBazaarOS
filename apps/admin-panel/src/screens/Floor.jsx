export default function Floor() {
  return (
    <div className="three-col">
      <div className="floor-section"><h4><span style={{background:'var(--accent-dim)',color:'var(--accent)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>A</span> Home Decor</h4>
        <div className="floor-item"><div className="fi-name">Bamboo Table Lamp</div><div className="fi-sku">BB-A-00210</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
        <div className="floor-item"><div className="fi-name">Wall Macrame Large</div><div className="fi-sku">BB-A-00188</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
        <div className="floor-item"><div className="fi-name">Terracotta Wall Panel</div><div className="fi-sku">BB-A-00155</div><span className="bp bp-pending" style={{fontSize:'10px'}}>Warning</span></div>
      </div>
      <div className="floor-section"><h4><span style={{background:'var(--blue-dim)',color:'var(--blue)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>F</span> Furniture</h4>
        <div className="floor-item"><div className="fi-name">Sheesham Bench 2-Seater</div><div className="fi-sku">BB-F-00076</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
        <div className="floor-item"><div className="fi-name">Wooden Chair Teak</div><div className="fi-sku">BB-F-00082</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
      </div>
      <div className="floor-section"><h4><span style={{background:'var(--red-dim)',color:'var(--red)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>O</span> Outdoor</h4>
        <div className="floor-item"><div className="fi-name">Garden Bench</div><div className="fi-sku">BB-O-00038</div><span className="bp bp-red" style={{fontSize:'10px'}}>Dead</span></div>
        <div className="floor-item"><div className="fi-name">Balcony Planter Stand</div><div className="fi-sku">BB-O-00041</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
      </div>
      <div className="floor-section"><h4><span style={{background:'var(--green-dim)',color:'var(--green)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>G</span> Art Plants</h4>
        <div className="floor-item"><div className="fi-name">Monstera 4ft</div><div className="fi-sku">BB-G-00142</div><span className="bp bp-pending" style={{fontSize:'10px'}}>Warning</span></div>
        <div className="floor-item"><div className="fi-name">Monstera 6ft</div><div className="fi-sku">BB-G-00118</div><span className="bp bp-red" style={{fontSize:'10px'}}>Pickup</span></div>
      </div>
      <div className="floor-section"><h4><span style={{background:'var(--purple-dim)',color:'var(--purple)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>P</span> Fiber Statues</h4>
        <div className="floor-item"><div className="fi-name">Fiber Ganesha 3ft</div><div className="fi-sku">BB-P-00064</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
        <div className="floor-item"><div className="fi-name">Buddha Head Statue</div><div className="fi-sku">BB-P-00071</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
      </div>
      <div className="floor-section"><h4><span style={{background:'var(--amber-dim)',color:'var(--amber)',padding:'2px 8px',borderRadius:'4px',fontFamily:'var(--fm)',fontSize:'12px'}}>C</span> Crockery</h4>
        <div className="floor-item"><div className="fi-name">Ceramic Dinner Set 18pc</div><div className="fi-sku">BB-C-00298</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
        <div className="floor-item"><div className="fi-name">Blue Pottery Mug Set</div><div className="fi-sku">BB-C-00305</div><span className="bp bp-active" style={{fontSize:'10px'}}>Active</span></div>
      </div>
    </div>
  )
}
