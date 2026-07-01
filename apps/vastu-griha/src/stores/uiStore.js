import { create } from 'zustand'

export const useUiStore = create((set) => ({
  screenState: 'welcome',
  activeTab: 'home',
  showAcharyaModal: false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  theme: typeof window !== 'undefined' ? (localStorage.getItem('vg-theme') || 'dark') : 'dark',
  showVastuGrid: true,
  showNormalGrid: true,
  showAddPopup: false,
  searchQuery: '',
  selectedRoomId: null,
  selectedIssueRoom: null,
  isTracing: false,
  traceStatus: '',
  designProgress: 0,

  setScreenState: (screenState) => set({ screenState }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowAcharyaModal: (showAcharyaModal) => set({ showAcharyaModal }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setTheme: (theme) => {
    set({ theme })
    if (typeof window !== 'undefined') {
      localStorage.setItem('vg-theme', theme)
    }
  },
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      localStorage.setItem('vg-theme', next)
    }
    return { theme: next }
  }),
  setShowVastuGrid: (showVastuGrid) => set({ showVastuGrid }),
  setShowNormalGrid: (showNormalGrid) => set({ showNormalGrid }),
  setShowAddPopup: (showAddPopup) => set({ showAddPopup }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedRoomId: (selectedRoomId) => set({ selectedRoomId }),
  setSelectedIssueRoom: (selectedIssueRoom) => set({ selectedIssueRoom }),
  setIsTracing: (isTracing) => set({ isTracing }),
  setTraceStatus: (traceStatus) => set({ traceStatus }),
  setDesignProgress: (designProgress) => set({ designProgress })
}))
