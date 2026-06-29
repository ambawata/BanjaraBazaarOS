import React, { useState, useEffect } from 'react'
import PlotConfig from './components/PlotConfig'
import Canvas from './components/Canvas'
import Compass from './components/Compass'
import FloorPlanUpload from './components/FloorPlanUpload'
import AnalysisPanel from './components/AnalysisPanel'
import AiChat from './components/AiChat'
import BanjaraBazaarShop from './components/BanjaraBazaarShop'
import ReportGenerator from './components/ReportGenerator'

const ELEMENT_CATALOG = {
  living: [
    { type: 'bedroom', label: 'Master Bedroom', icon: 'bed', w: 30, h: 25 },
    { type: 'bedroom', label: 'Guest Bedroom', icon: 'users', w: 25, h: 25 },
    { type: 'bedroom', label: 'Kids Bedroom', icon: 'mood-kid', w: 25, h: 25 },
    { type: 'kitchen', label: 'Kitchen (Stove)', icon: 'soup', w: 20, h: 20 },
    { type: 'pooja', label: 'Pooja Room', icon: 'flame', w: 15, h: 15 },
    { type: 'living', label: 'Living Room', icon: 'sofa', w: 35, h: 30 },
    { type: 'staircase', label: 'Staircase', icon: 'arrow-merge', w: 15, h: 25 }
  ],
  utilities: [
    { type: 'toilet', label: 'Toilet / Bath', icon: 'wash', w: 18, h: 15 },
    { type: 'borewell', label: 'Borewell / Water Well', icon: 'droplet', w: 12, h: 12 },
    { type: 'over-head-tank', label: 'Overhead Tank', icon: 'arrow-bar-to-up', w: 14, h: 14 },
    { type: 'septic-tank', label: 'Septic Tank', icon: 'arrow-bar-to-down', w: 15, h: 12 }
  ],
  power_outdoor: [
    { type: 'entrance', label: 'Main Entrance Gate', icon: 'door-enter', w: 15, h: 8 },
    { type: 'compound-wall', label: 'Compound Wall Boundary', icon: 'square-toggle', w: 100, h: 6 },
    { type: 'solar', label: 'Solar Array / Panels', icon: 'sun', w: 18, h: 15 },
    { type: 'solar', label: 'Generator Stand', icon: 'bolt', w: 12, h: 12 },
    { type: 'lift', label: 'Lift Shaft elevator', icon: 'arrows-up-down', w: 15, h: 15 },
    { type: 'basement', label: 'Basement Room', icon: 'circle-square', w: 40, h: 30 }
  ]
}

