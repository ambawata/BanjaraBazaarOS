import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@shared/ui'
import Toast from './components/Toast'
import GeometryToolPage from './pages/GeometryToolPage_v1_20260717'
import VerdictReportPage from './pages/VerdictReportPage'
import MyHomeWizardPage from './pages/MyHomeWizardPage'

// First real consumer of shared/ui/'s AppShell + Sidebar — previously an
// empty .gitkeep scaffold (see docs/PROJECT_STATUS.md discovery audit).
// This replaces the app-local AppShell_v1_20260717.jsx /
// Sidebar_v1_20260717.jsx (deleted as part of this migration, not left
// behind as dead code — nothing else referenced them).
const navItems = [
  { to: '/vastu-griha/my-home', label: 'Mera Ghar (Easy Mode)', icon: '🏠' },
  { to: '/vastu-griha/geometry-tool', label: 'Plot Geometry & Calibration', icon: '⧉' },
]

const titles = {
  '/vastu-griha/geometry-tool': 'Plot Geometry & True North Calibration',
  '/vastu-griha/verdict-report': 'Vastu Verdict Report',
  '/vastu-griha/my-home': 'Mera Ghar',
}

export default function App() {
  return (
    <>
      <AppShell
        navItems={navItems}
        brandInitials="VG"
        brandName="Vastu Griha"
        brandSubtitle="Geometry Tools"
        titles={titles}
        defaultTitle="Vastu Griha"
        footerNote="Geometry layer only — no Vastu verdicts, severity, or remedies are shown here."
        fullBleedPaths={['/vastu-griha/my-home']}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/vastu-griha/geometry-tool" replace />} />
          <Route path="/vastu-griha/geometry-tool" element={<GeometryToolPage />} />
          <Route path="/vastu-griha/verdict-report" element={<VerdictReportPage />} />
          <Route path="/vastu-griha/my-home" element={<MyHomeWizardPage />} />
        </Routes>
      </AppShell>
      {/* Kept as a true top-level sibling, not nested inside AppShell's
          children slot — matches the original render-tree structure
          exactly (Toast was a sibling of the Sidebar+content wrapper
          before this migration), avoiding any risk from `position:fixed`
          interacting with an ancestor's stacking/containing-block
          context. */}
      <Toast />
    </>
  )
}
