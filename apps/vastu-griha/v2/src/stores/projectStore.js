import { create } from 'zustand'

export const useProjectStore = create((set, get) => ({
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
    tilt: 0,
    northWall: 30,
    southWall: 30,
    eastWall: 40,
    westWall: 40,
    // Arbitrary polygon override for a genuinely irregular (zig-zag, 5+
    // sided) plot — an array of {x, y} in 0-100% plot space, edited via
    // PlotBoundaryDrawer. null means "no custom boundary yet", so Canvas
    // keeps deriving a rectangle/trapezoid from the wall lengths above,
    // same as before this field existed.
    boundaryPoints: null
  },

  // Project List Lifecycle States
  activeProjectId: null,
  projects: [
    {
      id: 'gupta',
      name: 'Gupta House',
      owner: 'Amit Gupta',
      location: 'South Delhi, India',
      type: 'Villa',
      facing: 'East',
      width: 30,
      length: 40,
      roomsCount: 5,
      vastuScore: 92,
      progress: 68,
      isFavorite: true,
      isArchived: false,
      lastEdited: 'Today, 10:30 AM',
      rooms: [
        { id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 80, y: 5, width: 15, height: 8 },
        { id: 'r2', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 15, width: 20, height: 15 },
        { id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 75, y: 70, width: 20, height: 20 },
        { id: 'r4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 70, width: 35, height: 25 },
        { id: 'r5', type: 'living', label: 'Living Room Lounge', x: 30, y: 25, width: 40, height: 35 }
      ]
    },
    {
      id: 'sharma',
      name: 'Sharma Villa',
      owner: 'Karan Sharma',
      location: 'Noida, Sector 62',
      type: 'Independent House',
      facing: 'North',
      width: 60,
      length: 90,
      roomsCount: 4,
      vastuScore: 84,
      progress: 42,
      isFavorite: false,
      isArchived: false,
      lastEdited: 'Yesterday, 7:45 PM',
      rooms: [
        { id: 'r1', type: 'entrance', label: 'Main Entrance Gate', x: 45, y: 5, width: 15, height: 8 },
        { id: 'r2', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 30, height: 25 },
        { id: 'r3', type: 'kitchen', label: 'Kitchen Cooktop', x: 65, y: 65, width: 25, height: 25 },
        { id: 'r4', type: 'pooja', label: 'Pooja Room', x: 75, y: 10, width: 20, height: 20 }
      ]
    }
  ],

  // Recent Activity Timeline Log
  activities: [
    { id: 'act-1', text: 'Created Gupta House project', time: 'Today, 10:15 AM' },
    { id: 'act-2', text: 'Calibrated East Facing grid on Gupta House', time: 'Today, 10:28 AM' },
    { id: 'act-3', text: 'Opened Sharma Villa layout blueprint', time: 'Yesterday, 7:40 PM' }
  ],

  setOnboarding: (onboarding) => set({ onboarding }),
  setPlot: (plot) => {
    const w = plot.width ?? 30;
    const l = plot.length ?? 40;
    const updated = {
      ...plot,
      northWall: plot.northWall ?? w,
      southWall: plot.southWall ?? w,
      eastWall: plot.eastWall ?? l,
      westWall: plot.westWall ?? l
    };
    set({ plot: updated });
  },
  updateOnboardingField: (field, value) => set((state) => ({
    onboarding: { ...state.onboarding, [field]: value }
  })),
  updatePlotField: (field, value) => set((state) => {
    const nextPlot = { ...state.plot, [field]: value };
    // Synchronize individual walls if changing global width/length
    if (field === 'width') {
      nextPlot.northWall = value;
      nextPlot.southWall = value;
    } else if (field === 'length') {
      nextPlot.eastWall = value;
      nextPlot.westWall = value;
    }
    // Synchronize global bounding dimensions if changing individual walls
    if (field === 'northWall' || field === 'southWall') {
      nextPlot.width = Math.max(nextPlot.northWall, nextPlot.southWall);
    } else if (field === 'eastWall' || field === 'westWall') {
      nextPlot.length = Math.max(nextPlot.eastWall, nextPlot.westWall);
    }
    return { plot: nextPlot };
  }),

  // Project Actions
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  
  loadProjects: () => {
    const data = localStorage.getItem('vg-projects-list')
    if (data) {
      try {
        set({ projects: JSON.parse(data) })
      } catch (e) {
        console.error('Failed to parse saved projects:', e)
      }
    }
  },

  saveProjects: () => {
    const list = get().projects
    localStorage.setItem('vg-projects-list', JSON.stringify(list))
  },

  addProject: (p) => {
    const list = [p, ...get().projects]
    const logs = [{ id: Date.now().toString(), text: `Created ${p.name} layout`, time: 'Just now' }, ...get().activities]
    set({ projects: list, activities: logs })
    get().saveProjects()
  },

  deleteProject: (id) => {
    const target = get().projects.find(p => p.id === id)
    const list = get().projects.filter(p => p.id !== id)
    const logs = [{ id: Date.now().toString(), text: `Deleted ${target ? target.name : 'project'}`, time: 'Just now' }, ...get().activities]
    set({ projects: list, activities: logs })
    get().saveProjects()
  },

  archiveProject: (id) => {
    const list = get().projects.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p)
    const target = get().projects.find(p => p.id === id)
    const text = target?.isArchived ? `Unarchived ${target.name}` : `Archived ${target?.name}`
    const logs = [{ id: Date.now().toString(), text, time: 'Just now' }, ...get().activities]
    set({ projects: list, activities: logs })
    get().saveProjects()
  },

  toggleFavoriteProject: (id) => {
    const list = get().projects.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    set({ projects: list })
    get().saveProjects()
  },

  renameProject: (id, name) => {
    const list = get().projects.map(p => p.id === id ? { ...p, name } : p)
    set({ projects: list })
    get().saveProjects()
  },

  duplicateProject: (id) => {
    const source = get().projects.find(p => p.id === id)
    if (!source) return
    const clone = {
      ...source,
      id: Date.now().toString(),
      name: `${source.name} (Copy)`,
      isFavorite: false,
      lastEdited: 'Just now'
    }
    const list = [clone, ...get().projects]
    const logs = [{ id: Date.now().toString(), text: `Duplicated ${source.name}`, time: 'Just now' }, ...get().activities]
    set({ projects: list, activities: logs })
    get().saveProjects()
  }
}))
