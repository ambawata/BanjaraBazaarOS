import React, { useState, useEffect } from 'react'
import PlotConfig from './components/PlotConfig'
import Canvas from './components/Canvas'
import Compass from './components/Compass'
import FloorPlanUpload from './components/FloorPlanUpload'
import AnalysisPanel from './components/AnalysisPanel'
import AiDesigner from './components/AiDesigner'
import AiChat from './components/AiChat'
import BanjaraBazaarShop from './components/BanjaraBazaarShop'
import ReportGenerator from './components/ReportGenerator'

const DEFAULT_ROOM_TEMPLATES = [
  { type: 'entrance', label: 'Main Entrance', icon: 'door-enter', w: 15, h: 10 },
  { type: 'pooja', label: 'Pooja Room', icon: 'flame', w: 15, h: 15 },
  { type: 'kitchen', label: 'Kitchen (Stove)', icon: 'soup', w: 20, h: 20 },
  { type: 'bedroom', label: 'Master Bedroom', icon: 'bed', w: 30, h: 25 },
  { type: 'bedroom', label: 'Guest Bedroom', icon: 'users', w: 25, h: 25 },
  { type: 'living', label: 'Living Room', icon: 'sofa', w: 35, h: 30 },
  { type: 'toilet', label: 'Toilet / Bath', icon: 'trash', w: 18, h: 15 },
  { type: 'staircase', label: 'Staircase', icon: 'arrow-merge', w: 15, h: 25 }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('designer')
  const [theme, setTheme] = useState(() => localStorage.getItem('vg-theme') || 'dark')
  
  // Plot configuration state
  const [plot, setPlot] = useState({
    width: 30,
    length: 40,
    shape: 'Rectangular',
    facing: 'East',
    tilt: 0
  })

  // Placed rooms state
  const [rooms, setRooms] = useState([
    { id: '1', type: 'entrance', label: 'Main Entrance', x: 90, y: 10, width: 10, height: 15 },
    { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
    { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
    { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
    { id: '5', type: 'living', label: 'Living Room', x: 45, y: 25, width: 45, height: 35 }
  ])

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
      x: 10, // Center/Left top initial placement
      y: 10,
      width: template.w,
      height: template.h
    }
    setRooms(prev => [...prev, newRoom])
    setSelectedRoomId(newRoom.id)
    setActiveTab('designer')
  }

  // Clear Canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear your current layout design?')) {
      setRooms([])
      setSelectedRoomId(null)
    }
  }

  // Load baseline template
  const handleSelectTemplate = (tpl) => {
    setPlot(tpl.plot)
    setRooms(tpl.rooms)
    setSelectedRoomId(null)
    setActiveTab('designer')
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
          <div className="sidebar-section-title">Planner Canvas</div>
          <div 
            className={`nav-item ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => setActiveTab('designer')}
          >
            <i className="ti ti-layout-grid-fill"></i> House Designer
          </div>
          <div 
            className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <i className="ti ti-template"></i> AI Layout Templates
          </div>
          <div 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <i className="ti ti-cloud-upload"></i> Floor Plan Upload
          </div>

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Consulting & Remedies</div>
          <div 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <i className="ti ti-brand-assistant"></i> AI Vastu Chat
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
            <i className="ti ti-file-text-filled"></i> Audit Report
          </div>
        </div>

        {/* Real-time Compass widget inside sidebar footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Compass tilt={plot.tilt} />
        </div>

        <div className="sidebar-footer">
          <strong>BanjaraBazaar</strong>
          Vastu Griha v1.0
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        <header id="topbar">
          <div className="topbar-left">
            <span className="page-title">
              {activeTab === 'designer' && 'Visual House Editor'}
              {activeTab === 'templates' && 'AI Baseline Templates'}
              {activeTab === 'upload' && 'Floor Plan Calibration'}
              {activeTab === 'chat' && 'AI Vastu Consultant'}
              {activeTab === 'shop' && 'Banjara Bazaar Remedial Shop'}
              {activeTab === 'reports' && 'Professional Vastu Report'}
            </span>
            <span className="page-subtitle">
              {activeTab === 'designer' && 'Drag and resize rooms inside the Vastu Mandala grid'}
              {activeTab === 'templates' && 'Load pre-engineered layout configurations'}
              {activeTab === 'upload' && 'Align your custom floor plan sketch behind the Vastu grid'}
              {activeTab === 'chat' && 'Ask the Vedic Acharya for paint shades, plants, or remedies'}
              {activeTab === 'shop' && 'Enhance positive energy flow with context-aware Vedic decorations'}
              {activeTab === 'reports' && 'Print or save an expert Vastu rating assessment PDF'}
            </span>
          </div>

          <div className="topbar-right">
            <button className="btn btn-icon theme-toggle" onClick={toggleTheme} title="Toggle light/dark mode">
              <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('reports')}>
              <i className="ti ti-download"></i> Export Report
            </button>
          </div>
        </header>

        {/* Dynamic Screen rendering */}
        <div className="page-workspace">
          
          {/* Main Visual Editor Screen */}
          {activeTab === 'designer' && (
            <>
              {/* Canva Room Sidebar */}
              <div className="designer-drawer">
                <div className="drawer-header">Room Catalog</div>
                <div className="drawer-body">
                  {DEFAULT_ROOM_TEMPLATES.map((tmpl) => (
                    <div 
                      key={tmpl.type + tmpl.label}
                      className="room-template-card"
                      onClick={() => handleAddRoom(tmpl)}
                      title="Click to place on canvas"
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
                  <div className="canvas-toolbar-group">
                    <span className="canvas-toolbar-label">Plot Blueprint</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{plot.width} ft × {plot.length} ft ({plot.facing} facing)</span>
                  </div>
                  <div className="canvas-toolbar-group">
                    <button className="btn btn-danger btn-sm" onClick={handleClearCanvas}>
                      <i className="ti ti-trash"></i> Clear Canvas
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

          {/* AI Templates Screen */}
          {activeTab === 'templates' && (
            <>
              <AiDesigner onSelectTemplate={handleSelectTemplate} />
              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <span className="canvas-toolbar-label">Template Preview</span>
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
                  <span className="canvas-toolbar-label">Align Overlay Sketch</span>
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
      </div>
    </div>
  )
}
