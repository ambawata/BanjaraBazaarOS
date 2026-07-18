import { NavLink } from 'react-router-dom'
import './sidebar.css'

// BanjaraBazaarOS shared Sidebar — the real, working component
// shared/ui/ was scaffolded for but never used until this task (see
// docs/PROJECT_STATUS.md discovery audit: shared/ui/ existed as an empty
// .gitkeep-only placeholder, zero apps imported from it).
//
// INTERACTION PATTERN: ported from a direct read of RentProOS's
// (ambawata/RentProOS, local clone at the time of this audit)
// staff-dashboard.html + css/layout.css + css/components.css +
// modules/uiManager.js — NOT guessed at, NOT the generic W3Schools
// tutorial pattern. Specifically:
//   - Default collapsed (icon-rail), not expanded — matches RentProOS's
//     `#sidebar-wrapper { width: var(--sidebar-collapsed-width) }` base
//     state with no `.expanded` class applied on load.
//   - A single `expanded` boolean drives BOTH the desktop rail-width
//     toggle (70px <-> 250px) AND the mobile off-canvas toggle
//     (hidden <-> slide-in) — same as RentProOS reinterpreting one
//     `#wrapper.expanded` class differently per media query, rather than
//     two separate state variables.
//   - Toggle button lives in AppShell's header, not in this component —
//     matches RentProOS's `#menu-toggle` sitting in the top navbar, not
//     inside `#sidebar-wrapper`.
//
// COLORS: BanjaraBazaarOS's own official brand (see tokens.js) — NOT
// RentProOS's colors (#7c3aed/#212529 dark sidebar). Only the
// interaction/structural pattern was ported, per explicit task
// instruction.
//
// DIMENSIONS: matches RentProOS's own rail widths exactly (70px
// collapsed / 250px expanded) — see tokens.js `sidebar` export, kept in
// sync there rather than only here.
//
// LAYOUT TECHNIQUE DIFFERENCE FROM RENTPROOS (deliberate, not a spec
// deviation): RentProOS positions its sidebar with `position:fixed` at
// all times and manually offsets the content area with matching
// `padding-left`, kept in sync by hand. This component instead keeps the
// sidebar as a normal flex child on desktop (`md:relative`) so the
// content area reflows automatically when the width changes — zero
// extra bookkeeping needed in AppShell. On mobile it still switches to
// `fixed` (removed from flow) so it can overlay the content as an
// off-canvas panel, matching RentProOS's mobile behavior exactly. The
// rendered visual result and interaction timing are the same; only the
// underlying CSS mechanism differs, in AppShell's favor.
// BADGE / SECTION-HEADER SUPPORT (added for admin-panel, the second real
// consumer — vastu-griha's own 2-item flat navItems array has neither, so
// both are purely additive and don't change its rendering at all):
//   - A navItems entry with a `section` key (no `to`) renders as a
//     non-interactive group label instead of a NavLink — e.g.
//     `{ section: 'Products' }` — matching admin-panel's pre-existing
//     "Main / Products / Inventory / ..." grouped-menu structure, which a
//     flat 26-item list would otherwise lose entirely.
//   - A NavLink entry may carry `badge` (string|number) + optional
//     `badgeColor` ('red' | 'amber' | 'green', defaults to 'red') for a
//     small pill count — e.g. admin-panel's Approval Queue "7". Hidden
//     when collapsed, same as labels — showing a bare number with no
//     label context on the icon-only rail would be unclear, and the
//     existing collapsed state already fully commits to icon-only.
const badgeColorClasses = {
  red: 'bg-red text-white',
  amber: 'bg-amber text-white',
  green: 'bg-green text-white',
}

export default function Sidebar({
  expanded,
  navItems,
  brandInitials,
  brandName,
  brandSubtitle,
  footerNote,
  onNavigate,
  sidebarRef,
}) {
  return (
    <aside
      ref={sidebarRef}
      // md:!w-[...] (Tailwind's `!` important modifier) rather than plain
      // md:w-[...]: found during testing that the unprefixed `w-64` (the
      // mobile base width) and the `md:w-[70px]`/`md:w-[250px]` responsive
      // overrides have equal CSS specificity, and empirically the media-
      // query rule was NOT reliably winning the cascade in this Tailwind
      // v3 JIT dev build (confirmed via direct stylesheet/cascade
      // inspection, not assumed) — `!` forces the correct, intended
      // override regardless of generated-rule ordering.
      className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col min-h-screen bg-surface border-r border-surface3 shrink-0 overflow-hidden transition-[width,transform] duration-300 ease-in-out w-64 md:translate-x-0 ${
        expanded ? 'translate-x-0 md:!w-[250px]' : '-translate-x-full md:!w-[70px]'
      }`}
    >
      <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-surface3 ${expanded ? '' : 'md:justify-center md:px-0'}`}>
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{brandInitials}</span>
        </div>
        {/* Genuinely unmounted when collapsed — not display:none — per
            the "labels don't render at all" requirement. Always rendered
            on mobile widths (the wrapper is either fully off-screen or
            fully shown there, no icon-only mobile state), so this uses
            expanded directly rather than a "isDesktopCollapsed" split;
            mobile users only ever see this element while expanded=true
            anyway, since expanded=false means translate-x-full (invisible). */}
        {expanded && (
          <div className="sidebar-label-fade min-w-0">
            <p className="text-ink1 text-sm font-semibold leading-none truncate">{brandName}</p>
            {brandSubtitle && <p className="text-ink3 text-xs mt-0.5 truncate">{brandSubtitle}</p>}
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map((item, i) =>
          item.section ? (
            expanded && (
              <div
                key={'section-' + item.section + '-' + i}
                className="sidebar-label-fade px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink3"
              >
                {item.section}
              </div>
            )
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={expanded ? undefined : item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  expanded ? '' : 'md:justify-center'
                } ${
                  isActive
                    ? 'bg-brandDim text-brand font-medium'
                    : 'text-ink2 hover:bg-surface2 hover:text-ink1'
                }`
              }
            >
              <span className="w-4 text-center text-base shrink-0">{item.icon}</span>
              {expanded && <span className="sidebar-label-fade flex-1 truncate">{item.label}</span>}
              {expanded && item.badge != null && (
                <span
                  className={`sidebar-label-fade shrink-0 text-[10px] font-semibold leading-none px-1.5 py-1 rounded-full ${
                    badgeColorClasses[item.badgeColor] || badgeColorClasses.red
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        )}
      </nav>

      {footerNote && expanded && (
        <div className="sidebar-label-fade p-4 border-t border-surface3 text-ink3 text-xs leading-relaxed">
          {/* div, not <p> (was a real bug: footerNote is documented as
              string|node, but a <p> wrapper is invalid HTML for any
              consumer passing block-level children — found while adding
              admin-panel's multi-line GSTIN/admin-name footer). */}
          {footerNote}
        </div>
      )}
    </aside>
  )
}
