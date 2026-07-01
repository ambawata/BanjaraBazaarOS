import React, { useState } from 'react'
import Compass from '../../components/Compass'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'

export default function OnboardingWizard() {
  const { screenState, setScreenState, setActiveTab } = useUiStore()
  const { onboarding, setOnboarding, setPlot } = useProjectStore()
  const { setRooms } = useCanvasStore()

  // Local Wizard Step Router
  const [wizardStep, setWizardStep] = useState(1)

  // Lazy-load nested wizard parameters
  const [roomsSelected, setRoomsSelected] = useState({
    bedroom: true,
    kitchen: true,
    bathroom: true,
    pooja: true,
    living: true,
    dining: false,
    store: false,
    garage: false
  })

  const [utilitiesSelected, setUtilitiesSelected] = useState({
    sewer: true,
    water: true,
    electric: true,
    rainwater: false,
    borewell: false,
    septic: false
  })

  const [wizardData, setWizardData] = useState({
    width: '30',
    length: '40',
    roadFacing: 'East',
    roadWidth: '30',
    cornerPlot: 'No',
    wallThickness: '9',
    wallHeight: '6',
    gatePosition: 'NE Corner',
    gateWidth: '10',
    gateStyle: 'Swing',
    constructionStage: 'Plot Only',
    floorsCount: '1'
  })

  const updateData = (key, val) => {
    setWizardData({ ...wizardData, [key]: val })
  }

  // Compile final results & switch to canvas
  const handleGenerateBlueprint = () => {
    setWizardStep(9) // Transition loading page

    setTimeout(() => {
      const w = parseInt(wizardData.width) || 30
      const l = parseInt(wizardData.length) || 40

      // 1. Set plot parameters
      setPlot({
        width: w,
        length: l,
        shape: onboarding.plotShape || 'Rectangular',
        facing: wizardData.roadFacing,
        tilt: 0
      })

      // 2. Set generated rooms array
      const generated = []

      // Standard boundary offset positions mapping
      if (roomsSelected.bedroom) {
        generated.push({ id: 'room-1', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 })
      }
      if (roomsSelected.kitchen) {
        generated.push({ id: 'room-2', type: 'kitchen', label: 'Kitchen Cooktop', x: 75, y: 70, width: 20, height: 25 })
      }
      if (roomsSelected.pooja) {
        generated.push({ id: 'room-3', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 10, width: 20, height: 20 })
      }
      if (roomsSelected.living) {
        generated.push({ id: 'room-4', type: 'living', label: 'Living Room Lounge', x: 25, y: 20, width: 45, height: 40 })
      }
      if (roomsSelected.bathroom) {
        generated.push({ id: 'room-5', type: 'toilet', label: 'Bathroom Toilet', x: 5, y: 35, width: 18, height: 22 })
      }
      if (roomsSelected.dining) {
        generated.push({ id: 'room-6', type: 'dining', label: 'Dining Space', x: 50, y: 65, width: 20, height: 30 })
      }

      // Add utilities based on checkbox selections
      if (utilitiesSelected.borewell) {
        generated.push({ id: 'util-1', type: 'borewell', label: 'Borewell Spot', x: 82, y: 35, width: 10, height: 10 })
      }
      if (utilitiesSelected.septic) {
        generated.push({ id: 'util-2', type: 'septic', label: 'Septic Tank', x: 5, y: 5, width: 16, height: 12 })
      }

      // Set state stores
      setRooms(generated)
      
      // Navigate straight to planner canvas workspace
      setScreenState('workspace')
      setActiveTab('designer')
    }, 2200)
  }

  // Header progress tracker
  const renderWizardTracker = () => {
    if (wizardStep > 8) return null
    return (
      <div style={{ padding: '16px 24px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.svg" style={{ width: '28px', height: '28px' }} alt="Logo" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--fd)', fontSize: '15px', fontWeight: 700, lineHeight: 1.1 }}>Guided House Wizard</span>
              <span style={{ fontSize: '10px', color: 'var(--text2)' }}>Create your custom layout step by step</span>
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>Step {wizardStep} of 8</span>
        </div>

        <div style={{ width: '100%', height: '5px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${(wizardStep / 8) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      
      {renderWizardTracker()}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
        
        {/* STEP 1: PLOT SHAPE */}
        {wizardStep === 1 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="25" y="25" width="50" height="50" rx="4" />
                <line x1="15" y1="50" x2="85" y2="50" strokeDasharray="3 3" opacity="0.5" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>1. Choose Plot Shape</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Select the layout outline that matching your property ground boundaries.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'Rectangular Plot', label: 'Rectangular Plot (Common)', desc: 'East-West and North-South straight parallel walls' },
                { id: 'Square Plot', label: 'Square Plot (Ideal)', desc: 'Perfect equal dimensions, highly recommended' },
                { id: 'Irregular Plot', label: 'Irregular Polygon', desc: 'Uneven corner angles, requires corrections' }
              ].map(item => (
                <div 
                  key={item.id}
                  className={`option-list-card ${onboarding.plotShape === item.id ? 'selected' : ''}`}
                  onClick={() => setOnboarding({ ...onboarding, plotShape: item.id })}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.label}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text2)' }}>{item.desc}</span>
                  </div>
                  <div className="option-circle">
                    {onboarding.plotShape === item.id && <div className="option-circle-dot"></div>}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '10px' }} onClick={() => setWizardStep(2)}>
              Next Step
            </button>
          </div>
        )}

        {/* STEP 2: BOUNDARY LENGTHS */}
        {wizardStep === 2 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="20" y="20" width="60" height="60" />
                <line x1="20" y1="12" x2="80" y2="12" stroke="var(--gold)" strokeWidth="1.5" />
                <text x="50" y="8" fill="var(--gold)" fontSize="8" textAnchor="middle">Width</text>
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>2. Enter Plot Boundaries</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Provide parallel side lengths in feet (e.g. 30 ft by 40 ft).</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Width (East-West side in feet)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. 30" value={wizardData.width}
                  onChange={(e) => updateData('width', e.target.value)}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Length (North-South side in feet)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. 40" value={wizardData.length}
                  onChange={(e) => updateData('length', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(3)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 3: ROAD DETAILS */}
        {wizardStep === 3 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="35" y="35" width="40" height="40" fill="none" stroke="var(--border2)" />
                <rect x="15" y="35" width="10" height="40" fill="rgba(124, 111, 247, 0.15)" stroke="var(--accent)" />
                <path d="M20,35 V75" stroke="var(--accent)" strokeDasharray="2 2" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>3. Road & Facing Side</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Specify road coordinates where traffic enters your property.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Road Side Location</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px', textAlign: 'left' }}
                  value={wizardData.roadFacing}
                  onChange={(e) => updateData('roadFacing', e.target.value)}
                >
                  <option value="East">East Road (Solar Access)</option>
                  <option value="North">North Road (Wealth zone)</option>
                  <option value="West">West Road (Neutral)</option>
                  <option value="South">South Road (Friction zone)</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Road Width (feet)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.roadWidth}
                  onChange={(e) => updateData('roadWidth', e.target.value)}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Corner Plot (Multiple Roads)?</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.cornerPlot}
                  onChange={(e) => updateData('cornerPlot', e.target.value)}
                >
                  <option value="No">No, single road access</option>
                  <option value="Yes">Yes, corner plot (2 roads)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(2)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(4)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 4: COMPOUND WALL */}
        {wizardStep === 4 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="25" y="25" width="50" height="50" stroke="var(--border)" strokeWidth="3" />
                <rect x="33" y="33" width="34" height="34" stroke="var(--accent)" strokeWidth="1.5" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>4. Compound Wall Offsets</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Configure boundaries thickness and distance offsets to building.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Wall Thickness (inches)</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.wallThickness}
                  onChange={(e) => updateData('wallThickness', e.target.value)}
                >
                  <option value="9">9 inches Outer Wall (Vastu Recommended)</option>
                  <option value="4.5">4.5 inches Thin Partition Wall</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Wall Height (feet)</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.wallHeight}
                  onChange={(e) => updateData('wallHeight', e.target.value)}
                >
                  <option value="6">6 ft Standard compound wall</option>
                  <option value="5">5 ft Low height wall</option>
                  <option value="8">8 ft Extra protection wall</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(3)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(5)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 5: MAIN GATE */}
        {wizardStep === 5 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="20" y="45" width="60" height="10" fill="rgba(124, 111, 247, 0.1)" stroke="var(--border)" />
                <line x1="35" y1="45" x2="35" y2="25" stroke="var(--accent)" strokeWidth="2.5" />
                <line x1="65" y1="45" x2="65" y2="25" stroke="var(--accent)" strokeWidth="2.5" />
                <path d="M35,25 Q50,15 65,25" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>5. Place Main Entrance Gate</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Entrances determine main energy flows entering the site.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Gate Location Zone</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.gatePosition}
                  onChange={(e) => updateData('gatePosition', e.target.value)}
                >
                  <option value="NE Corner">Northeast Gate (Ishanya - Highly Auspicious)</option>
                  <option value="NW Corner">Northwest Gate (Vayavya - Good)</option>
                  <option value="SE Corner">Southeast Gate (Agneya - Requires copper remedy)</option>
                  <option value="SW Corner">Southwest Gate (Avoid if possible)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Gate Width (ft)</span>
                  <select 
                    className="btn" style={{ width: '100%', padding: '10px' }}
                    value={wizardData.gateWidth}
                    onChange={(e) => updateData('gateWidth', e.target.value)}
                  >
                    <option value="10">10 ft (Recommended)</option>
                    <option value="8">8 ft (Standard)</option>
                    <option value="12">12 ft (Wide car entry)</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Style</span>
                  <select 
                    className="btn" style={{ width: '100%', padding: '10px' }}
                    value={wizardData.gateStyle}
                    onChange={(e) => updateData('gateStyle', e.target.value)}
                  >
                    <option value="Swing">Swing Gate (Auspicious)</option>
                    <option value="Sliding">Sliding Gate (Space Saver)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(4)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(6)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 6: UTILITIES & WATER */}
        {wizardStep === 6 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 2, marginBottom: '10px' }}>
                <circle cx="50" cy="50" r="30" stroke="var(--water-blue)" />
                <path d="M40,50 C45,45 55,45 60,50 C65,55 75,55 80,50" stroke="var(--water-blue)" strokeWidth="1.5" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>6. Utilities Connections</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Check connections to pre-align on canvas blueprint spots.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
              {[
                { key: 'sewer', label: 'Sewer Line' },
                { key: 'water', label: 'Municipal Water' },
                { key: 'electric', label: 'Electric Grid' },
                { key: 'rainwater', label: 'Rain Harvesting' },
                { key: 'borewell', label: 'Borewell Spot 💧' },
                { key: 'septic', label: 'Septic Tank 🚽' }
              ].map(u => (
                <label 
                  key={u.key} 
                  style={{
                    background: 'var(--bg2)',
                    border: utilitiesSelected[u.key] ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="checkbox"
                    checked={utilitiesSelected[u.key]}
                    onChange={(e) => setUtilitiesSelected({ ...utilitiesSelected, [u.key]: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{u.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(5)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(7)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 7: EXISTING STRUCTURE */}
        {wizardStep === 7 && (
          <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, marginBottom: '10px' }}>
                <polygon points="50,15 90,45 80,45 80,85 20,85 20,45 10,45" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>7. Construction Stage</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Let us know if there is an existing structure footprint.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Current Stage</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.constructionStage}
                  onChange={(e) => updateData('constructionStage', e.target.value)}
                >
                  <option value="Plot Only">Vacant Land / Raw Plot only</option>
                  <option value="Foundation Done">Foundation Plinth Level completed</option>
                  <option value="Renovation">Built house (Renovation Vastu Audit)</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>Planned Floors</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '10px' }}
                  value={wizardData.floorsCount}
                  onChange={(e) => updateData('floorsCount', e.target.value)}
                >
                  <option value="1">Ground Floor (G) only</option>
                  <option value="2">G + 1 Floor (Duplex)</option>
                  <option value="3">G + 2 Floors</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(6)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(8)}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 8: ROOM CHECKLIST */}
        {wizardStep === 8 && (
          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--gold)', strokeWidth: 2, marginBottom: '10px' }}>
                <rect x="20" y="20" width="60" height="60" />
                <line x1="50" y1="20" x2="50" y2="80" />
                <line x1="20" y1="50" x2="80" y2="50" />
              </svg>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>8. Select Required Rooms</h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Choose elements to pre-generate on your visual canvas planner.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
              {[
                { key: 'bedroom', label: 'Master Bedroom 🛏️' },
                { key: 'kitchen', label: 'Kitchen Cooktop 🍳' },
                { key: 'bathroom', label: 'Bathroom Toilet 🚿' },
                { key: 'pooja', label: 'Pooja Mandir 🛕' },
                { key: 'living', label: 'Living Room 📺' },
                { key: 'dining', label: 'Dining Area 🍽️' },
                { key: 'store', label: 'Store Room 📦' },
                { key: 'garage', label: 'Car Garage 🚗' }
              ].map(rm => (
                <label 
                  key={rm.key}
                  style={{
                    background: 'var(--bg2)',
                    border: roomsSelected[rm.key] ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="checkbox"
                    checked={roomsSelected[rm.key]}
                    onChange={(e) => setRoomsSelected({ ...roomsSelected, [rm.key]: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{rm.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setWizardStep(7)}>Back</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1.5, padding: '12px', justifyContent: 'center', fontWeight: 'bold' }} 
                onClick={handleGenerateBlueprint}
              >
                Generate Layout ✨
              </button>
            </div>
          </div>
        )}

        {/* LOADING GENERATING STATE */}
        {wizardStep === 9 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid var(--accent-dim)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid transparent', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'rotateCompass 1.5s linear infinite' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Compass tilt={0} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700 }}>Calibrating Vedic Grid Flow...</h3>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px', maxWidth: '280px', lineHeight: 1.4 }}>
                Plotting compound offsets, entrance alignments, and placing selected Vastu rooms on canvas coordinates.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
