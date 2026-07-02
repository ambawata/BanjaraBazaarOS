import React, { useEffect } from 'react'
import { useUiStore } from './stores/uiStore'
import { useCanvasStore } from './stores/canvasStore'
import OnboardingWizard from './features/onboarding/OnboardingWizard'
import PlannerWorkspace from './features/planner/PlannerWorkspace'
import ProjectDashboard from './features/dashboard/ProjectDashboard'

export default function App() {
  const screenState = useUiStore((state) => state.screenState)
  const theme = useUiStore((state) => state.theme)
  const setIsMobile = useUiStore((state) => state.setIsMobile)
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

  // Try to restore project from autosaved localStorage on startup
  useEffect(() => {
    const loaded = loadFromLocalStorage()
    if (loaded) {
      useUiStore.getState().setScreenState('workspace')
      useUiStore.getState().setActiveTab('home')
    }
  }, [loadFromLocalStorage])

  const wizardStates = ['step_prop', 'step_size', 'step_shape', 'step_preferences', 'step_summary', 'designing', 'preview']
  
  if (screenState === 'dashboard' || screenState === 'welcome') {
    return <ProjectDashboard />
  }

  if (wizardStates.includes(screenState)) {
    return <OnboardingWizard />
  }

  return <PlannerWorkspace />
}