export default function App() {
  const [appStep, setAppStep] = useState('welcome') // welcome | onboarding | workspace
  const [wizardStep, setWizardStep] = useState('size') // size | facing | bhk | generate
  const [activeTab, setActiveTab] = useState('designer') // designer | upload | chat | shop | reports
  const [theme, setTheme] = useState(() => localStorage.getItem('vg-theme') || 'dark')
  
  // Custom room naming input state
  const [customRoomName, setCustomRoomName] = useState('')

  // Plot configuration state
  const [plot, setPlot] = useState({
    width: 30,
    length: 40,
    shape: 'Rectangular',
    facing: 'East',
    tilt: 0
  })

  // Placed rooms state
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  // Calibration overlay floor plan settings
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
      x: 10,
      y: 10,
      width: template.w,
      height: template.h
    }
    setRooms(prev => [...prev, newRoom])
    setSelectedRoomId(newRoom.id)
    setActiveTab('designer')
  }

  // Custom room submit handler
  const handleAddCustomRoom = (e) => {
    e.preventDefault()
    if (!customRoomName.trim()) return
    handleAddRoom({
      type: 'custom',
      label: customRoomName,
      w: 22,
      h: 20
    })
    setCustomRoomName('')
  }

  // Clear Canvas
  const handleClearCanvas = () => {
    if (window.confirm('Clear current house plan?')) {
      setRooms([])
      setSelectedRoomId(null)
    }
  }

  // Load wizard generated layouts
  const handleGenerateLayout = (templateId) => {
    let tplPlot = { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 }
    let tplRooms = []

    if (templateId === 'east_2bhk') {
      tplPlot = { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 }
      tplRooms = [
        { id: '1', type: 'entrance', label: 'Main Entrance Gate', x: 90, y: 10, width: 10, height: 15 },
        { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
        { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
        { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
        { id: '5', type: 'bedroom', label: 'Kids Bedroom', x: 5, y: 5, width: 35, height: 25 },
        { id: '6', type: 'toilet', label: 'Toilet / Bath', x: 5, y: 35, width: 25, height: 20 },
        { id: '7', type: 'living', label: 'Living Lounge', x: 45, y: 25, width: 45, height: 35 }
      ]
    } 
    else if (templateId === 'north_3bhk') {
      tplPlot = { width: 40, length: 60, shape: 'Rectangular', facing: 'North', tilt: 0 }
      tplRooms = [
        { id: '11', type: 'entrance', label: 'Main Entrance Gate', x: 40, y: 0, width: 20, height: 8 },
        { id: '12', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 5, width: 20, height: 15 },
        { id: '13', type: 'kitchen', label: 'Kitchen (Agneya)', x: 75, y: 75, width: 20, height: 20 },
        { id: '14', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 30, height: 25 },
        { id: '15', type: 'bedroom', label: 'Guest Bedroom', x: 5, y: 10, width: 25, height: 25 },
        { id: '16', type: 'bedroom', label: 'Kids Bedroom', x: 40, y: 70, width: 25, height: 25 },
        { id: '17', type: 'toilet', label: 'Toilet / Bath', x: 5, y: 45, width: 20, height: 18 },
        { id: '18', type: 'living', label: 'Living Lounge', x: 35, y: 25, width: 35, height: 35 },
        { id: '19', type: 'staircase', label: 'Staircase', x: 75, y: 40, width: 20, height: 25 }
      ]
    }
    else if (templateId === 'west_2bhk') {
      tplPlot = { width: 30, length: 50, shape: 'Rectangular', facing: 'West', tilt: 0 }
      tplRooms = [
        { id: '21', type: 'entrance', label: 'Main Entrance Gate', x: 0, y: 10, width: 10, height: 15 },
        { id: '22', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 5, width: 20, height: 15 },
        { id: '23', type: 'kitchen', label: 'Kitchen (Southeast)', x: 75, y: 70, width: 20, height: 25 },
        { id: '24', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
        { id: '25', type: 'bedroom', label: 'Guest Bedroom', x: 5, y: 5, width: 35, height: 25 },
        { id: '26', type: 'toilet', label: 'Toilet / Bath', x: 5, y: 35, width: 25, height: 20 },
        { id: '27', type: 'living', label: 'Living Room', x: 45, y: 25, width: 45, height: 35 }
      ]
    }
    else if (templateId === 'south_1bhk') {
      tplPlot = { width: 30, length: 30, shape: 'Square', facing: 'South', tilt: 0 }
      tplRooms = [
        { id: '31', type: 'entrance', label: 'Main Entrance (SE)', x: 75, y: 90, width: 20, height: 10 },
        { id: '32', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 5, width: 20, height: 18 },
        { id: '33', type: 'kitchen', label: 'Kitchen', x: 75, y: 60, width: 20, height: 25 },
        { id: '34', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 60, width: 40, height: 35 },
        { id: '35', type: 'toilet', label: 'Toilet / Bath', x: 5, y: 5, width: 25, height: 25 },
        { id: '36', type: 'living', label: 'Living Room', x: 35, y: 20, width: 35, height: 40 }
      ]
    }

    setPlot(tplPlot)
    setRooms(tplRooms)
    setSelectedRoomId(null)
    setAppStep('workspace')
    setActiveTab('designer')
  }

  // Render Onboarding Screens
  if (appStep === 'welcome') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px', textAlign: 'center' }}>
        <img src="/logo.svg" style={{ width: '120px', height: '120px', marginBottom: '20px', animation: 'rotateCompass 60s linear infinite' }} alt="Vastu Logo" />
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Vastu Griha</h1>
        <p style={{ fontSize: '15px', color: 'var(--text2)', maxWidth: '400px', lineHeight: '1.6', marginBottom: '32px' }}>
          Find positive energy alignments in your plot. Let the Vastu Acharya guide your home plan step-by-step.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ padding: '16px 36px', fontSize: '16px', fontWeight: 600, borderRadius: '30px' }}
          onClick={() => setAppStep('onboarding')}
        >
          Begin Guided Consultation <i className="ti ti-arrow-right" style={{ marginLeft: '8px' }}></i>
        </button>
      </div>
    )
  }

  if (appStep === 'onboarding') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header id="topbar" style={{ flexShrink: 0 }}>
          <div className="topbar-left">
            <span className="page-title">Vastu Assistant</span>
            <span className="page-subtitle">Onboarding Interview</span>
          </div>
          <button className="btn" onClick={() => setAppStep('welcome')}><i className="ti ti-arrow-back-up"></i> Back</button>
        </header>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <AiChat 
            rooms={rooms}
            plot={plot}
            currentStep={wizardStep}
            onNextStep={setWizardStep}
            onGenerateLayout={handleGenerateLayout}
            onSwitchTab={setActiveTab}
          />
        </div>
      </div>
    )
  }

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
            <i className="ti ti-brand-assistant"></i> Ask Acharya
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
          <button className="btn btn-sm" onClick={() => setAppStep('onboarding')} title="Restart wizard"><i className="ti ti-rotate"></i> Reset</button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        <header id="topbar">
          <div className="topbar-left">
            <span className="page-title">
              {activeTab === 'designer' && 'Home Blueprint'}
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
            <button className="btn btn-icon theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
              <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('reports')}>
              <i className="ti ti-printer"></i> Print Report
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Screens */}
        <div className="page-workspace" style={{ paddingBottom: '60px' }}> {/* Padding for mobile bottom nav */}
          
          {/* Main Visual Editor Screen */}
          {activeTab === 'designer' && (
            <>
              {/* Canva Room Sidebar */}
              <div className="designer-drawer">
                <div className="drawer-header">Elements Catalog</div>
                <div className="drawer-body">
                  
                  <div className="sidebar-section-title">Living spaces</div>
                  {ELEMENT_CATALOG.living.map((tmpl) => (
                    <div 
                      key={tmpl.type + tmpl.label}
                      className="room-template-card"
                      onClick={() => handleAddRoom(tmpl)}
                    >
                      <i className={`ti ti-${tmpl.icon}`}></i>
                      <span>{tmpl.label}</span>
                    </div>
                  ))}

                  <div className="sidebar-section-title" style={{ marginTop: '12px' }}>Tanks & Drainage</div>
                  {ELEMENT_CATALOG.utilities.map((tmpl) => (
                    <div 
                      key={tmpl.type + tmpl.label}
                      className="room-template-card"
                      onClick={() => handleAddRoom(tmpl)}
                    >
                      <i className={`ti ti-${tmpl.icon}`}></i>
                      <span>{tmpl.label}</span>
                    </div>
                  ))}

                  <div className="sidebar-section-title" style={{ marginTop: '12px' }}>Utility & Power</div>
                  {ELEMENT_CATALOG.power_outdoor.map((tmpl) => (
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
                  <form onSubmit={handleAddCustomRoom} style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
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
              <AnalysisPanel rooms={rooms} plot={plot} />
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
            <AiChat 
              rooms={rooms} 
              plot={plot} 
              currentStep="chat"
              onSwitchTab={setActiveTab} 
            />
          )}

          {/* Remedies Catalog */}
          {activeTab === 'shop' && (
            <BanjaraBazaarShop 
              rooms={rooms} 
              plot={plot} 
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

        {/* Mobile bottom navigation bar */}
        <div className="bottom-nav">
          <div 
            className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <i className="ti ti-brand-assistant"></i>
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
            onClick={() => setActiveTab('shop')}
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
