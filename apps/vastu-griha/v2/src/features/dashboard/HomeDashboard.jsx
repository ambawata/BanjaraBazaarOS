import React from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { colors, typography, spacing, radius, shadows } from '../../ui/design-system'
import { Hero } from '../planner/widgets/home/Hero'
import { ActionCards } from '../planner/widgets/home/ActionCards'
import { RecentActivity } from '../planner/widgets/home/RecentActivity'
import { VastuScoreGauge } from '../planner/widgets/home/VastuScoreGauge'
import { ItemPlacementWidget } from '../planner/widgets/home/ItemPlacementWidget'
import VastuKnowledge from '../planner/widgets/home/VastuKnowledge'

// HomeDashboard – production consumer dashboard
export default function HomeDashboard() {
  const { projects, addProject, setActiveProjectId, loadProjects, setPlot } = useProjectStore()
  const { setScreenState, setActiveTab, isMobile, showNotificationCenter, notifications } = useUiStore()
  const { setRooms } = useCanvasStore()

  const [placementDirection, setPlacementDirection] = React.useState('North')

  React.useEffect(() => { loadProjects() }, [loadProjects])

  // ── Project helpers ──────────────────────────────────────────────────────
  const openProject = (proj) => {
    setActiveProjectId(proj.id)
    setPlot({ width: proj.width, length: proj.length, shape: 'Rectangular', facing: proj.facing, tilt: 0 })
    setRooms(proj.rooms || [])
    localStorage.setItem('vg-layout-project', JSON.stringify({
      plot: { width: proj.width, length: proj.length, shape: 'Rectangular', facing: proj.facing, tilt: 0 },
      rooms: proj.rooms || [],
    }))
    setScreenState('workspace')
    setActiveTab('designer')
  }

  const startNewProject = () => {
    const newProj = {
      id: Date.now().toString(), name: 'Untitled Project', owner: 'Owner', location: '',
      type: 'Villa', facing: 'East', width: 30, length: 40, roomsCount: 0, vastuScore: 0,
      progress: 0, isFavorite: false, isArchived: false, lastEdited: 'Just now', rooms: [],
    }
    addProject(newProj)
    openProject(newProj)
  }

  const recentProjects = [...projects].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5)

  const handleAddToCart = () => {
    useUiStore.getState().addNotification({ id: Date.now().toString(), text: 'Added Wall Mirror (Round) to cart', time: 'Just now', type: 'shop' })
    alert('Added mirror item to Banjara Bazaar cart!')
  }

  // ── Bottom Nav tabs ──────────────────────────────────────────────────────
  const bottomTabs = [
    { id: 'home', icon: 'ti ti-home-2', label: 'Home' },
    { id: 'designer', icon: 'ti ti-layout-grid', label: 'Design' },
    { id: 'analysis', icon: 'ti ti-chart-bar', label: 'Analyse' },
    { id: 'shop', icon: 'ti ti-shopping-cart', label: 'Shop' },
    { id: 'profile', icon: 'ti ti-user', label: 'Profile' },
  ]

  const topNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'designer', label: 'Design' },
    { id: 'analysis', label: 'Analyse' },
    { id: 'shop', label: 'Shop' },
    { id: 'profile', label: 'Profile' },
  ]
  const goToTab = (tabId) => { if (tabId === 'home') return; setScreenState('workspace'); setActiveTab(tabId) }

  return (
    <div className="vg-dashboard-shell" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', overflow: 'hidden',
      background: '#f0f0f0', color: colors.text, fontFamily: typography.familyBody,
    }}>
      <div className="vg-dashboard-card" style={{ // New centered container for app content
        maxWidth: isMobile ? '100%' : '1100px', margin: '0 auto',
        width: '100%',
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        background: '#ffffff', // App content background
        boxShadow: '0 0 20px rgba(0,0,0,0.05)',
        boxSizing: 'border-box',
      }}>
        {/* ── DESKTOP TOP NAVBAR (website-style, hidden on mobile/tablet) ──── */}
        <div className="vg-topnav" style={{
          justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 40px',
          background: '#ffffff', borderBottom: `1.5px solid ${colors.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[6] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="30" stroke={colors.accent} strokeWidth="4.5" />
                <circle cx="50" cy="50" r="16" stroke={colors.accent} strokeWidth="2" strokeDasharray="3 3" />
                <path d="M50,10 L50,90 M10,50 L90,50" stroke={colors.accent} strokeWidth="3.5" />
                <circle cx="50" cy="10" r="4.5" fill={colors.accent} />
                <circle cx="50" cy="90" r="4.5" fill={colors.accent} />
                <circle cx="10" cy="50" r="4.5" fill={colors.accent} />
                <circle cx="90" cy="50" r="4.5" fill={colors.accent} />
                <polygon points="50,26 56,42 50,38 44,42" fill={colors.accent} />
                <polygon points="50,74 56,58 50,62 44,58" fill={colors.accent} opacity="0.6" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                <span style={{ fontFamily: typography.familyDisplay, fontWeight: typography.weight.extrabold, fontSize: '17px', color: colors.accent, letterSpacing: '-0.1px' }}>Vastu Griha</span>
                <span style={{ fontSize: typography.size.xs, color: colors.text2, fontWeight: typography.weight.semibold }}>by Banjara Bazaar</span>
              </div>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: spacing[5] }}>
              {topNavLinks.map(link => (
                <span key={link.id} onClick={() => goToTab(link.id)} style={{
                  cursor: 'pointer', fontSize: typography.size.sm,
                  fontWeight: link.id === 'home' ? typography.weight.bold : typography.weight.medium,
                  color: link.id === 'home' ? colors.accent : colors.text2,
                }}>{link.label}</span>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => useUiStore.getState().setShowNotificationCenter(!showNotificationCenter)}>
              <i className="ti ti-bell" style={{ fontSize: '22px', color: colors.text2 }} />
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px', background: colors.accent,
                color: '#fff', fontSize: '9px', fontWeight: 'bold', width: '15px', height: '15px',
                borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{notifications.length}</span>
            </div>
            <div style={{
              width: '34px', height: '34px', borderRadius: radius.full, background: colors.accentDim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: typography.weight.bold, fontSize: typography.size.sm,
              color: colors.accent, cursor: 'pointer', border: `1.5px solid ${colors.accent}`,
            }}>AM</div>
          </div>
        </div>

        {/* ── MOBILE/TABLET APP BAR ─────────────────────────────────────────── */}
        <div className="vg-app-bar-mobile" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: isMobile ? '14px 18px' : '18px 24px',
          background: '#ffffff', borderBottom: `1.5px solid ${colors.border}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="30" stroke={colors.accent} strokeWidth="4.5" />
              <circle cx="50" cy="50" r="16" stroke={colors.accent} strokeWidth="2" strokeDasharray="3 3" />
              <path d="M50,10 L50,90 M10,50 L90,50" stroke={colors.accent} strokeWidth="3.5" />
              <circle cx="50" cy="10" r="4.5" fill={colors.accent} />
              <circle cx="50" cy="90" r="4.5" fill={colors.accent} />
              <circle cx="10" cy="50" r="4.5" fill={colors.accent} />
              <circle cx="90" cy="50" r="4.5" fill={colors.accent} />
              <polygon points="50,26 56,42 50,38 44,42" fill={colors.accent} />
              <polygon points="50,74 56,58 50,62 44,58" fill={colors.accent} opacity="0.6" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span style={{ fontFamily: typography.familyDisplay, fontWeight: typography.weight.extrabold, fontSize: '17px', color: colors.accent, letterSpacing: '-0.1px' }}>Vastu Griha</span>
              <span style={{ fontSize: typography.size.xs, color: colors.text2, fontWeight: typography.weight.semibold }}>by Banjara Bazaar</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => useUiStore.getState().setShowNotificationCenter(!showNotificationCenter)}>
              <i className="ti ti-bell" style={{ fontSize: '22px', color: colors.text2 }} />
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px', background: colors.accent,
                color: '#fff', fontSize: '9px', fontWeight: 'bold', width: '15px', height: '15px',
                borderRadius: radius.full, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{notifications.length}</span>
            </div>
            <div style={{
              width: '34px', height: '34px', borderRadius: radius.full, background: colors.accentDim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: typography.weight.bold, fontSize: typography.size.sm,
              color: colors.accent, cursor: 'pointer', border: `1.5px solid ${colors.accent}`,
            }}>AM</div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ──────────────────────────────────────────── */}
        <div className="vg-dashboard-content" style={{
          flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          width: '100%',
          padding: `clamp(16px, 4vw, 20px)`,
          paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 5vw, 22px)',
          boxSizing: 'border-box',
        }}>

          <Hero />

          <ActionCards setActiveTab={setActiveTab} setScreenState={setScreenState} />

          <div style={{ display: 'flex', gap: spacing[4], flexWrap: 'wrap', textAlign: 'left', width: '100%' }}>
            <RecentActivity setActiveTab={(tab) => { setScreenState('workspace'); setActiveTab(tab) }} />
            <VastuScoreGauge />
          </div>

          <ItemPlacementWidget
            placementDirection={placementDirection}
            setPlacementDirection={setPlacementDirection}
            onAddToCart={handleAddToCart}
          />

          <VastuKnowledge />

          {/* ── ACHARYA AI BANNER ─────────────────────────────────────────── */}
          <div
            onClick={() => { setScreenState('workspace'); setActiveTab('chat') }}
            style={{ background: '#EEF0F7', border: '1px solid #C7CCE0', borderRadius: radius['3xl'], padding: spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center', zIndex: 1, flex: 1.2 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: '#2B3A67', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="ti ti-message-chatbot" style={{ fontSize: '20px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: typography.weight.bold, color: '#2B3A67' }}>Talk to Acharya AI</h4>
                <span style={{ fontSize: '10.5px', color: '#4A5A8F', marginTop: '2px' }}>Get answers to your Vastu doubts</span>
              </div>
            </div>
            <button style={{ padding: '8px 14px', borderRadius: radius.base, background: '#2B3A67', border: 'none', color: '#fff', zIndex: 1, fontSize: typography.size.xs, fontWeight: typography.weight.bold, cursor: 'pointer' }}>
              Ask Now
            </button>
            {/* Acharya avatar */}
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.85, pointerEvents: 'none', zIndex: 0 }}>
              <svg viewBox="0 0 100 100" width="80" height="80">
                <circle cx="50" cy="50" r="46" fill="rgba(124, 111, 247, 0.05)" />
                <path d="M35,45 Q50,90 65,45" fill="#ffffff" />
                <path d="M42,50 Q50,95 58,50" fill="#f1f5f9" />
                <circle cx="50" cy="40" r="14" fill="#fed7aa" />
                <path d="M32,35 Q50,15 68,35 Q50,22 32,35" fill="#ffffff" />
                <circle cx="46" cy="38" r="1" fill="#000" />
                <circle cx="54" cy="38" r="1" fill="#000" />
                <path d="M47,44 Q50,47 53,44" fill="none" stroke="#000" strokeWidth="0.8" />
                <path d="M30,68 L70,68 L65,95 L35,95 Z" fill="#ea580c" />
              </svg>
            </div>
          </div>

        </div>{/* end scrollable */}

        {/* ── BOTTOM NAVIGATION (mobile/tablet only) ────────────────────────── */}
        <nav className="vg-bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          background: '#ffffff', borderTop: `1.5px solid ${colors.border}`,
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        }}>
          {bottomTabs.map((tab, idx) => {
            const isCenter = idx === 2
            const isActive = tab.id === 'home'
            if (isCenter) return (
              <button key={tab.id}
                onClick={() => { setScreenState('workspace'); setActiveTab('designer') }}
                style={{
                  width: '52px', height: '52px', borderRadius: radius.full,
                  background: colors.accent, color: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: shadows.accent, cursor: 'pointer', marginTop: '-20px',
                }}>
                <i className={tab.icon} style={{ fontSize: '22px' }} />
              </button>
            )
            return (
              <button key={tab.id}
                onClick={() => { if (tab.id === 'home') return; setScreenState('workspace'); setActiveTab(tab.id) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: isActive ? colors.accent : colors.text3, padding: '4px 8px',
                }}>
                <i className={tab.icon} style={{ fontSize: '22px' }} />
                <span style={{ fontSize: '9px', fontWeight: isActive ? typography.weight.bold : typography.weight.medium }}>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div> {/* End new centered container */}
    </div>
  )
}
