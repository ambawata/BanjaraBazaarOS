import React, { useState, useMemo, useEffect } from 'react'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useUiStore } from '../stores/uiStore'
import AssetLoader from '../lib/AssetLoader'

// 12 Onboarding & Editor screens
// 1. 'dashboard' (Home Dashboard)
// 2. 'upload' (Upload Floor Plan)
// 3. 'ai_detecting' (AI Detecting Rooms)
// 4. 'set_north' (Set North Direction)
// 5. 'editor' (My Home Plan Canvas)
// 9. 'ai_preview' (AI Preview 2D/3D mockup screen)
// 10. 'vastu_analysis' (Vastu Analysis dashboard)
// 11. 'save_project' (Save Project screen)
// 12. 'projects' (My Projects listing)

// Furniture category listings
const FURNITURE_ITEMS = [
  { id: 'furniture-sofa', name: 'Premium Sofa', category: 'furniture', size: '7\'0" x 3\'2"', w: 22, h: 10 },
  { id: 'furniture-armchair', name: 'L-Shape Sofa', category: 'furniture', size: '7\'0" x 5\'0"', w: 22, h: 16 },
  { id: 'furniture-bench', name: 'Single Sofa', category: 'furniture', size: '3\'0" x 3\'0"', w: 10, h: 10 },
  { id: 'furniture-dining-chair', name: 'Wooden Chair', category: 'furniture', size: '2\'0" x 2\'0"', w: 8, h: 8 },
  { id: 'furniture-coffee-table', name: 'Coffee Table', category: 'furniture', size: '4\'0" x 2\'2"', w: 14, h: 8 },
  { id: 'furniture-dining-table', name: 'Dining Table', category: 'furniture', size: '6\'0" x 3\'6"', w: 18, h: 11 }
]

// Mock project listings
const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'My Dream Home',
    desc: '2BHK East Facing House Plan',
    modified: 'Modified 2 mins ago',
    score: 82,
    rooms: [
      { id: 'r-1', type: 'kitchen', label: 'Kitchen', x: 65, y: 65, width: 30, height: 30 },
      { id: 'r-2', type: 'pooja', label: 'Pooja Room', x: 70, y: 5, width: 25, height: 25 },
      { id: 'r-3', type: 'bedroom', label: 'Bedroom 1', x: 5, y: 65, width: 35, height: 30 },
      { id: 'r-4', type: 'furniture-sofa', label: 'Premium Sofa', x: 45, y: 35, width: 22, height: 10 },
      { id: 'r-5', type: 'decor-mirror', label: 'Sacred Mirror', x: 5, y: 35, width: 10, height: 10 }
    ]
  },
  {
    id: 'proj-2',
    name: 'Gupta Residence',
    desc: 'Duplex with South Entrance',
    modified: 'Modified 2 days ago',
    score: 75,
    rooms: [
      { id: 'g-1', type: 'bedroom', label: 'Master Bedroom', x: 10, y: 60, width: 40, height: 35 },
      { id: 'g-2', type: 'kitchen', label: 'Kitchen', x: 60, y: 60, width: 35, height: 35 },
      { id: 'g-3', type: 'toilet', label: 'Toilet', x: 60, y: 20, width: 25, height: 25 }
    ]
  },
  {
    id: 'proj-3',
    name: 'Office Layout',
    desc: 'IT Park Sector Floor Plan',
    modified: 'Modified 5 days ago',
    score: 65,
    rooms: [
      { id: 'o-1', type: 'bedroom', label: 'Conference Room', x: 10, y: 10, width: 50, height: 40 },
      { id: 'o-2', type: 'kitchen', label: 'Pantry', x: 70, y: 70, width: 25, height: 25 }
    ]
  },
  {
    id: 'proj-4',
    name: 'Villa Plan',
    desc: 'Farmhouse facing Northeast',
    modified: 'Modified 1 week ago',
    score: 80,
    rooms: [
      { id: 'v-1', type: 'bedroom', label: 'Guest Room', x: 10, y: 10, width: 30, height: 30 }
    ]
  }
]

// Diagnostic evaluator for Vastu room placement
const getVastuRoomAnalysis = (room) => {
  if (!room) return { status: 'Good', score: 75, color: '#4B5E26' }
  const type = (room.type || room.label || '').toLowerCase()
  const label = (room.label || room.type || '').toLowerCase()
  const rx = room.x + room.width / 2
  const ry = room.y + room.height / 2

  let zone = ''
  if (rx < 33) {
    if (ry < 33) zone = 'NW'
    else if (ry < 66) zone = 'W'
    else zone = 'SW'
  } else if (rx < 66) {
    if (ry < 33) zone = 'N'
    else if (ry < 66) zone = 'C'
    else zone = 'S'
  } else {
    if (ry < 33) zone = 'NE'
    else if (ry < 66) zone = 'E'
    else zone = 'SE'
  }

  // Graded rules
  if (type.includes('kitchen')) {
    if (zone === 'SE') return { status: 'Excellent', score: 90, color: '#2e7d32' }
    if (zone === 'NW') return { status: 'Good', score: 75, color: '#4B5E26' }
    return { status: 'Average', score: 55, color: '#b78103' }
  }
  if (type.includes('bedroom')) {
    if (zone === 'SW' || zone === 'W') return { status: 'Excellent', score: 90, color: '#2e7d32' }
    if (zone === 'NW' || zone === 'S') return { status: 'Good', score: 75, color: '#4B5E26' }
    return { status: 'Avoid', score: 40, color: '#c62828' }
  }
  if (type.includes('pooja') || label.includes('pooja') || label.includes('temple')) {
    if (zone === 'NE') return { status: 'Excellent', score: 95, color: '#2e7d32' }
    if (zone === 'E' || zone === 'N') return { status: 'Good', score: 80, color: '#4B5E26' }
    return { status: 'Avoid', score: 30, color: '#c62828' }
  }
  if (type.includes('toilet') || type.includes('bath') || label.includes('toilet') || label.includes('bath')) {
    if (zone === 'NW' || zone === 'W') return { status: 'Good', score: 75, color: '#4B5E26' }
    if (zone === 'NE' || zone === 'C') return { status: 'Avoid', score: 30, color: '#c62828' }
    return { status: 'Average', score: 55, color: '#b78103' }
  }
  if (type.includes('sofa') || type.includes('furniture-sofa')) {
    if (zone === 'SW' || zone === 'W' || zone === 'S') return { status: 'Excellent', score: 90, color: '#2e7d32' }
    return { status: 'Good', score: 75, color: '#4B5E26' }
  }
  if (type.includes('mirror') || type.includes('decor-mirror')) {
    if (zone === 'N' || zone === 'E' || zone === 'NE') return { status: 'Excellent', score: 90, color: '#2e7d32' }
    return { status: 'Avoid', score: 40, color: '#c62828' }
  }

  return { status: 'Good', score: 75, color: '#4B5E26' }
}

