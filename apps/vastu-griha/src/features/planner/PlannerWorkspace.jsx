import React from 'react'
import Canvas from '../../components/Canvas'
import Compass from '../../components/Compass'
import PlotBoundaryDrawer from '../../components/PlotBoundaryDrawer'
import AnalysisPanel from '../../components/AnalysisPanel'
import BanjaraBazaarShop from '../../components/BanjaraBazaarShop'
import ReportGenerator from '../../components/ReportGenerator'
import AiChat from '../../components/AiChat'
import PlotConfig from '../../components/PlotConfig'
import { EXPANDED_ROOMS_CATALOG } from '../../assets/constants'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'

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
    traceStatus
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
    const url = URL.createObjectURL(file)
    setImageSettings({ ...imageSettings, url })
  }

  if (screenState === 'welcome') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
        
        {/* Header */}
        <header id="topbar" style={{ flexShrink: 0, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <i className="ti ti-menu-2" style={{ fontSize: '22px', cursor: 'pointer', color: 'var(--text)' }}></i>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <img src="/logo.svg" style={{ width: '28px', height: '28px' }} alt="Logo" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--fd)', fontSize: '16px', fontWeight: 700, lineHeight: 1.1 }}>Vastu Griha</span>
                <span style={{ fontSize: '9px', color: 'var(--text2)' }}>AI + Vastu. Perfect Harmony.</span>
              </div>
            </div>
          </div>
          
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <i className="ti ti-bell" style={{ fontSize: '20px', color: 'var(--text)' }}></i>
              <div style={{ position: 'absolute', top: '2px', right: '2px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--accent)' }}>
                AM
              </div>
              <i className="ti ti-chevron-down" style={{ fontSize: '12px', color: 'var(--text3)' }}></i>
            </div>
          </div>
        </header>

        {/* Dashboard Content Workspace */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto', width: '100%', paddingBottom: '100px' }}>
          
          {/* Welcome Banner Card */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, rgba(124,111,247,0.06), rgba(124,111,247,0.12))', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '16px',
              textAlign: 'left'
            }}
          >
            <div style={{ flex: 1.2 }}>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>Welcome back, Amit! 👋</span>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 700, marginTop: '6px', lineHeight: 1.2 }}>
                Let's design your dream home <span style={{ color: 'var(--accent)' }}>with Vastu Guidance</span>
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', lineHeight: 1.4 }}>
                Create a happy, healthy and prosperous home for you and your family.
              </p>
            </div>
            
            <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 260 180" style={{ width: '100%', height: 'auto', maxWidth: '140px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))' }}>
                <circle cx="180" cy="80" r="28" fill="#fdba74" opacity="0.6" />
                <path d="M-20,180 L40,110 L100,180 Z" fill="#fca5a5" opacity="0.4" />
                <path d="M60,180 L140,90 L220,180 Z" fill="#fca5a5" opacity="0.3" />
                
                <rect x="30" y="90" width="160" height="65" fill="#ffffff" rx="3" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="70" y="45" width="100" height="50" fill="#f8fafc" rx="3" stroke="#e2e8f0" strokeWidth="1" />
                <rect x="20" y="87" width="180" height="5" fill="#475569" rx="1" />
                <rect x="60" y="42" width="120" height="5" fill="#475569" rx="1" />
                <rect x="110" y="50" width="50" height="40" fill="#b45309" opacity="0.75" />
                <rect x="40" y="100" width="10" height="50" fill="#78350f" />
                
                <rect x="50" y="102" width="50" height="48" fill="#bae6fd" opacity="0.4" stroke="#475569" strokeWidth="1" />
                <rect x="78" y="52" width="28" height="36" fill="#bae6fd" opacity="0.4" stroke="#475569" strokeWidth="1" />
                <rect x="116" y="52" width="38" height="36" fill="#bae6fd" opacity="0.4" stroke="#475569" strokeWidth="1" />
                
                <rect x="120" y="102" width="30" height="53" fill="#451a03" />
                <circle cx="142" cy="128" r="1.5" fill="#eab308" />

                <rect x="190" y="110" width="60" height="45" fill="none" stroke="#64748b" strokeWidth="2" />
                <line x1="205" y1="110" x2="205" y2="155" stroke="#64748b" strokeWidth="1.5" />
                <line x1="220" y1="110" x2="220" y2="155" stroke="#64748b" strokeWidth="1.5" />
                <line x1="235" y1="110" x2="235" y2="155" stroke="#64748b" strokeWidth="1.5" />

                <path d="M215,155 Q230,95 240,40" stroke="#78350f" strokeWidth="4.5" fill="none" />
                <path d="M240,40 Q210,25 185,35" stroke="#16a34a" strokeWidth="3" fill="none" />
                <path d="M240,40 Q255,10 270,25" stroke="#16a34a" strokeWidth="3" fill="none" />
                
                <rect x="0" y="152" width="260" height="28" fill="#22c55e" opacity="0.25" />
                <rect x="0" y="155" width="260" height="25" fill="#166534" />
              </svg>
            </div>
          </div>

          {/* Option Core Actions Grid */}
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 'bold', display: 'block', margin: 0 }}>How would you like to start today?</span>
            <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginTop: '2px', marginBottom: '14px' }}>Choose the best option that suits your needs</span>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              <div 
                onClick={() => { setScreenState('workspace'); setActiveTab('upload'); }}
                style={{ background: 'rgba(124, 111, 247, 0.04)', border: '1.5px solid rgba(124, 111, 247, 0.15)', borderRadius: '16px', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <svg viewBox="0 0 100 100" width="72" height="72" style={{ marginBottom: '8px' }}>
                  <rect x="25" y="15" width="46" height="60" rx="6" fill="#fff" stroke="#8b5cf6" strokeWidth="2.5" />
                  <line x1="35" y1="30" x2="61" y2="30" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="35" y1="42" x2="61" y2="42" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="35" y1="54" x2="50" y2="54" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="68" cy="65" r="14" fill="#8b5cf6" />
                  <path d="M68,73 V57 M61,64 L68,57 L75,64" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e1b4b', marginTop: '4px' }}>Upload Existing Floor Plan</span>
                <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', height: '28px', lineHeight: 1.2 }}>Upload PDF, JPG or PNG of your floor plan</span>
                <div style={{ marginTop: '14px', width: '28px', height: '28px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)' }}>
                  <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
                </div>
              </div>

              <div 
                onClick={() => setScreenState('step_shape')}
                style={{ background: 'rgba(34, 197, 94, 0.04)', border: '1.5px solid rgba(34, 197, 94, 0.15)', borderRadius: '16px', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <svg viewBox="0 0 100 100" width="72" height="72" style={{ marginBottom: '8px' }}>
                  <polygon points="35,25 75,28 65,72 25,65" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" />
                  <polygon points="35,25 75,28 65,72 25,65" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                  <circle cx="35" cy="25" r="5" fill="#15803d" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="75" cy="28" r="5" fill="#15803d" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="65" cy="72" r="5" fill="#15803d" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="25" cy="65" r="5" fill="#15803d" stroke="#fff" strokeWidth="1.5" />
                  <path d="M15,35 Q18,30 22,38 Q25,32 18,42" fill="#22c55e" opacity="0.8" />
                  <path d="M80,60 Q85,55 88,64 Q92,58 84,70" fill="#22c55e" opacity="0.8" />
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#064e3b', marginTop: '4px' }}>Draw New Plot</span>
                <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', height: '28px', lineHeight: 1.2 }}>Start with plot size and create your plan</span>
                <div style={{ marginTop: '14px', width: '28px', height: '28px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)' }}>
                  <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
                </div>
              </div>

              <div 
                onClick={() => setScreenState('step_prop')}
                style={{ background: 'rgba(249, 115, 22, 0.04)', border: '1.5px solid rgba(249, 115, 22, 0.15)', borderRadius: '16px', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <svg viewBox="0 0 100 100" width="72" height="72" style={{ marginBottom: '8px' }}>
                  <line x1="50" y1="28" x2="50" y2="16" stroke="#f97316" strokeWidth="3" />
                  <circle cx="50" cy="14" r="4.5" fill="#f97316" />
                  <rect x="18" y="42" width="6" height="16" rx="3" fill="#ea580c" />
                  <rect x="76" y="42" width="6" height="16" rx="3" fill="#ea580c" />
                  <rect x="22" y="26" width="56" height="48" rx="20" fill="#fff" stroke="#f97316" strokeWidth="3" />
                  <rect x="30" y="34" width="40" height="32" rx="14" fill="#1e1b4b" />
                  <circle cx="42" cy="50" r="5" fill="#a7f3d0" />
                  <circle cx="58" cy="50" r="5" fill="#a7f3d0" />
                  <path d="M 46 58 Q 50 61 54 58" stroke="#a7f3d0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M78,16 L80,22 L86,24 L80,26 L78,32 L76,26 L70,24 L76,22 Z" fill="#fbbf24" />
                  <path d="M86,34 L87,37 L90,38 L87,39 L86,42 L85,39 L82,38 L85,37 Z" fill="#fbbf24" />
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#7c2d12', marginTop: '4px' }}>AI Design My Home</span>
                <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', height: '28px', lineHeight: 1.2 }}>Answer a few questions and let AI design</span>
                <div style={{ marginTop: '14px', width: '28px', height: '28px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(249, 115, 22, 0.3)' }}>
                  <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
                </div>
              </div>

              <div 
                onClick={() => { setScreenState('workspace'); setActiveTab('analysis'); }}
                style={{ background: 'rgba(59, 130, 246, 0.04)', border: '1.5px solid rgba(59, 130, 246, 0.15)', borderRadius: '16px', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <svg viewBox="0 0 100 100" width="72" height="72" style={{ marginBottom: '8px' }}>
                  <circle cx="46" cy="44" r="24" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="63" y1="61" x2="82" y2="80" stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" />
                  <rect x="36" y="44" width="20" height="16" fill="none" stroke="#d97706" strokeWidth="2" />
                  <polygon points="32,44 46,32 60,44" fill="none" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
                  <rect x="43" y="50" width="6" height="10" fill="#d97706" />
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#172554', marginTop: '4px' }}>Check My Home (Vastu Audit)</span>
                <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', height: '28px', lineHeight: 1.2 }}>Get instant Vastu analysis of your home</span>
                <div style={{ marginTop: '14px', width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)' }}>
                  <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Your Home recent list */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 'bold' }}>Continue Your Home</span>
              <span style={{ fontSize: '11.5px', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>View All Projects <i className="ti ti-chevron-right" style={{ fontSize: '10px' }}></i></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '56px', height: '46px', background: 'var(--bg3)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', padding: '4px' }}>
                    <svg viewBox="0 0 30 20" style={{ width: '100%', height: '100%' }}>
                      <rect x="2" y="2" width="26" height="16" fill="none" stroke="var(--border2)" strokeWidth="1" />
                      <line x1="10" y1="2" x2="10" y2="18" stroke="var(--border2)" strokeWidth="0.8" />
                      <line x1="20" y1="2" x2="20" y2="18" stroke="var(--border2)" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Gupta House <i className="ti ti-edit-2" style={{ fontSize: '10px', color: 'var(--text3)' }}></i></span>
                    <span style={{ fontSize: '10px', color: 'var(--text2)' }}>30' x 40' • East Facing</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <div style={{ width: '60px', height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '68%', height: '100%', background: 'var(--accent)' }}></div>
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--text3)' }}>68% Complete</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text3)' }}>Today, 10:30 AM</span>
                  <button className="btn btn-sm btn-primary" style={{ padding: '4px 12px', fontSize: '11px', borderRadius: '16px' }} onClick={() => handleContinueProject('gupta')}>
                    Continue <i className="ti ti-arrow-right" style={{ fontSize: '9px', marginLeft: '4px' }}></i>
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '56px', height: '46px', background: 'var(--bg3)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', padding: '4px' }}>
                    <svg viewBox="0 0 30 20" style={{ width: '100%', height: '100%' }}>
                      <rect x="2" y="2" width="26" height="16" fill="none" stroke="var(--border2)" strokeWidth="1" />
                      <line x1="15" y1="2" x2="15" y2="18" stroke="var(--border2)" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Sharma Villa <i className="ti ti-edit-2" style={{ fontSize: '10px', color: 'var(--text3)' }}></i></span>
                    <span style={{ fontSize: '10px', color: 'var(--text2)' }}>60' x 90' • North Facing</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <div style={{ width: '60px', height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '42%', height: '100%', background: 'var(--accent)' }}></div>
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--text3)' }}>42% Complete</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text3)' }}>Yesterday, 7:45 PM</span>
                  <button className="btn btn-sm btn-primary" style={{ padding: '4px 12px', fontSize: '11px', borderRadius: '16px' }} onClick={() => handleContinueProject('sharma')}>
                    Continue <i className="ti ti-arrow-right" style={{ fontSize: '9px', marginLeft: '4px' }}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Acharya pill button */}
        <button 
          onClick={() => setShowAcharyaModal(true)}
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '16px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: '24px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(124, 111, 247, 0.45)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 110
          }}
        >
          <svg viewBox="0 0 40 40" width="22" height="22" style={{ flexShrink: 0 }}>
            <circle cx="20" cy="20" r="18" fill="var(--gold)" />
            <path d="M12,32 Q20,20 28,32" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="20" cy="15" r="5" fill="#fff" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Ask Acharya</span>
        </button>

        {/* Bottom Navigation */}
        {isMobile && (
          <div className="bottom-nav" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div className="bottom-nav-item active" onClick={() => setScreenState('welcome')}>
              <i className="ti ti-home-2"></i>
              <span>Home</span>
            </div>
            <div className="bottom-nav-item" onClick={() => { setScreenState('workspace'); setActiveTab('designer'); }}>
              <i className="ti ti-layout-grid"></i>
              <span>Design</span>
            </div>
            <button className="bottom-nav-fab-btn" onClick={() => { setScreenState('workspace'); setShowAddPopup(true); }} style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifycontent: 'center', border: 'none', boxShadow: '0 4px 10px rgba(124, 111, 247, 0.4)', marginTop: '-16px', cursor: 'pointer', zIndex: 110, padding: 0 }}>
              <i className="ti ti-plus" style={{ fontSize: '20px' }}></i>
            </button>
            <div className="bottom-nav-item" onClick={() => { setScreenState('workspace'); setActiveTab('reports'); }}>
              <i className="ti ti-file-text"></i>
              <span>Reports</span>
            </div>
            <div className="bottom-nav-item" onClick={() => { setScreenState('workspace'); setActiveTab('shop'); }}>
              <i className="ti ti-shopping-cart"></i>
              <span>Remedies</span>
            </div>
          </div>
        )}

      </div>
    )
  }

  // Workspace View
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
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <i className="ti ti-home-2"></i> Dashboard Home
          </div>
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
          <button className="btn btn-sm" onClick={() => setScreenState('step_prop')}><i className="ti ti-rotate"></i> Reset</button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main">
        <header id="topbar">
          <div className="topbar-left">
            <span className="page-title">
              {activeTab === 'home' && 'Vastu Home Dashboard'}
              {activeTab === 'designer' && 'Plan Editor (Easy Mode)'}
              {activeTab === 'upload' && 'Align Custom Sketch'}
              {activeTab === 'chat' && 'Vastu Acharya Consultant'}
              {activeTab === 'analysis' && 'Vastu Compliance Audit'}
              {activeTab === 'shop' && 'Vastu Remedies Shop'}
              {activeTab === 'reports' && 'Vastu Health Report'}
            </span>
            <span className="page-subtitle">
              {activeTab === 'home' && 'Summary of home blueprint, energy health scores, and quick actions'}
              {activeTab === 'designer' && 'Tap elements to place, and use nudge buttons to align'}
              {activeTab === 'upload' && 'Place existing plans behind grid lines and adjust alignment'}
              {activeTab === 'chat' && 'Query paint colors, entrances, or element balance suggestions'}
              {activeTab === 'analysis' && 'Detailed sector evaluations and graded remedies'}
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
          
          {/* 1. Dedicated Home Dashboard Screen */}
          {activeTab === 'home' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px', width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'left', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Active Project Parameters</span>
                <h3 style={{ fontFamily: 'var(--fd)', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>My Vastu Dream House</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="badge" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>🏡 {onboarding.propertyType}</span>
                  <span className="badge" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>🧭 {plot.width} x {plot.length} ft</span>
                  <span className="badge" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>☀️ {onboarding.facing}</span>
                  <span className="badge" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>👥 {onboarding.membersCount} Occupants</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '5px solid var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'var(--emerald)', boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)' }}>
                  92%
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Vastu Score rating</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--emerald)' }}>Excellent Energy Alignment</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text2)' }}>Your room configuration matches traditional Vedic layout flows.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px', background: 'var(--emerald-dim)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: '24px', color: 'var(--emerald)' }}></i>
                  <h4 style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0', color: 'var(--emerald)' }}>5 Zones</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text2)' }}>Perfect Vastu Alignments</span>
                </div>
                <div style={{ flex: 1, minWidth: '140px', background: 'var(--gold-dim)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <i className="ti ti-alert-triangle" style={{ fontSize: '24px', color: 'var(--gold)' }}></i>
                  <h4 style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0', color: 'var(--gold)' }}>1 Zone</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text2)' }}>Remediable Friction Points</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Quick Actions</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div onClick={() => setActiveTab('designer')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                    <i className="ti ti-layout-grid" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>Edit Blueprint</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Place and align custom rooms</span>
                  </div>

                  <div onClick={() => setShowAcharyaModal(true)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                    <i className="ti ti-message-chatbot" style={{ fontSize: '20px', color: 'var(--gold)' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>Consult AI Acharya</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Ask room advice and colors</span>
                  </div>

                  <div onClick={() => setActiveTab('shop')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                    <i className="ti ti-shopping-cart" style={{ fontSize: '20px', color: 'var(--emerald)' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>Shop Remedies</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Procure Vedic correction helixes</span>
                  </div>

                  <div onClick={() => setActiveTab('reports')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                    <i className="ti ti-file-text" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>Print Vastu Report</span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Download detailed layouts PDF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`btn btn-sm ${showNormalGrid ? 'btn-primary' : ''}`} onClick={() => setShowNormalGrid(!showNormalGrid)}>
                      Grid Pattern
                    </button>
                    <button className={`btn btn-sm ${showVastuGrid ? 'btn-primary' : ''}`} onClick={() => setShowVastuGrid(!showVastuGrid)}>
                      Vastu Grid
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm" onClick={undoLayout} title="Undo last action">
                      <i className="ti ti-arrow-back-up" style={{ fontSize: '14px', marginRight: '4px' }}></i> Undo
                    </button>
                    <button className="btn btn-sm" onClick={redoLayout} title="Redo action">
                      <i className="ti ti-arrow-forward-up" style={{ fontSize: '14px', marginRight: '4px' }}></i> Redo
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleClearCanvas}>
                      <i className="ti ti-trash"></i> Clear
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

          {/* Floorplan Calibration Screen */}
          {activeTab === 'upload' && (
            <>
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
                    onChange={(e) => setImageSettings({ ...imageSettings, opacity: parseFloat(e.target.value) })} 
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Scale: {imageSettings.scale}</span>
                  <input 
                    type="range" min="0.5" max="2.5" step="0.05" style={{ width: '100%' }}
                    value={imageSettings.scale} 
                    onChange={(e) => setImageSettings({ ...imageSettings, scale: parseFloat(e.target.value) })} 
                  />
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>Rotation: {imageSettings.rotation}°</span>
                  <input 
                    type="range" min="-180" max="180" step="5" style={{ width: '100%' }}
                    value={imageSettings.rotation} 
                    onChange={(e) => setImageSettings({ ...imageSettings, rotation: parseInt(e.target.value) })} 
                  />
                </div>

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
                    marginTop: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(124, 111, 247, 0.3)'
                  }}
                >
                  <i className="ti ti-wand" style={{ fontSize: '16px' }}></i> 🪄 AI Auto-Trace Plan
                </button>
              </div>

              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <span className="canvas-toolbar-label">Calibrate backdrop sketch layer</span>
                </div>
                <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 40px)', minHeight: '380px' }}>
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
                  {isTracing && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(28, 29, 32, 0.85)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
                      <div className="ai-scanner-line" style={{ width: '100%', height: '4px', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', position: 'absolute', animation: 'scanLoop 2s ease-in-out infinite' }}></div>
                      <i className="ti ti-wand" style={{ fontSize: '40px', color: 'var(--gold)', animation: 'pulse 1.5s infinite', marginBottom: '14px' }}></i>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{traceStatus}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>AI vision digitizing room labels...</span>
                    </div>
                  )}
                </div>
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

        </div>

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
              <span>Home</span>
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
              onClick={() => setShowAddPopup(true)}
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
                boxShadow: '0 4px 10px rgba(124, 111, 247, 0.4)',
                marginTop: '-16px',
                cursor: 'pointer',
                zIndex: 110,
                padding: 0
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: '20px' }}></i>
            </button>

            <div 
              className={`bottom-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="ti ti-file-text"></i>
              <span>Reports</span>
            </div>
            <div 
              className={`bottom-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
              onClick={() => { setActiveTab('shop'); setSelectedIssueRoom(null); }}
            >
              <i className="ti ti-shopping-cart"></i>
              <span>Remedies</span>
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
