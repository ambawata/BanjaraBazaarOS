import React, { useState } from 'react'

export const VASTU_RULES = {
  pooja: {
    name: 'Pooja Room (Temple)',
    ratings: { NE: 100, N: 85, E: 90, C: 100, NW: 50, W: 40, SE: 10, S: 0, SW: 0 },
    descriptions: {
      NE: 'Perfect placement! Ishanya corner is ruled by Lord Shiva and represents the water element, inviting pure spiritual vibes.',
      C: 'Brahmasthan temple is highly auspicious. Spreads spiritual energy evenly throughout the entire house.',
      E: 'Very good placement. The morning sun rays bring health, light, and spiritual growth.',
      N: 'Good direction. Governed by Kubera, it brings clarity and mental peace.',
      NW: 'Acceptable. Windy quadrant is suitable, but keep it light and clean.',
      W: 'Neutral/Acceptable if no other space is available.',
      SE: 'Agni (Fire) clashes with Pooja (Water). This conflict of elements can lead to arguments or restlessness in the household.',
      S: 'Facing the direction of death (Yama) is not recommended for spiritual prayer spaces.',
      SW: 'Nairutya is for heavy master bedroom stability, not prayer energy.'
    },
    remedies: {
      SE: 'Place a brass bowl of water in the Northeast of the room and keep a camphor lamp lit.',
      S: 'Paint walls in light yellow. Hang a copper Sun emblem on the East wall of the room.',
      SW: 'Place a solid brass pyramid under the temple stand to ground the energy.'
    }
  },
  kitchen: {
    name: 'Kitchen (Cooktop)',
    ratings: { SE: 100, NW: 85, S: 70, E: 75, W: 50, C: 0, NE: 0, N: 15, SW: 0 },
    descriptions: {
      SE: 'Perfect placement! Agneya corner is ruled by Agni (Fire). Boosts family health and culinary success.',
      NW: 'Excellent secondary option. Governed by air, it keeps the fire cooking clean and efficient.',
      E: 'Good. Cooking facing the rising sun brings good health and vitality.',
      S: 'Acceptable. Safe for burners if kitchen faces East or Southeast.',
      W: 'Neutral. Cooking facing West is acceptable but not optimal.',
      N: 'Clashes with Kubera wealth sector. Can lead to unexpected expenses or money drains.',
      NE: 'Water zone (Northeast) clashes with Fire (Kitchen). It is like pouring water on cooking fire, causing health concerns and minor disputes.',
      SW: 'Fire in the Earth stability quadrant. Creates high-pressure stress and drains savings.',
      C: 'Placing fire in the center (Brahmasthan) burns the heart of the house, causing domestic friction.'
    },
    remedies: {
      NE: 'Stick a yellow border tape around the stove base, and place a green aventurine crystal near the cooktop.',
      SW: 'Place a copper helix on the Southeast wall of the kitchen, and use yellow shades in the kitchen decor.',
      C: 'Keep a small crystal bowl filled with sea salt in the kitchen, and avoid cooking heavy items in the center.',
      N: 'Place a green plant near the stove to transition the fire/water clash.'
    }
  },
  bedroom: {
    name: 'Master Bedroom',
    ratings: { SW: 100, S: 90, W: 85, NW: 70, E: 50, SE: 15, NE: 0, N: 30, C: 0 },
    descriptions: {
      SW: 'Perfect placement! Nairutya (Earth) is the zone of heavy stability, ensuring long-term health and authority for the head of family.',
      S: 'Excellent. Promotes deep sleep, relaxation, and fame.',
      W: 'Very good. Promotes career growth and stability.',
      NW: 'Good for kids, guests, or unmarried family members. Highly active wind quadrant.',
      E: 'Neutral. Good for children\'s study and sleep.',
      N: 'Avoid for master bedroom. Heavy sleep blocks active career flow.',
      SE: 'Fire energy causes restlessness, anger issues, and marital disputes.',
      NE: 'Sleeping in the spiritual corner disturbs sleep, causes stress, and affects marital harmony.',
      C: 'The heart of the house (Brahmasthan) must not be locked inside a heavy bedroom.'
    },
    remedies: {
      SE: 'Keep a crystal quartz cluster on the bedside table and use pastel blue or green bedsheets to calm the fire.',
      NE: 'Hang a copper Sun on the East wall and sleep with your head pointing South. Place a Vastu pyramid in the room.',
      C: 'Ensure the bed is not directly in the center of the room. Keep the room light, bright, and highly ventilated.'
    }
  },
  toilet: {
    name: 'Toilet / Bathroom',
    ratings: { NW: 100, W: 85, S: 70, N: 20, E: 20, SE: 10, SW: 0, NE: 0, C: 0 },
    descriptions: {
      NW: 'Perfect placement! Vayavya (Wind) quadrant easily drains negative energies and drains waste safely.',
      W: 'Very good. Safe direction for drainage.',
      S: 'Acceptable. Safe if drainage is toward the Northwest or West.',
      SE: 'Placing toilet in the fire corner drains financial resources and health.',
      N: 'Toilet in Kubera wealth quadrant leads to severe money drains.',
      E: 'Blocks morning solar energy, causing chronic fatigue.',
      SW: 'Drains household stability, marital relationships, and savings.',
      NE: 'Restroom in the divine Northeast corner contaminates pure spiritual inflow, leading to mental blocks.',
      C: 'Draining waste in the Brahmasthan ruins the entire household energy and happiness.'
    },
    remedies: {
      SW: 'Place a lead metal plate or helix on the outer toilet wall. Keep a glass bowl of raw sea salt inside.',
      NE: 'Place a brass bowl of sea salt inside, keep the door strictly closed, and mount a virtual copper pyramid partition.',
      C: 'Always keep the door closed. Place plants (like Spider plant) inside to filter air, and burn aromatic incense.',
      SE: 'Use red-colored towels or tiles inside. Place a copper helix on the toilet door.'
    }
  },
  living: {
    name: 'Living Room',
    ratings: { N: 100, E: 100, NE: 95, NW: 85, W: 70, C: 100, S: 50, SE: 50, SW: 30 },
    descriptions: {
      N: 'Perfect placement! Invites wealth, career opportunities, and social connections.',
      E: 'Perfect placement! Welcomes healing solar waves and boosts social circle.',
      NE: 'Highly auspicious. Keeps the entrance space airy, light, and clean.',
      C: 'Excellent. An open central living lounge keeps the Brahmasthan active and cheerful.',
      NW: 'Very good. Perfect for receiving guests and family gatherings.',
      W: 'Acceptable. Good for entertainment and family talk.',
      S: 'Neutral. Safe, but avoid placing heavy electronics or sofas directly in the north of this room.',
      SE: 'Neutral. Southeast living room is okay, but place TV and gadgets in the Southeast corner.',
      SW: 'Avoid if possible. Heavy sofas are fine, but Southwest should ideally be a bedroom for the owner.'
    },
    remedies: {
      SW: 'Ensure sofas are heavy and placed against the South and West walls. Keep the room well-lit.',
      SE: 'Place the television or sound systems in the Southeast corner of the living room.'
    }
  },
  staircase: {
    name: 'Staircase',
    ratings: { SW: 100, S: 95, W: 95, SE: 60, NW: 70, E: 20, N: 0, NE: 0, C: 0 },
    descriptions: {
      SW: 'Perfect placement! Heaviest structure in the earth quadrant (Nairutya) grounds positive vibrations.',
      S: 'Excellent. Very auspicious direction for a clockwise staircase.',
      W: 'Excellent. Safe direction for heavy structures.',
      NW: 'Good. Safe for internal or external staircase.',
      SE: 'Acceptable. Safe if placed away from the kitchen cooker walls.',
      E: 'Avoid. Blocks morning solar energy.',
      N: 'Heavy concrete blocks the inflow of Kubera wealth energies.',
      NE: 'Heaviness in Ishanya blocks divine solar rays and water element, causing delays in personal growth.',
      C: 'A heavy concrete block or circular staircase in the center (Brahmasthan) causes heavy structural energy stress.'
    },
    remedies: {
      NE: 'Hang a copper Sun on the eastern wall of the staircase. Keep the area extremely well-lit with yellow lights.',
      N: 'Place a brass tortoise at the bottom of the stairs facing towards the north.',
      C: 'Keep a crystal lotus on the staircase landing to balance the heavy central weight.'
    }
  },
  entrance: {
    name: 'Main Door / Gate',
    ratings: { NE: 100, N: 95, E: 95, NW: 75, W: 60, SE: 25, S: 20, SW: 0, C: 0 },
    descriptions: {
      NE: 'Highly auspicious! The ultimate door direction for pure cosmic, mental, and financial positive energies.',
      N: 'Auspicious. Attracts high income, good career opportunities, and business success.',
      E: 'Auspicious. Brings positive energy, social status, and healthy lifespans.',
      NW: 'Good. Wind entrance is clean, but keep a threshold to avoid money blowing away.',
      W: 'Acceptable. Safe for trade and businesses.',
      SE: 'Agni entrance causes arguments, minor fire hazards, or legal disputes.',
      S: 'Entrance facing South is ruled by Yama. Requires special threshold remedies.',
      SW: 'Entrance in Southwest leads to unstable energy flow, relationship strains, and savings leakages.',
      C: 'A main entrance directly in the exact center is structurally impossible and Vastu-taboo.'
    },
    remedies: {
      SW: 'Place a lead metal threshold strip under the main door. Hang a Panchmukhi Hanuman photo above the door.',
      SE: 'Paint the door in cream or light yellow. Install a copper threshold or copper strip.',
      S: 'Paint the door in red or dark wood. Mount a brass deity (like Ganesha) above the frame, and use a brass threshold.'
    }
  },
  borewell: {
    name: 'Borewell / Underground Tank',
    ratings: { NE: 100, N: 90, E: 90, NW: 40, W: 20, SE: 0, S: 0, SW: 0, C: 0 },
    descriptions: {
      NE: 'Excellent! Northeast represents the water element (Ishanya). Brings happiness, purity, and longevity.',
      N: 'Auspicious. Brings wealth and financial prosperity.',
      E: 'Good. Positive solar energy interacts well with active water flow.',
      NW: 'Avoid. Wind zone dries water energy, leading to instability.',
      W: 'Poor. Water in West causes minor losses and digestive issues.',
      SE: 'Fire corner (Southeast) clashes with Borewell (Water). Creates extreme stress and litigation risks.',
      S: 'Severe defect. Underground hollow drains the energy of Yama (fame and health).',
      SW: 'Severe defect. Hollow in Southwest destroys the grounding earth element, causing financial leaks.',
      C: 'Borewell in the center (Brahmasthan) drains the entire energy source of the home.'
    },
    remedies: {
      SE: 'Place a copper helix on the Southeast border and plant Tulsi around it.',
      S: 'Use a copper strip to isolate the well, and paint surrounding walls green.',
      SW: 'Place lead pyramids around the water pit boundary to isolate earth vibrations.'
    }
  },
  'over-head-tank': {
    name: 'Overhead Water Tank',
    ratings: { SW: 100, W: 90, S: 90, NW: 60, SE: 20, NE: 0, N: 10, E: 10, C: 0 },
    descriptions: {
      SW: 'Perfect! Heavy overhead water tank grounds the earth zone (Nairutya), creating high stability.',
      W: 'Very good. Safe direction for heavy rooftop water structures.',
      S: 'Excellent. Safe for structural weight.',
      NW: 'Acceptable. Wind zone is okay for heavy tanks if kept clean.',
      SE: 'Poor weight placement near the kitchen fireplace.',
      NE: 'Heavy weight in the water corner (Northeast) blocks positive cosmic waves. Causes heavy progress blocks.',
      N: 'Blocks incoming wealth rays. Causes financial stagnation.',
      E: 'Blocks morning sunlight and health waves.',
      C: 'Heavy concrete block in Brahmasthan causes severe family stress.'
    },
    remedies: {
      NE: 'Mount a brass tortoise at the bottom of the tank structure and paint the tank yellow.',
      N: 'Use red paint highlights on the tank base to reflect heavy elements, and place a brass pyramid.',
      C: 'Ensure the tank is elevated on pillars so it does not touch the direct floor slab of the Brahmasthan.'
    }
  },
  'septic-tank': {
    name: 'Septic Tank',
    ratings: { NW: 100, W: 80, S: 40, N: 20, E: 20, SE: 10, SW: 0, NE: 0, C: 0 },
    descriptions: {
      NW: 'Perfect placement! Wind quadrant (Vayavya) safely drains impurities and waste.',
      W: 'Good. Safe zone for drainage systems.',
      S: 'Avoid. Drainage towards South drains vitality.',
      N: 'Drains incoming wealth energy in Kubera corner.',
      E: 'Blocks morning solar energy.',
      SE: 'Clashes with fire cooker. Causes health issue indicators.',
      SW: 'Drains Nairutya earth stability. Causes chronic relationship breakdowns.',
      NE: 'Restroom/Septic in Northeast is a major defect. Blocks all incoming positive energy.',
      C: 'Septic line in Brahmasthan is strictly prohibited.'
    },
    remedies: {
      SW: 'Surround the tank with a yellow color boundary line and place lead metal anchors.',
      NE: 'Install a virtual copper partition strip and keep a brass bowl of sea salt nearby.'
    }
  },
  solar: {
    name: 'Solar Panel / Generator',
    ratings: { SE: 100, S: 85, E: 80, NW: 60, W: 50, SW: 20, NE: 0, N: 10, C: 0 },
    descriptions: {
      SE: 'Excellent! Southeast is Agneya (Fire). Best place for solar panels, transformers, and generators.',
      S: 'Very good. Safe zone for electric batteries and generators.',
      E: 'Good. Catches maximum sun rays and aligns with positive solar health.',
      NW: 'Acceptable. Safe secondary quadrant.',
      W: 'Neutral. Acceptable placement.',
      SW: 'Avoid. Too much active fire/heat disturbs quiet earth stability.',
      NE: 'Severe defect. Heat generator clashes with water energy corner (Northeast).',
      N: 'Poor placement for heat generators.',
      C: 'Electric generator in the center causes mental stress.'
    },
    remedies: {
      NE: 'Place a crystal geode near the solar batteries and wrap copper wire around the generator stand.'
    }
  },
  lift: {
    name: 'Elevator / Lift Shaft',
    ratings: { SW: 100, S: 95, W: 95, NW: 65, SE: 50, E: 20, N: 0, NE: 0, C: 0 },
    descriptions: {
      SW: 'Excellent! Heavy lift shaft concrete grounds the Southwest corner, improving stability.',
      S: 'Very good. Safe direction for heavy elevators.',
      W: 'Very good. Safe direction for heavy structure.',
      NW: 'Acceptable. Safe placement.',
      SE: 'Neutral. Safe if kept away from kitchen cooktops.',
      E: 'Blocks solar wave entrance.',
      N: 'Blocks incoming wealth rays in the North.',
      NE: 'Severe defect. Blocks cosmic rays in Northeast.',
      C: 'Heavy shaft in Brahmasthan causes domestic friction.'
    },
    remedies: {
      NE: 'Install a brass sun on the lift door casing, and keep the interior of the lift cabin bright and mirrored.'
    }
  },
  basement: {
    name: 'Basement Room',
    ratings: { NE: 100, N: 95, E: 95, NW: 50, W: 40, SE: 20, S: 10, SW: 0, C: 0 },
    descriptions: {
      NE: 'Excellent! Northeast quadrant is light and airy. An underground space here is highly recommended.',
      N: 'Very good. Safe quadrant for basement storage or study.',
      E: 'Good. Safe placement.',
      NW: 'Neutral. Safe secondary zone.',
      W: 'Avoid. Hollow in West causes career instability.',
      SE: 'Poor placement. Clashes with fire energy.',
      S: 'Avoid. Hollow in South drains security.',
      SW: 'Severe defect. Hollow in Nairutya destroys earth grounding stability, causing health and money leaks.',
      C: 'Hollow center in Brahmasthan is prohibited.'
    },
    remedies: {
      SW: 'Place heavy cabinets or solid brass blocks in the Southwest corner of the basement. Use warm yellow lights.'
    }
  },
  'compound-wall': {
    name: 'Boundary Wall / Road',
    ratings: { SW: 100, S: 100, W: 100, NW: 80, SE: 80, N: 80, E: 80, NE: 80, C: 0 },
    descriptions: {
      SW: 'Perfect! Heavy boundary walls in South and West protect the house from negative elements.',
      S: 'Excellent. Keep this wall taller and thicker.',
      W: 'Excellent. Keep this wall taller and thicker.',
      NW: 'Good. Standard boundary placement.',
      SE: 'Good. Standard boundary placement.',
      NE: 'Acceptable. Note: Keep Northeast boundary wall lower and thinner than South/West walls.',
      N: 'Acceptable. Keep this wall lower and thinner.',
      E: 'Acceptable. Keep this wall lower and thinner.',
      C: 'Boundary wall crossing the center is a severe layout defect.'
    },
    remedies: {
      C: 'Keep walls light and place crystal hangings.'
    }
  },
  custom: {
    name: 'Custom Room / Object',
    ratings: { NE: 80, N: 80, E: 80, NW: 80, W: 80, SE: 80, S: 80, SW: 80, C: 0 },
    descriptions: {
      C: 'The central zone (Brahmasthan) must remain open and free of walls or structures.',
      NE: 'Acceptable placement.',
      N: 'Acceptable placement.',
      E: 'Acceptable placement.',
      NW: 'Acceptable placement.',
      W: 'Acceptable placement.',
      SE: 'Acceptable placement.',
      S: 'Acceptable placement.',
      SW: 'Acceptable placement.'
    },
    remedies: {
      C: 'Ensure this custom room is kept light, clutter-free, and well ventilated.'
    }
  }
}

