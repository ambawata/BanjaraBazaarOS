import React from 'react'

const PRODUCT_MAPPINGS = {
  toilet: { title: 'Himalayan Pink Rock Salt (1kg)', price: '₹349', icon: 'seeding' },
  'septic-tank': { title: 'Himalayan Pink Rock Salt (1kg)', price: '₹349', icon: 'seeding' },
  kitchen: { title: 'Agni Southeast Copper Helix', price: '₹999', icon: 'brightness-half' },
  entrance: { title: 'Vastu Lead Metal Boundary Strip', price: '₹799', icon: 'door-enter' },
  bedroom: { title: 'Rose/Crystal Quartz Cluster', price: '₹599', icon: 'sparkles' },
  staircase: { title: 'Brass Tortoise Grounding Base', price: '₹649', icon: 'bell' },
  lift: { title: 'Brass Tortoise Grounding Base', price: '₹649', icon: 'bell' },
  custom: { title: 'Vastu Pyramid - Copper', price: '₹499', icon: 'pyramid' }
}

export default function BanjaraBazaarShop({ rooms, plot, selectedIssueRoom, onClearSelection }) {
  
  const handleBuyProduct = (title) => {
    alert(`Thank you for selecting "${title}". You will be redirected to the main Banjara Bazaar checkout page to complete your purchase!`)
  }

  // Check if we are viewing a specific issue remedy (Screen 10 layout)
  if (selectedIssueRoom) {
    const room = selectedIssueRoom
    const evalRes = room.analysis || { status: 'Can Be Improved', zone: 'SW', desc: 'Suboptimal direction.' }
    
    // Graded recommendations based on room type
    let remedies = [
      { text: `Shift ${room.label} to standard direction`, badge: 'Best Solution', badgeType: 'best-solution' },
      { text: 'Install Copper strip under floor base', badge: 'Effective', badgeType: 'effective' },
      { text: 'Use Vastu Pyramid (Energy balance)', badge: 'Good', badgeType: 'good' }
    ]

    if (room.type === 'toilet' || room.type === 'septic-tank') {
      remedies = [
        { text: `Shift ${room.label} to Northwest/West (Best Solution)`, badge: 'Best Solution', badgeType: 'best-solution' },
        { text: 'Keep raw Pink Rock Salt in a glass bowl inside', badge: 'Effective', badgeType: 'effective' },
        { text: 'Install Brass/Copper partition strip under threshold', badge: 'Good', badgeType: 'good' }
      ]
    } 
    else if (room.type === 'kitchen') {
      remedies = [
        { text: 'Shift Cooking stove burner to Southeast', badge: 'Best Solution', badgeType: 'best-solution' },
        { text: 'Install Agni Copper Helix on Southeast wall', badge: 'Effective', badgeType: 'effective' },
        { text: 'Place green aventurine crystals near stove base', badge: 'Good', badgeType: 'good' }
      ]
    }
    else if (room.type === 'entrance') {
      remedies = [
        { text: 'Relocate main door opening to Northeast/East', badge: 'Best Solution', badgeType: 'best-solution' },
        { text: 'Install Yellow Threshold / Lead Strip boundary', badge: 'Effective', badgeType: 'effective' },
        { text: 'Hang Panchmukhi Hanuman photo above door frame', badge: 'Good', badgeType: 'good' }
      ]
    }

    const matchedProduct = PRODUCT_MAPPINGS[room.type] || PRODUCT_MAPPINGS.custom

    return (
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Back header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button className="btn btn-sm" onClick={onClearSelection}>
            <i className="ti ti-arrow-left"></i> Back to Catalog
          </button>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700 }}>Remedies & Shop</h2>
        </div>

        {/* Issue Card */}
        <div className="remedy-dashboard-card" style={{ borderLeftColor: 'var(--terracotta)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Active Issue</span>
          <div className="remedy-issue-row">
            <div className="remedy-issue-graphic-placeholder">
              <i className={`ti ti-${matchedProduct.icon}`}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <strong style={{ fontSize: '15px' }}>{room.label} in {evalRes.zone}</strong>
              <p style={{ fontSize: '12.5px', color: 'var(--text2)', marginTop: '4px', lineHeight: '1.4' }}>
                {evalRes.desc} This placement can create energetic friction or minor instability.
              </p>
            </div>
          </div>
        </div>

        {/* Graded Remedies */}
        <div style={{ marginBottom: '24px', width: '100%' }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>Suggested Remedies</h3>
          {remedies.map((rem, idx) => (
            <div key={idx} className="remedy-item-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{rem.text}</span>
              <span className={`remedy-item-badge badge-${rem.badgeType}`}>{rem.badge}</span>
            </div>
          ))}
        </div>

        {/* Shop Remedy Card */}
        <div style={{ width: '100%' }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Shop for Remedies</h3>
          <div 
            className="product-card"
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: '16px', 
              gap: '16px', 
              borderColor: 'var(--gold)',
              background: 'var(--bg2)'
            }}
          >
            <div 
              className="product-image-placeholder" 
              style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '28px' }}
            >
              <i className="ti ti-pyramid"></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{matchedProduct.title}</span>
              <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 'bold', marginTop: '2px' }}>{matchedProduct.price}</span>
            </div>
            <button 
              className="btn btn-primary"
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
              onClick={() => handleBuyProduct(matchedProduct.title)}
            >
              Buy Now
            </button>
          </div>
        </div>

      </div>
    )
  }

  // General Shop Catalog View
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, marginBottom: '6px' }}>
          Remedies Catalog
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '14px' }}>
          Veda-approved elements to correct directional gaps and enhance home energy flow:
        </p>
      </div>
      
      <div className="shop-grid">
        {Object.entries(PRODUCT_MAPPINGS).map(([key, p]) => (
          <div key={key} className="product-card">
            <div className="product-image-placeholder">
              <i className={`ti ti-${p.icon}`}></i>
            </div>
            <div className="product-info">
              <span className="product-title">{p.title}</span>
              <p style={{ fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '10px' }}>
                Used for balancing energy elements in your planning outline.
              </p>
              <div className="product-footer">
                <span className="product-price">{p.price}</span>
                <button className="btn btn-sm btn-primary" onClick={() => handleBuyProduct(p.title)}>
                  Procure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
