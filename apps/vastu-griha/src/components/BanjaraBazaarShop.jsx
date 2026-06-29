import React from 'react'
import { evaluateRoom } from './AnalysisPanel'

const PRODUCTS = [
  {
    id: 'brass_puja_thali',
    title: 'Auspicious Brass Pooja Thali Set',
    category: 'Pooja',
    price: '₹1,299',
    remedyRelation: 'Best for Northeast (Ishanya) Temple',
    icon: 'flame',
    desc: 'Pure brass plate, oil lamp, incense holder, and bell. Enhances spiritual vibration in the prayer corner.'
  },
  {
    id: 'lead_threshold_strip',
    title: 'Vastu Lead Metal Boundary Strip',
    category: 'Remedies',
    price: '₹799',
    remedyRelation: 'Fixes Southwest/South Entrance',
    icon: 'door-enter',
    desc: 'Heavy lead metal bar to install under the main threshold. Blocks negative energies from entering South/Southwest doors.'
  },
  {
    id: 'copper_helix',
    title: 'Agni Southeast Copper Helix',
    category: 'Remedies',
    price: '₹999',
    remedyRelation: 'Fixes Northeast Kitchen/Borewell',
    icon: 'brightness-half',
    desc: 'Pure copper spiral energizer. Relocates or balances kitchen flame violations in northern sectors.'
  },
  {
    id: 'raw_sea_salt',
    title: 'Himalayan Pink Rock Salt (1kg)',
    category: 'Remedies',
    price: '₹349',
    remedyRelation: 'Fixes Toilet & Septic Tank Defects',
    icon: 'seeding',
    desc: 'Natural raw sea salt chunks. Place in a glass bowl inside restrooms to absorb negative bio-energies.'
  },
  {
    id: 'wooden_mandir',
    title: 'Handcrafted Teak Wood Pooja Mandir',
    category: 'Furniture',
    price: '₹8,499',
    remedyRelation: 'Best for Northeast/East Wall',
    icon: 'home',
    desc: 'Exquisite wooden temple carving with storage drawers. Fits perfectly on Northeast walls.'
  },
  {
    id: 'six_rod_chime',
    title: 'Vastu Wind Chime (6 Metal Rods)',
    category: 'Decor',
    price: '₹649',
    remedyRelation: 'Best for Northwest (Vayavya) Guest Room',
    icon: 'bell',
    desc: 'Acoustically tuned metal tubes. Attracts fresh breezes, guest warmth, and business opportunities.'
  },
  {
    id: 'seven_horses_painting',
    title: 'Seven Running Horses Canvas Painting',
    category: 'Decor',
    price: '₹1,499',
    remedyRelation: 'Hang on East Wall of Living Room',
    icon: 'photo',
    desc: 'Vibrant sunrise painting. Inspires speed, financial growth, and career success when placed on East walls.'
  },
  {
    id: 'tulsi_terracotta_planter',
    title: 'Traditional Terracotta Tulsi Vrindavan',
    category: 'Garden',
    price: '₹599',
    remedyRelation: 'Best for Northeast Balcony/Courtyard',
    icon: 'leaf',
    desc: 'Clay planter with beautiful moldings. Keeps the Tulsi plant healthy to radiate oxygen and positivity.'
  }
]

export default function BanjaraBazaarShop({ rooms, plot }) {
  const recommendations = []
  
  rooms.forEach(room => {
    const evalRes = evaluateRoom(room, plot)
    if (evalRes.rating < 70) {
      if (room.type === 'toilet' || room.type === 'septic-tank') {
        recommendations.push('raw_sea_salt')
        if (evalRes.zone === 'SW' || evalRes.zone === 'NE') {
          recommendations.push('lead_threshold_strip')
        }
      }
      if (room.type === 'kitchen' || room.type === 'solar') {
        recommendations.push('copper_helix')
      }
      if (room.type === 'entrance' && (evalRes.zone === 'SW' || evalRes.zone === 'S')) {
        recommendations.push('lead_threshold_strip')
      }
      if (room.type === 'borewell' && (evalRes.zone === 'SE' || evalRes.zone === 'SW')) {
        recommendations.push('copper_helix')
      }
    }
  })

  // Fallbacks
  if (recommendations.length === 0) {
    recommendations.push('brass_puja_thali')
    recommendations.push('seven_horses_painting')
  }

  const uniqueRecIds = [...new Set(recommendations)]
  const recommendedProducts = PRODUCTS.filter(p => uniqueRecIds.includes(p.id))
  const catalogProducts = PRODUCTS.filter(p => !uniqueRecIds.includes(p.id))

  const handleBuyProduct = (title) => {
    alert(`Thank you for selecting the "${title}". You will be redirected to the main Banjara Bazaar checkout page to complete your purchase!`)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Recommended Shelf */}
      <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, marginBottom: '6px' }}>
          Personalized Home Remedies
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '14px' }}>
          Based on the aspects that can be improved in your plan, we recommend these items to balance household energies:
        </p>
        
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
          {recommendedProducts.map(p => (
            <div 
              key={p.id} 
              className="product-card" 
              style={{ flexShrink: 0, width: '280px', borderColor: 'var(--gold)' }}
            >
              <div className="product-tag">Vastu Remedy</div>
              <div className="product-image-placeholder" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                <i className={`ti ti-${p.icon}`}></i>
              </div>
              <div className="product-info">
                <span className="product-title">{p.title}</span>
                <span className="product-remedy-relation">{p.remedyRelation}</span>
                <p style={{ fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '10px' }}>
                  {p.desc}
                </p>
                <div className="product-footer">
                  <span className="product-price">{p.price}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleBuyProduct(p.title)}>
                    Procure Remedy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', margin: '14px 24px 0' }} />

      {/* Main Catalog Grid */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700 }}>Vastu Remedies Store</h3>
      </div>
      
      <div className="shop-grid">
        {catalogProducts.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-image-placeholder">
              <i className={`ti ti-${p.icon}`}></i>
            </div>
            <div className="product-info">
              <span className="product-title">{p.title}</span>
              <span className="product-remedy-relation" style={{ color: 'var(--text3)' }}>{p.category} Category</span>
              <p style={{ fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '10px' }}>
                {p.desc}
              </p>
              <div className="product-footer">
                <span className="product-price">{p.price}</span>
                <button className="btn btn-sm" onClick={() => handleBuyProduct(p.title)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
