import React, { useState, useEffect } from 'react'
import PlotConfig from './components/PlotConfig'
import Canvas from './components/Canvas'
import Compass from './components/Compass'
import FloorPlanUpload from './components/FloorPlanUpload'
import AnalysisPanel from './components/AnalysisPanel'
import BanjaraBazaarShop from './components/BanjaraBazaarShop'
import ReportGenerator from './components/ReportGenerator'
import AiChat from './components/AiChat'

const POPUP_ELEMENTS = {
  rooms: [
    { type: 'bedroom', label: 'Bedroom', icon: 'bed', w: 30, h: 25 },
    { type: 'kitchen', label: 'Kitchen', icon: 'soup', w: 20, h: 20 },
    { type: 'toilet', label: 'Bathroom', icon: 'wash', w: 18, h: 15 },
    { type: 'living', label: 'Living Room', icon: 'sofa', w: 35, h: 30 },
    { type: 'pooja', label: 'Pooja Room', icon: 'flame', w: 15, h: 15 }
  ],
  utilities: [
    { type: 'staircase', label: 'Staircase', icon: 'arrow-merge', w: 15, h: 25 },
    { type: 'lift', label: 'Lift', icon: 'arrows-up-down', w: 15, h: 15 },
    { type: 'over-head-tank', label: 'Water Tank', icon: 'arrow-bar-to-up', w: 14, h: 14 },
    { type: 'septic-tank', label: 'Septic Tank', icon: 'arrow-bar-to-down', w: 15, h: 12 },
    { type: 'custom', label: 'Shaft', icon: 'binary', w: 10, h: 10 }
  ],
  outdoors: [
    { type: 'solar', label: 'Parking', icon: 'bolt', w: 25, h: 20 },
    { type: 'custom', label: 'Garden', icon: 'leaf', w: 25, h: 20 },
    { type: 'entrance', label: 'Gate', icon: 'door-enter', w: 15, h: 8 },
    { type: 'custom', label: 'Balcony', icon: 'box', w: 20, h: 10 },
    { type: 'custom', label: 'Lawn', icon: 'seeding', w: 30, h: 15 }
  ]
}

