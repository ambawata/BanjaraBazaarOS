import React, { useState, useEffect } from 'react'
import Canvas from './components/Canvas'
import Compass from './components/Compass'
import PlotBoundaryDrawer from './components/PlotBoundaryDrawer'
import AnalysisPanel from './components/AnalysisPanel'
import BanjaraBazaarShop from './components/BanjaraBazaarShop'
import ReportGenerator from './components/ReportGenerator'
import AiChat from './components/AiChat'

const EXPANDED_ROOMS_CATALOG = {
  private: [
    { type: 'bedroom', label: 'Master Bedroom', icon: 'bed', w: 30, h: 25 },
    { type: 'bedroom', label: 'Parents Bedroom', icon: 'users', w: 25, h: 25 },
    { type: 'bedroom', label: 'Kids Bedroom', icon: 'mood-kid', w: 25, h: 25 },
    { type: 'bedroom', label: 'Guest Bedroom', icon: 'user-plus', w: 25, h: 25 },
    { type: 'bedroom', label: 'Servant Room', icon: 'user-cog', w: 18, h: 18 },
    { type: 'bedroom', label: 'Driver Room', icon: 'car-crane', w: 18, h: 18 }
  ],
  living: [
    { type: 'living', label: 'Living Room', icon: 'sofa', w: 35, h: 30 },
    { type: 'living', label: 'Dining Area', icon: 'tools-kitchen-2', w: 25, h: 20 },
    { type: 'custom', label: 'Study Room', icon: 'notebook', w: 20, h: 20 },
    { type: 'custom', label: 'Home Office', icon: 'device-laptop', w: 20, h: 20 },
    { type: 'custom', label: 'Home Theatre', icon: 'movie', w: 30, h: 25 },
    { type: 'custom', label: 'Gym Room', icon: 'barbell', w: 24, h: 20 }
  ],
  utility: [
    { type: 'kitchen', label: 'Kitchen Cooktop', icon: 'soup', w: 22, h: 22 },
    { type: 'custom', label: 'Utility Room', icon: 'wash', w: 15, h: 15 },
    { type: 'custom', label: 'Store Room', icon: 'box', w: 15, h: 12 },
    { type: 'custom', label: 'Pantry Space', icon: 'cup', w: 12, h: 12 },
    { type: 'toilet', label: 'Bathroom / Toilet', icon: 'wash-dryclean', w: 18, h: 15 },
    { type: 'toilet', label: 'Powder Room', icon: 'eyeglass', w: 12, h: 12 }
  ],
  vedic_heavy: [
    { type: 'pooja', label: 'Pooja Temple Mandir', icon: 'flame', w: 15, h: 15 },
    { type: 'staircase', label: 'Staircase Block', icon: 'arrow-merge', w: 15, h: 25 },
    { type: 'lift', label: 'Elevator / Lift Shaft', icon: 'arrows-up-down', w: 15, h: 15 }
  ],
  outdoor_power: [
    { type: 'entrance', label: 'Main Entrance Gate', icon: 'door-enter', w: 15, h: 8 },
    { type: 'compound-wall', label: 'Compound Wall Boundary', icon: 'square-toggle', w: 100, h: 6 },
    { type: 'solar', label: 'Solar Array Panels', icon: 'sun', w: 18, h: 15 },
    { type: 'solar', label: 'EV Charging Station', icon: 'charging-pile', w: 14, h: 14 },
    { type: 'custom', label: 'Parking Area', icon: 'car', w: 25, h: 20 },
    { type: 'custom', label: 'Garden Area', icon: 'leaf', w: 25, h: 20 },
    { type: 'custom', label: 'Lawn Area', icon: 'seeding', w: 30, h: 15 },
    { type: 'custom', label: 'Courtyard Space', icon: 'layout-grid', w: 20, h: 20 },
    { type: 'custom', label: 'Swimming Pool', icon: 'ripple', w: 35, h: 20 }
  ],
  water_drain: [
    { type: 'borewell', label: 'Underground Water Tank', icon: 'droplet', w: 12, h: 12 },
    { type: 'over-head-tank', label: 'Overhead Tank', icon: 'arrow-bar-to-up', w: 14, h: 14 },
    { type: 'septic-tank', label: 'Septic Tank Block', icon: 'arrow-bar-to-down', w: 15, h: 12 }
  ]
}

