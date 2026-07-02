import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  gridSize: 8,
  snapToGrid: true,
  autosaveInterval: 1500,
  wallThicknessExternal: 9,
  wallThicknessInternal: 4.5,

  setGridSize: (gridSize) => set({ gridSize }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setAutosaveInterval: (autosaveInterval) => set({ autosaveInterval }),
  setWallThicknessExternal: (wallThicknessExternal) => set({ wallThicknessExternal }),
  setWallThicknessInternal: (wallThicknessInternal) => set({ wallThicknessInternal })
}))
