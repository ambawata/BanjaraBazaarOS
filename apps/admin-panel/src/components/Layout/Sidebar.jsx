import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard, IconClock, IconPackageOff, IconCoinRupee,
  IconBuilding, IconBox, IconShield, IconLogout
} from '@tabler/icons-react'
import { useStore } from '../../store/useStore'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/approvals', label: 'Approval Queue', icon: IconClock },
  { to: '/deadstock', label: 'Dead Stock', icon: IconPackageOff },
  { to: '/settlements', label: 'Settlements', icon: IconCoinRupee },
  { to: '/vendors', label: 'Vendors', icon: IconBuilding },
  { to: '/inventory', label: 'Inventory', icon: IconBox },
  { to: '/audit', label: 'Audit Logs', icon: IconShield },
]

export default function Sidebar() {
  const logout = useStore(s => s.logout)

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-surface border-r border-surface3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface3">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <span className="text-white text-xs font-bold">BB</span>
        </div>
        <div>
          <p className="text-ink1 text-sm font-semibold leading-none">BanjaraBazaar</p>
          <p className="text-ink3 text-xs mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
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
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-surface3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ink2 hover:bg-redDim hover:text-red transition-colors"
        >
          <IconLogout size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
