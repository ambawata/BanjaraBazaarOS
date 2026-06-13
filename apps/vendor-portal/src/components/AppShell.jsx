import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Toast from './Toast'
import Dashboard from '../pages/Dashboard'
import MyProducts from '../pages/MyProducts'
import AddProduct from '../pages/AddProduct'
import Earnings from '../pages/Earnings'
import DeadStockAlerts from '../pages/DeadStockAlerts'
import Profile from '../pages/Profile'

const titles = {
  '/dashboard':   'Dashboard',
  '/products':    'My Products',
  '/add-product': 'Add Product',
  '/earnings':    'Earnings',
  '/deadstock':   'Dead Stock Alerts',
  '/profile':     'Profile',
}

export default function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-full bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-surface border-b border-surface3 flex items-center px-6 shrink-0">
          <h1 className="text-ink1 font-semibold text-base">{titles[pathname] || 'Vendor Portal'}</h1>
        </header>
        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/products"    element={<MyProducts />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/earnings"    element={<Earnings />} />
            <Route path="/deadstock"   element={<DeadStockAlerts />} />
            <Route path="/profile"     element={<Profile />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  )
}