export function evaluateRoom(room, plot) {
  const cx = room.x + room.width / 2
  const cy = room.y + room.height / 2
  
  let col = 0
  if (cx < 33.3) col = 0
  else if (cx >= 66.6) col = 2
  else col = 1
  
  let row = 0
  if (cy < 33.3) row = 0
  else if (cy >= 66.6) row = 2
  else row = 1
  
  const zoneMap = [
    ['NW', 'N', 'NE'],
    ['W',  'C', 'E' ],
    ['SW', 'S', 'SE']
  ]
  
  const zone = zoneMap[row][col]
  const config = VASTU_RULES[room.type] || VASTU_RULES.custom
  const rating = config.ratings[zone] !== undefined ? config.ratings[zone] : 80
  
  let status = 'Neutral'
  if (rating >= 90) status = 'Excellent'
  else if (rating >= 70) status = 'Good'
  else if (rating >= 40) status = 'Can Be Improved'
  else status = 'Needs Attention'
  
  const desc = config.descriptions[zone] || 'Acceptable placement.'
  const remedy = rating < 70 ? config.remedies?.[zone] : null

  return {
    rating,
    zone,
    status,
    desc,
    remedy,
    roomName: config.name
  }
}

export default function AnalysisPanel({ rooms, plot, onSwitchTab, onSelectShopItem }) {
  const [activeSubTab, setActiveSubTab] = useState('overview') // overview | positives | improvements
  
  let totalRating = 0
  let count = 0
  
  const evaluatedRooms = rooms.map(room => {
    const analysis = evaluateRoom(room, plot)
    totalRating += analysis.rating
    count++
    return { ...room, analysis }
  })
  
  const score = count > 0 ? Math.round(totalRating / count) : 100
  
  const complianceExcellent = evaluatedRooms.filter(r => r.analysis.status === 'Excellent' || r.analysis.status === 'Good' || r.analysis.status === 'Neutral')
  const complianceIssues = evaluatedRooms.filter(r => r.analysis.status === 'Can Be Improved' || r.analysis.status === 'Needs Attention')

  let scoreColor = 'var(--status-emerald)' // Emerald
  let ratingText = 'EXCELLENT COMPLIANCE'
  let detailsText = 'All primary house vectors align with natural cosmic flow.'
  if (score < 50) {
    scoreColor = 'var(--status-red)' // Red
    ratingText = 'CRITICAL CORRECTIONS'
    detailsText = 'Severe elemental clashes. Pyramids or crystals needed.'
  } else if (score < 80) {
    scoreColor = 'var(--status-amber)' // Amber
    ratingText = 'AVERAGE ALIGNMENT'
    detailsText = 'Minor energy blockages in secondary quadrants.'
  }

  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const handleRowClick = (room) => {
    if (room.analysis.status === 'Can Be Improved' || room.analysis.status === 'Needs Attention') {
      onSelectShopItem(room)
      onSwitchTab('shop')
    }
  }

  return (
    <div className="analysis-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg2)' }}>
      
      {/* Visual Header */}
      <div className="analysis-header" style={{ padding: '20px 16px', borderBottom: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
        <div>
          <span style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.06em' }}>VEDIC COMPLIANCE SYSTEM</span>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '15px', color: 'var(--text)', margin: '2px 0 0' }}>Vastu Energy Audit</h3>
        </div>
        
        {/* Glow Telemetry Widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--bg3)',
          border: '1.5px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: 'inset 0 0 12px rgba(245, 166, 35, 0.02)'
        }}>
          {/* Radial score gauge */}
          <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
            <svg viewBox="0 0 70 70" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="35" cy="35" r={radius} stroke="var(--border)" strokeWidth="4.5" fill="none" />
              <circle 
                cx="35" 
                cy="35" 
                r={radius} 
                stroke={scoreColor} 
                strokeWidth="4.5" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', fontFamily: 'var(--fb)', color: 'var(--text)' }}>
              {score}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: scoreColor, letterSpacing: '0.04em' }}>
              {ratingText}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.3', fontWeight: '500' }}>
              {detailsText}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', padding: '0 12px', background: 'var(--bg2)' }}>
        {[
          { id: 'overview', label: 'OVERVIEW', count: evaluatedRooms.length },
          { id: 'positives', label: 'AUSPICIOUS', count: complianceExcellent.length },
          { id: 'improvements', label: 'CORRECTIONS', count: complianceIssues.length }
        ].map((tab) => {
          const active = activeSubTab === tab.id
          return (
            <div 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 4px',
                fontSize: '9.5px',
                fontWeight: '800',
                color: active ? 'var(--gold)' : 'var(--text3)',
                cursor: 'pointer',
                borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                letterSpacing: '0.04em'
              }}
            >
              {tab.label} ({tab.count})
            </div>
          )
        })}
      </div>

      {/* Content List */}
      <div className="analysis-content" style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {activeSubTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {evaluatedRooms.map((room) => {
              const isExcellent = room.analysis.status === 'Excellent' || room.analysis.status === 'Good' || room.analysis.status === 'Neutral'
              const statusColor = isExcellent ? 'var(--status-emerald)' : (room.analysis.status === 'Can Be Improved' ? 'var(--status-amber)' : 'var(--status-red)')
              
              return (
                <div 
                  key={room.id} 
                  onClick={() => handleRowClick(room)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'var(--bg3)',
                    border: '1.5px solid var(--border)',
                    borderLeft: `3px solid ${statusColor}`,
                    borderRadius: '10px',
                    cursor: isExcellent ? 'default' : 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease'
                  }}
                  className="remedy-row-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                    <i className={`ti ti-${isExcellent ? 'circle-check-filled' : 'alert-triangle-filled'}`} style={{ color: statusColor, fontSize: '16px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
                        {room.label} in {room.analysis.zone}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px' }}>
                        {isExcellent ? 'Highly auspicious Vedic alignment.' : 'Clashes with sector element. Click to resolve ➔'}
                      </span>
                    </div>
                  </div>
                  {!isExcellent && <i className="ti ti-chevron-right" style={{ color: 'var(--text3)', fontSize: '14px' }} />}
                </div>
              )
            })}
            {evaluatedRooms.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic', fontSize: '12px' }}>
                Your layout canvas is empty. Add rooms in Editor tab.
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'positives' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complianceExcellent.map((room) => (
              <div 
                key={room.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(16, 185, 129, 0.03)',
                  border: '1.5px solid rgba(16, 185, 129, 0.15)',
                  borderLeft: '3px solid var(--status-emerald)',
                  borderRadius: '10px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <i className="ti ti-circle-check-filled" style={{ color: 'var(--status-emerald)', fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
                      {room.label} in {room.analysis.zone}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px', lineHeight: '1.4' }}>
                      {room.analysis.desc}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {complianceExcellent.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic', fontSize: '12px' }}>
                No compliant coordinates established yet.
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'improvements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complianceIssues.map((room) => {
              const statusColor = room.analysis.status === 'Needs Attention' ? 'var(--status-red)' : 'var(--status-amber)'
              return (
                <div 
                  key={room.id} 
                  onClick={() => handleRowClick(room)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'var(--bg3)',
                    border: '1.5px solid var(--border)',
                    borderLeft: `3px solid ${statusColor}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  className="remedy-row-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
                    <i className="ti ti-alert-triangle-filled" style={{ color: statusColor, fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
                        {room.label} in {room.analysis.zone}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px', textDecoration: 'underline' }}>
                        Element conflict! View copper/crystal remedies ➔
                      </span>
                    </div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ color: 'var(--text3)', fontSize: '14px' }} />
                </div>
              )
            })}
            {complianceIssues.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--emerald)', fontWeight: 'bold', fontSize: '12px' }}>
                Excellent! Zero elemental conflicts detected.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer view report */}
      <div style={{ padding: '16px', borderTop: '1.5px solid var(--border)', flexShrink: 0, background: 'var(--bg2)' }}>
        <button 
          className="btn btn-primary" 
          style={{
            width: '100%',
            padding: '12px',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-gradient-end) 100%)',
            borderColor: 'var(--gold)',
            boxShadow: '0 4px 14px rgba(245, 166, 35, 0.2)'
          }}
          onClick={() => onSwitchTab('reports')}
        >
          View Detailed Audit Report
        </button>
      </div>
    </div>
  )
}
