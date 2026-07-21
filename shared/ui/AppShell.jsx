import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import './blueprint.css'

// BanjaraBazaarOS shared AppShell — composes the shared Sidebar with a
// header (hamburger toggle + page title) and a main content slot. See
// Sidebar.jsx's docblock for the full RentProOS-pattern-vs-BanjaraBazaarOS
// -colors rationale; this file owns the actual `expanded` state and the
// two RentProOS behaviors that live at the wrapper/toggle level rather
// than inside the sidebar itself:
//   - click-outside-to-close (RentProOS's uiManager.js applies this at
//     ANY viewport width whenever expanded, not mobile-only — confirmed
//     by reading its actual document-click handler, no breakpoint guard
//     present — replicated identically here)
//   - the toggle button living in the top bar, not the sidebar
//
// DEVIATION FLAGGED (per task instruction to flag rather than silently
// decide): RentProOS resets to collapsed on every reload (no persistence)
// and this component matches that exactly — `expanded` starts `false`
// with no localStorage read. Not changed here; flagging only that this
// was a deliberate choice to match spec, not an oversight, in case
// persistence is wanted later.
//
// PROPS (the reusable contract other apps will follow):
//   navItems      [{ to, label, icon, badge?, badgeColor? } |
//                  { section }]                required — see Sidebar.jsx's
//                                               own docblock for the
//                                               section-header / badge
//                                               entry shapes (added for
//                                               admin-panel, additive,
//                                               vastu-griha's flat 2-item
//                                               array is unaffected)
//   brandInitials string (e.g. "VG")         required
//   brandName     string                     required
//   brandSubtitle string                     optional
//   titles        { [pathname]: string }     optional, header heading per route
//   defaultTitle  string                     optional, fallback heading
//   footerNote    string|node                optional, sidebar footer text
//   fullBleedPaths list<string>              optional, paths that skip the
//                                             default `p-6` main padding
//                                             (e.g. a page with its own
//                                             edge-to-edge map/canvas)
//   headerActions node                       optional, right-aligned extra
//                                             controls in the header next to
//                                             the page title (e.g.
//                                             admin-panel's notification
//                                             bell / Backup / Sync buttons)
//                                             — added for admin-panel,
//                                             renders nothing when omitted
//   children      node                       the routed page content
export default function AppShell({
  navItems,
  brandInitials,
  brandName,
  brandSubtitle,
  titles = {},
  defaultTitle = brandName,
  footerNote,
  fullBleedPaths = [],
  headerActions,
  children,
}) {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const sidebarRef = useRef(null)
  const toggleRef = useRef(null)

  const isFullBleed = fullBleedPaths.includes(pathname)

  // Click-outside-to-close — matches RentProOS's document-level listener
  // exactly (no viewport guard; applies whenever expanded, any width).
  useEffect(() => {
    function handleDocumentClick(e) {
      if (
        expanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setExpanded(false)
      }
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [expanded])

  // Auto-collapse on shrinking below the mobile breakpoint while
  // expanded — direct port of RentProOS's collapseSidebarOnMobile().
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768 && expanded) {
        // Intentionally NOT collapsing here: on mobile, expanded=true is
        // what makes the drawer visible at all. Collapsing on every
        // resize tick below 768 would slam the drawer shut mid-transition
        // whenever a desktop window is narrowed, which is exactly the
        // "already-expanded desktop rail becoming a phantom-open mobile
        // drawer" case RentProOS's own function guards against — but
        // RentProOS's collapse target there is its *desktop* expanded
        // state bleeding into mobile, not the mobile drawer itself. This
        // component's single boolean already means "expanded" maps
        // correctly to each breakpoint's own correct visual state without
        // needing a forced reset, so no action is taken. Documented here
        // rather than silently omitted, since RentProOS does have an
        // explicit function for this.
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [expanded])

  return (
    <div className="flex h-full bg-bg bg-blueprint">
      <Sidebar
        sidebarRef={sidebarRef}
        expanded={expanded}
        navItems={navItems}
        brandInitials={brandInitials}
        brandName={brandName}
        brandSubtitle={brandSubtitle}
        footerNote={footerNote}
        onNavigate={() => {
          // Matches the pre-existing vastu-griha behavior: navigating
          // dismisses the mobile drawer. On desktop this also collapses
          // the rail back to icon-only after navigating, matching
          // RentProOS's own nav-link click behavior (its sidebarLinks
          // click handler calls the same collapse path).
          setExpanded(false)
        }}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 bg-surface border-b border-surface3 flex items-center gap-3 px-4 md:px-6 shrink-0">
          <button
            ref={toggleRef}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(v => !v)
            }}
            aria-label="Menu"
            aria-expanded={expanded}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-ink1 text-xl hover:bg-surface2 shrink-0"
          >
            ☰
          </button>
          <h1 className="text-ink1 font-display font-semibold text-lg truncate">{titles[pathname] || defaultTitle}</h1>
          {headerActions && <div className="ml-auto flex items-center gap-2 shrink-0">{headerActions}</div>}
        </header>

        <main className={`flex-1 overflow-y-auto ${isFullBleed ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>

      {/* Mobile backdrop — click-outside-to-close's visual affordance.
          The document-click handler above already handles the actual
          close logic; this overlay is purely the dimmed-background cue,
          matching the pre-existing vastu-griha drawer's backdrop. */}
      {expanded && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" aria-hidden="true" />
      )}
    </div>
  )
}
