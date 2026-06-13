import { useStore } from '../../store/useStore'
import { IconBell } from '@tabler/icons-react'

const titles = {
  '/dashboard': 'Dashboard',
  '/approvals': 'Approval Queue',
  '/deadstock': 'Dead Stock',
  '/settlements': 'Settlements',
  '/vendors': 'Vendors',
  '/inventory': 'Inventory',
  '/audit': 'Audit Logs',
}

export default function Topbar({ path }) {
  const user = useStore(s => s.user)
  const title = titles[path] || 'Admin Panel'

  return (
    <header className="h-14 bg-surface border-b border-surface3 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-ink1 font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 text-ink2 hover:text-ink1 transition-colors">
          <IconBell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brandDim flex items-center justify-center">
            <span className="text-brand text-xs font-semibold">{user?.name?.[0] || 'A'}</span>
          </div>
          <span className="text-ink2 text-sm">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
