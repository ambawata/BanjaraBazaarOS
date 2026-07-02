import { create } from 'zustand'

export const useUiStore = create((set) => ({
  screenState: 'welcome',
  activeTab: 'home',
  showAcharyaModal: false,
  isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  theme: typeof window !== 'undefined' ? (localStorage.getItem('vg-theme') || 'light') : 'light',
  showVastuGrid: true,
  showNormalGrid: true,
  showAddPopup: false,
  searchQuery: '',
  selectedRoomId: null,
  selectedIssueRoom: null,
  isTracing: false,
  traceStatus: '',
  designProgress: 0,

  // Collaboration Foundations
  showShareModal: false,
  showNotificationCenter: false,
  editMode: 'edit', // 'edit' | 'view'
  
  members: [
    { id: 'm-1', name: 'Amit Gupta', email: 'amit@gupta.com', role: 'Owner', avatar: 'AG' },
    { id: 'm-2', name: 'Karan Sharma', email: 'karan@sharma.com', role: 'Consultant', avatar: 'KS' },
    { id: 'm-3', name: 'Neha Gupta', email: 'neha@gupta.com', role: 'Family', avatar: 'NG' }
  ],

  comments: [
    { id: 'c-1', target: 'Pooja Mandir', author: 'Karan Sharma', text: 'Pooja room is perfectly aligned in the Northeast corner zone.', time: '10 mins ago' },
    { id: 'c-2', target: 'Kitchen Cooktop', author: 'Neha Gupta', text: 'Should we expand the kitchen size by 2 feet to the west?', time: '30 mins ago' }
  ],

  tasks: [
    { id: 't-1', text: 'Verify Kitchen Cooktop Sector compliance', completed: true },
    { id: 't-2', text: 'Align Entrance orientation coordinates', completed: true },
    { id: 't-3', text: 'Review Vastu Audit remedies suggestions', completed: false },
    { id: 't-4', text: 'Upload sketch backdrop calibration', completed: false }
  ],

  notifications: [
    { id: 'n-1', text: 'Gupta House layout autosaved locally', time: 'Just now', type: 'save' },
    { id: 'n-2', text: 'Vastu Audit compliance score compiled', time: '5 mins ago', type: 'report' },
    { id: 'n-3', text: 'Project shared with Karan Sharma', time: '1 hour ago', type: 'share' }
  ],

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
  setDesignProgress: (designProgress) => set({ designProgress }),

  // Actions mutations
  setShowShareModal: (showShareModal) => set({ showShareModal }),
  setShowNotificationCenter: (showNotificationCenter) => set({ showNotificationCenter }),
  setEditMode: (editMode) => set({ editMode }),
  
  addMember: (m) => set((state) => ({ members: [...state.members, m] })),
  updateMemberRole: (id, role) => set((state) => ({
    members: state.members.map(m => m.id === id ? { ...m, role } : m)
  })),

  addComment: (comment) => set((state) => ({ comments: [comment, ...state.comments] })),
  
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] }))
}))
