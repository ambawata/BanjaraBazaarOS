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
      NW: 'Perfect placement! Vayavya (Wind) quadrant easily blows away negative energies and drains waste safely.',
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
  
  let col = 1
  if (cx < 33.3) col = 0
  else if (cx >= 66.6) col = 2
  
  let row = 1
  if (cy < 33.3) row = 0
  else if (cy >= 66.6) row = 2
  
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

export default function AnalysisPanel({ rooms, plot }) {
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

  let scoreColor = 'var(--emerald)'
  let ratingText = 'Very Harmonious Home'
  if (score < 50) {
    scoreColor = 'var(--terracotta)'
    ratingText = 'Needs Remedial Actions'
  } else if (score < 80) {
    scoreColor = 'var(--gold)'
    ratingText = 'Can Be Improved with Remedies'
  }

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700 }}>Vastu Health Check</h3>
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
            <span className="score-label">Harmony Rating</span>
            <span className="score-rating" style={{ color: scoreColor, fontSize: '13.5px' }}>{ratingText}</span>
          </div>
        </div>
      </div>

      <div className="analysis-content">
        {/* Needs Attention / remedies */}
        {complianceIssues.length > 0 && (
          <div>
            <div className="rule-group-title" style={{ color: 'var(--terracotta)' }}>Needs Attention ({complianceIssues.length})</div>
            <div className="rule-list">
              {complianceIssues.map((room) => (
                <div key={room.id} className={`rule-card rule-${room.analysis.status === 'Needs Attention' ? 'poor' : 'warning'}`}>
                  <i className={`rule-card-icon ti ti-${room.analysis.status === 'Needs Attention' ? 'circle-x-filled' : 'alert-triangle-filled'}`}></i>
                  <div className="rule-card-content">
                    <span className="rule-card-title">{room.label} in {room.analysis.zone}</span>
                    <span className="rule-card-desc">{room.analysis.desc}</span>
                    {room.analysis.remedy && (
                      <span className="rule-card-remedy">
                        <i className="ti ti-heart-handshake" style={{ marginRight: '4px' }}></i>
                        <strong>Remedy Solution:</strong> {room.analysis.remedy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Alignments */}
        <div>
          <div className="rule-group-title" style={{ color: 'var(--emerald)' }}>Positive Alignments ({complianceExcellent.length})</div>
          {complianceExcellent.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>Place items or use AI templates to find positive alignments.</p>
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

        {/* Brahmasthan Check */}
        <div style={{ background: 'var(--bg3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: 'auto' }}>
          <h4 style={{ fontSize: '11px', fontFamily: 'var(--fm)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>Center Space Clearance</h4>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4' }}>
            {rooms.some(r => evaluateRoom(r, plot).zone === 'C') ? (
              <span style={{ color: 'var(--terracotta)' }}><i className="ti ti-circle-x"></i> The central space is occupied. For peace, keep the center completely open and free of walls.</span>
            ) : (
              <span style={{ color: 'var(--emerald)' }}><i className="ti ti-circle-check"></i> Center space is clear. Energy flows smoothly in the middle of your home.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
