import { create } from 'zustand'

export const useProjectStore = create((set) => ({
  onboarding: {
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
  },
  plot: {
    width: 30,
    length: 40,
    shape: 'Rectangular',
    facing: 'East',
    tilt: 0
  },

  setOnboarding: (onboarding) => set({ onboarding }),
  setPlot: (plot) => set({ plot }),
  updateOnboardingField: (field, value) => set((state) => ({
    onboarding: { ...state.onboarding, [field]: value }
  })),
  updatePlotField: (field, value) => set((state) => ({
    plot: { ...state.plot, [field]: value }
  }))
}))
