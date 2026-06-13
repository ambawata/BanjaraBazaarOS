import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

const nav = [
  { to: '/dashboard',  label: 'Dashboard',         icon: '⊞' },
  { to: '/products',   label: 'My Products',        icon: '⬡' },
  { to: '/add-product',label: 'Add Product',        icon: '+' },
  { to: '/earnings',   label: 'Earnings',           icon: '₹' },
  { to: '/deadstock',  label: 'Dead Stock Alerts',  icon: '⚠' },
  { to: '/profile',    label: 'Profile',            icon: '◎' },
]

export default function Sidebar() {
  const { vendor, logout } = useStore()

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-surface border-r border-surface3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface3">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <span className="text-white text-xs font-bold">BB</span>
        </div>
        <div>
          <p className="text-ink1 text-sm font-semibold leading-none">Vendor Portal</p>
          <p className="text-ink3 text-xs mt-0.5 font-mono">{vendor?.id}</p>
        </div>
      </div>

      {/* Vendor name */}
      <div className="px-5 py-3 border-b border-surface3">
        <p className="text-ink1 text-xs font-semibold truncate">{vendor?.businessName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brandDim text-brand font-medium'
                  : 'text-ink2 hover:bg-surface2 hover:text-ink1'
              }`
            }
          >
            <span className="w-4 text-center text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t border-surface3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ink2 hover:bg-redDim hover:text-red transition-colors"
        >
          <span className="w-4 text-center">⏻</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
