import React, { useEffect } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { colors, typography, spacing, radius, shadows } from '../../ui/design-system'

// HomeDashboard – consumer‑first dashboard UI
export default function HomeDashboard() {
  const {
    projects,
    addProject,
    setActiveProjectId,
    loadProjects,
    setPlot,
    setRooms,
  } = useProjectStore()

  const { setScreenState, setActiveTab, isMobile } = useUiStore()
  const { setRooms: setCanvasRooms } = useCanvasStore()

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Helper: open a project and navigate to workspace
  const openProject = (proj) => {
    setActiveProjectId(proj.id)
    setPlot({
      width: proj.width,
      length: proj.length,
      shape: 'Rectangular',
      facing: proj.facing,
      tilt: 0,
    })
    setCanvasRooms(proj.rooms || [])
    // Persist for refresh
    localStorage.setItem('vg-layout-project', JSON.stringify({
      plot: {
        width: proj.width,
        length: proj.length,
        shape: 'Rectangular',
        facing: proj.facing,
        tilt: 0,
      },
      rooms: proj.rooms || [],
    }))
    setScreenState('workspace')
    setActiveTab('designer')
  }

  // Start New Project – creates a fresh project and opens it
  const startNewProject = () => {
    const newProj = {
      id: Date.now().toString(),
      name: 'Untitled Project',
      owner: 'Owner',
      location: '',
      type: 'Villa',
      facing: 'East',
      width: 30,
      length: 40,
      roomsCount: 0,
      vastuScore: 0,
      progress: 0,
      isFavorite: false,
      isArchived: false,
      lastEdited: 'Just now',
      rooms: [],
    }
    addProject(newProj)
    openProject(newProj)
  }

  // Continue Last Project – most recently edited project
  const continueLastProject = () => {
    if (!projects.length) return
    const last = [...projects].sort((a, b) => {
      // Simple fallback sorting by numeric id (timestamp)
      return Number(b.id) - Number(a.id)
    })[0]
    openProject(last)
  }

  // Quick actions – placeholder alerts
  const quickAction = (name) => {
    alert(`${name} action not implemented yet`)
  }

  // Recent projects – horizontal scroll (latest 5)
  const recentProjects = [...projects]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: typography.familyBody,
    }}>
      {/* Top Header */}
      <header style={{
        padding: `${spacing[4]} ${spacing[6]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <img src="/logo.svg" alt="Vastu Griha" style={{ height: '32px' }} />
          <span style={{ fontSize: typography.size.xl, fontWeight: typography.weight.semibold }}>Vastu Griha</span>
        </div>
        <div style={{ fontSize: typography.size.md }}>Hi, User</div>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: radius.full,
          background: colors.accentDim,
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: typography.weight.bold,
        }}>
          U
        </div>
      </header>

      {/* Hero Card */}
      <section style={{
        margin: spacing[6],
        padding: spacing.cardPadLg,
        background: colors.bg2,
        borderRadius: radius['2xl'],
        boxShadow: shadows.base,
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: typography.size['3xl'], fontWeight: typography.weight.extrabold, marginBottom: spacing[3] }}>
          Design your Vastu‑perfect home
        </h1>
        <p style={{ fontSize: typography.size.md, marginBottom: spacing[5], color: colors.text2 }}>
          Analyze layouts, align energies, and get actionable remedies.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.gapLg }}>
          <button
            onClick={startNewProject}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              background: colors.accent,
              color: colors.white,
              border: 'none',
              borderRadius: radius.base,
              fontSize: typography.size.md,
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
          >
            Start New Project
          </button>
          <button
            onClick={continueLastProject}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              background: colors.bg3,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.base,
              fontSize: typography.size.md,
              cursor: 'pointer',
            }}
          >
            Continue Last Project
          </button>
        </div>
      </section>

      {/* AI Acharya Card */}
      <section style={{
        margin: `0 ${spacing[6]} ${spacing[6]}`,
        padding: spacing.cardPad,
        background: colors.bg2,
        borderRadius: radius.xl,
        boxShadow: shadows.base,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.gapLg,
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: typography.size.xl, fontWeight: typography.weight.semibold }}>AI Acharya</h2>
          <p style={{ margin: `${spacing[2]} 0`, fontSize: typography.size.base, color: colors.text2 }}>
            Get AI‑driven Vastu recommendations and guidance.
          </p>
        </div>
        <button
          onClick={() => quickAction('AI Acharya')}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: colors.accent,
            color: colors.white,
            border: 'none',
            borderRadius: radius.md,
            cursor: 'pointer',
          }}
        >
          Continue with AI
        </button>
      </section>

      {/* Quick Actions */}
      <section style={{
        margin: `0 ${spacing[6]} ${spacing[6]}`,
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: spacing.gap,
      }}>
        {['Upload Floor Plan', 'Draw Plot', 'AI Generate Layout', 'Check Existing Home'].map((label) => (
          <button
            key={label}
            onClick={() => quickAction(label)}
            style={{
              padding: spacing[3],
              background: colors.bg3,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.base,
              fontSize: typography.size.base,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Recent Projects – horizontal scroll */}
      <section style={{ margin: `0 ${spacing[6]} ${spacing[6]}` }}>
        <h3 style={{ fontSize: typography.size.lg, marginBottom: spacing[2] }}>Recent Projects</h3>
        <div style={{ display: 'flex', overflowX: 'auto', gap: spacing.gap, paddingBottom: spacing[2] }}>
          {recentProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => openProject(p)}
              style={{
                minWidth: '140px',
                background: colors.bg2,
                borderRadius: radius.lg,
                border: `1px solid ${colors.border}`,
                padding: spacing[3],
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{ height: '80px', background: colors.bg3, marginBottom: spacing[2] }} />
              <strong style={{ fontSize: typography.size.base, display: 'block', color: colors.text }}>{p.name}</strong>
              <span style={{ fontSize: typography.size.xs, color: colors.text2 }}>{p.width}' x {p.length}'</span>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Cards */}
      <section style={{ margin: `0 ${spacing[6]} ${spacing[6]}` }}>
        <h3 style={{ fontSize: typography.size.lg, marginBottom: spacing[2] }}>Learning</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: spacing.gap }}>
          <div style={{ padding: spacing[4], background: colors.bg2, borderRadius: radius.xl, boxShadow: shadows.base }}>
            <h4 style={{ margin: 0, fontSize: typography.size.md }}>Vastu Tips</h4>
            <p style={{ fontSize: typography.size.sm, color: colors.text2 }}>Quick tips to improve energy flow in your home.</p>
          </div>
          <div style={{ padding: spacing[4], background: colors.bg2, borderRadius: radius.xl, boxShadow: shadows.base }}>
            <h4 style={{ margin: 0, fontSize: typography.size.md }}>What's New</h4>
            <p style={{ fontSize: typography.size.sm, color: colors.text2 }}>Latest features and updates.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
