import React, { useEffect } from 'react'
import { useUiStore } from './stores/uiStore'
import { useCanvasStore } from './stores/canvasStore'
import { useProjectStore } from './stores/projectStore'
import OnboardingWizard from './features/onboarding/OnboardingWizard'
import PlannerWorkspace from './features/planner/PlannerWorkspace'
import ProjectDashboard from './features/dashboard/ProjectDashboard'
import MobileAppContainer from './components/MobileAppContainer'

export default function App() {
  const screenState = useUiStore((state) => state.screenState)
  const theme = useUiStore((state) => state.theme)
  const setIsMobile = useUiStore((state) => state.setIsMobile)
  const isMobile = useUiStore((state) => state.isMobile)
  const loadFromLocalStorage = useCanvasStore((state) => state.loadFromLocalStorage)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobile])

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
  }, [theme])

  // Try to restore project from autosaved localStorage on startup, or set defaults
  useEffect(() => {
    const loaded = loadFromLocalStorage()
    if (!loaded) {
      useProjectStore.getState().setPlot({
        width: 30,
        length: 40,
        shape: 'Rectangular',
        facing: 'East',
        tilt: 0
      })
      useCanvasStore.getState().setRooms([
        { id: 'r-1', label: 'Kitchen', x: 65, y: 65, width: 30, height: 30 },
        { id: 'r-2', label: 'Pooja Room', x: 70, y: 5, width: 25, height: 25 },
        { id: 'r-3', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 }
      ])
    }
    useUiStore.getState().setScreenState('workspace')
    useUiStore.getState().setActiveTab('home')
  }, [loadFromLocalStorage])

  const wizardStates = ['step_prop', 'step_size', 'step_shape', 'step_preferences', 'step_summary', 'designing', 'preview']
  
  if (isMobile) {
    return <MobileAppContainer />
  }

  if (screenState === 'dashboard') {
    return <ProjectDashboard />
  }

  if (wizardStates.includes(screenState)) {
    return <OnboardingWizard />
  }

  return <PlannerWorkspace />
}

