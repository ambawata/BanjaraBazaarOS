import React, { useState, useEffect } from 'react'
import OnboardingWizard from './features/onboarding/OnboardingWizard'
import PlannerWorkspace from './features/planner/PlannerWorkspace'

export default function App() {
  const [screenState, setScreenState] = useState('welcome') 
  // welcome | step_prop | step_size | step_shape | step_preferences | step_summary | designing | preview | workspace
  
  const [activeTab, setActiveTab] = useState('home') // home | designer | upload | analysis | shop | reports
  const [showAcharyaModal, setShowAcharyaModal] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  const [theme, setTheme] = useState(() => localStorage.getItem('vg-theme') || 'dark')
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
  const [isTracing, setIsTracing] = useState(false)
  const [traceStatus, setTraceStatus] = useState('')

  // Consolidated Onboarding answers state
  const [onboarding, setOnboarding] = useState({
    propertyType: 'Independent Villa',
    sizePreset: '30 x 40 ft',
    customWidth: '',
    customLength: '',
    plotShape: 'Rectangular Plot',
    facing: 'East Road ☀️',
    goal: 'Build New Home',
    membersCount: '4',
    occupantType: 'Self',
    budget: 'Up to 25 Lakhs',
    preferredStyle: 'Modern',
    customRequirements: ''
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

  const handleAutoTrace = () => {
    if (!imageSettings.url) {
      alert("Please upload a floor plan drawing (PDF/JPG/PNG) first using the uploader!")
      return
    }
    
    setIsTracing(true)
    setTraceStatus('Scanning layout drawing structural contours...')
    
    setTimeout(() => {
      setTraceStatus('Detecting text tags (Bedroom, Kitchen, Pooja)...')
    }, 1000)

    setTimeout(() => {
      setTraceStatus('Mapping coordinate offsets to 3x3 Vastu mandala...')
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
      setIsTracing(false)
      setTraceStatus('')
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
    setImageSettings(prev => ({ ...prev, url }))
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

  // Routing
  const wizardStates = ['step_prop', 'step_size', 'step_shape', 'step_preferences', 'step_summary', 'designing', 'preview']
  
  if (wizardStates.includes(screenState)) {
    return (
      <OnboardingWizard
        screenState={screenState}
        setScreenState={setScreenState}
        onboarding={onboarding}
        setOnboarding={setOnboarding}
        boundaryPoints={boundaryPoints}
        setBoundaryPoints={setBoundaryPoints}
        rooms={rooms}
        setRooms={setRooms}
        plot={plot}
        setPlot={setPlot}
        imageSettings={imageSettings}
        setImageSettings={setImageSettings}
        selectedRoomId={selectedRoomId}
        setSelectedRoomId={setSelectedRoomId}
        designProgress={designProgress}
        setDesignProgress={setDesignProgress}
        isMobile={isMobile}
        setShowAcharyaModal={setShowAcharyaModal}
        isTracing={isTracing}
        setIsTracing={setIsTracing}
        traceStatus={traceStatus}
        setTraceStatus={setTraceStatus}
        setActiveTab={setActiveTab}
        selectSizePreset={selectSizePreset}
        typeCustomDimension={typeCustomDimension}
        selectShapePreset={selectShapePreset}
        handlePointsChange={handlePointsChange}
        handleAddRoom={handleAddRoom}
        handleAutoTrace={handleAutoTrace}
        triggerAiDesignProcess={triggerAiDesignProcess}
        getDeterminedRoomsList={getDeterminedRoomsList}
      />
    )
  }

  return (
    <PlannerWorkspace
      screenState={screenState}
      setScreenState={setScreenState}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showAcharyaModal={showAcharyaModal}
      setShowAcharyaModal={setShowAcharyaModal}
      isMobile={isMobile}
      theme={theme}
      toggleTheme={toggleTheme}
      boundaryPoints={boundaryPoints}
      selectedIssueRoom={selectedIssueRoom}
      setSelectedIssueRoom={setSelectedIssueRoom}
      selectedRoomId={selectedRoomId}
      setSelectedRoomId={setSelectedRoomId}
      showVastuGrid={showVastuGrid}
      setShowVastuGrid={setShowVastuGrid}
      showNormalGrid={showNormalGrid}
      setShowNormalGrid={setShowNormalGrid}
      showAddPopup={showAddPopup}
      setShowAddPopup={setShowAddPopup}
      customRoomName={customRoomName}
      setCustomRoomName={setCustomRoomName}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isTracing={isTracing}
      traceStatus={traceStatus}
      onboarding={onboarding}
      plot={plot}
      setPlot={setPlot}
      rooms={rooms}
      setRooms={setRooms}
      imageSettings={imageSettings}
      setImageSettings={setImageSettings}
      handlePointsChange={handlePointsChange}
      handleAddRoom={handleAddRoom}
      handleAddCustomRoom={handleAddCustomRoom}
      handleClearCanvas={handleClearCanvas}
      handleNudge={handleNudge}
      handleResizeNudge={handleResizeNudge}
      handleDeleteSelected={handleDeleteSelected}
      handleAutoTrace={handleAutoTrace}
      handleContinueProject={handleContinueProject}
      handleBackdropFile={handleBackdropFile}
    />
  )
}
