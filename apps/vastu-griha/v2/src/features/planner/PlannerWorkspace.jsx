import React from 'react'
import Canvas from '../../components/Canvas'
import Compass from '../../components/Compass'
import PlotBoundaryDrawer from '../../components/PlotBoundaryDrawer'
import AnalysisPanel from '../../components/AnalysisPanel'
import BanjaraBazaarShop from '../../components/BanjaraBazaarShop'
import ReportGenerator from '../../components/ReportGenerator'
import AiChat from '../../components/AiChat'
import PlotConfig from '../../components/PlotConfig'
import AssetGallery from '../../components/AssetGallery'
import { EXPANDED_ROOMS_CATALOG } from '../../assets/constants'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { Hero } from './widgets/home/Hero';
import { ActionCards } from './widgets/home/ActionCards';
import { RecentActivity } from './widgets/home/RecentActivity';
import { VastuScoreGauge } from './widgets/home/VastuScoreGauge';
import { ItemPlacementWidget } from './widgets/home/ItemPlacementWidget';

export default function PlannerWorkspace() {
  const {
    screenState,
    setScreenState,
    activeTab,
    setActiveTab,
    showAcharyaModal,
    setShowAcharyaModal,
    isMobile,
    theme,
    toggleTheme,
    selectedIssueRoom,
    setSelectedIssueRoom,
    selectedRoomId,
    setSelectedRoomId,
    showVastuGrid,
    setShowVastuGrid,
    showNormalGrid,
    setShowNormalGrid,
    showAddPopup,
    setShowAddPopup,
    customRoomName,
    setCustomRoomName,
    searchQuery,
    setSearchQuery,
    isTracing,
    traceStatus,
    showShareModal,
    setShowShareModal,
    showNotificationCenter,
    setShowNotificationCenter,
    editMode,
    setEditMode,
    members,
    comments,
    tasks,
    notifications
  } = useUiStore()

  const {
    onboarding,
    plot,
    setPlot
  } = useProjectStore()

  const {
    rooms,
    setRooms,
    boundaryPoints,
    setBoundaryPoints,
    imageSettings,
    setImageSettings,
    addRoom,
    deleteRoom,
    clearCanvas,
    nudgeRoom,
    resizeRoom,
    undoLayout,
    redoLayout
  } = useCanvasStore()

  const [showTip, setShowTip] = React.useState(() => {
    return typeof window !== 'undefined' ? !localStorage.getItem('vg-dismiss-tip') : true
  })
  const dismissTip = () => {
    localStorage.setItem('vg-dismiss-tip', 'true')
    setShowTip(false)
  }
  const [placementDirection, setPlacementDirection] = React.useState('North')

  // ── Upload / Calibrate Sketch screen — component-level state & refs ────
  const [showPlotSheet, setShowPlotSheet] = React.useState(false)
  const [rotateDragAngle, setRotateDragAngle] = React.useState(null)
  const gestureRef = React.useRef(null)
  const panRef = React.useRef(null)
  const rotRef = React.useRef(null)
  const pinchRef = React.useRef(null)

  const _angleBetween = (cx, cy, x, y) => Math.atan2(y - cy, x - cx) * (180 / Math.PI)
  const _touchDist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

  const onSketchPanStart = (e) => {
    if (!imageSettings.url) return
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.touches?.[0]?.clientY
    panRef.current = { startX: x, startY: y, origX: imageSettings.xOffset, origY: imageSettings.yOffset }
  }
  const onSketchPanMove = (e) => {
    if (!panRef.current) return
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.touches?.[0]?.clientY
    const dx = (x - panRef.current.startX) / imageSettings.scale
    const dy = (y - panRef.current.startY) / imageSettings.scale
    setImageSettings({ ...imageSettings, xOffset: panRef.current.origX + dx, yOffset: panRef.current.origY + dy })
  }
  const onSketchPanEnd = () => { panRef.current = null }

  const onSketchWheel = (e) => {
    if (!imageSettings.url) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const next = Math.max(0.3, Math.min(4.0, imageSettings.scale + delta))
    setImageSettings({ ...imageSettings, scale: parseFloat(next.toFixed(2)) })
  }

  const onSketchTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: _touchDist(e.touches[0], e.touches[1]), origScale: imageSettings.scale }
      panRef.current = null
    } else { onSketchPanStart(e) }
  }
  const onSketchTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const ratio = _touchDist(e.touches[0], e.touches[1]) / pinchRef.current.startDist
      const next = Math.max(0.3, Math.min(4.0, pinchRef.current.origScale * ratio))
      setImageSettings({ ...imageSettings, scale: parseFloat(next.toFixed(2)) })
    } else { onSketchPanMove(e) }
  }
  const onSketchTouchEnd = () => { pinchRef.current = null; onSketchPanEnd() }

  const onRotateHandleStart = (e) => {
    e.stopPropagation()
    const rect = gestureRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.touches?.[0]?.clientY
    rotRef.current = { cx, cy, startAngle: _angleBetween(cx, cy, x, y), origRotation: imageSettings.rotation }
    const moveEvt = e.type === 'touchstart' ? 'touchmove' : 'mousemove'
    const upEvt = e.type === 'touchstart' ? 'touchend' : 'mouseup'
    const onMove = (ev) => {
      if (!rotRef.current) return
      const mx = ev.clientX ?? ev.touches?.[0]?.clientX
      const my = ev.clientY ?? ev.touches?.[0]?.clientY
      const delta = _angleBetween(rotRef.current.cx, rotRef.current.cy, mx, my) - rotRef.current.startAngle
      const newRot = Math.round(rotRef.current.origRotation + delta)
      setRotateDragAngle(newRot)
      setImageSettings({ ...imageSettings, rotation: newRot })
    }
    const onUp = () => {
      rotRef.current = null; setRotateDragAngle(null)
      window.removeEventListener(moveEvt, onMove); window.removeEventListener(upEvt, onUp)
    }
    window.addEventListener(moveEvt, onMove); window.addEventListener(upEvt, onUp)
  }

  const sketchOpacitySteps = [0.25, 0.5, 0.85]
  const cycleSketchOpacity = () => {
    const idx = sketchOpacitySteps.findIndex(v => imageSettings.opacity <= v)
    setImageSettings({ ...imageSettings, opacity: sketchOpacitySteps[(idx + 1) % sketchOpacitySteps.length] })
  }

  // Preset vs Corner Taps shape handler
  const selectShapePreset = (shape) => {
    setBoundaryPoints([])
    useProjectStore.getState().setOnboarding({ ...onboarding, plotShape: shape })
  }

  const handlePointsChange = (pts) => {
    setBoundaryPoints(pts)
    if (pts.length > 0) {
      useProjectStore.getState().setOnboarding({ ...onboarding, plotShape: 'Custom Shape (Tapped corners)' })
    }
  }

  // Add room helpers
  const handleAddRoom = (template) => {
    addRoom(template)
    setShowAddPopup(false)
    setActiveTab('designer')
  }

  // Submit custom element
  const handleAddCustomRoom = (e) => {
    e.preventDefault()
    if (!customRoomName.trim()) return
    addRoom({
      type: 'custom',
      label: customRoomName,
      w: 22,
      h: 22
    })
    setCustomRoomName('')
    setShowAddPopup(false)
    setActiveTab('designer')
  }

  const handleHomeAddToCart = () => {
    useUiStore.getState().addNotification({
        id: Date.now().toString(),
        text: 'Added Wall Mirror (Round) to Banjara Bazaar cart',
        time: 'Just now',
        type: 'shop'
    });
    alert('Added mirror item to Banjara Bazaar cart!');
  };

  // Clear visual canvas
  const handleClearCanvas = () => {
    if (window.confirm('Reset current layout design?')) {
      clearCanvas()
      setSelectedRoomId(null)
    }
  }

  const handleDeleteSelected = () => {
    if (!selectedRoomId) return
    deleteRoom(selectedRoomId)
    setSelectedRoomId(null)
  }

  const handleAutoTrace = () => {
    if (!imageSettings.url) {
      alert("Please upload a floor plan drawing (PDF/JPG/PNG) first using the uploader!")
      return
    }
    
    useUiStore.getState().setIsTracing(true)
    useUiStore.getState().setTraceStatus('Scanning layout drawing structural contours...')
    
    setTimeout(() => {
      useUiStore.getState().setTraceStatus('Detecting text tags (Bedroom, Kitchen, Pooja)...')
    }, 1000)

    setTimeout(() => {
      useUiStore.getState().setTraceStatus('Mapping coordinate offsets to 3x3 Vastu mandala...')
    }, 2000)

    setTimeout(() => {
      setRooms([
        { id: 't1', type: 'bedroom', label: 'Master Bedroom', x: 2.8, y: 60.5, width: 29.2, height: 31.5 },
        { id: 't2', type: 'bedroom', label: 'Kids Bedroom', x: 2.8, y: 2, width: 29.2, height: 32 },
        { id: 't3', type: 'bedroom', label: 'Parents Bedroom', x: 61.2, y: 6, width: 29.5, height: 33.2 },
        { id: 't4', type: 'living', label: 'Living Room Lounge', x: 35, y: 5, width: 26.2, height: 24.5 },
        { id: 't5', type: 'kitchen', label: 'Kitchen Cooktop', x: 61.8, y: 59, width: 29.2, height: 33.2 },
        { id: 't6', type: 'pooja', label: 'Pooja Mandir', x: 74.6, y: 39.2, width: 16.1, height: 19.8 },
        { id: 't7', type: 'toilet', label: 'Left Toilet / Bath', x: 16.5, y: 34, width: 15.5, height: 22 },
        { id: 't8', type: 'toilet', label: 'Right Toilet / Bath', x: 61.8, y: 39.2, width: 12.8, height: 19.8 },
        { id: 't9', type: 'staircase', label: 'Staircase Block', x: 32, y: 55.5, width: 14.8, height: 36.5 },
        { id: 't10', type: 'dining', label: 'Dining Area', x: 46.8, y: 59.8, width: 15, height: 32.2 },
        { id: 't11', type: 'entrance', label: 'Main Entrance', x: 46.8, y: 92, width: 15, height: 8 }
      ])
      useUiStore.getState().setIsTracing(false)
      useUiStore.getState().setTraceStatus('')
      setActiveTab('designer')
    }, 3000)
  }

  // Background sketch calibration file reader
  const handleContinueProject = (project) => {
    if (project === 'gupta') {
      setPlot({ width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 })
      setRooms([
        { id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 80, y: 5, width: 15, height: 8 },
        { id: 'r2', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 15, width: 20, height: 15 },
        { id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 75, y: 70, width: 20, height: 20 },
        { id: 'r4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 35, height: 25 },
        { id: 'r5', type: 'living', label: 'Living Room Lounge', x: 30, y: 25, width: 40, height: 35 }
      ])
      setScreenState('workspace')
      setActiveTab('designer')
    } else {
      setPlot({ width: 60, length: 90, shape: 'Rectangular', facing: 'North', tilt: 0 })
      setRooms([
        { id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 45, y: 5, width: 15, height: 8 },
        { id: 'r2', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 30, height: 25 },
        { id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 65, y: 65, width: 25, height: 25 },
        { id: 'r4', type: 'pooja', label: 'Pooja Room', x: 75, y: 10, width: 20, height: 20 }
      ])
      setScreenState('workspace')
      setActiveTab('designer')
    }
  }

  const handleBackdropFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageSettings({
        ...imageSettings,
        url: ev.target?.result
      })
    }
    reader.readAsDataURL(file)
  }

  // Workspace View
  return (
    <div id="app-container">
      
      {/* Sidebar navigation */}
      <nav id="sidebar">
        <div className="sidebar-brand">
          <svg className="sidebar-logo-img" viewBox="0 0 100 100" fill="none" role="img" aria-label="Vastu compass">
            <circle cx="50" cy="50" r="30" stroke="var(--accent)" strokeWidth="4.5" />
            <circle cx="50" cy="50" r="16" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M50,10 L50,90 M10,50 L90,50" stroke="var(--accent)" strokeWidth="3.5" />
            <circle cx="50" cy="10" r="4.5" fill="var(--accent)" />
            <circle cx="50" cy="90" r="4.5" fill="var(--accent)" />
            <circle cx="10" cy="50" r="4.5" fill="var(--accent)" />
            <circle cx="90" cy="50" r="4.5" fill="var(--accent)" />
            <polygon points="50,26 56,42 50,38 44,42" fill="var(--accent)" />
            <polygon points="50,74 56,58 50,62 44,58" fill="var(--accent)" opacity="0.6" />
          </svg>
          <span>Vastu</span> Griha
        </div>

        <div className="sidebar-nav">
          <div 
            className="nav-item"
            style={{ borderBottom: '1px solid var(--border)', borderRadius: 0, paddingBottom: '12px', marginBottom: '12px', gap: '8px' }}
            onClick={() => setScreenState('dashboard')}
          >
            <i className="ti ti-arrow-left"></i> Exit to Dashboard
          </div>

          <div className="sidebar-section-title">Home Blueprint</div>
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <i className="ti ti-home-2"></i> Workspace
          </div>
          <div 
            className={`nav-item ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => setActiveTab('designer')}
          >
            <i className="ti ti-layout-grid"></i> Visual Layout
          </div>
          <div 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <i className="ti ti-cloud-upload"></i> Calibrate Sketch
          </div>

          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Vedic Audit</div>
          <div 
            className="nav-item"
            onClick={() => setShowAcharyaModal(true)}
          >
            <i className="ti ti-message-chatbot"></i> Ask Acharya
          </div>
          <div 
            className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <i className="ti ti-clipboard-check"></i> Vastu Audit
          </div>
          <div 
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            <i className="ti ti-shopping-cart"></i> Shop Remedies
          </div>
          <div 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="ti ti-file-text"></i> Print Audit
          </div>
          <div 
            className={`nav-item ${activeTab === 'collaborate' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborate')}
          >
            <i className="ti ti-users"></i> Collaborate
          </div>
          <div 
            className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
            style={{ borderTop: '1px solid var(--border)', borderRadius: 0, marginTop: '8px', paddingTop: '8px' }}
          >
            <i className="ti ti-armchair"></i> Furniture & Decor
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Compass tilt={plot.tilt} />
        </div>

        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Vastu Griha v1.0</span>
          <button className="btn btn-sm" onClick={() => setScreenState('step_prop')}><i className="ti ti-rotate"></i> Reset</button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        {activeTab !== 'home' && activeTab !== 'profile' && (
          <header id="topbar">
            <div className="topbar-left">
              <span className="page-title">
                {activeTab === 'designer' && 'Plan Editor (Easy Mode)'}
                {activeTab === 'upload' && 'Align Custom Sketch'}
                {activeTab === 'chat' && 'Vastu Acharya Consultant'}
                {activeTab === 'analysis' && 'Vastu Compliance Audit'}
                {activeTab === 'shop' && 'Vastu Remedies Shop'}
                {activeTab === 'reports' && 'Vastu Health Report'}
                {activeTab === 'collaborate' && 'Project Collaboration'}
                {activeTab === 'assets' && 'Furniture & Decor'}
              </span>
              <span className="page-subtitle">
                {activeTab === 'designer' && 'Tap elements to place, and use nudge buttons to align'}
                {activeTab === 'upload' && 'Place existing plans behind grid lines and adjust alignment'}
                {activeTab === 'chat' && 'Query paint colors, entrances, or element balance suggestions'}
                {activeTab === 'analysis' && 'Detailed sector evaluations and graded remedies'}
                {activeTab === 'shop' && 'Procure Vedic remedies to align home energy fields'}
                {activeTab === 'reports' && 'Check and print family Vastu layout checklist reports'}
                {activeTab === 'collaborate' && 'Share layout coordinates and trace tasks checklists'}
                {activeTab === 'assets' && 'Browse beautiful home collections and find the perfect placement'}
              </span>
            </div>

            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <select 
                className="btn" 
                style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                value={editMode}
                onChange={(e) => setEditMode(e.target.value)}
              >
                <option value="edit">✍️ Edit Mode</option>
                <option value="view">👓️ View Only</option>
              </select>

              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotificationCenter(!showNotificationCenter)}>
                <i className="ti ti-bell" style={{ fontSize: '20px' }}></i>
                {notifications.length > 0 && (
                  <div style={{ position: 'absolute', top: '2px', right: '2px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                )}
              </div>

              <button className="btn btn-icon theme-toggle" onClick={toggleTheme}>
                <i className={`ti ti-${theme === 'light' ? 'moon-filled' : 'sun-filled'}`}></i>
              </button>

              <button className="btn" onClick={() => setShowShareModal(true)}>
                <i className="ti ti-share"></i> <span className="hidden-mobile">Share</span>
              </button>

              <button className="btn btn-primary" onClick={() => setActiveTab('reports')}>
                <i className="ti ti-printer"></i> <span className="hidden-mobile">Print Report</span>
              </button>

              {showNotificationCenter && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    right: '180px', 
                    width: '280px', 
                    background: 'var(--bg2)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow)', 
                    zIndex: 500, 
                    padding: '16px',
                    textAlign: 'left'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Local Alerts</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)', cursor: 'pointer' }} onClick={() => setShowNotificationCenter(false)}>Close</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px' }}>{n.text}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text3)' }}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Dynamic Workspace Screens */}
        <div className="page-workspace" style={{ paddingBottom: '60px' }}>
          
          {/* 1. Dedicated Workspace Landing Screen */}
          {activeTab === 'home' && (() => {
            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#faf9f6', overflowY: 'auto', paddingBottom: '80px' }}>
                
                {/* Custom Consumer-Style Home App Bar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: isMobile ? '14px 18px' : '18px 24px', 
                  background: '#ffffff', 
                  borderBottom: '1.5px solid var(--border)', 
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  flexShrink: 0 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="30" stroke="var(--accent)" strokeWidth="4.5" />
                      <circle cx="50" cy="50" r="16" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
                      <path d="M50,10 L50,90 M10,50 L90,50" stroke="var(--accent)" strokeWidth="3.5" />
                      <circle cx="50" cy="10" r="4.5" fill="var(--accent)" />
                      <circle cx="50" cy="90" r="4.5" fill="var(--accent)" />
                      <circle cx="10" cy="50" r="4.5" fill="var(--accent)" />
                      <circle cx="90" cy="50" r="4.5" fill="var(--accent)" />
                      <polygon points="50,26 56,42 50,38 44,42" fill="var(--accent)" />
                      <polygon points="50,74 56,58 50,62 44,58" fill="var(--accent)" opacity="0.6" />
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.1' }}>
                      <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '17px', color: 'var(--accent)', letterSpacing: '-0.1px' }}>Vastu Griha</span>
                      <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 600 }}>by Banjara Bazaar</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => useUiStore.getState().setShowNotificationCenter(!showNotificationCenter)}>
                      <i className="ti ti-bell" style={{ fontSize: '22px', color: 'var(--text2)' }}></i>
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent)', color: '#fff', fontSize: '9px', fontWeight: 'bold', width: '15px', height: '15px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                    </div>
                    <div 
                      style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', border: '1.5px solid var(--accent)' }}
                      onClick={() => setActiveTab('profile')}
                    >
                      AM
                    </div>
                  </div>
                </div>

                {/* Home Inner Content Panel */}
                <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '1000px', margin: '0 auto', padding: 'clamp(16px, 4vw, 20px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 5vw, 22px)', boxSizing: 'border-box' }}>
                  
                  <Hero />
                  <ActionCards setActiveTab={setActiveTab} setScreenState={setScreenState} />

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', textAlign: 'left', width: '100%' }}>
                    <RecentActivity setActiveTab={setActiveTab} />
                    <VastuScoreGauge />
                  </div>

                  <ItemPlacementWidget
                    placementDirection={placementDirection}
                    setPlacementDirection={setPlacementDirection}
                    onAddToCart={handleHomeAddToCart}
                  />

                  {/* TALK TO ACHARYA AI BOTTOM CARD */}
                  <div 
                    onClick={() => setShowAcharyaModal(true)}
                    style={{ background: '#EEF0F7', border: '1px solid #C7CCE0', borderRadius: '24px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 1, flex: 1.2 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2B3A67', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="ti ti-message-chatbot" style={{ fontSize: '20px' }}></i>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold', color: '#2B3A67' }}>Talk to Acharya AI</h4>
                        <span style={{ fontSize: '10.5px', color: '#4A5A8F', marginTop: '2px' }}>Get answers to your Vastu doubts</span>
                      </div>
                    </div>

                    <button className="btn btn-sm btn-primary" style={{ padding: '8px 14px', borderRadius: '12px', background: '#2B3A67', borderColor: '#2B3A67', zIndex: 1, fontSize: '10px', fontWeight: 'bold' }}>
                      Ask Now
                    </button>

                    {/* Wise Acharya Avatar illustration floating right */}
                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.85, pointerEvents: 'none', zIndex: 0 }}>
                      <svg viewBox="0 0 100 100" width="80" height="80">
                        <circle cx="50" cy="50" r="46" fill="rgba(124, 111, 247, 0.05)" />
                        <path d="M35,45 Q50,90 65,45" fill="#ffffff" />
                        <path d="M42,50 Q50,95 58,50" fill="#f1f5f9" />
                        <circle cx="50" cy="40" r="14" fill="#fed7aa" />
                        <path d="M32,35 Q50,15 68,35 Q50,22 32,35" fill="#ffffff" />
                        <circle cx="46" cy="38" r="1" fill="#000" />
                        <circle cx="54" cy="38" r="1" fill="#000" />
                        <path d="M47,44 Q50,47 53,44" fill="none" stroke="#000" strokeWidth="0.8" />
                        <path d="M30,68 L70,68 L65,95 L35,95 Z" fill="#ea580c" />
                      </svg>
                    </div>
                  </div>

                </div>

              </div>
            )
          })()}

          {/* Main Visual Editor Screen */}
          {activeTab === 'designer' && (
            <>
              {!isMobile && (
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
                        <i className={tmpl.icon}></i>
                        <span>{tmpl.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="canvas-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="canvas-toolbar">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className={`toggle-chip ${showNormalGrid ? 'active' : ''}`} onClick={() => setShowNormalGrid(!showNormalGrid)}>
                      <i className="ti ti-grid-dots"></i> <span className="hidden-mobile">Grid</span>
                    </button>
                    <button className={`toggle-chip ${showVastuGrid ? 'active' : ''}`} onClick={() => setShowVastuGrid(!showVastuGrid)}>
                      <i className="ti ti-compass"></i> <span className="hidden-mobile">Vastu Grid</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-icon" onClick={undoLayout} title="Undo last action">
                      <i className="ti ti-arrow-back-up"></i>
                    </button>
                    <button className="btn btn-icon" onClick={redoLayout} title="Redo action">
                      <i className="ti ti-arrow-forward-up"></i>
                    </button>
                    <button className="btn btn-icon btn-danger" onClick={handleClearCanvas} title="Clear canvas">
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </div>

                {showTip && (
                  <div className="guided-tips-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                      <i className="ti ti-bulb" style={{ color: 'var(--gold)', fontSize: '18px' }}></i>
                      <span style={{ fontSize: '11.5px', color: 'var(--text2)' }}>
                        <strong>Guided Tip:</strong> Tap any room on the canvas to open alignment handles. Drag corner handles to resize, or use nudge buttons below for precise Vastu alignments.
                      </span>
                    </div>
                    <i className="ti ti-x" style={{ cursor: 'pointer', color: 'var(--text3)' }} onClick={dismissTip}></i>
                  </div>
                )}
                
                <Canvas />

                {isMobile && (
                  <button 
                    className="btn btn-primary fab-add-room" 
                    onClick={() => setShowAddPopup(true)}
                    style={{
                      position: 'fixed',
                      bottom: '80px',
                      right: '20px',
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                      zIndex: 90,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: '22px' }}></i>
                  </button>
                )}

                {/* Desktop Property Inspector panel */}
                {!isMobile && selectedRoomId && (
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Easy Align Controls</span>
                        {(() => {
                          const selectedRoom = rooms.find(r => r.id === selectedRoomId)
                          return selectedRoom ? (
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '2px' }}>
                              Editing: {selectedRoom.label} ({Math.round((selectedRoom.width / 100) * plot.width)}x{Math.round((selectedRoom.height / 100) * plot.length)} ft)
                            </span>
                          ) : null
                        })()}
                      </div>
                      <button className="btn btn-sm btn-danger" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '16px' }} onClick={handleDeleteSelected}>
                        <i className="ti ti-trash"></i> Delete
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '6px' }}>Move:</span>
                        <button className="btn btn-sm" onClick={() => nudgeRoom(selectedRoomId, 'left')}><i className="ti ti-arrow-left"></i></button>
                        <button className="btn btn-sm" onClick={() => nudgeRoom(selectedRoomId, 'up')}><i className="ti ti-arrow-up"></i></button>
                        <button className="btn btn-sm" onClick={() => nudgeRoom(selectedRoomId, 'down')}><i className="ti ti-arrow-down"></i></button>
                        <button className="btn btn-sm" onClick={() => nudgeRoom(selectedRoomId, 'right')}><i className="ti ti-arrow-right"></i></button>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '6px' }}>Resize:</span>
                        <button className="btn btn-sm" onClick={() => resizeRoom(selectedRoomId, 'w', 1)}>W +</button>
                        <button className="btn btn-sm" onClick={() => resizeRoom(selectedRoomId, 'w', -1)}>W -</button>
                        <button className="btn btn-sm" onClick={() => resizeRoom(selectedRoomId, 'h', 1)}>H +</button>
                        <button className="btn btn-sm" onClick={() => resizeRoom(selectedRoomId, 'h', -1)}>H -</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Property Bottom Sheet */}
                {isMobile && selectedRoomId && rooms.find(r => r.id === selectedRoomId) && (() => {
                  const selectedRoom = rooms.find(r => r.id === selectedRoomId)
                  return (
                    <div className="mobile-bottom-sheet-overlay" onClick={() => setSelectedRoomId(null)}>
                      <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="bottom-sheet-drag-bar"></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontFamily: 'var(--fd)', fontWeight: 'bold', margin: 0 }}>Configure {selectedRoom.label}</h4>
                          <button className="btn btn-sm btn-danger" onClick={handleDeleteSelected}><i className="ti ti-trash"></i> Delete</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Room Label</span>
                          <input 
                            type="text" className="chat-input" style={{ width: '100%', padding: '8px' }}
                            value={selectedRoom.label}
                            onChange={(e) => {
                              const updated = rooms.map(r => r.id === selectedRoomId ? { ...r, label: e.target.value } : r)
                              setRooms(updated)
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Width (ft)</span>
                            <input 
                              type="number" className="chat-input" style={{ width: '100%', padding: '8px' }}
                              value={Math.round((selectedRoom.width / 100) * plot.width)}
                              onChange={(e) => {
                                const wPct = Math.round((parseInt(e.target.value) / plot.width) * 100 * 10) / 10
                                if (wPct > 5 && wPct < 95) {
                                  const updated = rooms.map(r => r.id === selectedRoomId ? { ...r, width: wPct } : r)
                                  setRooms(updated)
                                }
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Length (ft)</span>
                            <input 
                              type="number" className="chat-input" style={{ width: '100%', padding: '8px' }}
                              value={Math.round((selectedRoom.height / 100) * plot.length)}
                              onChange={(e) => {
                                const hPct = Math.round((parseInt(e.target.value) / plot.length) * 100 * 10) / 10
                                if (hPct > 5 && hPct < 95) {
                                  const updated = rooms.map(r => r.id === selectedRoomId ? { ...r, height: hPct } : r)
                                  setRooms(updated)
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'left' }}>Fine-tune Position (Nudge)</span>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button className="btn" onClick={() => nudgeRoom(selectedRoomId, 'left')}><i className="ti ti-arrow-left"></i> Left</button>
                            <button className="btn" onClick={() => nudgeRoom(selectedRoomId, 'up')}><i className="ti ti-arrow-up"></i> Up</button>
                            <button className="btn" onClick={() => nudgeRoom(selectedRoomId, 'down')}><i className="ti ti-arrow-down"></i> Down</button>
                            <button className="btn" onClick={() => nudgeRoom(selectedRoomId, 'right')}><i className="ti ti-arrow-right"></i> Right</button>
                          </div>
                        </div>
                        
                        <button className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }} onClick={() => setSelectedRoomId(null)}>Save & Close</button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {!isMobile && (
                <AnalysisPanel 
                  rooms={rooms} 
                  plot={plot} 
                  onSwitchTab={setActiveTab}
                  onSelectShopItem={setSelectedIssueRoom}
                />
              )}
            </>
          )}

          {/* ─── Floorplan Calibration Screen ─────────────────────────────── */}
          {activeTab === 'upload' && (() => {

            // ── Common canvas wrapper with gesture overlay ─────────────────
            const GestureCanvas = () => (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: isMobile ? '60vh' : '380px'
                }}
              >
                {/* Canvas reads rooms/plot/imageSettings/selection directly from the stores */}
                <Canvas />

                {/* Transparent gesture-capture overlay — sits above canvas, below tracing overlay */}
                {imageSettings.url && (
                  <div
                    ref={gestureRef}
                    onMouseDown={onSketchPanStart}
                    onMouseMove={onSketchPanMove}
                    onMouseUp={onSketchPanEnd}
                    onMouseLeave={onSketchPanEnd}
                    onWheel={onSketchWheel}
                    onTouchStart={onSketchTouchStart}
                    onTouchMove={onSketchTouchMove}
                    onTouchEnd={onSketchTouchEnd}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 5,
                      cursor: 'grab',
                      touchAction: 'none'
                    }}
                  >
                    {/* ── Rotate handle — top-right corner ───────────────── */}
                    <div
                      onMouseDown={onRotateHandleStart}
                      onTouchStart={onRotateHandleStart}
                      title="Drag to rotate"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(20,20,28,0.72)',
                        backdropFilter: 'blur(6px)',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'grab',
                        zIndex: 6,
                        userSelect: 'none',
                        touchAction: 'none'
                      }}
                    >
                      <i className="ti ti-rotate-clockwise" style={{ fontSize: 14, color: '#fff', pointerEvents: 'none' }} />
                    </div>

                    {/* ── Rotation tooltip (only visible while dragging) ──── */}
                    {rotateDragAngle !== null && (
                      <div style={{
                        position: 'absolute',
                        top: 42,
                        right: 8,
                        background: 'rgba(20,20,28,0.85)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        pointerEvents: 'none',
                        zIndex: 7
                      }}>
                        {rotateDragAngle}°
                      </div>
                    )}

                    {/* ── Opacity toggle icon ─────────────────────────────── */}
                    <div
                      onClick={(e) => { e.stopPropagation(); cycleSketchOpacity() }}
                      title={`Opacity: ${Math.round(imageSettings.opacity * 100)}% — tap to cycle`}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(20,20,28,0.72)',
                        backdropFilter: 'blur(6px)',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 6,
                        userSelect: 'none'
                      }}
                    >
                      <i
                        className={`ti ${imageSettings.opacity < 0.4 ? 'ti-eye-off' : 'ti-eye'}`}
                        style={{ fontSize: 14, color: '#fff', pointerEvents: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* AI Tracing overlay — kept exactly as before */}
                {isTracing && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 29, 32, 0.85)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
                    <div className="ai-scanner-line" style={{ width: '100%', height: '4px', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', position: 'absolute', animation: 'scanLoop 2s ease-in-out infinite' }}></div>
                    <i className="ti ti-wand" style={{ fontSize: '40px', color: 'var(--gold)', animation: 'pulse 1.5s infinite', marginBottom: '14px' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{traceStatus}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>AI vision digitizing room labels...</span>
                  </div>
                )}
              </div>
            )

            // ═══════════════════════════════════════════════════════════════
            // MOBILE LAYOUT — full-screen canvas + floating toolbar + sheet
            // ═══════════════════════════════════════════════════════════════
            if (isMobile) {
              return (
                <div style={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  {/* Full-screen canvas — top padding reserves space so the
                      floating toolbar below never overlaps the plot content */}
                  <div style={{ flex: 1, position: 'relative', paddingTop: 60, boxSizing: 'border-box' }}>
                    <GestureCanvas />
                  </div>

                  {/* ── Floating minimal toolbar ─────────────────────────── */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                    background: 'rgba(20,20,28,0.80)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 28,
                    padding: '6px 12px',
                    zIndex: 20,
                    alignItems: 'center'
                  }}>
                    {/* Upload button */}
                    <label
                      htmlFor="mobile-sketch-upload"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: 'var(--accent)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className="ti ti-upload" style={{ fontSize: 13 }} />
                      Upload
                    </label>
                    <input
                      id="mobile-sketch-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleBackdropFile}
                      style={{ display: 'none' }}
                    />

                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />

                    {/* AI Auto-Trace button */}
                    <button
                      onClick={handleAutoTrace}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 6px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className="ti ti-wand" style={{ fontSize: 14, color: 'var(--gold)' }} />
                      AI Trace
                    </button>

                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />

                    {/* Plot config sheet trigger */}
                    <button
                      onClick={() => setShowPlotSheet(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 6px'
                      }}
                    >
                      <i className="ti ti-settings" style={{ fontSize: 15 }} />
                    </button>
                  </div>

                  {/* Gesture hint strip — shows only when no image loaded */}
                  {!imageSettings.url && (
                    <div style={{
                      position: 'absolute',
                      bottom: 80,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(20,20,28,0.75)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: 11,
                      padding: '8px 16px',
                      borderRadius: 20,
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      zIndex: 15,
                      whiteSpace: 'nowrap'
                    }}>
                      <span>✌️ Pinch to zoom</span>
                      <span>☝️ Drag to pan</span>
                      <span>↺ Handle to rotate</span>
                    </div>
                  )}

                  {/* ── PlotConfig bottom sheet ──────────────────────────── */}
                  {showPlotSheet && (
                    <div
                      onClick={() => setShowPlotSheet(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        zIndex: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: 'var(--bg2)',
                          borderRadius: '20px 20px 0 0',
                          borderTop: '1px solid var(--border)',
                          maxHeight: '70vh',
                          overflowY: 'auto',
                          padding: '0 0 32px 0'
                        }}
                      >
                        {/* Drag bar */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
                        </div>
                        <div style={{ padding: '0 20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>Plot Configuration</span>
                            <button
                              onClick={() => setShowPlotSheet(false)}
                              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, padding: 4 }}
                            >
                              <i className="ti ti-x" />
                            </button>
                          </div>
                          <PlotConfig plot={plot} onChange={setPlot} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // ═══════════════════════════════════════════════════════════════
            // DESKTOP LAYOUT — left panel + center canvas + right PlotConfig
            // ═══════════════════════════════════════════════════════════════
            return (
              <>
                {/* ── Left control panel (no sliders — only file & AI btn) ── */}
                <div className="upload-screen-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Align Sketch Backdrop</span>

                  {/* File picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '11px', color: 'var(--text2)' }}>Upload drawing (JPG/PNG)</span>
                    <label
                      htmlFor="desktop-sketch-upload"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 14px',
                        borderRadius: 8,
                        border: '1.5px dashed var(--border2)',
                        cursor: 'pointer',
                        background: 'var(--bg3)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text2)',
                        transition: 'border-color 0.15s'
                      }}
                    >
                      <i className="ti ti-photo-up" style={{ fontSize: 16, color: 'var(--accent)' }} />
                      {imageSettings.url ? 'Replace image' : 'Choose file…'}
                    </label>
                    <input
                      id="desktop-sketch-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleBackdropFile}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Gesture instructions */}
                  {imageSettings.url ? (
                    <div style={{
                      background: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      fontSize: 11,
                      color: 'var(--text2)'
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>
                        Direct Controls
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="ti ti-hand-move" style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }} />
                        <span>Drag image to reposition</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="ti ti-mouse" style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }} />
                        <span>Scroll wheel to zoom in/out</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="ti ti-rotate-clockwise" style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }} />
                        <span>Drag ↺ corner handle to rotate</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="ti ti-eye" style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }} />
                        <span>Eye icon (on canvas) to cycle opacity</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(124,111,247,0.06)',
                      border: '1px dashed rgba(124,111,247,0.3)',
                      borderRadius: 8,
                      padding: '14px 12px',
                      fontSize: 11,
                      color: 'var(--text3)',
                      lineHeight: 1.5
                    }}>
                      Upload a floor plan to calibrate it as a backdrop behind your Vastu canvas. Drag, zoom, and rotate directly on the image.
                    </div>
                  )}

                  {/* AI Auto-Trace CTA */}
                  <button
                    className="btn btn-primary"
                    onClick={handleAutoTrace}
                    style={{
                      background: 'linear-gradient(135deg, var(--gold), var(--accent))',
                      border: 'none',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      gap: '8px',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(124, 111, 247, 0.3)'
                    }}
                  >
                    <i className="ti ti-wand" style={{ fontSize: '16px' }} /> AI Auto-Trace Plan
                  </button>
                </div>

                {/* ── Center canvas with gesture overlay ─────────────────── */}
                <div className="canvas-area">
                  <div className="canvas-toolbar">
                    <span className="canvas-toolbar-label">Calibrate backdrop sketch layer</span>
                    {imageSettings.url && (
                      <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>
                        Scale {imageSettings.scale.toFixed(2)}× · {Math.round(imageSettings.rotation)}°
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 40px)', minHeight: '380px' }}>
                    <GestureCanvas />
                  </div>
                </div>

                {/* ── Right PlotConfig panel — unchanged ─────────────────── */}
                <PlotConfig plot={plot} onChange={setPlot} />
              </>
            )
          })()}

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

          {/* Dedicated Vastu Analysis Audit Screen */}
          {activeTab === 'analysis' && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <AnalysisPanel 
                rooms={rooms} 
                plot={plot} 
                onSwitchTab={setActiveTab}
                onSelectShopItem={setSelectedIssueRoom}
                isFullPage={true}
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

          {/* Collaborate Tab */}
          {activeTab === 'collaborate' && (
            <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '24px', overflowY: 'auto', textAlign: 'left', flexWrap: 'wrap' }}>
              
              {/* Left Column: Members & Task Checklist */}
              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Member List */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Project Members ({members.length})</span>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowShareModal(true)}>
                      <i className="ti ti-user-plus"></i> Invite
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {members.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                            {m.avatar}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.name}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{m.email}</span>
                          </div>
                        </div>

                        <select 
                          className="btn btn-sm" 
                          style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--border2)' }}
                          value={m.role}
                          onChange={(e) => useUiStore.getState().updateMemberRole(m.id, e.target.value)}
                        >
                          <option value="Owner">👑 Owner</option>
                          <option value="Editor">✏️ Editor</option>
                          <option value="Viewer">👁️ Viewer</option>
                          <option value="Family">👪 Family</option>
                          <option value="Consultant">🧭 Consultant</option>
                          <option value="Staff">🛠️ Staff</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Checklist */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Verification Checklist</span>
                    <button 
                      className="btn btn-sm" 
                      onClick={() => {
                        const txt = prompt('Enter new task detail:')
                        if (txt) {
                          useUiStore.getState().addTask({ id: Date.now().toString(), text: txt, completed: false })
                        }
                      }}
                    >
                      + Add Task
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tasks.map(t => (
                      <label 
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'var(--bg3)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border2)',
                          cursor: 'pointer',
                          textDecoration: t.completed ? 'line-through' : 'none',
                          opacity: t.completed ? 0.6 : 1
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '12.5px' }}>{t.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Local Comments Panel & Version Placeholder */}
              <div style={{ flex: 1.2, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Local Comments Panel */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Local Comments Panel</span>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      const txt = e.target.elements['cmt-text'].value
                      const tgt = e.target.elements['cmt-target'].value
                      if (!txt.trim()) return

                      useUiStore.getState().addComment({
                        id: Date.now().toString(),
                        target: tgt,
                        author: 'Amit Gupta',
                        text: txt,
                        time: 'Just now'
                      })
                      e.target.elements['cmt-text'].value = ''
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select name="cmt-target" className="btn btn-sm" style={{ flex: 1, padding: '6px' }}>
                        <option value="General Project">General Project</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.label}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <textarea 
                      name="cmt-text"
                      className="chat-input"
                      style={{ width: '100%', minHeight: '60px', padding: '8px', fontSize: '12px', resize: 'none' }}
                      placeholder="Type a comment or query..."
                      required
                    />
                    <button type="submit" className="btn btn-sm btn-primary" style={{ alignSelf: 'flex-end', padding: '6px 16px' }}>Post Comment</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                    {comments.map(c => (
                      <div key={c.id} style={{ background: 'var(--bg3)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>{c.author}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text3)' }}>{c.time}</span>
                        </div>
                        <span style={{ fontSize: '10px', background: 'var(--bg4)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', color: 'var(--gold)', fontWeight: 600 }}>@ {c.target}</span>
                        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.3 }}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloud Sync & Versioning info panel */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Cloud Sync Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="ti ti-cloud-off" style={{ fontSize: '24px', color: 'var(--gold)' }}></i>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Local Sandbox Mode</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text2)' }}>Layout auto-saving locally. Future cloud versioning pending.</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Revision: v1.0.3-local</span>
                    <span>Last Saved: Just now</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Asset Library Tab */}
          {activeTab === 'assets' && (
            <AssetGallery />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ flex: 1, padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxWidth: '480px', margin: '0 auto', width: '100%', paddingBottom: '100px' }}>
              <div style={{ background: 'var(--bg2)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  AM
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>Amit Gupta</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text2)' }}>📍 Dwarka Sector 15, New Delhi</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Member since June 2026</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Your Analytics Overview</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'var(--bg3)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', display: 'block' }}>82%</span>
                    <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginTop: '4px' }}>Vastu Score</span>
                  </div>
                  <div style={{ background: 'var(--bg3)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', display: 'block' }}>3</span>
                    <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginTop: '4px' }}>Saved Blueprint Layouts</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Account Settings</span>
                <button className="btn" style={{ width: '100%', padding: '12px', borderRadius: '14px', justifyContent: 'flex-start' }} onClick={() => useUiStore.getState().setScreenState('dashboard')}>
                  <i className="ti ti-folders" style={{ fontSize: '16px', marginRight: '6px' }}></i> Exit to Project Manager
                </button>
                <button className="btn" style={{ width: '100%', padding: '12px', borderRadius: '14px', justifyContent: 'flex-start' }} onClick={() => useUiStore.getState().toggleTheme()}>
                  <i className="ti ti-adjustments-horizontal" style={{ fontSize: '16px', marginRight: '6px' }}></i> Switch Light/Dark Mode
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Share Project Dialog Overlay */}
        {showShareModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowShareModal(false)}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 'bold', margin: 0 }}>Share Project</h3>
                <i className="ti ti-x" style={{ fontSize: '20px', cursor: 'pointer', color: 'var(--text3)' }} onClick={() => setShowShareModal(false)}></i>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Invite by Email or Phone number</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="chat-input" placeholder="e.g. neha@gupta.com" style={{ flex: 1, padding: '8px' }} id="invite-input" />
                  <button className="btn btn-primary" onClick={() => {
                    const el = document.getElementById('invite-input')
                    if (el && el.value.trim()) {
                      useUiStore.getState().addMember({
                        id: Date.now().toString(),
                        name: el.value.split('@')[0],
                        email: el.value,
                        role: 'Editor',
                        avatar: el.value[0].toUpperCase()
                      })
                      useUiStore.getState().addNotification({
                        id: Date.now().toString(),
                        text: `Invited ${el.value} to project`,
                        time: 'Just now',
                        type: 'share'
                      })
                      el.value = ''
                      alert('Invite sent successfully! Member added to local registry.')
                    }
                  }}>Invite</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Shareable layout link</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="chat-input" value="https://vastugriha.banjarabazaaros.com/share/prj-gupta-392a" readOnly style={{ flex: 1, padding: '8px', fontSize: '11.5px', background: 'var(--bg3)', color: 'var(--text2)' }} />
                  <button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText('https://vastugriha.banjarabazaaros.com/share/prj-gupta-392a'); alert('Copied share link to clipboard!'); }}>Copy</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Scan QR to view layout on mobile</span>
                <div style={{ width: '100px', height: '100px', background: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 10 10" style={{ width: '100%', height: '100%' }}>
                    <rect x="0" y="0" width="3" height="3" fill="#000" />
                    <rect x="7" y="0" width="3" height="3" fill="#000" />
                    <rect x="0" y="7" width="3" height="3" fill="#000" />
                    <rect x="4" y="4" width="2" height="2" fill="#000" />
                    <rect x="2" y="4" width="1" height="2" fill="#000" />
                    <rect x="7" y="5" width="2" height="1" fill="#000" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Add Room Popup */}
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
                    <div className="element-tile-icon-box tile-room"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Living Rooms */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Living Spaces</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.living.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Utility Rooms */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Utility & Kitchen</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.utility.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-room"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Vedic & Heavy */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Temple & Heavy structures</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.vedic_heavy.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-utility"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Outdoors */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Outdoors & Power</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.outdoor_power.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-outdoor"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Water & Drain */}
              <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 600, color: 'var(--text3)', marginBottom: '8px', textAlign: 'left', fontFamily: 'var(--fm)' }}>Water & Septic Drainage</div>
              <div className="element-grid-container">
                {EXPANDED_ROOMS_CATALOG.water_drain.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                  <div key={r.label} className="element-tile-card" onClick={() => handleAddRoom(r)}>
                    <div className="element-tile-icon-box tile-utility"><i className={r.icon}></i></div>
                    <span className="element-tile-label">{r.label}</span>
                  </div>
                ))}
              </div>

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
        {isMobile && (
          <div className="bottom-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div 
              className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <i className="ti ti-home-2"></i>
              <span>Workspace</span>
            </div>
            <div 
              className={`bottom-nav-item ${activeTab === 'designer' ? 'active' : ''}`}
              onClick={() => setActiveTab('designer')}
            >
              <i className="ti ti-layout-grid"></i>
              <span>Design</span>
            </div>
            
            <button 
              className="bottom-nav-fab-btn" 
              onClick={() => setScreenState('step_prop')}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                boxShadow: '0 4px 10px rgba(95, 85, 229, 0.4)',
                marginTop: '-16px',
                cursor: 'pointer',
                zIndex: 110,
                padding: 0
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: '20px' }}></i>
            </button>

            <div 
              className={`bottom-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => { setActiveTab('shop'); setSelectedIssueRoom(null); }}
            >
              <i className="ti ti-shopping-cart"></i>
              <span>Shop</span>
            </div>
            <div 
              className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="ti ti-user"></i>
              <span>Profile</span>
            </div>
          </div>
        )}

        {/* Global Acharya Chat Dialog Popup Modal */}
        {showAcharyaModal && (
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(0,0,0,0.6)', 
              zIndex: 900, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowAcharyaModal(false)}
          >
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '480px', 
                height: '80vh', 
                background: 'var(--bg)', 
                borderRadius: '16px', 
                border: '1px solid var(--border)', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: 'var(--bg2)', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg viewBox="0 0 40 40" width="30" height="30">
                    <circle cx="20" cy="20" r="18" fill="var(--gold-dim)" />
                    <circle cx="20" cy="15" r="5" fill="var(--gold)" />
                    <path d="M12,32 Q20,20 28,32" fill="none" stroke="var(--gold)" strokeWidth="2" />
                  </svg>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Ask Vastu Acharya</h4>
                    <span style={{ fontSize: '10px', color: 'var(--text2)' }}>AI Vedic layout consultant</span>
                  </div>
                </div>
                <i className="ti ti-x" style={{ fontSize: '20px', cursor: 'pointer' }} onClick={() => setShowAcharyaModal(false)}></i>
              </div>

              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <AiChat 
                  rooms={rooms} 
                  plot={plot} 
                  currentStep="chat"
                  onSwitchTab={(tab) => { setShowAcharyaModal(false); setActiveTab(tab); }} 
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