export default function App() {
  const [screenState, setScreenState] = useState('welcome') 
  // welcome | step_prop | step_size | step_shape | step_facing | step_family | step_needs | step_special | step_summary | designing | preview | workspace
  
  const [activeTab, setActiveTab] = useState('designer') // designer | upload | chat | shop | reports
  const [theme, setTheme] = useState(() => localStorage.getItem('vg-theme') || 'dark')
  
  // Custom Boundary Corner points
  const [boundaryPoints, setBoundaryPoints] = useState([])

  // Selection states
  const [selectedIssueRoom, setSelectedIssueRoom] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  // Editor Toggles
  const [showVastuGrid, setShowVastuGrid] = useState(true)
  const [showNormalGrid, setShowNormalGrid] = useState(true)
  
  // Elements Popup & Custom input state
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [customRoomName, setCustomRoomName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Onboarding lifestyle answers state
  const [onboarding, setOnboarding] = useState({
    propertyType: 'Independent Villa',
    sizePreset: '30 x 40 ft',
    customWidth: '',
    customLength: '',
    plotShape: 'Rectangular Plot',
    facing: 'East Road ☀️',
    familySetup: 'Joint Family',
    seniorCitizens: true,
    youngChildren: false,
    hasPets: false,
    wfh: true,
    dailyPooja: true,
    multipleCars: false,
    needsElevator: false,
    homeTheatre: false,
    gymRoom: false,
    servantQuarters: false,
    swimmingPool: false,
    evCharger: false
  })

  // Simulated AI design progress loader
  const [designProgress, setDesignProgress] = useState(0)

  // Plot Layout Config
  const [plot, setPlot] = useState({
    width: 30,
    length: 40,
    shape: 'Rectangular',
    facing: 'East',
    tilt: 0
  })

  const [rooms, setRooms] = useState([])

  // Background sketch calibration overlay properties
  const [imageSettings, setImageSettings] = useState({
    url: '',
    scale: 1.0,
    opacity: 0.5,
    rotation: 0,
    xOffset: 0,
    yOffset: 0
  })

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('vg-theme', next)
  }

  // Preset Selection vs. Custom inputs UX Rule (Screen 2 Plot Size)
  const selectSizePreset = (preset) => {
    setOnboarding(prev => ({
      ...prev,
      sizePreset: preset,
      customWidth: '',
      customLength: ''
    }))
  }

  const typeCustomDimension = (field, val) => {
    setOnboarding(prev => ({
      ...prev,
      sizePreset: null, // Clear active preset
      [field]: val
    }))
  }

  // Plot Boundary Preset vs. Corner Taps (Screen 3 Shape)
  const selectShapePreset = (shape) => {
    setBoundaryPoints([]) // Clear custom drawing
    setOnboarding(prev => ({ ...prev, plotShape: shape }))
  }

  const handlePointsChange = (pts) => {
    setBoundaryPoints(pts)
    if (pts.length > 0) {
      setOnboarding(prev => ({ ...prev, plotShape: 'Custom Shape (Tapped corners)' }))
    }
  }

  // Add room helpers
  const handleAddRoom = (template) => {
    const newRoom = {
      id: Date.now().toString(),
      type: template.type,
      label: template.label,
      x: 30,
      y: 30,
      width: template.w,
      height: template.h
    }
    setRooms(prev => [...prev, newRoom])
    setSelectedRoomId(newRoom.id)
    setShowAddPopup(false)
    setActiveTab('designer')
  }

  // Submit custom element
  const handleAddCustomRoom = (e) => {
    e.preventDefault()
    if (!customRoomName.trim()) return
    handleAddRoom({
      type: 'custom',
      label: customRoomName,
      w: 22,
      h: 22
    })
    setCustomRoomName('')
  }

  // Clear visual canvas
  const handleClearCanvas = () => {
    if (window.confirm('Reset current layout design?')) {
      setRooms([])
      setSelectedRoomId(null)
    }
  }

  // Easy Mode Canvas Nudge handlers
  const handleNudge = (direction) => {
    if (!selectedRoomId) return
    const index = rooms.findIndex(r => r.id === selectedRoomId)
    if (index === -1) return
    
    const updated = [...rooms]
    const r = { ...updated[index] }
    
    const step = 2.5 // small movement increments
    if (direction === 'left') r.x = Math.max(0, r.x - step)
    else if (direction === 'right') r.x = Math.min(100 - r.width, r.x + step)
    else if (direction === 'up') r.y = Math.max(0, r.y - step)
    else if (direction === 'down') r.y = Math.min(100 - r.height, r.y + step)
    
    updated[index] = r
    setRooms(updated)
  }

  const handleResizeNudge = (dimension, factor) => {
    if (!selectedRoomId) return
    const index = rooms.findIndex(r => r.id === selectedRoomId)
    if (index === -1) return
    
    const updated = [...rooms]
    const r = { ...updated[index] }
    
    const step = 5
    if (dimension === 'w') {
      if (factor > 0) r.width = Math.min(100 - r.x, r.width + step)
      else r.width = Math.max(10, r.width - step)
    } else if (dimension === 'h') {
      if (factor > 0) r.height = Math.min(100 - r.y, r.height + step)
      else r.height = Math.max(10, r.height - step)
    }
    
    updated[index] = r
    setRooms(updated)
  }

  const handleDeleteSelected = () => {
    if (!selectedRoomId) return
    setRooms(prev => prev.filter(r => r.id !== selectedRoomId))
    setSelectedRoomId(null)
  }

  // Background sketch calibration file reader
  const handleBackdropFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageSettings(prev => ({ ...prev, url }))
  }

  // Determine rooms based on lifestyle checklist (AI Room Determination)
  const getDeterminedRoomsList = () => {
    const list = []
    list.push('Living Room')
    list.push('Kitchen Cooktop')
    list.push('Dining Area')
    list.push('Bathroom / Toilet')

    if (onboarding.familySetup === 'Joint Family') {
      list.push('Master Bedroom')
      list.push('Parents Bedroom')
      list.push('Kids Bedroom')
    } else {
      list.push('Master Bedroom')
      list.push('Guest Bedroom')
    }

    if (onboarding.dailyPooja) list.push('Pooja Temple Mandir')
    if (onboarding.wfh) list.push('Home Office')
    if (onboarding.seniorCitizens) list.push('Parents Bedroom (Ground Floor)')
    if (onboarding.needsElevator) list.push('Elevator / Lift Shaft')
    if (onboarding.evCharger) list.push('EV Charging Station')
    if (onboarding.homeTheatre) list.push('Home Theatre')
    if (onboarding.gymRoom) list.push('Gym Room')
    if (onboarding.swimmingPool) list.push('Swimming Pool')
    if (onboarding.servantQuarters) list.push('Servant Room')

    return list
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

  // Generate baseline plan from lifestyle configurations
  const loadLifestyleLayout = () => {
    // Parse dimensions
    let w = 30, l = 40
    if (onboarding.sizePreset) {
      const parts = onboarding.sizePreset.split(' ')
      w = parseInt(parts[0]) || 30
      l = parseInt(parts[2]) || 40
    } else {
      w = parseInt(onboarding.customWidth) || 30
      l = parseInt(onboarding.customLength) || 40
    }

    // Set Facing direction
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

    // Setup rooms based on Vastu zones for determined lists
    const tplRooms = []
    
    // Gate: Northeast or East
    tplRooms.push({ id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 80, y: 5, width: 15, height: 8 })
    
    // Pooja: Northeast (Ishanya)
    if (onboarding.dailyPooja) {
      tplRooms.push({ id: 'r2', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 15, width: 20, height: 15 })
    }
    
    // Kitchen: Southeast (Agneya)
    tplRooms.push({ id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 75, y: 70, width: 20, height: 20 })

    // Master Bedroom: Southwest (Nairutya)
    tplRooms.push({ id: 'r4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 35, height: 25 })

    // Living Room: Central/Northeastern
    tplRooms.push({ id: 'r5', type: 'living', label: 'Living Room Lounge', x: 30, y: 25, width: 40, height: 35 })

    // Toilet: West or Northwest
    tplRooms.push({ id: 'r6', type: 'toilet', label: 'Bathroom Toilet', x: 5, y: 35, width: 20, height: 20 })

    // Home Office: Northwest or North
    if (onboarding.wfh) {
      tplRooms.push({ id: 'r7', type: 'custom', label: 'Home Office Study', x: 35, y: 5, width: 22, height: 18 })
    }

    // Lift shaft
    if (onboarding.needsElevator) {
      tplRooms.push({ id: 'r8', type: 'lift', label: 'Elevator Lift', x: 5, y: 10, width: 12, height: 12 })
    }

    setPlot(tplPlot)
    setRooms(tplRooms)
    setScreenState('preview')
  }

  // 1. Welcome / Home Screen
  if (screenState === 'welcome') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-menu-2" style={{ fontSize: '20px', cursor: 'pointer' }}></i>
            <span className="page-title" style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700 }}>Vastu Griha</span>
          </div>
          <button className="btn btn-icon theme-toggle" onClick={toggleTheme}>
            <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <img src="/logo.svg" style={{ width: '100px', height: '100px', marginBottom: '20px', animation: 'rotateCompass 60s linear infinite' }} alt="Vastu Logo" />
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Vastu Griha</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text2)', maxWidth: '360px', lineHeight: '1.5', marginBottom: '28px' }}>
            Find positive energy alignments in your plot. Let the Vastu Acharya guide your home plan step-by-step.
          </p>

          {/* Preset paths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' }}>
            <button className="btn btn-primary" style={{ padding: '16px', borderRadius: '30px', fontWeight: 'bold', justifyContent: 'center' }} onClick={() => setScreenState('step_prop')}>
              Design My Home <i className="ti ti-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
            
            <button className="btn" style={{ padding: '14px', borderRadius: '30px', justifyContent: 'center' }} onClick={() => { setScreenState('workspace'); setActiveTab('upload') }}>
              I Have a Plan (Upload sketch)
            </button>
            
            <button className="btn" style={{ padding: '14px', borderRadius: '30px', justifyContent: 'center' }} onClick={() => { setScreenState('workspace'); setActiveTab('designer') }}>
              Draw My Plot Boundary
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Property Type selection
  if (screenState === 'step_prop') {
    const props = ['Independent Villa', 'Raw Land / Plot', 'Apartment Flat', 'Renovation Project']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('welcome')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Property Type</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>What type of property is this?</h2>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {props.map(p => (
              <div 
                key={p}
                className={`option-list-card ${onboarding.propertyType === p ? 'selected' : ''}`}
                onClick={() => setOnboarding(prev => ({ ...prev, propertyType: p }))}
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

  // Step 2: Plot Size
  if (screenState === 'step_size') {
    const presets = ['20 x 30 ft', '30 x 40 ft', '30 x 50 ft', '40 x 60 ft', '50 x 80 ft']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_prop')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Plot Size</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>What is your plot size?</h2>
          
          <div className="onboarding-options-grid" style={{ maxWidth: '400px' }}>
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

          {/* Custom dimensions */}
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', gap: '12px', marginTop: '16px', textAlign: 'left' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Custom Width (ft)</span>
              <input 
                type="number" 
                className="chat-input"
                style={{ width: '100%', padding: '12px' }}
                placeholder="e.g. 35"
                value={onboarding.customWidth}
                onChange={(e) => typeCustomDimension('customWidth', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Custom Length (ft)</span>
              <input 
                type="number" 
                className="chat-input"
                style={{ width: '100%', padding: '12px' }}
                placeholder="e.g. 45"
                value={onboarding.customLength}
                onChange={(e) => typeCustomDimension('customLength', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_prop')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_shape')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Plot Boundary shape & Corner-taps
  if (screenState === 'step_shape') {
    const shapes = ['Square Plot', 'Rectangular Plot', 'L-Shape Plot', 'Irregular Plot']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_size')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Plot Shape & Boundary</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '4px', textAlign: 'center' }}>What is the plot shape?</h2>
          <span style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '16px' }}>Select preset or tap points to draw boundary</span>

          {/* Quick choices */}
          <div className="onboarding-options-grid" style={{ maxWidth: '400px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
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

          {/* Corner points drawing */}
          <PlotBoundaryDrawer points={boundaryPoints} onChange={handlePointsChange} />

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_size')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_facing')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Street Facing side
  if (screenState === 'step_facing') {
    const sides = ['North Road 🧭', 'East Road ☀️', 'South Road 🔥', 'West Road 🌅']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_shape')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Street Facing</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>Which side is the street/road?</h2>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {sides.map(sd => (
              <div 
                key={sd}
                className={`option-list-card ${onboarding.facing === sd ? 'selected' : ''}`}
                onClick={() => setOnboarding(prev => ({ ...prev, facing: sd }))}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{sd}</span>
                <div className="option-circle">
                  {onboarding.facing === sd && <div className="option-circle-dot"></div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_shape')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_family')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Family Size setup
  if (screenState === 'step_family') {
    const families = ['1 Family', '2 Families', 'Joint Family', 'Shared with Tenant']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_facing')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Household size</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>How many families will live here?</h2>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {families.map(fm => (
              <div 
                key={fm}
                className={`option-list-card ${onboarding.familySetup === fm ? 'selected' : ''}`}
                onClick={() => setOnboarding(prev => ({ ...prev, familySetup: fm }))}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{fm}</span>
                <div className="option-circle">
                  {onboarding.familySetup === fm && <div className="option-circle-dot"></div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_facing')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_needs')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 6: Family demographics & mobility needs (Checklist)
  if (screenState === 'step_needs') {
    const checklist = [
      { key: 'seniorCitizens', label: 'Senior Citizens (50-70+ years)', icon: 'users' },
      { key: 'youngChildren', label: 'Young Children / Toddlers', icon: 'mood-kid' },
      { key: 'hasPets', label: 'Pets (Dog / Cat)', icon: 'dog' },
      { key: 'wfh', label: 'Work from Home (WFH)', icon: 'device-laptop' },
      { key: 'dailyPooja', label: 'Daily Pooja / Prayer', icon: 'flame' },
      { key: 'multipleCars', label: 'Multiple Vehicles (2+)', icon: 'car' },
      { key: 'needsElevator', label: 'Mobility / Accessibility Needs (Elevator)', icon: 'arrows-up-down' }
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_family')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Demographics & Needs</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>Are there any special family needs?</h2>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {checklist.map(item => (
              <div 
                key={item.key}
                className={`option-list-card ${onboarding[item.key] ? 'selected' : ''}`}
                onClick={() => setOnboarding(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`ti ti-${item.icon}`} style={{ color: onboarding[item.key] ? 'var(--accent)' : 'var(--text3)' }}></i>
                  <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '4px', 
                  border: '2px solid var(--border2)',
                  background: onboarding[item.key] ? 'var(--accent)' : 'none',
                  borderColor: onboarding[item.key] ? 'var(--accent)' : 'var(--border2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifycontent: 'center',
                  color: '#fff'
                }}>
                  {onboarding[item.key] && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_family')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_special')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 7: Special rooms / accessories
  if (screenState === 'step_special') {
    const specials = [
      { key: 'homeTheatre', label: 'Home Theatre Room', icon: 'movie' },
      { key: 'gymRoom', label: 'Home Gym Space', icon: 'barbell' },
      { key: 'servantQuarters', label: 'Servant Quarters / Rooms', icon: 'user-cog' },
      { key: 'swimmingPool', label: 'Swimming Pool', icon: 'ripple' },
      { key: 'evCharger', label: 'EV Charger Stand', icon: 'charging-pile' }
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_needs')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>Special Spaces</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>Any secondary rooms or settings?</h2>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {specials.map(item => (
              <div 
                key={item.key}
                className={`option-list-card ${onboarding[item.key] ? 'selected' : ''}`}
                onClick={() => setOnboarding(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`ti ti-${item.icon}`} style={{ color: onboarding[item.key] ? 'var(--accent)' : 'var(--text3)' }}></i>
                  <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '4px', 
                  border: '2px solid var(--border2)',
                  background: onboarding[item.key] ? 'var(--accent)' : 'none',
                  borderColor: onboarding[item.key] ? 'var(--accent)' : 'var(--border2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  {onboarding[item.key] && <i className="ti ti-check" style={{ fontSize: '12px' }}></i>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_needs')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step_summary')}>Next</button>
          </div>
        </div>
      </div>
    )
  }

  // Step 8: AI Summary & Determined Rooms Listing
  if (screenState === 'step_summary') {
    const list = getDeterminedRoomsList()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon" onClick={() => setScreenState('step_special')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}>
            <span className="page-title" style={{ fontSize: '14px' }}>AI Determined Rooms</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>Your Vastu Home Blueprint Checklist</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '20px', maxWidth: '420px', textAlign: 'center' }}>
            Based on your answers (Joint Family, Senior Citizens, WFH, daily pooja), the AI Vastu consultant has selected these required home structures:
          </p>

          <div className="summary-meta-card" style={{ maxWidth: '420px', textAlign: 'left' }}>
            {list.map((rName, idx) => (
              <div key={idx} className="summary-meta-row" style={{ padding: '8px 0' }}>
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
            <button className="btn" style={{ padding: '10px', justifyContent: 'center', fontSize: '12px' }} onClick={() => setScreenState('step_prop')}>
              Restart Answers
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

  // Generated Plan preview score widget
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
            onClick={() => { setScreenState('workspace'); setActiveTab('reports') }}
          >
            View Vastu Audit
          </button>
        </div>
      </div>
    )
  }

  // 7. Workspace easy mode canvas layout
  return (
    <div id="app-container">
      
      {/* Sidebar navigation */}
      <nav id="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.svg" className="sidebar-logo-img" alt="Vastu compass" />
          <span>Vastu</span> Griha
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">Home Blueprint</div>
          <div 
            className={`nav-item ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => setActiveTab('designer')}
          >
            <i className="ti ti-layout-grid-fill"></i> Visual Layout
          </div>
          <div 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <i className="ti ti-cloud-upload"></i> Calibrate Sketch
          </div>

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Vedic Audit</div>
          <div 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <i className="ti ti-message-chatbot"></i> Ask Acharya
          </div>
          <div 
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            <i className="ti ti-shopping-cart-filled"></i> Shop Remedies
          </div>
          <div 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="ti ti-file-text-filled"></i> Print Audit
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Compass tilt={plot.tilt} />
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Vastu Griha v1.0</span>
          <button className="btn btn-sm" onClick={() => setScreenState('welcome')}><i className="ti ti-rotate"></i> Reset</button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        <header id="topbar">
          <div className="topbar-left">
            <span className="page-title">
              {activeTab === 'designer' && 'Plan Editor (Easy Mode)'}
              {activeTab === 'upload' && 'Align Custom Sketch'}
              {activeTab === 'chat' && 'Vastu Acharya Consultant'}
              {activeTab === 'shop' && 'Vastu Remedies Shop'}
              {activeTab === 'reports' && 'Vastu Health Report'}
            </span>
            <span className="page-subtitle">
              {activeTab === 'designer' && 'Tap elements to place, and use nudge buttons to align'}
              {activeTab === 'upload' && 'Place existing plans behind grid lines and adjust alignment'}
              {activeTab === 'chat' && 'Query paint colors, entrances, or element balance suggestions'}
              {activeTab === 'shop' && 'Procure Vedic remedies to align home energy fields'}
              {activeTab === 'reports' && 'Check and print family Vastu layout checklist reports'}
            </span>
          </div>

          <div className="topbar-right">
            <button className="btn btn-icon theme-toggle" onClick={toggleTheme}>
              <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('reports')}>
              <i className="ti ti-printer"></i> Print Report
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Screens */}
        <div className="page-workspace" style={{ paddingBottom: '60px' }}>
          
          {/* Main Visual Editor Screen */}
          {activeTab === 'designer' && (
            <>
              {/* Canva Room Sidebar */}
              <div className="designer-drawer">
                <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Elements Catalog</span>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPopup(true)}>
                    <i className="ti ti-plus"></i> Add Item
                  </button>
                </div>
                <div className="drawer-body">
                  <div className="sidebar-section-title">Living rooms</div>
                  {EXPANDED_ROOMS_CATALOG.private.map((tmpl) => (
                    <div 
                      key={tmpl.type + tmpl.label}
                      className="room-template-card"
                      onClick={() => handleAddRoom(tmpl)}
                    >
                      <i className={`ti ti-${tmpl.icon}`}></i>
                      <span>{tmpl.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="canvas-area">
                <div className="canvas-toolbar">
                  {/* Grid toggles */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`btn btn-sm ${showNormalGrid ? 'btn-primary' : ''}`} onClick={() => setShowNormalGrid(!showNormalGrid)}>
                      Grid Pattern
                    </button>
                    <button className={`btn btn-sm ${showVastuGrid ? 'btn-primary' : ''}`} onClick={() => setShowVastuGrid(!showVastuGrid)}>
                      Vastu Grid
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger btn-sm" onClick={handleClearCanvas}>
                      <i className="ti ti-trash"></i> Clear
                    </button>
                  </div>
                </div>
                
                <Canvas 
                  rooms={rooms}
                  plot={plot}
                  onRoomsChange={setRooms}
                  imageSettings={imageSettings}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                  showVastuGrid={showVastuGrid}
                  showNormalGrid={showNormalGrid}
                />

                {/* Arrow Nudge toolbar for Easy mobile positioning */}
                {selectedRoomId && (
                  <div 
                    style={{ 
                      marginTop: '12px', 
                      background: 'var(--bg2)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '12px', 
                      padding: '12px 16px',
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 600 }}>Easy Align Controls</span>
                      <button className="btn btn-sm btn-danger" onClick={handleDeleteSelected}>
                        <i className="ti ti-trash"></i> Delete
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {/* Move Nudges */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '6px' }}>Move:</span>
                        <button className="btn btn-sm" onClick={() => handleNudge('left')}><i className="ti ti-arrow-left"></i></button>
                        <button className="btn btn-sm" onClick={() => handleNudge('up')}><i className="ti ti-arrow-up"></i></button>
                        <button className="btn btn-sm" onClick={() => handleNudge('down')}><i className="ti ti-arrow-down"></i></button>
                        <button className="btn btn-sm" onClick={() => handleNudge('right')}><i className="ti ti-arrow-right"></i></button>
                      </div>

                      {/* Resize Nudges */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '6px' }}>Resize:</span>
                        <button className="btn btn-sm" onClick={() => handleResizeNudge('w', 1)}>W +</button>
                        <button className="btn btn-sm" onClick={() => handleResizeNudge('w', -1)}>W -</button>
                        <button className="btn btn-sm" onClick={() => handleResizeNudge('h', 1)}>H +</button>
                        <button className="btn btn-sm" onClick={() => handleResizeNudge('h', -1)}>H -</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Sidebar panel */}
              <AnalysisPanel 
                rooms={rooms} 
                plot={plot} 
                onSwitchTab={setActiveTab}
                onSelectShopItem={setSelectedIssueRoom}
              />
            </>
          )}

          {/* Floorplan Calibration Screen */}
          {activeTab === 'upload' && (
            <>
              {/* Opacity/Scale Backdrop adjustment sliders */}
              <div className="upload-screen-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Align Sketch Backdrop</span>
                
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Upload drawing (PDF/JPG/PNG)</span>
                  <input type="file" accept="image/*" onChange={handleBackdropFile} />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Backdrop Opacity: {imageSettings.opacity}</span>
                  <input 
                    type="range" min="0.1" max="1.0" step="0.05" style={{ width: '100%' }}
                    value={imageSettings.opacity} 
                    onChange={(e) => setImageSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))} 
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Scale: {imageSettings.scale}</span>
                  <input 
                    type="range" min="0.5" max="2.5" step="0.05" style={{ width: '100%' }}
                    value={imageSettings.scale} 
                    onChange={(e) => setImageSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))} 
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Rotation: {imageSettings.rotation}°</span>
                  <input 
                    type="range" min="-180" max="180" step="5" style={{ width: '100%' }}
                    value={imageSettings.rotation} 
                    onChange={(e) => setImageSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))} 
                  />
                </div>
              </div>

              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <span className="canvas-toolbar-label">Calibrate backdrop sketch layer</span>
                </div>
                <Canvas 
                  rooms={rooms}
                  plot={plot}
                  onRoomsChange={setRooms}
                  imageSettings={imageSettings}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                  showVastuGrid={showVastuGrid}
                  showNormalGrid={showNormalGrid}
                />
              </div>
              <PlotConfig plot={plot} onChange={setPlot} />
            </>
          )}

          {/* Simulated Chat Consultant */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <AiChat 
                rooms={rooms} 
                plot={plot} 
                currentStep="chat"
                onSwitchTab={setActiveTab} 
              />
            </div>
          )}

          {/* Remedies Catalog */}
          {activeTab === 'shop' && (
            <BanjaraBazaarShop 
              rooms={rooms} 
              plot={plot} 
              selectedIssueRoom={selectedIssueRoom}
              onClearSelection={() => setSelectedIssueRoom(null)}
            />
          )}

          {/* Print Report */}
          {activeTab === 'reports' && (
            <ReportGenerator 
              rooms={rooms} 
              plot={plot} 
            />
          )}

        </div>

        {/* 8. Add Room Popup (Sliding Modal Grid Sheet) */}
        {showAddPopup && (
          <div className="add-element-sheet-overlay" onClick={() => setShowAddPopup(false)}>
            <div className="add-element-sheet" onClick={(e) => e.stopPropagation()}>
              
              <div className="sheet-header">
                <span className="sheet-title">Add Element (Canva Style)</span>
                <i className="ti ti-x" style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => setShowAddPopup(false)}></i>
              </div>

              <input 
                type="text" 
                className="chat-input" 
                style={{ width: '100%', padding: '10px 14px', marginBottom: '16px' }}
                placeholder="Search room or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Private Rooms */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Private Rooms</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.private.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Living Rooms */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Living Spaces</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.living.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Utility Rooms */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Utility & Kitchen</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.utility.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Vedic & Heavy */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Temple & Heavy structures</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.vedic_heavy.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-utility"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Outdoors */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Outdoors & Power</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.outdoor_power.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-outdoor"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Water & Drain */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Water & Septic Drainage</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.water_drain.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-utility"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Add Custom room name */}
              <form onSubmit={handleAddCustomRoom} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  className="chat-input"
                  style={{ flex: 1, padding: '10px 14px' }}
                  placeholder="Enter custom room / item name..."
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Custom Room</button>
              </form>

            </div>
          </div>
        )}

        {/* Mobile bottom navigation bar */}
        <div className="bottom-nav">
          <div 
            className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <i className="ti ti-message-chatbot"></i>
            <span>Acharya</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => setActiveTab('designer')}
          >
            <i className="ti ti-layout-grid"></i>
            <span>Blueprint</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shop'); setSelectedIssueRoom(null); }}
          >
            <i className="ti ti-shopping-cart"></i>
            <span>Remedies</span>
          </div>
          <div 
            className={`bottom-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="ti ti-file-text"></i>
            <span>Report</span>
          </div>
        </div>

      </div>
    </div>
  )
}
