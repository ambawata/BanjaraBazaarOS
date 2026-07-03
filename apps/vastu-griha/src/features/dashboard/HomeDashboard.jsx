import React from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { colors, typography, spacing, radius, shadows, motion } from '../../ui/design-system'

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

  const isCorrectDirection = ['North', 'East'].includes(placementDirection)
  const recentProjects = [...projects].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5)

  // ── Bottom Nav tabs ──────────────────────────────────────────────────────
  const bottomTabs = [
    { id: 'home', icon: 'ti ti-home-2', label: 'Home' },
    { id: 'designer', icon: 'ti ti-layout-grid-fill', label: 'Design' },
    { id: 'analysis', icon: 'ti ti-chart-bar', label: 'Analyse' },
    { id: 'shop', icon: 'ti ti-shopping-cart', label: 'Shop' },
    { id: 'profile', icon: 'ti ti-user', label: 'Profile' },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: '#faf9f6', color: colors.text, fontFamily: typography.familyBody,
      overflowX: 'hidden',
    }}>

      {/* ── APP BAR ─────────────────────────────────────────────────────── */}
      <div style={{
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
      <div style={{
        flex: 1, overflowY: 'auto', paddingBottom: '80px',
        width: '100%', maxWidth: '480px', margin: '0 auto',
        padding: `clamp(16px, 4vw, 20px)`,
        display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 5vw, 22px)',
        boxSizing: 'border-box',
      }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing[4], marginBottom: '-16px' }}>
          <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{ fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.text2, opacity: 0.9 }}>👋 Namaste, Amit</span>
            <h2 style={{ fontFamily: typography.familyDisplay, fontSize: typography.size['3xl'], fontWeight: typography.weight.extrabold, color: colors.text, marginTop: '6px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
              Let's make your home<br />more <span style={{ color: colors.accent }}>Vastu</span> friendly
            </h2>
            <p style={{ fontSize: typography.size.sm, color: colors.text2, marginTop: '8px', lineHeight: typography.lineHeight.normal }}>
              Get personalized guidance and shop the right products for your home.
            </p>
          </div>
          <div style={{ flex: 0.9, display: 'flex', justifyContent: 'center' }}>
            {/* Armchair illustration */}
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', maxWidth: '220px' }}>
              <defs>
                <radialGradient id="hd-hero-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fffcf5" />
                  <stop offset="70%" stopColor="#fdf6e2" />
                  <stop offset="100%" stopColor="#f7eecf" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="110" cy="100" r="80" fill="url(#hd-hero-grad)" />
              <path d="M150,160 L150,70" stroke="#d7ccc8" strokeWidth="2" strokeLinecap="round" />
              <path d="M140,160 L160,160" stroke="#d7ccc8" strokeWidth="3" strokeLinecap="round" />
              <path d="M138,70 L162,70 L154,54 L146,54 Z" fill="#efebe9" stroke="#d7ccc8" strokeWidth="1" />
              <path d="M150,70 L150,85" stroke="#ffe082" strokeWidth="1.5" />
              <ellipse cx="60" cy="140" rx="20" ry="4" fill="#d7ccc8" />
              <line x1="50" y1="140" x2="45" y2="165" stroke="#8d6e63" strokeWidth="2" />
              <line x1="70" y1="140" x2="75" y2="165" stroke="#8d6e63" strokeWidth="2" />
              <line x1="60" y1="140" x2="60" y2="165" stroke="#8d6e63" strokeWidth="2" />
              <rect x="54" y="124" width="12" height="12" fill="#ffab91" rx="2" />
              <path d="M60,124 Q45,100 38,105 Q35,115 54,124" fill="#4caf50" />
              <path d="M60,124 Q75,100 82,105 Q85,115 66,124" fill="#4caf50" />
              <path d="M60,124 Q60,95 55,95 Q50,105 60,124" fill="#388e3c" />
              <rect x="90" y="90" width="50" height="45" rx="10" fill="#f5f5f0" stroke="#e0e0d1" strokeWidth="1.5" />
              <rect x="84" y="125" width="62" height="20" rx="6" fill="#f5f5f0" stroke="#e0e0d1" strokeWidth="1.5" />
              <rect x="78" y="110" width="12" height="32" rx="4" fill="#e0e0d1" stroke="#d5d5c3" strokeWidth="1.5" />
              <rect x="140" y="110" width="12" height="32" rx="4" fill="#e0e0d1" stroke="#d5d5c3" strokeWidth="1.5" />
              <line x1="94" y1="145" x2="90" y2="165" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="136" y1="145" x2="140" y2="165" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M102,125 Q115,115 128,125 Q128,132 115,130 Q102,132 102,125 Z" fill="#ffe082" stroke="#ffd54f" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* ── 4 ACTION CARDS ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], textAlign: 'left' }}>
          <span style={{ fontSize: '13.5px', fontWeight: typography.weight.bold, color: colors.text }}>What would you like to do today?</span>
          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: spacing[2] }} className="no-scrollbar">

            {/* Card 1 – Have floor plan */}
            <ActionCard
              onClick={() => { setScreenState('workspace'); setActiveTab('upload') }}
              bg="#f3f0ff" border="#e7e2ff"
              icon={<svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
                <rect x="10" y="10" width="80" height="80" rx="10" fill="#fff" stroke="#dcd6ff" strokeWidth="1.5" />
                <rect x="22" y="22" width="25" height="25" fill="none" stroke="#7c6ff7" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x="52" y="22" width="26" height="35" fill="none" stroke="#7c6ff7" strokeWidth="1.5" />
                <rect x="22" y="52" width="25" height="26" fill="none" stroke="#7c6ff7" strokeWidth="1.5" />
                <line x1="34" y1="22" x2="34" y2="47" stroke="#7c6ff7" strokeWidth="1" />
                <line x1="22" y1="34" x2="47" y2="34" stroke="#7c6ff7" strokeWidth="1" />
              </svg>}
              title="I already have a Floor Plan"
              subtitle="Upload your plan and get Vastu analysis"
              titleColor="#312e81" subtitleColor="#6366f1" arrowBg="#7c6ff7"
            />

            {/* Card 2 – No floor plan */}
            <ActionCard
              onClick={() => setScreenState('step_prop')}
              bg="#f0fdf4" border="#dcfce7"
              icon={<svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
                <rect x="10" y="10" width="80" height="80" rx="10" fill="#fff" stroke="#d1fae5" strokeWidth="1.5" />
                <polygon points="25,25 75,25 65,75 35,75" fill="none" stroke="#22c55e" strokeWidth="2" />
                <circle cx="25" cy="25" r="3" fill="#22c55e" />
                <circle cx="75" cy="25" r="3" fill="#22c55e" />
                <circle cx="65" cy="75" r="3" fill="#22c55e" />
                <circle cx="35" cy="75" r="3" fill="#22c55e" />
              </svg>}
              title="I don't have a Floor Plan"
              subtitle="Draw your plot and create the plan"
              titleColor="#064e3b" subtitleColor="#16a34a" arrowBg="#22c55e"
            />

            {/* Card 3 – Place item */}
            <ActionCard
              onClick={() => { const el = document.getElementById('hd-placement-widget'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
              bg="#fffbeb" border="#fef3c7"
              icon={<svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
                <rect x="10" y="10" width="80" height="80" rx="10" fill="#fff" stroke="#fef3c7" strokeWidth="1.5" />
                <ellipse cx="50" cy="45" rx="16" ry="24" fill="none" stroke="#d97706" strokeWidth="2.5" />
                <ellipse cx="50" cy="45" rx="13" ry="21" fill="#fff" stroke="#fbbf24" strokeWidth="1" />
                <line x1="38" y1="80" x2="62" y2="80" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="41" y1="80" x2="46" y2="68" stroke="#d97706" strokeWidth="2" />
                <line x1="59" y1="80" x2="54" y2="68" stroke="#d97706" strokeWidth="2" />
              </svg>}
              title="Place My New Item"
              subtitle="Find the perfect Vastu placement for any item"
              titleColor="#78350f" subtitleColor="#d97706" arrowBg="#d97706"
            />

            {/* Card 4 – Quick check */}
            <ActionCard
              onClick={() => { setScreenState('workspace'); setActiveTab('analysis') }}
              bg="#eff6ff" border="#dbeafe"
              icon={<svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
                <rect x="10" y="10" width="80" height="80" rx="10" fill="#fff" stroke="#dbeafe" strokeWidth="1.5" />
                <path d="M50,22 L75,30 L75,55 Q75,72 50,80 Q25,72 25,55 L25,30 Z" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M42,51 L48,57 L58,44" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
              title="Quick Vastu Check"
              subtitle="Get instant score and top remedies"
              titleColor="#1e3a8a" subtitleColor="#2563eb" arrowBg="#2563eb"
            />
          </div>
        </div>

        {/* ── RECENT ACTIVITY + VASTU SCORE ─────────────────────────────── */}
        <div style={{ display: 'flex', gap: spacing[4], flexWrap: 'wrap', textAlign: 'left', width: '100%' }}>

          {/* Recent Activity */}
          <div style={{ flex: '1 1 min(100%, 240px)', background: '#ffffff', borderRadius: radius['3xl'], border: `1px solid ${colors.border}`, padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[3], boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13.5px', fontWeight: typography.weight.bold, color: colors.text }}>Recent Activity</span>
              <span style={{ fontSize: typography.size.sm, color: colors.accent, fontWeight: typography.weight.semibold, cursor: 'pointer' }}
                onClick={() => { setScreenState('workspace'); setActiveTab('collaborate') }}>View All</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {[
                { text: 'Dining table placement improved', time: 'Today, 10:30 AM', score: '+18 Score' },
                { text: 'Mirror moved to North wall', time: 'Yesterday, 6:45 PM', score: '+12 Score' },
                { text: 'Water fountain added in NE', time: '29 May, 9:15 PM', score: '+15 Score' },
              ].map((act, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.bg3, padding: '8px 12px', borderRadius: radius.base, border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flex: 1 }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: radius.full, background: colors.emeraldDim, color: colors.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-arrow-up" style={{ fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: typography.weight.semibold, color: colors.text }}>{act.text}</span>
                      <span style={{ fontSize: typography.size.xs, color: colors.text3 }}>{act.time}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: typography.size.xs, color: colors.emerald, fontWeight: typography.weight.bold, flexShrink: 0 }}>{act.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vastu Score Gauge */}
          <div style={{ flex: '1 1 min(100%, 160px)', background: '#ffffff', borderRadius: radius['3xl'], border: `1px solid ${colors.border}`, padding: spacing[4], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', marginBottom: spacing[2] }}>
              <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.text2 }}>Your Vastu Score</span>
              <i className="ti ti-info-circle" style={{ fontSize: '12px', color: colors.text3 }} />
            </div>
            <div style={{ position: 'relative', width: '110px', height: '70px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 60" style={{ width: '100px', height: '60px' }}>
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eee" strokeWidth="8" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={colors.emerald} strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="22.6" />
              </svg>
              <div style={{ position: 'absolute', bottom: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: typography.weight.extrabold, color: colors.text }}>82<span style={{ fontSize: typography.size.sm, color: colors.text3 }}>/100</span></span>
                <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.emerald }}>Good</span>
                <span style={{ fontSize: typography.size.xs, color: colors.text3 }}>Keep going!</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── WHERE TO PLACE WIDGET ──────────────────────────────────────── */}
        <div id="hd-placement-widget" style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], background: '#ffffff', border: `1px solid ${colors.border}`, borderRadius: radius['3xl'], padding: '18px', textAlign: 'left', width: '100%' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: typography.weight.bold, color: colors.text }}>Where do you want to place?</h3>
            <div style={{ fontSize: typography.size.sm, marginTop: '4px' }}>Item: <span style={{ fontWeight: typography.weight.semibold }}>Wall Mirror</span></div>
            <div style={{ fontSize: typography.size.sm, marginTop: '2px' }}>Best Directions: <span style={{ color: colors.emerald, fontWeight: typography.weight.bold }}>North, East</span></div>
          </div>

          {/* Direction chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['North', 'East', 'West', 'South'].map(dir => (
              <button key={dir} onClick={() => setPlacementDirection(dir)} style={{
                padding: '6px 14px', borderRadius: '16px', cursor: 'pointer',
                border: placementDirection === dir ? `1px solid ${colors.accent}` : `1px solid ${colors.border2}`,
                background: placementDirection === dir ? colors.accent : 'transparent',
                color: placementDirection === dir ? '#ffffff' : colors.text2,
                fontSize: typography.size.sm, fontWeight: typography.weight.bold,
                transition: motion.transition.base,
              }}>{dir}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
            {/* Wall preview SVG */}
            <div style={{ flex: 1.2, minWidth: '180px' }}>
              <svg viewBox="0 0 320 180" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: radius.lg, background: '#faf9f5', border: `1px solid ${colors.border}` }}>
                <rect width="320" height="180" fill="#faf9f5" />
                <rect y="136" width="320" height="44" fill="#f3efe6" />
                <line x1="0" y1="136" x2="320" y2="136" stroke="#eae4d6" strokeWidth="2" />
                <rect x="15" y="20" width="40" height="116" fill="none" stroke="#ddd7c9" strokeWidth="1.5" />
                <line x1="35" y1="20" x2="35" y2="136" stroke="#ddd7c9" strokeWidth="1.5" />
                <rect x="22" y="30" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />
                <rect x="22" y="65" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />
                <rect x="22" y="100" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />
                <path d="M260,136 Q254,100 258,95 Q262,100 260,136" fill="#a5d6a7" />
                <circle cx="260" cy="136" r="10" fill="#e0d7c6" stroke="#d5cbb6" strokeWidth="1.5" />
                <path d="M260,126 Q250,90 240,90 Q235,95 255,122" fill="#2e7d32" />
                <path d="M260,126 Q270,90 280,90 Q285,95 265,122" fill="#2e7d32" />
                <path d="M260,116 Q250,75 252,70 Q258,75 260,116" fill="#388e3c" />
                <rect x="75" y="102" width="150" height="34" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
                <rect x="85" y="82" width="130" height="20" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
                <rect x="68" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
                <rect x="220" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
                <line x1="84" y1="136" x2="80" y2="152" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" />
                <line x1="216" y1="136" x2="220" y2="152" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" />
                {isCorrectDirection ? (
                  <>
                    <rect x="110" y="24" width="80" height="50" fill="rgba(95, 85, 229, 0.05)" stroke={colors.accent} strokeWidth="2" strokeDasharray="4 4" rx="6" />
                    <line x1="150" y1="24" x2="135" y2="38" stroke={colors.accent} strokeWidth="1.5" />
                    <line x1="150" y1="24" x2="165" y2="38" stroke={colors.accent} strokeWidth="1.5" />
                    <ellipse cx="150" cy="48" rx="14" ry="18" fill="#e0f2f1" stroke="#8d6e63" strokeWidth="2" />
                    <ellipse cx="150" cy="48" rx="12" ry="16" fill="#e0f7fa" />
                    <circle cx="150" cy="24" r="2" fill={colors.accent} />
                    <circle cx="110" cy="24" r="3" fill="#fff" stroke={colors.accent} strokeWidth="1.5" />
                    <circle cx="190" cy="24" r="3" fill="#fff" stroke={colors.accent} strokeWidth="1.5" />
                    <circle cx="110" cy="74" r="3" fill="#fff" stroke={colors.accent} strokeWidth="1.5" />
                    <circle cx="190" cy="74" r="3" fill="#fff" stroke={colors.accent} strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <rect x="110" y="24" width="80" height="50" fill="rgba(239, 68, 68, 0.05)" stroke={colors.red} strokeWidth="2" strokeDasharray="4 4" rx="6" />
                    <text x="150" y="52" fill={colors.red} fontSize="9" fontWeight="bold" textAnchor="middle">Conflict Zone</text>
                  </>
                )}
              </svg>
            </div>

            {/* Product card */}
            <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: spacing[2], background: '#faf9f6', padding: spacing[3], borderRadius: radius.lg, border: `1px solid ${colors.border}`, justifyContent: 'space-between', boxSizing: 'border-box' }}>
              <span style={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.accent, textTransform: 'uppercase' }}>Perfect on this wall!</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" width="40" height="40">
                  <ellipse cx="50" cy="50" rx="20" ry="28" fill="#eae5db" stroke="#8d6e63" strokeWidth="2" />
                  <ellipse cx="50" cy="50" rx="16" ry="24" fill="#ffffff" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.text }}>Wall Mirror (Round)</span>
                <span style={{ fontSize: typography.size.xs, color: colors.text3 }}>Size: 24 inch</span>
                <span style={{ fontSize: '12.5px', fontWeight: typography.weight.bold, color: colors.accent, marginTop: '2px' }}>₹2,499</span>
              </div>
              <div style={{ fontSize: typography.size.xs, color: colors.text2 }}>4.6 ⭐ <span style={{ color: colors.text3 }}>(128)</span></div>
              <button
                onClick={() => { useUiStore.getState().addNotification({ id: Date.now().toString(), text: 'Added Wall Mirror (Round) to cart', time: 'Just now', type: 'shop' }); alert('Added mirror item to Banjara Bazaar cart!') }}
                style={{ width: '100%', padding: '8px', borderRadius: radius.md, fontSize: typography.size.xs, cursor: 'pointer', background: colors.accent, color: '#fff', border: 'none', fontWeight: typography.weight.bold }}
              >Add to Cart</button>
            </div>
          </div>
        </div>

        {/* ── ACHARYA AI BANNER ─────────────────────────────────────────── */}
        <div
          onClick={() => { setScreenState('workspace'); setActiveTab('chat') }}
          style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: radius['3xl'], padding: spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%' }}
        >
          <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center', zIndex: 1, flex: 1.2 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: colors.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-message-chatbot" style={{ fontSize: '20px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: typography.weight.bold, color: '#4c1d95' }}>Talk to Acharya AI</h4>
              <span style={{ fontSize: '10.5px', color: '#7c3aed', marginTop: '2px' }}>Get answers to your Vastu doubts</span>
            </div>
          </div>
          <button style={{ padding: '8px 14px', borderRadius: radius.base, background: '#7c3aed', border: 'none', color: '#fff', zIndex: 1, fontSize: typography.size.xs, fontWeight: typography.weight.bold, cursor: 'pointer' }}>
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

      {/* ── BOTTOM NAVIGATION ─────────────────────────────────────────────── */}
      <nav style={{
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

    </div>
  )
}

// ── ActionCard helper (local, not exported) ──────────────────────────────────
function ActionCard({ onClick, bg, border, icon, title, subtitle, titleColor, subtitleColor, arrowBg }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: '150px', background: bg, border: `1px solid ${border}`,
        borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', minHeight: '210px', cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.15s ease',
      }}
    >
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: titleColor, lineHeight: 1.2 }}>{title}</span>
        <span style={{ fontSize: '10px', color: subtitleColor }}>{subtitle}</span>
      </div>
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: arrowBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
        <i className="ti ti-arrow-right" style={{ fontSize: '12px' }} />
      </div>
    </div>
  )
}
