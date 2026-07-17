import { NavLink } from 'react-router-dom'

// Single nav entry for this additive module. This sidebar is local to the
// new apps/vastu-griha app — it does not touch nav/routing in any existing
// app, so the existing customer-facing Vastu Griha shopping pages (once
// built) are entirely unaffected.
const nav = [
  { to: '/vastu-griha/my-home', label: 'Mera Ghar (Easy Mode)', icon: '🏠' },
  { to: '/vastu-griha/geometry-tool', label: 'Plot Geometry & Calibration', icon: '⧉' },
]

// MOBILE FIX: this sidebar used to be a permanently-visible fixed-width
// (w-64 = 256px) column with no responsive behavior at all — on a real
// phone viewport (e.g. 375px wide) it consumed most of the screen,
// leaving barely 100px for actual page content (discovered while taking
// mobile screenshots of the My Home wizard). Below the `md` breakpoint it
// now renders as a slide-in drawer (off-canvas by default, toggled via
// the hamburger button added to AppShell's header) with a tap-outside
// backdrop to close; at `md` and above it behaves exactly as before
// (permanently visible, static, non-overlay). This is shared shell
// behavior — it improves every page (including geometry-tool and
// verdict-report) without changing any of their actual content/logic.
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen bg-surface border-r border-surface3 shrink-0 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white text-xs font-bold">VG</span>
          </div>
          <div>
            <p className="text-ink1 text-sm font-semibold leading-none">Vastu Griha</p>
            <p className="text-ink3 text-xs mt-0.5">Geometry Tools</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
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

        <div className="p-4 border-t border-surface3">
          <p className="text-ink3 text-xs leading-relaxed">
            Geometry layer only — no Vastu verdicts, severity, or remedies are
            shown here.
          </p>
        </div>
      </aside>
    </>
  )
}
