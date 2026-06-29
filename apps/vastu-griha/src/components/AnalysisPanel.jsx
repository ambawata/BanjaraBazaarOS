import React from 'react'

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
      SE: 'Incompatible. Clash of fire (Southeast) and water (Pooja) elements. Leads to family arguments.',
      S: 'Forbidden. Facing the direction of death (Yama) is not recommended for deities.',
      SW: 'Forbidden. Nairutya is for heavy master bedroom stability, not prayer energy.'
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
      N: 'Incompatible. Clashes with Kubera wealth sector. Leads to financial leakages.',
      NE: 'Critical violation! Placing fire in the water zone (Ishanya) destroys family health and mental clarity.',
      SW: 'Critical violation! Fire in Nairutya destroys financial savings and relationship stability.',
      C: 'Critical violation! Placing fire in the center (Brahmasthan) brings distress and family arguments.'
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
      SE: 'Incompatible. Fire energy causes restlessness, anger issues, and marital disputes.',
      NE: 'Critical violation! Sleeping in the spiritual corner disturbs sleep, causes stress, and affects marital harmony.',
      C: 'Critical violation! The heart of the house (Brahmasthan) must not be locked inside a heavy bedroom.'
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
      NW: 'Perfect placement! Vayavya (Wind) quadrant easily blows away negative energies and drains waste safely.',
      W: 'Very good. Safe direction for drainage.',
      S: 'Acceptable. Safe if drainage is toward the Northwest or West.',
      SE: 'Incompatible. Placing toilet in the fire corner drains financial resources and health.',
      N: 'Incompatible. Toilet in Kubera wealth quadrant leads to severe money drains.',
      E: 'Incompatible. Blocks morning solar energy, causing chronic fatigue.',
      SW: 'Critical violation! Nairutya toilet drains household stability, marital relationships, and savings.',
      NE: 'Critical violation! Restroom in the divine Ishanya corner is a major defect, causing critical illnesses and blocks.',
      C: 'Critical violation! Draining waste in the Brahmasthan ruins the entire household energy and happiness.'
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
      N: 'Critical violation! Heavy concrete blocks the inflow of Kubera wealth energies.',
      NE: 'Critical violation! Heaviness in Ishanya blocks divine solar rays and water element, causing severe delays.',
      C: 'Critical violation! A heavy concrete block or circular staircase in the center (Brahmasthan) causes heavy chest/health problems.'
    },
    remedies: {
      NE: 'Hang a copper Sun on the eastern wall of the staircase. Keep the area extremely well-lit with yellow lights.',
      N: 'Place a brass tortoise at the bottom of the stairs facing towards the north.',
      C: 'Keep a crystal lotus on the staircase landing to balance the heavy central weight.'
    }
  },
  entrance: {
    name: 'Main Entrance',
    ratings: { NE: 100, N: 95, E: 95, NW: 75, W: 60, SE: 25, S: 20, SW: 0, C: 0 },
    descriptions: {
      NE: 'Highly auspicious! The ultimate door direction for pure cosmic, mental, and financial positive energies.',
      N: 'Auspicious. Attracts high income, good career opportunities, and business success.',
      E: 'Auspicious. Brings positive energy, social status, and healthy lifespans.',
      NW: 'Good. Wind entrance is clean, but keep a threshold to avoid money blowing away.',
      W: 'Acceptable. Safe for trade and businesses.',
      SE: 'Poor. Agni entrance causes arguments, fire accidents, or legal disputes.',
      S: 'Poor. Entrance facing South is ruled by Yama. Requires special threshold remedies.',
      SW: 'Critical violation! Entrance in Southwest leads to severe money losses, theft, and health breakdowns.',
      C: 'Forbidden. A main entrance directly in the exact center is structurally impossible and Vastu-taboo.'
    },
    remedies: {
      SW: 'Place a lead metal threshold strip under the main door. Hang a Panchmukhi Hanuman photo above the door.',
      SE: 'Paint the door in cream or light yellow. Install a copper threshold or copper strip.',
      S: 'Paint the door in red or dark wood. Mount a brass deity (like Ganesha) above the frame, and use a brass threshold.'
    }
  }
}

export function evaluateRoom(room, plot) {
  // Determine center coordinates of room
  const cx = room.x + room.width / 2
  const cy = room.y + room.height / 2
  
  // Map cx, cy (0-100) to grid coordinates (0, 1, 2)
  let col = 1
  if (cx < 33.3) col = 0
  else if (cx >= 66.6) col = 2
  
  let row = 1
  if (cy < 33.3) row = 0
  else if (cy >= 66.6) row = 2
  
  // Directions based on standard N-top grid
  const zoneMap = [
    ['NW', 'N', 'NE'],
    ['W',  'C', 'E' ],
    ['SW', 'S', 'SE']
  ]
  
  const zone = zoneMap[row][col]
  const config = VASTU_RULES[room.type]
  if (!config) return { rating: 50, zone, status: 'Acceptable', desc: 'Custom Room Placement.' }
  
  const rating = config.ratings[zone] !== undefined ? config.ratings[zone] : 50
  
  let status = 'Acceptable'
  if (rating >= 90) status = 'Excellent'
  else if (rating >= 70) status = 'Good'
  else if (rating >= 40) status = 'Warning'
  else status = 'Poor'
  
  const desc = config.descriptions[zone] || 'No specific guidelines.'
  const remedy = rating < 70 ? config.remedies[zone] : null

  return {
    rating,
    zone,
    status,
    desc,
    remedy,
    roomName: config.name
  }
}