export default function App() {
  const [screenState, setScreenState] = useState('welcome') // welcome | step1 | step2 | summary | designing | preview | workspace
  const [activeTab, setActiveTab] = useState('designer') // designer | upload | chat | shop | reports
  const [theme, setTheme] = useState(() => localStorage.getItem('vg-theme') || 'dark')
  
  // Custom Element State
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customRoomName, setCustomRoomName] = useState('')
  
  // Selected Room for Remedies & Shop (Screen 10)
  const [selectedIssueRoom, setSelectedIssueRoom] = useState(null)

  // Onboarding Answers State
  const [onboardingData, setOnboardingData] = useState({
    size: '30 x 40 ft',
    families: 'Joint Family',
    facing: 'East',
    floors: 'Ground Floor',
    members: '6 (2 Adults, 2 Kids, 2 Elders)',
    specialNeeds: 'Pooja Room, Parking for 2 Cars'
  })

  // Simulated AI design progress bar loader
  const [designProgress, setDesignProgress] = useState(0)

  // Plot layout configuration
  const [plot, setPlot] = useState({
    width: 30,
    length: 40,
    shape: 'Rectangular',
    facing: 'East',
    tilt: 0
  })

  // Placed rooms list
  const [rooms, setRooms] = useState([
    { id: '1', type: 'entrance', label: 'Main Entrance Gate', x: 90, y: 10, width: 10, height: 15 },
    { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
    { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
    { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
    { id: '5', type: 'living', label: 'Living Lounge', x: 45, y: 25, width: 45, height: 35 }
  ])

  const [selectedRoomId, setSelectedRoomId] = useState(null)

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

  // Add room helper
  const handleAddRoom = (template) => {
    const newRoom = {
      id: Date.now().toString(),
      type: template.type,
      label: template.label,
      x: 35,
      y: 35,
      width: template.w,
      height: template.h
    }
    setRooms(prev => [...prev, newRoom])
    setSelectedRoomId(newRoom.id)
    setShowAddPopup(false)
    setActiveTab('designer')
  }

  // Custom Element form handler
  const handleAddCustomElement = (e) => {
    e.preventDefault()
    if (!customRoomName.trim()) return
    handleAddRoom({
      type: 'custom',
      label: customRoomName,
      w: 20,
      h: 20
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

  // Handle answers update
  const handleAnswerChange = (field, val) => {
    setOnboardingData(prev => ({ ...prev, [field]: val }))
  }

  // Trigger design progress animation (Screen 5)
  const startAiDesigning = () => {
    setScreenState('designing')
    setDesignProgress(0)
    
    const interval = setInterval(() => {
      setDesignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Set layout templates based on selections
          loadOnboardingTemplate()
          return 100
        }
        return prev + 5
      })
    }, 120)
  }

  const loadOnboardingTemplate = () => {
    let tplPlot = { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 }
    let tplRooms = []

    if (onboardingData.facing === 'East') {
      tplPlot = { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 }
      tplRooms = [
        { id: '1', type: 'entrance', label: 'Main Entrance Gate', x: 90, y: 10, width: 10, height: 15 },
        { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
        { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
        { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
        { id: '5', type: 'bedroom', label: 'Kids Bedroom', x: 5, y: 5, width: 35, height: 25 },
        { id: '6', type: 'toilet', label: 'Bathroom', x: 5, y: 35, width: 25, height: 20 },
        { id: '7', type: 'living', label: 'Living Lounge', x: 45, y: 25, width: 45, height: 35 }
      ]
    } 
    else {
      // Default standard 3BHK North facing template
      tplPlot = { width: 40, length: 60, shape: 'Rectangular', facing: 'North', tilt: 0 }
      tplRooms = [
        { id: '11', type: 'entrance', label: 'Main Entrance Gate', x: 40, y: 0, width: 20, height: 8 },
        { id: '12', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 5, width: 20, height: 15 },
        { id: '13', type: 'kitchen', label: 'Kitchen (Agneya)', x: 75, y: 75, width: 20, height: 20 },
        { id: '14', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 30, height: 25 },
        { id: '15', type: 'bedroom', label: 'Guest Bedroom', x: 5, y: 10, width: 25, height: 25 },
        { id: '17', type: 'toilet', label: 'Toilet / Bath', x: 5, y: 45, width: 20, height: 18 },
        { id: '18', type: 'living', label: 'Living Lounge', x: 35, y: 25, width: 35, height: 35 }
      ]
    }

    setPlot(tplPlot)
    setRooms(tplRooms)
    setSelectedRoomId(null)
    setScreenState('preview')
  }

  // Load a quick project template from Welcome screen
  const loadRecentProject = () => {
    const tplPlot = { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 }
    const tplRooms = [
      { id: '1', type: 'entrance', label: 'Main Entrance Gate', x: 90, y: 10, width: 10, height: 15 },
      { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
      { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
      { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
      { id: '5', type: 'living', label: 'Living Lounge', x: 45, y: 25, width: 45, height: 35 }
    ]
    setPlot(tplPlot)
    setRooms(tplRooms)
    setScreenState('workspace')
    setActiveTab('designer')
  }

  // 1. Welcome / Home Screen
  if (screenState === 'welcome') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        
        {/* Top Header */}
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-menu-2" style={{ fontSize: '20px', cursor: 'pointer' }}></i>
            <span className="page-title" style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700 }}>Vastu Griha</span>
          </div>
          <div className="topbar-right">
            <button className="btn btn-icon theme-toggle" onClick={toggleTheme}>
              <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
            </button>
            <i className="ti ti-bell" style={{ fontSize: '20px', cursor: 'pointer', marginLeft: '6px' }}></i>
          </div>
        </header>

        {/* Content View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Banner greeting */}
          <div style={{ margin: '12px 0 24px', maxWidth: '400px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--fd)', display: 'block', marginBottom: '6px' }}>Namaste! 👋</span>
            <p style={{ fontSize: '14.5px', color: 'var(--text2)', lineHeight: '1.5' }}>
              I am your AI Vastu Expert. How can I help you today?
            </p>
          </div>

          {/* Core Action Cards */}
          <div className="welcome-grid">
            <div className="welcome-card" onClick={() => setScreenState('step1')}>
              <div className="welcome-card-icon"><i className="ti ti-message-chatbot"></i></div>
              <span className="welcome-card-title">Design My Home</span>
              <span className="welcome-card-desc">AI will design for you</span>
            </div>
            
            <div className="welcome-card" onClick={() => { setScreenState('workspace'); setActiveTab('upload') }}>
              <div className="welcome-card-icon"><i className="ti ti-cloud-upload"></i></div>
              <span className="welcome-card-title">I Have a Plan</span>
              <span className="welcome-card-desc">Upload & check Vastu</span>
            </div>
            
            <div className="welcome-card" onClick={() => { setScreenState('workspace'); setActiveTab('designer') }}>
              <div className="welcome-card-icon"><i className="ti ti-layout-grid-fill"></i></div>
              <span className="welcome-card-title">Check My Home</span>
              <span className="welcome-card-desc">Vastu review & score</span>
            </div>
            
            <div className="welcome-card" onClick={() => { setScreenState('workspace'); setActiveTab('chat') }}>
              <div className="welcome-card-icon"><i className="ti ti-bulb"></i></div>
              <span className="welcome-card-title">Ask Vastu AI</span>
              <span className="welcome-card-desc">Ask anything</span>
            </div>
          </div>

          {/* Recent projects */}
          <div className="projects-shelf">
            <div className="projects-shelf-title">
              <span>My Recent Projects</span>
              <span style={{ fontSize: '11px', color: 'var(--accent)', cursor: 'pointer' }}>See All</span>
            </div>
            
            <div className="project-item-card" onClick={loadRecentProject}>
              <div className="project-thumb-placeholder">
                <i className="ti ti-map-2"></i>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Gupta House</span>
                <span style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>30x40 East Facing · Edited 2 days ago</span>
              </div>
              <i className="ti ti-chevron-right" style={{ color: 'var(--text3)' }}></i>
            </div>
          </div>

        </div>

        {/* Home bottom nav placeholder */}
        <div className="bottom-nav" style={{ display: 'flex' }}>
          <div className="bottom-nav-item active"><i className="ti ti-home"></i><span>Home</span></div>
          <div className="bottom-nav-item" onClick={loadRecentProject}><i className="ti ti-folder"></i><span>Projects</span></div>
          <div className="bottom-nav-item" onClick={() => { setScreenState('workspace'); setActiveTab('reports') }}><i className="ti ti-file-text"></i><span>Reports</span></div>
          <div className="bottom-nav-item" onClick={() => { setScreenState('workspace'); setActiveTab('shop') }}><i className="ti ti-shopping-cart"></i><span>Shop</span></div>
          <div className="bottom-nav-item" onClick={toggleTheme}><i className="ti ti-user"></i><span>Profile</span></div>
        </div>

      </div>
    )
  }

  // 2. AI Questions - Step 1 (Plot Size)
  if (screenState === 'step1') {
    const sizes = ['20 x 30 ft', '30 x 40 ft', '40 x 60 ft', '50 x 80 ft', '60 x 90 ft']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        
        {/* Onboarding header */}
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon theme-toggle" onClick={() => setScreenState('welcome')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ textAlign: 'center', width: '100%', paddingRight: '36px' }}>
            <span className="page-title" style={{ fontSize: '15px' }}>AI Vastu Assistant</span>
            {/* Progress indicators */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--accent)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          
          <div style={{ margin: '12px 0 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Great! I will design a perfect Vastu home for you. 😊</span>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>What is the size of your plot?</h2>
            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Choose or enter custom size</span>
          </div>

          {/* Quick choices */}
          <div className="onboarding-options-grid">
            {sizes.map(sz => (
              <div 
                key={sz}
                className={`option-button-card ${onboardingData.size === sz ? 'selected' : ''}`}
                onClick={() => handleAnswerChange('size', sz)}
              >
                {sz}
              </div>
            ))}
          </div>

          {/* Custom Size field */}
          <div style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>Custom Size</span>
            <input 
              type="text" 
              className="chat-input"
              style={{ width: '100%', padding: '12px' }}
              placeholder="e.g. 35 x 45 ft"
              value={onboardingData.size}
              onChange={(e) => handleAnswerChange('size', e.target.value)}
            />
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', width: '100%', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('welcome')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step2')}>Next</button>
          </div>

        </div>
      </div>
    )
  }

  // 3. AI Questions - Step 2 (Families)
  if (screenState === 'step2') {
    const familyOptions = ['1 Family', '2 Families', '3 Families', 'Joint Family', 'Other / Custom']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon theme-toggle" onClick={() => setScreenState('step1')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ textAlign: 'center', width: '100%', paddingRight: '36px' }}>
            <span className="page-title" style={{ fontSize: '15px' }}>AI Vastu Assistant</span>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--accent)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          
          <div style={{ margin: '12px 0 20px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 700 }}>How many families will be living here?</h2>
          </div>

          {/* List selection */}
          <div style={{ width: '100%' }}>
            {familyOptions.map(fam => (
              <div 
                key={fam}
                className={`option-list-card ${onboardingData.families === fam ? 'selected' : ''}`}
                onClick={() => handleAnswerChange('families', fam)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ti ti-users" style={{ color: onboardingData.families === fam ? 'var(--accent)' : 'var(--text3)' }}></i>
                  <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{fam}</span>
                </div>
                <div className="option-circle">
                  {onboardingData.families === fam && <div className="option-circle-dot"></div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', width: '100%', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
            <button className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('step1')}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setScreenState('summary')}>Next</button>
          </div>

        </div>
      </div>
    )
  }

  // 4. Questions Summary
  if (screenState === 'summary') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <button className="btn btn-icon theme-toggle" onClick={() => setScreenState('step2')}><i className="ti ti-chevron-left"></i></button>
          <div className="topbar-left" style={{ textAlign: 'center', width: '100%', paddingRight: '36px' }}>
            <span className="page-title" style={{ fontSize: '15px' }}>Your Family Summary</span>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--border2)' }}></div>
              <div style={{ width: '16px', height: '4px', borderRadius: '2px', background: 'var(--accent)' }}></div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          
          {/* Metadata Cards Stack */}
          <div className="summary-meta-card">
            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-ruler"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Plot Size</span>
                <span className="summary-meta-value">{onboardingData.size}</span>
              </div>
            </div>

            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-users"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Families</span>
                <span className="summary-meta-value">{onboardingData.families}</span>
              </div>
            </div>

            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-id-badge"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Members</span>
                <span className="summary-meta-value">{onboardingData.members}</span>
              </div>
            </div>

            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-building-community"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Floors</span>
                <span className="summary-meta-value">
                  <select 
                    style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', fontWeight: 600, fontSize: '13.5px' }}
                    value={onboardingData.floors}
                    onChange={(e) => handleAnswerChange('floors', e.target.value)}
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="Double Floor">G+1 Floors</option>
                    <option value="Triple Floor">G+2 Floors</option>
                  </select>
                </span>
              </div>
            </div>

            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-compass"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Facing Direction</span>
                <span className="summary-meta-value">
                  <select 
                    style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', fontWeight: 600, fontSize: '13.5px' }}
                    value={onboardingData.facing}
                    onChange={(e) => handleAnswerChange('facing', e.target.value)}
                  >
                    <option value="East">East</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                  </select>
                </span>
              </div>
            </div>

            <div className="summary-meta-row">
              <div className="summary-meta-icon"><i className="ti ti-gift"></i></div>
              <div className="summary-meta-info">
                <span className="summary-meta-label">Special Needs</span>
                <span className="summary-meta-value">{onboardingData.specialNeeds}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', marginTop: 'auto', paddingTop: '20px' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '14px', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
              onClick={startAiDesigning}
            >
              Looks Good, Design My Home ✨
            </button>
            <button className="btn" style={{ padding: '10px', justifyContent: 'center', fontSize: '12.5px' }} onClick={() => setScreenState('step1')}>
              Edit Answers
            </button>
          </div>

        </div>
      </div>
    )
  }

  // 5. AI Designing Screen
  if (screenState === 'designing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center' }}>
            <span className="page-title" style={{ fontSize: '15px' }}>AI Vastu Designer</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Animated Robot Graphic */}
          <div className="loading-robot-wrapper">
            <svg className="robot-avatar-img" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.3" />
              <rect x="25" y="30" width="50" height="40" rx="12" fill="var(--bg2)" stroke="var(--accent)" strokeWidth="3" />
              <rect x="35" y="42" width="10" height="10" rx="3" fill="#fff" />
              <rect x="55" y="42" width="10" height="10" rx="3" fill="#fff" />
              <circle cx="40" cy="47" r="3" fill="var(--accent)" />
              <circle cx="60" cy="47" r="3" fill="var(--accent)" />
              <path d="M 45 60 Q 50 63 55 60" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Antenna */}
              <line x1="50" y1="30" x2="50" y2="18" stroke="var(--accent)" strokeWidth="3" />
              <circle cx="50" cy="15" r="5" fill="var(--gold)" />
            </svg>
            
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 700, marginTop: '20px' }}>AI is designing your perfect Vastu home...</h3>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>This may take up to 20 seconds</span>

            {/* Custom progress loading bar */}
            <div className="loader-bar-outer">
              <div className="loader-bar-inner" style={{ width: `${designProgress}%` }}></div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '8px' }}>{designProgress}%</span>
          </div>

          <div className="loading-tips-bubble">
            <i className="ti ti-bulb" style={{ marginRight: '6px' }}></i>
            Our AI considers Vastu Shastra, family needs, light, ventilation and positive energy flow.
          </div>

        </div>
      </div>
    )
  }

  // 6. Generated Plan Preview Screen
  if (screenState === 'preview') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left" style={{ width: '100%', textAlign: 'center' }}>
            <span className="page-title" style={{ fontSize: '15px' }}>Your Vastu Plan is Ready! 🎉</span>
          </div>
        </header>

        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
          
          {/* Blueprint Display Card */}
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
            {/* Visual compass overlay */}
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
            />
          </div>

          {/* Bottom rating widget */}
          <div 
            className="score-widget" 
            style={{ 
              width: '100%', 
              maxWidth: '440px', 
              justifyContent: 'space-between', 
              padding: '14px', 
              margin: '16px 0',
              background: 'var(--bg2)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', color: '#22c55e' }}>
                92%
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span className="score-label" style={{ fontSize: '10px' }}>Vastu Score</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#22c55e' }}>Excellent</span>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => { setScreenState('workspace'); setActiveTab('designer') }}>
              Edit Plan
            </button>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', maxWidth: '440px', padding: '14px', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
            onClick={() => { setScreenState('workspace'); setActiveTab('reports') }}
          >
            View Full Analysis
          </button>

        </div>
      </div>
    )
  }

  // 7. Workspace (Grid blueprint editor with bottom sheets)
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
          <button className="btn btn-sm" onClick={() => setScreenState('welcome')} title="Restart Onboarding"><i className="ti ti-rotate"></i> Reset</button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        <header id="topbar">
          <div className="topbar-left">
            <span className="page-title">
              {activeTab === 'designer' && 'Plan Editor'}
              {activeTab === 'upload' && 'Align Custom Sketch'}
              {activeTab === 'chat' && 'Vastu Acharya Consultant'}
              {activeTab === 'shop' && 'Vastu Remedies Shop'}
              {activeTab === 'reports' && 'Vastu Health Report'}
            </span>
            <span className="page-subtitle">
              {activeTab === 'designer' && 'Review or drag layout structures inside your grid'}
              {activeTab === 'upload' && 'Place your existing house drawings behind the Vastu compass'}
              {activeTab === 'chat' && 'Get answers to directional paint shades, utilities, or corrections'}
              {activeTab === 'shop' && 'Procure Vedic items to correct home energy flows'}
              {activeTab === 'reports' && 'Save and print a family-friendly rating checklist'}
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
                    <i className="ti ti-plus"></i> Add Room
                  </button>
                </div>
                <div className="drawer-body">
                  <div className="sidebar-section-title">Living spaces</div>
                  {POPUP_ELEMENTS.rooms.map((tmpl) => (
                    <div 
                      key={tmpl.type + tmpl.label}
                      className="room-template-card"
                      onClick={() => handleAddRoom(tmpl)}
                    >
                      <i className={`ti ti-${tmpl.icon}`}></i>
                      <span>{tmpl.label}</span>
                    </div>
                  ))}

                  <div className="sidebar-section-title" style={{ marginTop: '12px' }}>Custom Structure</div>
                  <form onSubmit={handleAddCustomElement} style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
                    <input 
                      type="text" 
                      className="chat-input"
                      style={{ padding: '6px 10px', fontSize: '12px', flex: 1 }}
                      placeholder="e.g. Garden Shed" 
                      value={customRoomName}
                      onChange={(e) => setCustomRoomName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-sm btn-primary" style={{ padding: '0 8px' }}><i className="ti ti-plus"></i></button>
                  </form>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <div className="canvas-toolbar-group">
                    <span className="canvas-toolbar-label">Plot Outline</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{plot.width} ft × {plot.length} ft ({plot.facing} facing)</span>
                  </div>
                  <div className="canvas-toolbar-group">
                    <button className="btn btn-danger btn-sm" onClick={handleClearCanvas}>
                      <i className="ti ti-trash"></i> Reset Layout
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
                />
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
              <FloorPlanUpload 
                imageSettings={imageSettings} 
                onSettingsChange={setImageSettings} 
              />
              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <span className="canvas-toolbar-label">Calibrate Upload Image</span>
                </div>
                <Canvas 
                  rooms={rooms}
                  plot={plot}
                  onRoomsChange={setRooms}
                  imageSettings={imageSettings}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
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

        {/* 8. Add Room Popup (Modal sheet overlay) */}
        {showAddPopup && (
          <div className="add-element-sheet-overlay" onClick={() => setShowAddPopup(false)}>
            <div className="add-element-sheet" onClick={(e) => e.stopPropagation()}>
              
              <div className="sheet-header">
                <span className="sheet-title">Add Room / Item</span>
                <i className="ti ti-x" style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => setShowAddPopup(false)}></i>
              </div>

              {/* Search */}
              <input 
                type="text" 
                className="chat-input" 
                style={{ width: '100%', padding: '10px 14px', marginBottom: '16px' }}
                placeholder="Search room or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Rooms Category */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Rooms</div>
              <div className="element-grid-container">
                {POPUP_ELEMENTS.rooms.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={`ti ti-${r.icon}`}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Utilities Category */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Utilities</div>
              <div className="element-grid-container">
                {POPUP_ELEMENTS.utilities.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                  <div key={u.label} className="element-tile-card" onClick={() => handleAddRoom(u)}>
                    <div className="element-tile-icon-box tile-utility"><i className={`ti ti-${u.icon}`}></i></div>
                    <span className="element-tile-label">{u.label}</span>
                  </div>
                ))}
              </div>

              {/* Outdoors Category */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Outdoors</div>
              <div className="element-grid-container">
                {POPUP_ELEMENTS.outdoors.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                  <div key={o.label} className="element-tile-card" onClick={() => handleAddRoom(o)}>
                    <div className="element-tile-icon-box tile-outdoor"><i className={`ti ti-${o.icon}`}></i></div>
                    <span className="element-tile-label">{o.label}</span>
                  </div>
                ))}
              </div>

              {/* Add custom */}
              <form onSubmit={handleAddCustomElement} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  className="chat-input"
                  style={{ flex: 1, padding: '10px 14px' }}
                  placeholder="Enter custom room / item name..."
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Custom Room / Item</button>
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
