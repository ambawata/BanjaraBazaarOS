import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@shared/ui'
import { useStore } from './store/useStore'
import Toast from './components/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyProducts from './pages/MyProducts'
import AddProduct from './pages/AddProduct'
import Earnings from './pages/Earnings'
import DeadStockAlerts from './pages/DeadStockAlerts'
import Profile from './pages/Profile'

// Migrated to the shared shared/ui/ AppShell+Sidebar (PR #5, same pattern
// admin-panel used in PR #7) — replaces the local components/AppShell.jsx
// + components/Sidebar.jsx (deleted, nothing else referenced them). Unlike
// admin-panel's 26-item/9-section/4-badge nav, this app's 6 flat items with
// no sections and no badges need none of the extensions added for
// admin-panel — this is closer to vastu-griha's own simple case.
const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/products', label: 'My Products', icon: '⬡' },
  { to: '/add-product', label: 'Add Product', icon: '+' },
  { to: '/earnings', label: 'Earnings', icon: '₹' },
  { to: '/deadstock', label: 'Dead Stock Alerts', icon: '⚠' },
  { to: '/profile', label: 'Profile', icon: '◎' },
]

const titles = {
  '/dashboard': 'Dashboard',
  '/products': 'My Products',
  '/add-product': 'Add Product',
  '/earnings': 'Earnings',
  '/deadstock': 'Dead Stock Alerts',
  '/profile': 'Profile',
}

export default function App() {
  const vendor = useStore(s => s.vendor)
  const logout = useStore(s => s.logout)

  // Toast was only ever mounted inside the authenticated shell (the old
  // components/AppShell.jsx rendered it as a sibling of Sidebar+content) —
  // Login has no toasts of its own, matches that exactly.
  if (!vendor) return <Login />

  return (
    <>
      <AppShell
        navItems={navItems}
        brandInitials="BB"
        // Old sidebar showed two separate things: a static "Vendor Portal"
        // app label with the vendor's id as a small mono subtitle, AND a
        // separate business-name line below it. The shared brand block only
        // has room for two lines, so business name (the more useful,
        // personalized info) takes the primary line and "Vendor Portal"
        // becomes the subtitle — the vendor's id (e.g. "BB-A-0042") is
        // dropped from the sidebar chrome, a minor disclosed simplification
        // (purely decorative, nothing reads it back out of the sidebar).
        brandName={vendor.businessName}
        brandSubtitle="Vendor Portal"
        titles={titles}
        defaultTitle="Vendor Portal"
        footerNote={
          <button
            onClick={logout}
            className="flex items-center gap-2 text-ink2 hover:text-red transition-colors"
          >
            <span className="w-4 text-center">⏻</span> Sign out
          </button>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<MyProducts />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/deadstock" element={<DeadStockAlerts />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AppShell>
      <Toast />
    </>
  )
}
