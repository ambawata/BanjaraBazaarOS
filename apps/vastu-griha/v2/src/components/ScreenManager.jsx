import React from 'react';
import { useUiStore } from '../stores/uiStore';
import OnboardingWizard from '../features/onboarding/OnboardingWizard';
import PlannerWorkspace from '../features/planner/PlannerWorkspace';
import HomeDashboard from '../features/dashboard/HomeDashboard';

const WIZARD_STATES = ['step_prop', 'step_size', 'step_shape', 'step_preferences', 'step_summary', 'designing', 'preview'];

export default function ScreenManager() {
  const screenState = useUiStore((state) => state.screenState);

  if (screenState === 'dashboard') {
    return <HomeDashboard />;
  }

  if (WIZARD_STATES.includes(screenState)) {
    return <OnboardingWizard />;
  }

  return <PlannerWorkspace />;
}
