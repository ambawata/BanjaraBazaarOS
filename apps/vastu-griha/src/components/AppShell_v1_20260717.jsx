import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar_v1_20260717'
import Toast from './Toast'
import GeometryToolPage from '../pages/GeometryToolPage_v1_20260717'

const titles = {
  '/vastu-griha/geometry-tool': 'Plot Geometry & True North Calibration',
}

export default function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-full bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 bg-surface border-b border-surface3 flex items-center px-6 shrink-0">
          <h1 className="text-ink1 font-semibold text-base">{titles[pathname] || 'Vastu Griha'}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/vastu-griha/geometry-tool" replace />} />
            <Route path="/vastu-griha/geometry-tool" element={<GeometryToolPage />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  )
}