export default function MobileAppContainer() {
  const [mobileScreen, setMobileScreen] = useState('dashboard')
  const { rooms, setRooms, addRoom, deleteRoom } = useCanvasStore()
  const { plot, setPlot } = useProjectStore()
  
  // Custom states for wizard simulation & bottom sheets
  const [uploadProgress, setUploadProgress] = useState(0)
  const [detectingStep, setDetectingStep] = useState(0)
  const [rotationAngle, setRotationAngle] = useState(0)
  
  const [projectsList, setProjectsList] = useState(INITIAL_PROJECTS)
  const [projectName, setProjectName] = useState('My Dream Home')
  const [projectDesc, setProjectDesc] = useState('2BHK East Facing House Plan')
  
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  
  // Sheet states
  const [addObjectSheet, setAddObjectSheet] = useState(false)
  const [catalogSheet, setCatalogSheet] = useState(false)
  const [catalogTab, setCatalogTab] = useState('All')
  
  // Custom 2D/3D preview states
  const [previewTab, setPreviewTab] = useState('3D View')
  const [previewDirection, setPreviewDirection] = useState('North')

  // Helper for dynamic preview offsets based on directions
  const previewAssetTranslate = useMemo(() => {
    switch (previewDirection) {
      case 'North': return { x: 120, y: 120, rot: 0 } // placement near North wall
      case 'East': return { x: 280, y: 120, rot: 90 }  // placement near East wall
      case 'South': return { x: 140, y: 180, rot: 180 } // placement near South zone
      case 'West': return { x: 260, y: 180, rot: 270 }  // placement near West zone
      default: return { x: 200, y: 150, rot: 0 }
    }
  }, [previewDirection])

  // Calculate live dynamic Vastu score based on coordinates of placed rooms
  const currentVastuScore = useMemo(() => {
    if (rooms.length === 0) return 82
    let sum = 0
    rooms.forEach(r => {
      sum += getVastuRoomAnalysis(r).score
    })
    const avg = Math.round(sum / rooms.length)
    return Math.max(50, Math.min(99, avg))
  }, [rooms])

  // Get active selected object details
  const selectedObject = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null
  }, [rooms, selectedRoomId])

  // Simulate file upload transition
  const handleUploadSimulate = () => {
    setMobileScreen('ai_detecting')
    setUploadProgress(0)
    setDetectingStep(0)
  }

  // Effect to simulate AI room detection progression
  useEffect(() => {
    if (mobileScreen !== 'ai_detecting') return
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // transition to next screen after completion
          setTimeout(() => {
            setMobileScreen('set_north')
          }, 600)
          return 100
        }
        const nextVal = prev + 10
        if (nextVal > 25) setDetectingStep(1)
        if (nextVal > 55) setDetectingStep(2)
        if (nextVal > 85) setDetectingStep(3)
        return nextVal
      })
    }, 180)

    return () => clearInterval(interval)
  }, [mobileScreen])

  // Compass auto detect simulation
  const handleAutoDetectNorth = () => {
    setRotationAngle(-45)
  }

  // Done rotating, save north orientation and go to editor
  const handleConfirmNorth = () => {
    setPlot({ ...plot, tilt: rotationAngle })
    setMobileScreen('editor')
  }

  // Placing asset on the canvas from bottom sheet
  const handleAddAssetToCanvas = (item) => {
    // Generate standard room template
    const template = {
      type: item.id,
      label: item.name,
      w: item.w,
      h: item.h
    }
    
    // Add to canvas using store action
    addRoom(template)
    setCatalogSheet(false)
    setSelectedRoomId(null)
  }

  // Object Nudge Action
  const handleNudgeObject = (dir) => {
    if (!selectedRoomId) return
    const step = 4
    const nextRooms = rooms.map(r => {
      if (r.id !== selectedRoomId) return r
      let nx = r.x
      let ny = r.y
      if (dir === 'left') nx = Math.max(0, r.x - step)
      if (dir === 'right') nx = Math.min(100 - r.width, r.x + step)
      if (dir === 'up') ny = Math.max(0, r.y - step)
      if (dir === 'down') ny = Math.min(100 - r.height, r.y + step)
      return { ...r, x: nx, y: ny }
    })
    setRooms(nextRooms)
  }

  // Object Rotate (90 degrees toggle width/height)
  const handleRotateObject = () => {
    if (!selectedRoomId) return
    const nextRooms = rooms.map(r => {
      if (r.id !== selectedRoomId) return r
      return { ...r, width: r.height, height: r.width }
    })
    setRooms(nextRooms)
  }

  // Object Scale Adjust
  const handleScaleObject = (factor) => {
    if (!selectedRoomId) return
    const nextRooms = rooms.map(r => {
      if (r.id !== selectedRoomId) return r
      const nw = Math.max(10, Math.min(100 - r.x, r.width + factor * 4))
      const nh = Math.max(10, Math.min(100 - r.y, r.height + factor * 4))
      return { ...r, width: nw, height: nh }
    })
    setRooms(nextRooms)
  }

  // Object Duplicate
  const handleDuplicateObject = () => {
    if (!selectedRoomId) return
    const target = rooms.find(r => r.id === selectedRoomId)
    if (!target) return
    const clone = {
      ...target,
      id: Date.now().toString(),
      x: Math.min(80, target.x + 8),
      y: Math.min(80, target.y + 8)
    }
    setRooms([...rooms, clone])
    setSelectedRoomId(clone.id)
  }

  // Project Database actions
  const handleSaveProject = (e) => {
    e.preventDefault()
    const newProj = {
      id: Date.now().toString(),
      name: projectName,
      desc: projectDesc,
      modified: 'Modified Just now',
      score: currentVastuScore,
      rooms: [...rooms]
    }
    setProjectsList([newProj, ...projectsList.filter(p => p.name !== projectName)])
    setMobileScreen('projects')
  }

  const handleLoadProject = (proj) => {
    setProjectName(proj.name)
    setProjectDesc(proj.desc || '')
    setRooms(proj.rooms)
    setMobileScreen('editor')
    setSelectedRoomId(null)
  }

  return (
    <div 
      className="mobile-redesign-viewport"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1A1D24', // dark backing to highlight the phone frame
        fontFamily: "'Outfit', 'DM Sans', sans-serif"
      }}
    >
      
      {/* PHONE EMULATOR CONTAINER CONTAINER */}
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          maxHeight: '880px',
          background: '#FDFBF7', // Mobile Warm White
          borderRadius: '32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '8px solid #2A2B2F' // sleek matte outer bezels
        }}
      >
        
        {/* MOBILE TOP STATUS BAR */}
        <div 
          style={{
            height: '44px',
            background: '#FDFBF7',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 700,
            color: '#3D2616',
            userSelect: 'none'
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <i className="ti ti-wifi"></i>
            <i className="ti ti-chart-bar"></i>
            <i className="ti ti-battery-4"></i>
          </div>
        </div>

        {/* INTERACTIVE SCREENS ROUTER */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* SCREEN 1: Home Dashboard */}
          {mobileScreen === 'dashboard' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
              
              {/* Profile Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#5F55E5', margin: 0 }}>Vastu Griha</h4>
                  <span style={{ fontSize: '12px', color: '#8A7B6E', fontWeight: 600 }}>by Banjara Bazaar</span>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F5F2EC', border: '2px solid #E4DFD5', color: '#5C4E43', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                  AM
                </div>
              </div>

              {/* Headline */}
              <div style={{ margin: '8px 0' }}>
                <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#8A7B6E' }}>Design</span>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#3D2616', lineHeight: '1.1', marginTop: '4px' }}>
                  Create your Vastu perfect home
                </h1>
                <p style={{ fontSize: '14px', color: '#8A7B6E', marginTop: '8px', lineHeight: 1.4 }}>
                  Upload your plan blueprint or start drawing coordinates to begin.
                </p>
              </div>

              {/* Upload Floor Plan Option Card */}
              <div 
                onClick={() => setMobileScreen('upload')}
                style={{ 
                  background: 'rgba(95, 85, 229, 0.06)', 
                  border: '1.5px solid #5F55E5', 
                  borderRadius: '24px', 
                  padding: '24px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'transform 0.2s'
                }}
                className="mobile-card-hover"
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#5F55E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FDFBF7' }}>
                  <i className="ti ti-upload" style={{ fontSize: '24px' }}></i>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#3D2616', margin: 0 }}>Upload Floor Plan</h4>
                  <span style={{ fontSize: '12px', color: '#8A7B6E' }}>Upload PDF, JPG or PNG drawings</span>
                </div>
              </div>

              {/* Draw New Plan Option Card */}
              <div 
                onClick={() => {
                  setRooms([
                    { id: 'r-1', type: 'kitchen', label: 'Kitchen', x: 65, y: 65, width: 30, height: 30 },
                    { id: 'r-2', type: 'pooja', label: 'Pooja Mandir', x: 70, y: 5, width: 25, height: 25 },
                    { id: 'r-3', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 }
                  ])
                  setMobileScreen('editor')
                }}
                style={{ 
                  background: 'rgba(112, 130, 56, 0.06)', 
                  border: '1.5px solid #708238', 
                  borderRadius: '24px', 
                  padding: '24px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'transform 0.2s'
                }}
                className="mobile-card-hover"
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#708238', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FDFBF7' }}>
                  <i className="ti ti-edit" style={{ fontSize: '24px' }}></i>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#3D2616', margin: 0 }}>Draw New Plan</h4>
                  <span style={{ fontSize: '12px', color: '#8A7B6E' }}>Draw your plot size and create layout</span>
                </div>
              </div>

              {/* AI Suggestion Alert banner */}
              <div 
                style={{ 
                  background: '#F5F2EC', 
                  borderRadius: '24px', 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  border: '1px solid #EAE6DF',
                  marginTop: 'auto' 
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px' }}>✨</span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#8A7B6E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Suggestion</span>
                </div>
                <span style={{ fontSize: '13.5px', color: '#3D2616', lineHeight: 1.4 }}>
                  Kitchen is best positioned in South-East to stimulate fire energy for health and family prosperity.
                </span>
                <button 
                  onClick={() => {
                    setRooms([
                      { id: 'r-1', type: 'kitchen', label: 'Kitchen', x: 68, y: 68, width: 28, height: 28 }
                    ])
                    setMobileScreen('editor')
                  }}
                  style={{ alignSelf: 'flex-start', background: '#3D2616', color: '#FDFBF7', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Check Now
                </button>
              </div>

            </div>
          )}

          {/* SCREEN 2: Upload Floor Plan */}
          {mobileScreen === 'upload' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setMobileScreen('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0, flex: 1, textAlign: 'center' }}>Upload Floor Plan</h3>
                <i className="ti ti-help" style={{ fontSize: '20px', color: '#8A7B6E' }}></i>
              </div>

              {/* Upload Box */}
              <div 
                onClick={handleUploadSimulate}
                style={{
                  flex: 1,
                  border: '2px dashed #5F55E5',
                  borderRadius: '28px',
                  background: 'rgba(95, 85, 229, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(95, 85, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5F55E5' }}>
                  <i className="ti ti-cloud-upload" style={{ fontSize: '32px' }}></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#3D2616', margin: '0 0 6px 0' }}>Upload your floor plan</h4>
                  <p style={{ fontSize: '12.5px', color: '#8A7B6E', margin: 0, lineHeight: 1.4 }}>
                    Supports PDF, JPG, PNG<br />(Max size 20MB)
                  </p>
                </div>
              </div>

              {/* Tips Section */}
              <div style={{ background: '#FAF8F5', padding: '20px', borderRadius: '20px', border: '1px solid #EAE6DF' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Tips for best results
                </span>
                <ul style={{ fontSize: '13px', color: '#5C4E43', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Clear, flat top-down views are best processed</li>
                  <li>Include clear room labels and measurement dimensions</li>
                  <li>Keep North direction indicator visible if known</li>
                </ul>
              </div>

              {/* Choose File Button */}
              <button 
                onClick={handleUploadSimulate}
                style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#5F55E5', color: '#FDFBF7', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(95, 85, 229, 0.2)' }}
              >
                Choose File
              </button>

            </div>
          )}

          {/* SCREEN 3: AI Detecting Rooms */}
          {mobileScreen === 'ai_detecting' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Title Header */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#3D2616', margin: 0 }}>AI Detecting Rooms</h3>
                <p style={{ fontSize: '13px', color: '#8A7B6E', marginTop: '6px' }}>
                  Please wait while our AI identifies structural rooms in your plan...
                </p>
              </div>

              {/* Blueprint Scan Mockup Graphic */}
              <div 
                style={{
                  width: '240px',
                  height: '240px',
                  background: '#F5F2EC',
                  borderRadius: '24px',
                  border: '1px solid #EAE6DF',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {/* Simulated floorplan blueprints */}
                <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%' }}>
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#8A7B6E" strokeWidth="1" strokeDasharray="2 2" />
                  <rect x="15" y="15" width="40" height="30" fill="rgba(112, 130, 56, 0.08)" stroke="#708238" strokeWidth="1.5" />
                  <rect x="55" y="15" width="30" height="30" fill="rgba(95, 85, 229, 0.08)" stroke="#5F55E5" strokeWidth="1.5" />
                  <rect x="15" y="45" width="70" height="40" fill="none" stroke="#3D2616" strokeWidth="1.5" />
                </svg>

                {/* Laser scan line animation */}
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: '#5F55E5',
                    boxShadow: '0 0 8px #5F55E5',
                    top: `${uploadProgress}%`,
                    transition: 'top 0.2s linear'
                  }}
                />
              </div>

              {/* Progress counter */}
              <div style={{ width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#3D2616' }}>
                  Detecting rooms... {uploadProgress}%
                </span>
                
                {/* Horizontal progress bar */}
                <div style={{ width: '100%', height: '6px', background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#5F55E5', transition: 'width 0.2s linear' }} />
                </div>
              </div>

              {/* Checklist details */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#2e7d32', fontWeight: 600 }}>
                  <i className="ti ti-checkbox" style={{ fontSize: '16px' }}></i>
                  <span>Analyzing layout contours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: detectingStep >= 1 ? '#2e7d32' : '#8A7B6E', fontWeight: 600 }}>
                  <i className={detectingStep >= 1 ? "ti ti-checkbox" : "ti ti-circle-dashed"} style={{ fontSize: '16px' }}></i>
                  <span>Detecting structural walls</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: detectingStep >= 2 ? '#2e7d32' : '#8A7B6E', fontWeight: 600 }}>
                  <i className={detectingStep >= 2 ? "ti ti-checkbox" : "ti ti-circle-dashed"} style={{ fontSize: '16px' }}></i>
                  <span>Identifying room designations</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: detectingStep >= 3 ? '#2e7d32' : '#8A7B6E', fontWeight: 600 }}>
                  <i className={detectingStep >= 3 ? "ti ti-checkbox" : "ti ti-loader"} style={{ fontSize: '16px', animation: detectingStep === 2 ? 'rotateCompass 1s linear infinite' : 'none' }}></i>
                  <span>Optimizing diagnostic accuracy</span>
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 4: Set North Direction */}
          {mobileScreen === 'set_north' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setMobileScreen('upload')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0, flex: 1, textAlign: 'center' }}>Set North Direction</h3>
                <i className="ti ti-help" style={{ fontSize: '20px', color: '#8A7B6E' }}></i>
              </div>

              {/* Info text */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13.5px', color: '#8A7B6E', margin: 0 }}>
                  Rotate the plot layout coordinates so that North points straight up.
                </p>
              </div>

              {/* Rotatable Layout compass graphic */}
              <div 
                style={{
                  flex: 1,
                  background: '#F5F2EC',
                  borderRadius: '28px',
                  border: '1px solid #EAE6DF',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {/* Static North line marker */}
                <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#5F55E5', zIndex: 10 }}>
                  <span style={{ fontSize: '11px', fontWeight: 900 }}>N</span>
                  <i className="ti ti-arrow-up" style={{ fontSize: '14px' }}></i>
                  <div style={{ width: '1.5px', height: '40px', background: '#5F55E5', strokeDasharray: '2 2' }} />
                </div>

                {/* Rotatable canvas plot element */}
                <div 
                  style={{
                    width: '180px',
                    height: '180px',
                    border: '1.5px solid #3D2616',
                    background: '#FAF8F5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `rotate(${rotationAngle}deg)`,
                    transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    position: 'relative'
                  }}
                >
                  {/* Outer wall lines */}
                  <div style={{ fontSize: '10px', color: '#8A7B6E', borderBottom: '1px dashed #D6CEBF', width: '100%', textAlign: 'center', padding: '4px 0', position: 'absolute', top: 0 }}>Kitchen</div>
                  <div style={{ fontSize: '10px', color: '#8A7B6E', borderTop: '1px dashed #D6CEBF', width: '100%', textAlign: 'center', padding: '4px 0', position: 'absolute', bottom: 0 }}>Master Bedroom</div>
                  <strong style={{ fontSize: '13px', color: '#3D2616' }}>GUPTA HOUSE</strong>
                </div>

                {/* Live tilt degrees indicator */}
                <div style={{ position: 'absolute', bottom: '16px', background: '#3D2616', color: '#FDFBF7', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                  Orientation tilt: {rotationAngle}°
                </div>
              </div>

              {/* CCW & CW Rotators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                <button 
                  onClick={() => setRotationAngle(prev => prev - 15)}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F2EC', border: '1px solid #EAE6DF', color: '#3D2616', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyAlignment: 'center' }}
                >
                  <i className="ti ti-rotate" style={{ transform: 'scaleX(-1)' }}></i>
                </button>
                <button 
                  onClick={() => setRotationAngle(prev => prev + 15)}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F2EC', border: '1px solid #EAE6DF', color: '#3D2616', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyAlignment: 'center' }}
                >
                  <i className="ti ti-rotate"></i>
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={handleAutoDetectNorth}
                  style={{ width: '100%', padding: '14px', borderRadius: '16px', border: '1px solid #D6CEBF', background: '#FDFBF7', color: '#3D2616', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Auto Detect North
                </button>
                <button 
                  onClick={handleConfirmNorth}
                  style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#5F55E5', color: '#FDFBF7', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
                >
                  Confirm North
                </button>
              </div>

            </div>
          )}

          {/* SCREEN 5: My Home Plan (Editor) */}
          {mobileScreen === 'editor' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              
              {/* Header Score Info */}
              <div style={{ padding: '16px 20px', background: '#FAF8F5', borderBottom: '1px solid #EAE6DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setMobileScreen('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#3D2616', display: 'flex', alignItems: 'center' }}>
                    <i className="ti ti-arrow-left"></i>
                  </button>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#3D2616', margin: 0 }}>My Home Plan</h4>
                    <span style={{ fontSize: '11px', color: '#8A7B6E' }}>Dwarka Sector 15</span>
                  </div>
                </div>
                
                {/* Vastu Score Badge link */}
                <button 
                  onClick={() => setMobileScreen('vastu_analysis')}
                  style={{
                    background: '#EAEFE2',
                    border: '1px solid #D1DCC0',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#4B5E26' }}>{currentVastuScore}% Vastu Score</span>
                  <span style={{ fontSize: '10px', color: '#8A7B6E', textDecoration: 'underline' }}>View Analysis</span>
                </button>
              </div>

              {/* Editor Workspace Area */}
              <div style={{ flex: 1, position: 'relative', background: '#FAF8F5', overflow: 'hidden' }} onClick={() => setSelectedRoomId(null)}>
                
                {/* 3x3 grid mandala lines overlay if selected */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '20px',
                    width: 'calc(100% - 40px)',
                    height: 'calc(100% - 40px)',
                    border: '2px solid #E4DFD5',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    opacity: 0.85,
                    pointerEvents: 'none'
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{ border: '0.5px dashed #E4DFD5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8.5px', color: '#C3BCAF', fontWeight: 'bold' }}>
                        {['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE'][i]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Left Mini Edit Sidebar menu */}
                <div 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    background: '#FDFBF7',
                    border: '1px solid #EAE6DF',
                    borderRadius: '12px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 100,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  {[
                    { id: 'select', icon: 'ti-hand-point', label: 'Select' },
                    { id: 'door', icon: 'ti-door', label: 'Door' },
                    { id: 'window', icon: 'ti-window', label: 'Window' },
                    { id: 'wall', icon: 'ti-box', label: 'Wall' },
                    { id: 'more', icon: 'ti-dots', label: 'More' }
                  ].map(tool => (
                    <button 
                      key={tool.id} 
                      onClick={(e) => { e.stopPropagation(); alert(`${tool.label} tool selected`); }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: 'none',
                        background: tool.id === 'select' ? '#F5F2EC' : 'transparent',
                        color: tool.id === 'select' ? '#5F55E5' : '#8A7B6E',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <i className={`ti ${tool.icon}`} style={{ fontSize: '15px' }}></i>
                      <span style={{ fontSize: '7.5px', fontWeight: 600 }}>{tool.label}</span>
                    </button>
                  ))}
                </div>

                {/* Placed Canvas Rooms & Furniture */}
                <div style={{ position: 'absolute', left: '20px', top: '20px', width: 'calc(100% - 40px)', height: 'calc(100% - 40px)' }}>
                  {rooms.map((room) => {
                    const isSelected = room.id === selectedRoomId
                    const isFurniture = (room.type || '').includes('-')
                    const previewUrl = isFurniture ? AssetLoader.getAssetPreviewUrl(room.type) : null
                    const diagnostic = getVastuRoomAnalysis(room)

                    return (
                      <div
                        key={room.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRoomId(room.id)
                        }}
                        style={{
                          position: 'absolute',
                          left: `${room.x}%`,
                          top: `${room.y}%`,
                          width: `${room.width}%`,
                          height: `${room.height}%`,
                          border: isSelected ? '2px solid #5F55E5' : '1px solid #3d2616',
                          backgroundColor: isSelected ? 'rgba(95, 85, 229, 0.05)' : '#FDFBF7',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          boxShadow: isSelected ? '0 6px 20px rgba(95, 85, 229, 0.15)' : 'none',
                          zIndex: isSelected ? 99 : 5,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {previewUrl ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={previewUrl} style={{ width: '85%', height: '85%', objectFit: 'contain' }} alt={room.label} />
                            {isSelected && (
                              <span style={{ fontSize: '8px', color: '#8A7B6E', whiteSpace: 'nowrap' }}>
                                {room.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '11px', display: 'block', color: '#3D2616', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {room.label}
                            </strong>
                            <span style={{ fontSize: '8.5px', color: '#8A7B6E' }}>
                              {Math.round(room.width * 0.3)}x{Math.round(room.height * 0.3)} ft
                            </span>
                            <span style={{ fontSize: '8px', color: diagnostic.color, fontWeight: 'bold' }}>
                              {diagnostic.status}
                            </span>
                          </div>
                        )}

                        {/* Drag indicator if selected */}
                        {isSelected && (
                          <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '18px', height: '18px', borderRadius: '50%', background: '#5F55E5', color: '#FDFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', border: '1px solid #FAF8F5' }}>
                            <i className="ti ti-resize"></i>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* FAB (Add Object category menu toggle) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setAddObjectSheet(true); }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    bottom: '16px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#5F55E5',
                    color: '#FDFBF7',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(95, 85, 229, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}
                  className="fab-pulse"
                >
                  <i className="ti ti-plus"></i>
                </button>
              </div>

              {/* Editor bottom action bar */}
              <div 
                style={{ 
                  height: '56px', 
                  background: '#FAF8F5', 
                  borderTop: '1px solid #EAE6DF', 
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: '0 10px',
                  zIndex: 200
                }}
              >
                {[
                  { id: 'toggle_grid', icon: 'ti-layout-grid', label: 'Vastu Grid' },
                  { id: 'preview', icon: 'ti-photo', label: 'Preview' },
                  { id: 'advice', icon: 'ti-bulb', label: 'Vastu Advice' },
                  { id: 'save', icon: 'ti-device-floppy', label: 'Save Project' }
                ].map(action => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'preview') setMobileScreen('ai_preview')
                      else if (action.id === 'save') setMobileScreen('save_project')
                      else if (action.id === 'toggle_grid') alert('Toggled diagnostic Vastu Grid boundaries')
                      else alert(`AI Vastu Auditor Advice: Placing heavier furniture like Wardrobes in the South-West builds earth stabilization.`)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5C4E43',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px'
                    }}
                  >
                    <i className={`ti ${action.icon}`} style={{ fontSize: '18px' }}></i>
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{action.label}</span>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* SCREEN 9: AI Preview (2D/3D Mockup) */}
          {mobileScreen === 'ai_preview' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setMobileScreen('editor')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0 }}>AI Preview</h3>
                <i className="ti ti-dots" style={{ fontSize: '20px', color: '#8A7B6E' }}></i>
              </div>

              {/* 2D View / 3D View toggle pill */}
              <div style={{ background: '#FAF8F5', padding: '4px', borderRadius: '14px', border: '1px solid #EAE6DF', display: 'flex', gap: '4px' }}>
                {['2D View', '3D View'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: '10px',
                      border: 'none',
                      background: previewTab === tab ? '#3D2616' : 'transparent',
                      color: previewTab === tab ? '#FDFBF7' : '#5C4E43',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Rendering Mockup box */}
              <div 
                style={{
                  flex: 1,
                  background: '#F5F2EC',
                  borderRadius: '28px',
                  border: '1px solid #EAE6DF',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {previewTab === '3D View' ? (
                  <svg viewBox="0 0 400 260" style={{ width: '100%', height: '100%' }}>
                    {/* Isometric Walls */}
                    <polygon points="40,30 200,90 200,230 40,170" fill="#efebe2" stroke="#eae5d8" strokeWidth="1.5" />
                    <polygon points="200,90 360,30 360,170 200,230" fill="#faf8f5" stroke="#eae5d8" strokeWidth="1.5" />
                    <polygon points="40,170 200,230 360,170 200,110" fill="#FAF8F5" stroke="#eae5d8" strokeWidth="1.5" />
                    
                    {/* Floor grid */}
                    <line x1="80" y1="185" x2="240" y2="125" stroke="#e4dfd5" strokeWidth="1" />
                    <line x1="120" y1="200" x2="280" y2="140" stroke="#e4dfd5" strokeWidth="1" />
                    
                    {/* Sofa placeholder standing flat */}
                    <ellipse cx={previewAssetTranslate.x} cy={previewAssetTranslate.y + 12} rx="24" ry="10" fill="#708238" opacity="0.2" />
                    <image 
                      href={AssetLoader.getAssetPreviewUrl('furniture-sofa')} 
                      x={previewAssetTranslate.x - 25} 
                      y={previewAssetTranslate.y - 25} 
                      width="50" 
                      height="50"
                    />
                  </svg>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '140px', height: '140px' }}>
                      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#3D2616" strokeWidth="2" />
                      {/* Sofa Top view */}
                      <rect x="20" y="35" width="60" height="30" rx="3" fill="#FAF8F5" stroke="#3D2616" strokeWidth="1.5" />
                      <line x1="20" y1="55" x2="80" y2="55" stroke="#3D2616" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}

                {/* Compass HUD */}
                <div style={{ position: 'absolute', right: '16px', top: '16px', background: '#FDFBF7', padding: '6px 12px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, border: '1px solid #EAE6DF' }}>
                  🧭 Focus: {previewDirection}
                </div>
              </div>

              {/* Directions Select menu */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Direction Placement
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['North', 'East', 'South', 'West'].map(dir => {
                    const isActive = previewDirection === dir
                    return (
                      <button
                        key={dir}
                        onClick={() => setPreviewDirection(dir)}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          borderRadius: '14px',
                          border: '1.5px solid',
                          borderColor: isActive ? '#3D2616' : '#EAE6DF',
                          background: isActive ? '#3D2616' : '#FDFBF7',
                          color: isActive ? '#FDFBF7' : '#5C4E43',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {dir}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Diagnostic Vastu status bar */}
              <div 
                style={{
                  background: '#EAEFE2',
                  border: '1px solid #D1DCC0',
                  color: '#4B5E26',
                  padding: '16px',
                  borderRadius: '20px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                <i className="ti ti-check-circle" style={{ fontSize: '18px', marginTop: '1px' }}></i>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>Excellent Placement</strong>
                  <span style={{ fontSize: '12.5px', color: '#3D2616', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                    Placing seating structures near the South/West walls increases mental focus and relaxation energy flow.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 10: Vastu Analysis */}
          {mobileScreen === 'vastu_analysis' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setMobileScreen('editor')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0, flex: 1, textAlign: 'center' }}>Vastu Analysis</h3>
                <div style={{ width: '20px' }}></div>
              </div>

              {/* Gauge rating graph */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    border: '8px solid #EAEFE2',
                    borderTopColor: '#708238', // circular progress loader
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-45deg)'
                  }}
                >
                  <div style={{ transform: 'rotate(45deg)', textAlign: 'center' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: '#3D2616', display: 'block', lineHeight: 1 }}>{currentVastuScore}%</span>
                    <span style={{ fontSize: '10.5px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '4px' }}>Vastu Score</span>
                  </div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#708238' }}>Excellent energy balance</span>
              </div>

              {/* Graded elements checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                  Placements breakdown
                </span>

                {rooms.map((room) => {
                  const rating = getVastuRoomAnalysis(room)
                  return (
                    <div 
                      key={room.id}
                      style={{
                        background: '#FAF8F5',
                        border: '1px solid #EAE6DF',
                        borderRadius: '16px',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ fontSize: '14px', color: '#3D2616' }}>{room.label}</strong>
                        <span style={{ fontSize: '11px', color: '#8A7B6E' }}>Placed in the {Math.round(room.x + room.width/2) < 50 ? 'West' : 'East'} sector</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: rating.color, background: `${rating.color}15`, padding: '4px 10px', borderRadius: '8px' }}>
                        {rating.status}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* View Full Analysis buttons */}
              <button 
                onClick={() => setMobileScreen('editor')}
                style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#5F55E5', color: '#FDFBF7', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: 'auto' }}
              >
                View Full Analysis
              </button>

            </div>
          )}

          {/* SCREEN 11: Save Project */}
          {mobileScreen === 'save_project' && (
            <form onSubmit={handleSaveProject} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setMobileScreen('editor')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0 }}>Save Project</h3>
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#5F55E5' }}>
                  <i className="ti ti-check"></i>
                </button>
              </div>

              {/* Form Input fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase' }}>Project Name</label>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    style={{ padding: '14px', borderRadius: '14px', border: '1px solid #D6CEBF', background: '#FDFBF7', color: '#3D2616', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase' }}>Description (Optional)</label>
                  <textarea 
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    style={{ padding: '14px', borderRadius: '14px', border: '1px solid #D6CEBF', background: '#FDFBF7', color: '#3D2616', fontSize: '14px', outline: 'none', height: '80px', resize: 'none' }}
                  />
                </div>
              </div>

              {/* Privacy selections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase' }}>Privacy Settings</span>
                
                {/* Private option */}
                <div style={{ padding: '16px', background: '#FAF8F5', border: '1.5px solid #5F55E5', borderRadius: '18px', display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer' }}>
                  <i className="ti ti-lock" style={{ fontSize: '18px', color: '#5F55E5' }}></i>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#3D2616' }}>Private</strong>
                    <span style={{ fontSize: '11px', color: '#8A7B6E' }}>Only you can access this dashboard</span>
                  </div>
                  <i className="ti ti-circle-check-filled" style={{ color: '#5F55E5', fontSize: '18px' }}></i>
                </div>

                {/* Public option */}
                <div style={{ padding: '16px', background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '18px', display: 'flex', gap: '14px', alignItems: 'center', opacity: 0.7 }}>
                  <i className="ti ti-world" style={{ fontSize: '18px', color: '#8A7B6E' }}></i>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#3D2616' }}>Public</strong>
                    <span style={{ fontSize: '11px', color: '#8A7B6E' }}>Anyone with link can read and collaborate</span>
                  </div>
                </div>
              </div>

              {/* Save Project Button */}
              <button 
                type="submit"
                style={{ width: '100%', padding: '16px', borderRadius: '18px', background: '#5F55E5', color: '#FDFBF7', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: 'auto', boxShadow: '0 4px 12px rgba(95, 85, 229, 0.2)' }}
              >
                Save Project
              </button>
            </form>
          )}

          {/* SCREEN 12: My Projects dashboard */}
          {mobileScreen === 'projects' && (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setMobileScreen('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#3D2616' }}>
                  <i className="ti ti-arrow-left"></i>
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616', margin: 0 }}>My Projects</h3>
                <button 
                  onClick={() => {
                    setRooms([])
                    setMobileScreen('editor')
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#5F55E5' }}
                >
                  <i className="ti ti-plus"></i>
                </button>
              </div>

              {/* Search projects */}
              <div style={{ position: 'relative' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8A7B6E', fontSize: '16px' }}></i>
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1px solid #EAE6DF', background: '#FAF8F5', color: '#3D2616', outline: 'none', fontSize: '13px' }}
                />
              </div>

              {/* Projects Grid cards list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {projectsList.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => handleLoadProject(proj)}
                    style={{
                      background: '#FAF8F5',
                      border: '1px solid #EAE6DF',
                      borderRadius: '20px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      transition: 'transform 0.2s'
                    }}
                    className="mobile-card-hover"
                  >
                    {/* Thumbnail vector plan */}
                    <div style={{ width: '70px', height: '70px', background: '#FAF8F5', border: '1px solid #E4DFD5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%' }}>
                        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#8A7B6E" strokeWidth="2" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="#8A7B6E" strokeWidth="1.5" strokeDasharray="2 2" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="#8A7B6E" strokeWidth="1.5" strokeDasharray="2 2" />
                      </svg>
                    </div>

                    {/* Metadata details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#3D2616', margin: 0 }}>{proj.name}</h4>
                      <span style={{ fontSize: '11px', color: '#8A7B6E' }}>{proj.modified}</span>
                      <span style={{ fontSize: '11px', color: '#708238', fontWeight: 700, marginTop: '2px', display: 'inline-block' }}>
                        {proj.score}% Vastu Score
                      </span>
                    </div>

                    <i className="ti ti-chevron-right" style={{ color: '#8A7B6E', fontSize: '16px' }}></i>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* MOCKUP PERSISTENT BOTTOM NAVIGATION BAR */}
        {['dashboard', 'editor', 'projects'].includes(mobileScreen) && (
          <div 
            style={{
              height: '64px',
              background: '#FDFBF7',
              borderTop: '1px solid #EAE6DF',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              position: 'relative',
              boxShadow: '0 -4px 12px rgba(45, 41, 37, 0.02)'
            }}
          >
            {/* Dashboard Link */}
            <button 
              onClick={() => setMobileScreen('dashboard')}
              style={{ background: 'none', border: 'none', color: mobileScreen === 'dashboard' ? '#5F55E5' : '#8A7B6E', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '60px' }}
            >
              <i className="ti ti-smart-home" style={{ fontSize: '20px' }}></i>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Home</span>
            </button>

            {/* Design Link */}
            <button 
              onClick={() => setMobileScreen('editor')}
              style={{ background: 'none', border: 'none', color: mobileScreen === 'editor' ? '#5F55E5' : '#8A7B6E', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '60px' }}
            >
              <i className="ti ti-layout-dashboard" style={{ fontSize: '20px' }}></i>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Design</span>
            </button>

            {/* Middle FAB (Add Object Sheet popup trigger) */}
            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
              <button 
                onClick={() => {
                  setSelectedRoomId(null)
                  setAddObjectSheet(true)
                }}
                style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#5F55E5',
                  color: '#FDFBF7',
                  border: '4px solid #FDFBF7',
                  fontSize: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(95, 85, 229, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="ti ti-plus"></i>
              </button>
            </div>

            {/* Shop Redirect */}
            <button 
              onClick={() => alert('Opening Vastu Remedies procurement catalog...')}
              style={{ background: 'none', border: 'none', color: '#8A7B6E', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '60px' }}
            >
              <i className="ti ti-shopping-cart" style={{ fontSize: '20px' }}></i>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Shop</span>
            </button>

            {/* Projects list Redirect */}
            <button 
              onClick={() => setMobileScreen('projects')}
              style={{ background: 'none', border: 'none', color: mobileScreen === 'projects' ? '#5F55E5' : '#8A7B6E', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', width: '60px' }}
            >
              <i className="ti ti-folder" style={{ fontSize: '20px' }}></i>
              <span style={{ fontSize: '9px', fontWeight: 700 }}>Projects</span>
            </button>
          </div>
        )}

        {/* BOTTOM SHEET: SCREEN 6 (Add Object Categories) */}
        {addObjectSheet && (
          <div 
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(45, 41, 37, 0.5)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              animation: 'fadeIn 0.2s'
            }}
            onClick={() => setAddObjectSheet(false)}
          >
            <div 
              style={{
                background: '#FDFBF7',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px',
                maxHeight: '80%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag indicator handle bar */}
              <div style={{ width: '40px', height: '4px', background: '#EAE6DF', borderRadius: '2px', alignSelf: 'center' }}></div>

              {/* Title & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '17px', fontWeight: 800, color: '#3D2616' }}>Add Object</strong>
                <button onClick={() => setAddObjectSheet(false)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#8A7B6E', cursor: 'pointer' }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8A7B6E', fontSize: '15px' }}></i>
                <input 
                  type="text" 
                  placeholder="Search furniture, doors, windows..."
                  style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1px solid #EAE6DF', background: '#FAF8F5', color: '#3D2616', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Grid of categories tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', margin: '8px 0' }}>
                {[
                  { id: 'furniture', label: 'Furniture', icon: '🛋️' },
                  { id: 'doors', label: 'Doors', icon: '🚪' },
                  { id: 'windows', label: 'Windows', icon: '🪟' },
                  { id: 'plants', label: 'Plants', icon: '🪴' },
                  { id: 'decor', label: 'Decor', icon: '🪞' },
                  { id: 'temple', label: 'Temple', icon: '🪔' },
                  { id: 'utilities', label: 'Utilities', icon: '🚿' },
                  { id: 'structure', label: 'Structure', icon: '🧱' }
                ].map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      if (cat.id === 'furniture') {
                        setCatalogSheet(true)
                        setAddObjectSheet(false)
                      } else {
                        alert(`Selecting ${cat.label} category elements catalog...`)
                      }
                    }}
                    style={{
                      background: '#FAF8F5',
                      border: '1.5px solid #EAE6DF',
                      borderRadius: '16px',
                      padding: '12px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                    className="mobile-card-hover"
                  >
                    <span style={{ fontSize: '22px' }}>{cat.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#3D2616' }}>{cat.label}</span>
                  </div>
                ))}
              </div>

              {/* AI Suggestion recommendation bar */}
              <div style={{ background: '#FAF8F5', border: '1.5px solid #D1DCC0', borderRadius: '18px', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '15px' }}>✨</span>
                <span style={{ fontSize: '11px', color: '#4B5E26', fontWeight: 600 }}>
                  AI Recommendation: Based on your layout, we suggest placing Sofa in North-West sector.
                </span>
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM SHEET: SCREEN 7 (Furniture Catalog UI) */}
        {catalogSheet && (
          <div 
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(45, 41, 37, 0.5)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              animation: 'fadeIn 0.2s'
            }}
            onClick={() => setCatalogSheet(false)}
          >
            <div 
              style={{
                background: '#FDFBF7',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '24px',
                height: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag bar */}
              <div style={{ width: '40px', height: '4px', background: '#EAE6DF', borderRadius: '2px', alignSelf: 'center' }}></div>

              {/* Title & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '17px', fontWeight: 800, color: '#3D2616' }}>Furniture Catalog</strong>
                <button onClick={() => setCatalogSheet(false)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#8A7B6E', cursor: 'pointer' }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>

              {/* Top Chips scrollbar */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'Sofa', 'Bed', 'Table', 'Chair'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCatalogTab(tab)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: catalogTab === tab ? '#3D2616' : '#F5F2EC',
                      color: catalogTab === tab ? '#FDFBF7' : '#5C4E43',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Catalog list grid of options */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', paddingBottom: '20px' }}>
                {FURNITURE_ITEMS.filter(item => catalogTab === 'All' || item.name.includes(catalogTab)).map(item => {
                  const previewUrl = AssetLoader.getAssetPreviewUrl(item.id)
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleAddAssetToCanvas(item)}
                      style={{
                        background: '#FAF8F5',
                        border: '1.5px solid #EAE6DF',
                        borderRadius: '18px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer',
                        alignItems: 'center'
                      }}
                      className="mobile-card-hover"
                    >
                      <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt={item.name} />
                      </div>
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <strong style={{ fontSize: '12.5px', color: '#3D2616', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </strong>
                        <span style={{ fontSize: '10.5px', color: '#8A7B6E' }}>{item.size}</span>
                      </div>
                      <button 
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#5F55E5',
                          color: '#FDFBF7',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        + Add to Plan
                      </button>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM SHEET: SCREEN 8 (Object Options Nudge & Live Vastu Advice) */}
        {selectedObject && (
          <div 
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(45, 41, 37, 0.25)', // slight backdrop tint
              zIndex: 900,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              pointerEvents: 'none' // allow touching background canvas while sheet is active!
            }}
          >
            <div 
              style={{
                background: '#FDFBF7',
                borderTopLeftRadius: '28px',
                borderTopRightRadius: '28px',
                padding: '20px 24px',
                maxHeight: '65%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'auto', // reactivate touch events inside panel
                boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
                animation: 'slideUp 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag indicator handle */}
              <div style={{ width: '40px', height: '4px', background: '#EAE6DF', borderRadius: '2px', alignSelf: 'center' }}></div>

              {/* Title & Dimension */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px', fontWeight: 800, color: '#3D2616' }}>{selectedObject.label}</strong>
                  <span style={{ fontSize: '11px', color: '#8A7B6E', display: 'block', marginTop: '2px' }}>
                    Size: {Math.round(selectedObject.width * 0.3)}'0" x {Math.round(selectedObject.height * 0.3)}'0"
                  </span>
                </div>
                <button onClick={() => setSelectedRoomId(null)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#8A7B6E', cursor: 'pointer' }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>

              {/* Action row (Nudge, Rotate, Scale, Delete) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                
                {/* Nudge Arrow control cluster */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: '#FAF8F5', border: '1px solid #EAE6DF', padding: '6px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#8A7B6E' }}>Nudge</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', width: '100%' }}>
                    <div />
                    <button onClick={() => handleNudgeObject('up')} style={{ padding: '2px', border: 'none', background: '#E4DFD5', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                    <div />
                    <button onClick={() => handleNudgeObject('left')} style={{ padding: '2px', border: 'none', background: '#E4DFD5', borderRadius: '4px', cursor: 'pointer' }}>◀</button>
                    <div />
                    <button onClick={() => handleNudgeObject('right')} style={{ padding: '2px', border: 'none', background: '#E4DFD5', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
                    <div />
                    <button onClick={() => handleNudgeObject('down')} style={{ padding: '2px', border: 'none', background: '#E4DFD5', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    <div />
                  </div>
                </div>

                {/* Rotate button */}
                <button 
                  onClick={handleRotateObject}
                  style={{
                    background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <i className="ti ti-rotate" style={{ fontSize: '18px', color: '#5F55E5' }}></i>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#3D2616' }}>Rotate</span>
                </button>

                {/* Scale buttons (Resize) */}
                <div style={{ background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#8A7B6E' }}>Resize</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleScaleObject(-1)} style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', background: '#E4DFD5', fontWeight: 'bold' }}>-</button>
                    <button onClick={() => handleScaleObject(1)} style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', background: '#E4DFD5', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>

                {/* Delete button */}
                <button 
                  onClick={() => {
                    deleteRoom(selectedObject.id)
                    setSelectedRoomId(null)
                  }}
                  style={{
                    background: 'rgba(198, 40, 40, 0.05)', border: '1.5px solid #ffcdd2', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <i className="ti ti-trash" style={{ fontSize: '18px', color: '#c62828' }}></i>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#c62828' }}>Delete</span>
                </button>
              </div>

              {/* Extra options Duplicate */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleDuplicateObject}
                  style={{ flex: 1, padding: '10px', background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#5C4E43', cursor: 'pointer' }}
                >
                  👥 Duplicate
                </button>
                <button 
                  onClick={() => alert('Flipped object alignment footprint')}
                  style={{ flex: 1, padding: '10px', background: '#FAF8F5', border: '1px solid #EAE6DF', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#5C4E43', cursor: 'pointer' }}
                >
                  🔄 Flip Layout
                </button>
              </div>

              {/* Vastu advice diagnostic checks */}
              {(() => {
                const analysis = getVastuRoomAnalysis(selectedObject)
                return (
                  <div style={{ background: `${analysis.color}10`, border: `1px solid ${analysis.color}30`, padding: '12px 16px', borderRadius: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px' }}>✨</span>
                    <div>
                      <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8A7B6E', letterSpacing: '0.5px' }}>Vastu Diagnosis</strong>
                      <span style={{ fontSize: '12px', color: '#3D2616', display: 'block', marginTop: '2px' }}>
                        {selectedObject.label} is currently graded as <strong style={{ color: analysis.color }}>{analysis.status} Placement</strong> in this coordinate.
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* Done button */}
              <button 
                onClick={() => setSelectedRoomId(null)}
                style={{ width: '100%', padding: '14px', borderRadius: '16px', background: '#3D2616', color: '#FDFBF7', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                Done
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Embedded device styles */}
      <style>{`
        /* Card pulse hover */
        .mobile-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 41, 37, 0.05);
        }
        
        /* Floating pulse pointer */
        .fab-pulse {
          animation: floatPulse 2s infinite ease-in-out;
        }

        @keyframes floatPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }

        /* Slide animations */
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  )
}