export default function AnalysisPanel({ rooms, plot }) {
  // Compute overall score
  let totalRating = 0
  let count = 0
  
  const evaluatedRooms = rooms.map(room => {
    const analysis = evaluateRoom(room, plot)
    totalRating += analysis.rating
    count++
    return { ...room, analysis }
  })
  
  const score = count > 0 ? Math.round(totalRating / count) : 100
  
  // Categorize rules into issues vs good placements
  const complianceExcellent = evaluatedRooms.filter(r => r.analysis.status === 'Excellent' || r.analysis.status === 'Good')
  const complianceIssues = evaluatedRooms.filter(r => r.analysis.status === 'Warning' || r.analysis.status === 'Poor')

  // Set colors based on score
  let scoreColor = 'var(--emerald)'
  let ratingText = 'Excellent (Vastu Auspicious)'
  if (score < 50) {
    scoreColor = 'var(--red)'
    ratingText = 'Poor (Severe Defects)'
  } else if (score < 75) {
    scoreColor = 'var(--amber)'
    ratingText = 'Fair (Needs Remedies)'
  } else if (score < 90) {
    scoreColor = 'var(--gold)'
    ratingText = 'Good (Very Positive)'
  }

  // Calculate stroke dashoffset for the circular gauge
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700 }}>Vastu Evaluation</h3>
        <div className="score-widget">
          <div className="score-circle-container">
            <svg className="score-svg">
              <circle className="score-svg-bg" cx="32" cy="32" r={radius} />
              <circle 
                className="score-svg-fill" 
                cx="32" 
                cy="32" 
                r={radius} 
                style={{ 
                  stroke: scoreColor, 
                  strokeDasharray: circumference, 
                  strokeDashoffset: strokeDashoffset 
                }} 
              />
            </svg>
            <div className="score-text" style={{ color: scoreColor }}>{score}%</div>
          </div>
          <div className="score-details">
            <span className="score-label">Compliance Score</span>
            <span className="score-rating" style={{ color: scoreColor }}>{ratingText}</span>
          </div>
        </div>
      </div>

      <div className="analysis-content">
        {/* Warning / Remedies Section */}
        {complianceIssues.length > 0 && (
          <div>
            <div className="rule-group-title" style={{ color: 'var(--red)' }}>Vastu Defects & Remedies ({complianceIssues.length})</div>
            <div className="rule-list">
              {complianceIssues.map((room) => (
                <div key={room.id} className={`rule-card rule-${room.analysis.status.toLowerCase()}`}>
                  <i className={`rule-card-icon ti ti-${room.analysis.status === 'Poor' ? 'circle-x-filled' : 'alert-triangle-filled'}`}></i>
                  <div className="rule-card-content">
                    <span className="rule-card-title">{room.label} in {room.analysis.zone}</span>
                    <span className="rule-card-desc">{room.analysis.desc}</span>
                    {room.analysis.remedy && (
                      <span className="rule-card-remedy">
                        <i className="ti ti-heart-handshake" style={{ marginRight: '4px' }}></i>
                        <strong>Remedy:</strong> {room.analysis.remedy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excellent / Good Placements */}
        <div>
          <div className="rule-group-title" style={{ color: 'var(--emerald)' }}>Positive Alignments ({complianceExcellent.length})</div>
          {complianceExcellent.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>No positive Vastu alignments found yet. Try relocating rooms or utilizing AI templates.</p>
          ) : (
            <div className="rule-list">
              {complianceExcellent.map((room) => (
                <div key={room.id} className="rule-card rule-excellent">
                  <i className="ti ti-circle-check-filled rule-card-icon"></i>
                  <div className="rule-card-content">
                    <span className="rule-card-title">{room.label} in {room.analysis.zone}</span>
                    <span className="rule-card-desc">{room.analysis.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Vastu Checklists */}
        <div style={{ background: 'var(--bg3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: 'auto' }}>
          <h4 style={{ fontSize: '11px', fontFamily: 'var(--fm)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>Brahmasthan Clearance</h4>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4' }}>
            {rooms.some(r => evaluateRoom(r, plot).zone === 'C') ? (
              <span style={{ color: 'var(--red)' }}><i className="ti ti-circle-x"></i> Center zone (Brahmasthan) is occupied. It must remain fully empty, clean, and open to invite cosmic flow.</span>
            ) : (
              <span style={{ color: 'var(--emerald)' }}><i className="ti ti-circle-check"></i> Center zone is clear. Pure cosmic ether flows freely in your home.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
