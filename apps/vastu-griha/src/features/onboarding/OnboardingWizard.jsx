import React from 'react'
import Canvas from '../../components/Canvas'
import Compass from '../../components/Compass'
import PlotBoundaryDrawer from '../../components/PlotBoundaryDrawer'
import { GOAL_SVGS, STYLE_SVGS } from '../../assets/constants'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'

export default function OnboardingWizard() {
  const {
    screenState,
    setScreenState,
    isMobile,
    setShowAcharyaModal,
    isTracing,
    traceStatus,
    setActiveTab,
    designProgress,
    setDesignProgress
  } = useUiStore()

  const {
    onboarding,
    setOnboarding,
    plot,
    setPlot
  } = useProjectStore()

  const {
    rooms,
    setRooms,
    boundaryPoints,
    setBoundaryPoints,
    imageSettings,
    selectedRoomId,
    setSelectedRoomId,
    addRoom
  } = useCanvasStore()

  // Preset Selection vs. Custom inputs UX Rule (Screen 2 Plot Size)
  const selectSizePreset = (preset) => {
    setOnboarding({
      ...onboarding,
      sizePreset: preset,
      customWidth: '',
      customLength: ''
    })
  }

  const typeCustomDimension = (field, val) => {
    setOnboarding({
      ...onboarding,
      sizePreset: null, // Clear active preset
      [field]: val
    })
  }

  // Plot Boundary Preset vs. Corner Taps (Screen 3 Shape)
  const selectShapePreset = (shape) => {
    setBoundaryPoints([]) // Clear custom drawing
    setOnboarding({ ...onboarding, plotShape: shape })
  }

  const handlePointsChange = (pts) => {
    setBoundaryPoints(pts)
    if (pts.length > 0) {
      setOnboarding({ ...onboarding, plotShape: 'Custom Shape (Tapped corners)' })
    }
  }

  // Determine rooms based on lifestyle checklist (AI Room Determination)
  const getDeterminedRoomsList = () => {
    const list = []
    list.push('Living Room')
    list.push('Kitchen Cooktop')
    list.push('Dining Area')
    list.push('Bathroom / Toilet')

    if (onboarding.goal === 'Build New Home') {
      list.push('Master Bedroom')
      list.push('Parents Bedroom')
      list.push('Kids Bedroom')
    } else {
      list.push('Master Bedroom')
    }

    if (onboarding.customRequirements.toLowerCase().includes('pooja')) {
      list.push('Pooja Temple Mandir')
    } else {
      list.push('Pooja Temple Mandir (Recommended)')
    }

    if (onboarding.customRequirements.toLowerCase().includes('office') || onboarding.customRequirements.toLowerCase().includes('study')) {
      list.push('Home Office')
    }

    return list
  }

  // Generate plan from configurations
  const loadLifestyleLayout = () => {
    let w = 30, l = 40
    if (onboarding.sizePreset) {
      const parts = onboarding.sizePreset.split(' ')
      w = parseInt(parts[0]) || 30
      l = parseInt(parts[2]) || 40
    } else {
      w = parseInt(onboarding.customWidth) || 30
      l = parseInt(onboarding.customLength) || 40
    }

    let dir = 'East'
    if (onboarding.facing.includes('North')) dir = 'North'
    else if (onboarding.facing.includes('West')) dir = 'West'
    else if (onboarding.facing.includes('South')) dir = 'South'

    const tplPlot = {
      width: w,
      length: l,
      shape: onboarding.plotShape.includes('Custom') ? 'Irregular' : 'Rectangular',
      facing: dir,
      tilt: 0
    }

    const tplRooms = []
    tplRooms.push({ id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 80, y: 5, width: 15, height: 8 })
    tplRooms.push({ id: 'r2', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 15, width: 20, height: 15 })
    tplRooms.push({ id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 75, y: 70, width: 20, height: 20 })
    tplRooms.push({ id: 'r4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 35, height: 25 })
    tplRooms.push({ id: 'r5', type: 'living', label: 'Living Room Lounge', x: 30, y: 25, width: 40, height: 35 })
    tplRooms.push({ id: 'r6', type: 'toilet', label: 'Bathroom Toilet', x: 5, y: 35, width: 20, height: 20 })

    setPlot(tplPlot)
    setRooms(tplRooms)
    setScreenState('preview')
  }

  // Start designing animation
  const triggerAiDesignProcess = () => {
    setScreenState('designing')
    setDesignProgress(0)
    
    const interval = setInterval(() => {
      setDesignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          loadLifestyleLayout()
          return 100
        }
        return prev + 10
      })
    }, 150)
  }

  // Wizard header matching mockup
  const renderWizardHeader = (activeStep, backState) => {
    return (
      <div className="wizard-layout-header" style={{ width: '100%', padding: '16px 24px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <button className="btn" style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', visibility: activeStep === 1 ? 'hidden' : 'visible' }} onClick={() => setScreenState(backState)}>
            <i className="ti ti-arrow-left"></i> Back
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.svg" style={{ width: '32px', height: '32px' }} alt="Vastu Logo" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700, lineHeight: 1.1 }}>Vastu Griha</span>
              <span style={{ fontSize: '10px', color: 'var(--text2)' }}>AI + Vastu. Perfect Harmony.</span>
            </div>
          </div>

          <button className="btn" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '24px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setScreenState('workspace'); setShowAcharyaModal(true); }}>
            <svg viewBox="0 0 40 40" width="24" height="24">
              <circle cx="20" cy="20" r="18" fill="var(--gold-dim)" />
              <circle cx="20" cy="16" r="6" fill="var(--gold)" />
              <path d="M10,32 Q20,22 30,32" fill="none" stroke="var(--gold)" strokeWidth="2.5" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Ask Acharya</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: '8px', margin: '4px 0' }}>
          {[
            { step: 1, label: 'Start Type' },
            { step: 2, label: 'Project Info' },
            { step: 3, label: 'Upload & Scale' },
            { step: 4, label: 'Preferences' }
          ].map((item, idx) => {
            const isCompleted = activeStep > item.step
            const isActive = activeStep === item.step
            return (
              <React.Fragment key={item.step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--accent)' : (isActive ? 'var(--accent-dim)' : 'var(--bg3)'),
                    border: `2px solid ${isActive || isCompleted ? 'var(--accent)' : 'var(--border2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted || isActive ? 'var(--accent)' : 'var(--text3)',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {isCompleted ? <i className="ti ti-check" style={{ color: '#fff', fontSize: '14px' }}></i> : item.step}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: isActive || isCompleted ? 'var(--accent)' : 'var(--text3)' }}>{item.label}</span>
                </div>
                {idx < 3 && (
                  <div style={{ flex: 1, maxWidth: '80px', height: '2px', background: isCompleted ? 'var(--accent)' : 'var(--border2)', margin: '0 4px', marginBottom: '14px' }}></div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  // Step 1: Start Type selection
  if (screenState === 'step_prop') {
    const props = ['Independent Villa', 'Raw Land / Plot', 'Apartment Flat', 'Renovation Project']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {renderWizardHeader(1, 'welcome')}

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>What type of property is this?</h2>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {props.map(p => (
              <div 
                key={p}
                className={`option-list-card ${onboarding.propertyType === p ? 'selected' : ''}`}
                onClick={() => setOnboarding({ ...onboarding, propertyType: p })}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{p}</span>
                <div className="option-circle">
                  {onboarding.propertyType === p && <div className="option-circle-dot"></div>}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', padding: '12px', justifyContent: 'center', marginTop: 'auto' }} onClick={() => setScreenState('step_size')}>
            Next Step
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Project Info
  if (screenState === 'step_size') {
    const presets = ['20 x 30 ft', '30 x 40 ft', '30 x 50 ft', '40 x 60 ft', '50 x 80 ft']
    const sides = ['North Road 🧭', 'East Road ☀️', 'South Road 🔥', 'West Road 🌅']
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {renderWizardHeader(2, 'step_prop')}

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>Tell us about your plot</h2>
          
          <div style={{ width: '100%', maxWidth: '420px', textAlign: 'left', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>1. Select Plot Size</span>
            <div className="onboarding-options-grid">
              {presets.map(pr => (
                <div 
                   key={pr}
                   className={`option-button-card ${onboarding.sizePreset === pr ? 'selected' : ''}`}
                   onClick={() => selectSizePreset(pr)}
                >
                  {pr}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Custom Width (ft)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. 35" value={onboarding.customWidth}
                  onChange={(e) => typeCustomDimension('customWidth', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Custom Length (ft)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. 45" value={onboarding.customLength}
                  onChange={(e) => typeCustomDimension('customLength', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '420px', textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>2. Which side is the road?</span>
            <div className="onboarding-options-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {sides.map(sd => (
                <div 
                  key={sd}
                  className={`option-button-card ${onboarding.facing === sd ? 'selected' : ''}`}
                  onClick={() => setOnboarding({ ...onboarding, facing: sd })}
                >
                  {sd}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '420px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_prop')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_shape')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Upload & Scale / Shape Boundary
  if (screenState === 'step_shape') {
    const shapes = ['Square Plot', 'Rectangular Plot', 'L-Shape Plot', 'Irregular Plot']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {renderWizardHeader(3, 'step_size')}

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>Plot Boundary drawing</h2>
          <span style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '16px' }}>Select shape preset or tap corner points below</span>

          <div className="onboarding-options-grid" style={{ width: '100%', maxWidth: '420px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {shapes.map(sh => (
              <div 
                key={sh}
                className={`option-button-card ${onboarding.plotShape === sh ? 'selected' : ''}`}
                onClick={() => selectShapePreset(sh)}
              >
                {sh}
              </div>
            ))}
          </div>

          <PlotBoundaryDrawer points={boundaryPoints} onChange={handlePointsChange} />

          <div style={{ display: 'flex', width: '100%', maxWidth: '420px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_size')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_preferences')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: PREFERENCES
  if (screenState === 'step_preferences') {
    const goals = [
      { id: 'Build New Home', desc: 'Planning & designing a new home', key: 'build' },
      { id: 'Renovate / Remodel', desc: 'Making changes to existing home', key: 'renovate' },
      { id: 'Vastu Audit', desc: 'Check Vastu of existing home', key: 'audit' },
      { id: 'Find Remedies', desc: 'Get Vastu remedies & suggestions', key: 'remedy' }
    ]

    const budgets = ['Up to 25 Lakhs', '25 - 50 Lakhs', '50 - 1 Crore', 'Above 1 Crore']
    const styles = ['Modern', 'Traditional', 'Contemporary', 'Minimalist']

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {renderWizardHeader(4, 'step_shape')}

        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 700, margin: 0 }}>Set your preferences</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text2)', marginTop: '4px' }}>Tell us your needs so our AI can give better Vastu recommendations.</p>
            </div>
            <button className="btn btn-sm" style={{ gap: '6px', background: 'none', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '11px', whiteSpace: 'nowrap' }}>
              <i className="ti ti-bulb" style={{ color: 'var(--gold)' }}></i> Why these preferences?
            </button>
          </div>

          <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <i className="ti ti-target" style={{ color: 'var(--accent)' }}></i> 1. Which best describes your goal?
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                {goals.map(g => {
                  const isSelected = onboarding.goal === g.id
                  return (
                    <div 
                      key={g.id}
                      onClick={() => setOnboarding({ ...onboarding, goal: g.id })}
                      style={{
                        background: 'var(--bg2)',
                        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      {GOAL_SVGS[g.key]}
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', marginTop: '6px', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{g.id}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px', lineHeight: 1.2 }}>{g.desc}</span>
                      
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <i className="ti ti-check" style={{ fontSize: '10px' }}></i>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <i className="ti ti-users" style={{ color: 'var(--accent)' }}></i> 2. Family Details <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'normal' }}>(Optional)</span>
                </span>
                
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Number of Members</span>
                      <select 
                        className="chat-input" style={{ width: '100%', padding: '8px' }}
                        value={onboarding.membersCount}
                        onChange={(e) => setOnboarding({ ...onboarding, membersCount: e.target.value })}
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5+</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Main Occupant</span>
                      <select 
                        className="chat-input" style={{ width: '100%', padding: '8px' }}
                        value={onboarding.occupantType}
                        onChange={(e) => setOnboarding({ ...onboarding, occupantType: e.target.value })}
                      >
                        <option value="Self">Self</option>
                        <option value="Parents">Parents</option>
                        <option value="Children">Children</option>
                        <option value="Renters">Renters</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '220px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <i className="ti ti-currency-rupee" style={{ color: 'var(--accent)' }}></i> 3. Approximate Budget
                </span>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {budgets.map(b => {
                    const isSelected = onboarding.budget === b
                    return (
                      <div 
                        key={b}
                        onClick={() => setOnboarding({ ...onboarding, budget: b })}
                        className={`option-button-card ${isSelected ? 'selected' : ''}`}
                        style={{ padding: '8px 4px', fontSize: '11.5px', justifyContent: 'center' }}
                      >
                        {b}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1.2, minWidth: '250px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <i className="ti ti-layout" style={{ color: 'var(--accent)' }}></i> 4. Preferred Design Style
                </span>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {styles.map(s => {
                    const isSelected = onboarding.preferredStyle === s
                    return (
                      <div 
                        key={s}
                        onClick={() => setOnboarding({ ...onboarding, preferredStyle: s })}
                        style={{
                          border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(124,111,247,0.04)' : 'none'
                        }}
                      >
                        {STYLE_SVGS[s.toLowerCase()]}
                        <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '6px', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{s}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ flex: 0.8, minWidth: '200px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <i className="ti ti-message-2" style={{ color: 'var(--accent)' }}></i> 5. Special Notes
                </span>
                <textarea 
                  className="chat-input"
                  style={{ flex: 1, width: '100%', minHeight: '120px', padding: '12px', borderRadius: '12px', fontSize: '12px', resize: 'none' }}
                  placeholder="e.g. Need a senior citizen room on ground floor, EV charging in garage, open pooja temple..."
                  value={onboarding.customRequirements}
                  onChange={(e) => setOnboarding({ ...onboarding, customRequirements: e.target.value })}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '520px', gap: '16px', marginTop: 'auto', paddingTop: '24px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', borderRadius: '30px', justifyContent: 'center' }} onClick={() => setScreenState('step_shape')}>
              <i className="ti ti-arrow-left" style={{ marginRight: '6px' }}></i> Back
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1.5, padding: '12px', borderRadius: '30px', justifyContent: 'center', display: 'flex', flexDirection: 'column', height: '48px', lineHeight: 1 }}
              onClick={() => setScreenState('step_summary')}
            >
              <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>Continue <i className="ti ti-arrow-right"></i></span>
              <span style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>Next: AI will analyze your plan</span>
            </button>
          </div>

        </div>
      </div>
    )
  }

  // Step 5: AI Summary
  if (screenState === 'step_summary') {
    const list = getDeterminedRoomsList()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {renderWizardHeader(4, 'step_preferences')}

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>Your Vastu Home Blueprint Checklist</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '20px', maxWidth: '420px', textAlign: 'center' }}>
            Based on your answers (Goal: {onboarding.goal}, Budget: {onboarding.budget}, Style: {onboarding.preferredStyle}), the AI Vastu consultant has selected these required home structures:
          </p>

          <div className="summary-meta-card" style={{ maxWidth: '420px', textAlign: 'left', width: '100%' }}>
            {list.map((rName, idx) => (
              <div key={idx} className="summary-meta-row" style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="ti ti-circle-check" style={{ color: 'var(--accent)', fontSize: '16px' }}></i>
                <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{rName}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '420px', gap: '10px', marginTop: 'auto', paddingTop: '20px' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '14px', justifyContent: 'center', fontSize: '14.5px', fontWeight: 'bold' }}
              onClick={triggerAiDesignProcess}
            >
              Looks Good, Design My Vastu Home ✨
            </button>
            <button className="btn" style={{ padding: '10px', justifyContent: 'center', fontSize: '12px' }} onClick={() => setScreenState('step_preferences')}>
              Back to Preferences
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding loading robot bar
  if (screenState === 'designing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>AI Vastu Consultant</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-robot-wrapper">
            <svg className="robot-avatar-img" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.3" />
              <rect x="25" y="30" width="50" height="40" rx="12" fill="var(--bg2)" stroke="var(--accent)" strokeWidth="3" />
              <rect x="35" y="42" width="10" height="10" rx="3" fill="#fff" />
              <rect x="55" y="42" width="10" height="10" rx="3" fill="#fff" />
              <circle cx="40" cy="47" r="3" fill="var(--accent)" />
              <circle cx="60" cy="47" r="3" fill="var(--accent)" />
              <path d="M 45 60 Q 50 63 55 60" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="50" y1="30" x2="50" y2="18" stroke="var(--accent)" strokeWidth="3" />
              <circle cx="50" cy="15" r="5" fill="var(--gold)" />
            </svg>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700, marginTop: '20px', textAlign: 'center' }}>AI is calculating magnetic & solar flows...</h3>
            
            <div className="loader-bar-outer">
              <div className="loader-bar-inner" style={{ width: `${designProgress}%` }}></div>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '8px' }}>{designProgress}%</span>
          </div>

          <div className="loading-tips-bubble">
            <i className="ti ti-bulb" style={{ marginRight: '6px' }}></i>
            Vastu energy balances electromagnetic flows, ventilation space, and morning sunlight access.
          </div>
        </div>
      </div>
    )
  }

  // Generated Plan preview
  if (screenState === 'preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Your Vastu Plan is Ready! 🎉</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <div 
            className="remedy-dashboard-card" 
            style={{ 
              flex: 1, 
              width: '100%', 
              maxWidth: '440px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <Compass tilt={plot.tilt} />
            </div>

            <Canvas 
              rooms={rooms}
              plot={plot}
              onRoomsChange={setRooms}
              imageSettings={imageSettings}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              showVastuGrid={true}
              showNormalGrid={true}
            />
          </div>

          <div className="score-widget" style={{ width: '100%', maxWidth: '440px', justifyContent: 'space-between', padding: '14px', margin: '16px 0', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', color: '#22c55e' }}>
                92%
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Vastu Score</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#22c55e' }}>Excellent Vastu Home</span>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => { setScreenState('workspace'); setActiveTab('designer') }}>
              Open Editor
            </button>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '440px', padding: '14px', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
            onClick={() => { setScreenState('workspace'); setActiveTab('analysis') }}
          >
            View Vastu Audit
          </button>
        </div>
      </div>
    )
  }

  return null
}
