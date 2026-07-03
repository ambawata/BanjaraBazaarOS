import React, { useState, useEffect } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useCanvasStore } from '../../stores/canvasStore'

export default function ProjectDashboard() {
  const {
    projects,
    activities,
    addProject,
    deleteProject,
    archiveProject,
    toggleFavoriteProject,
    renameProject,
    duplicateProject,
    setActiveProjectId,
    loadProjects,
    setPlot
  } = useProjectStore()

  const { setScreenState, setActiveTab, isMobile } = useUiStore()
  const { setRooms } = useCanvasStore()

  // State hooks for dashboard filters
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'favorites' | 'archived'
  const [sortBy, setSortBy] = useState('edited') // 'edited' | 'name' | 'score'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(null) // projectId to rename
  const [newNameText, setNewNameText] = useState('')

  // Form states for new project
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    location: '',
    type: 'Villa',
    width: '30',
    length: '40',
    facing: 'East'
  })

  // Load from LocalStorage on mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Create project submission
  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newProj = {
      id: Date.now().toString(),
      name: formData.name,
      owner: formData.owner || 'Owner User',
      location: formData.location || 'Local Address',
      type: formData.type,
      facing: formData.facing,
      width: parseInt(formData.width) || 30,
      length: parseInt(formData.length) || 40,
      roomsCount: 0,
      vastuScore: 0,
      progress: 0,
      isFavorite: false,
      isArchived: false,
      lastEdited: 'Just now',
      rooms: []
    }

    addProject(newProj)
    setShowCreateModal(false)

    // Reset form
    setFormData({
      name: '',
      owner: '',
      location: '',
      type: 'Villa',
      width: '30',
      length: '40',
      facing: 'East'
    })

    // Open project instantly
    handleOpenProject(newProj)
  }

  // Open Project & load states to canvas
  const handleOpenProject = (p) => {
    setActiveProjectId(p.id)
    setPlot({
      width: p.width,
      length: p.length,
      shape: 'Rectangular',
      facing: p.facing,
      tilt: 0
    })
    setRooms(p.rooms || [])
    
    // Save in workspace autosave key so refresh holds it
    localStorage.setItem('vg-layout-project', JSON.stringify({
      rooms: p.rooms || [],
      plot: {
        width: p.width,
        length: p.length,
        shape: 'Rectangular',
        facing: p.facing,
        tilt: 0
      }
    }))

    setScreenState('workspace')
    setActiveTab('designer')
  }

  // Create from quick template
  const handleCreateFromTemplate = (templateName, w, l, facing) => {
    const proj = {
      id: Date.now().toString(),
      name: `My ${templateName}`,
      owner: 'Owner User',
      location: 'Custom Address',
      type: templateName,
      facing,
      width: w,
      length: l,
      roomsCount: 0,
      vastuScore: 0,
      progress: 0,
      isFavorite: false,
      isArchived: false,
      lastEdited: 'Just now',
      rooms: []
    }
    addProject(proj)
    handleOpenProject(proj)
  }

  // Filtered & Sorted projects list
  const getProcessedProjects = () => {
    let result = [...projects]

    // 1. Search query
    if (searchTerm.trim()) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // 2. Filter states
    if (activeFilter === 'favorites') {
      result = result.filter(p => p.isFavorite && !p.isArchived)
    } else if (activeFilter === 'archived') {
      result = result.filter(p => p.isArchived)
    } else {
      result = result.filter(p => !p.isArchived)
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'score') {
        return (b.vastuScore || 0) - (a.vastuScore || 0)
      }
      // default: last edited (we just sort by string comparison or keep list ordering)
      return 0
    })

    return result
  }

  const processedList = getProcessedProjects()

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowY: 'auto', paddingBottom: '70px', fontFamily: "'Outfit', sans-serif" }}>
        
        {/* Mobile Header Profile */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px 20px' }}>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>Vastu Griha</h4>
            <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>by Banjara Bazaar</span>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
            AM
          </div>
        </div>

        {/* Headline */}
        <div style={{ padding: '0 20px', margin: '8px 0', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text3)' }}>Design Workspace</span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', lineHeight: '1.2', marginTop: '4px', marginBottom: '8px' }}>
            Create your Vastu perfect home
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.4, margin: 0 }}>
            Analyze layouts, align energy orientations, and procure remedies.
          </p>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px', position: 'relative', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', outline: 'none', fontSize: '13px' }}
          />
          <i className="ti ti-search" style={{ position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '16px' }}></i>
        </div>

        {/* Projects List title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 6px 20px', borderBottom: '1px solid var(--border)', margin: '0 20px' }}>
          <strong style={{ fontSize: '14px' }}>My Layouts ({processedList.length})</strong>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: 'none', background: 'none', color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
          >
            <option value="edited">Recent</option>
            <option value="name">Name</option>
            <option value="score">Score</option>
          </select>
        </div>

        {/* Projects List items */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {processedList.map(p => (
            <div 
              key={p.id}
              onClick={() => handleOpenProject(p)}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
            >
              {/* Thumbnail SVG */}
              <div style={{ width: '56px', height: '56px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ width: '40px', height: '40px', fill: 'none', stroke: 'var(--border2)', strokeWidth: 2 }}>
                  <rect x="5" y="5" width="90" height="90" stroke="var(--accent)" strokeWidth="3" opacity="0.3" fill="rgba(124,111,247,0.02)" />
                  {p.rooms && p.rooms.map((rm, idx) => (
                    <rect key={idx} x={rm.x} y={rm.y} width={rm.width} height={rm.height} fill="rgba(124, 111, 247, 0.08)" stroke="var(--accent)" strokeWidth="1" />
                  ))}
                </svg>
              </div>

              {/* Text metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                <strong style={{ fontSize: '13.5px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{p.width}' x {p.length}' • {p.facing} Facing</span>
                <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Edited {p.lastEdited}</span>
              </div>

              {/* Vastu score badge */}
              {p.roomsCount > 0 && (
                <div style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                  {p.vastuScore}% Vastu
                </div>
              )}

              {/* Three dots context trigger */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    const menu = e.currentTarget.nextSibling
                    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex'
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '16px', padding: '6px', cursor: 'pointer' }}
                >
                  <i className="ti ti-dots-vertical"></i>
                </button>
                <div 
                  style={{ 
                    display: 'none', 
                    position: 'absolute', 
                    bottom: '30px', 
                    right: 0, 
                    background: 'var(--bg3)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    flexDirection: 'column', 
                    zIndex: 100, 
                    boxShadow: 'var(--shadow)',
                    minWidth: '100px'
                  }}
                >
                  <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => { handleOpenProject(p) }}>Open</button>
                  <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => { setNewNameText(p.name); setShowRenameModal(p.id); }}>Rename</button>
                  <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => duplicateProject(p.id)}>Duplicate</button>
                  <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => archiveProject(p.id)}>{p.isArchived ? 'Unarchive' : 'Archive'}</button>
                  <button className="floating-context-btn" style={{ padding: '6px 12px', color: 'var(--red)' }} onClick={() => deleteProject(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Project FAB on mobile */}
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{ position: 'fixed', right: '20px', bottom: '80px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,111,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <i className="ti ti-plus"></i>
        </button>

      </div>
    )
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>
      
      {/* Sidebar menu */}
      <nav id="sidebar" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="sidebar-brand">
          <img src="/logo.svg" className="sidebar-logo-img" alt="Vastu logo" />
          <span>Vastu</span> Griha
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">Workspace Home</div>
          <div 
            className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <i className="ti ti-folders"></i> All Projects
          </div>
          <div 
            className={`nav-item ${activeFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveFilter('favorites')}
          >
            <i className="ti ti-star"></i> Favorites
          </div>
          <div 
            className={`nav-item ${activeFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveFilter('archived')}
          >
            <i className="ti ti-archive"></i> Archived
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px 14px', borderRadius: '30px', justifyContent: 'center' }}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="ti ti-plus" style={{ marginRight: '6px' }}></i> Create Project
          </button>
        </div>

        <div className="sidebar-footer">
          <span>Vastu Griha v1.0</span>
        </div>
      </nav>

      {/* Main dashboard body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <header id="topbar" style={{ flexShrink: 0, padding: '12px 24px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
          <div className="topbar-left" style={{ textAlign: 'left' }}>
            <span className="page-title" style={{ fontSize: '20px', fontWeight: 700 }}>Project Workspace Dashboard</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginTop: '2px' }}>Manage layouts, energy checklist ratings, and compliance reports</span>
          </div>

          <div className="topbar-right" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', width: '220px', position: 'relative' }}>
              <input 
                type="text" className="chat-input" style={{ width: '100%', padding: '8px 32px 8px 12px', fontSize: '12.5px' }}
                placeholder="Search projects..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="ti ti-search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}></i>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="ti ti-plus"></i> New
            </button>
          </div>
        </header>

        {/* Dashboard inner panels */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflowY: 'auto' }}>
            
            {/* Quick Templates Selection */}
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>Start with Quick Templates</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                {[
                  { name: 'Villa', size: '40x60 ft', icon: 'ti-home-2', w: 40, l: 60 },
                  { name: 'Apartment', size: '30x40 ft', icon: 'ti-building', w: 30, l: 40 },
                  { name: 'Office', size: '20x30 ft', icon: 'ti-briefcase', w: 20, l: 30 },
                  { name: 'Shop', size: '15x25 ft', icon: 'ti-shopping-cart', w: 15, l: 25 }
                ].map(tmpl => (
                  <div 
                    key={tmpl.name}
                    className="option-button-card"
                    style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => handleCreateFromTemplate(tmpl.name, tmpl.w, tmpl.l, 'East')}
                  >
                    <i className={tmpl.icon} style={{ fontSize: '24px', color: 'var(--accent)' }}></i>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>{tmpl.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{tmpl.size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* List Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {activeFilter === 'all' && 'All Layouts'}
                {activeFilter === 'favorites' && 'Starred Favorites'}
                {activeFilter === 'archived' && 'Archived Files'}
                <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: '6px' }}>({processedList.length})</span>
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text3)', alignSelf: 'center' }}>Sort:</span>
                <select 
                  className="btn" style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="edited">Last Edited</option>
                  <option value="name">Name A-Z</option>
                  <option value="score">Vastu Score</option>
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            {processedList.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text3)' }}>
                <svg viewBox="0 0 100 100" width="70" height="70" style={{ fill: 'none', stroke: 'var(--border2)', strokeWidth: 1.5, marginBottom: '14px' }}>
                  <path d="M20,20 H80 V80 H20 Z" />
                  <path d="M20,40 H80" />
                  <circle cx="50" cy="60" r="10" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>No projects found matching filters</span>
                <button className="btn btn-sm btn-primary" style={{ marginTop: '12px' }} onClick={() => setShowCreateModal(true)}>Create New Project</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {processedList.map(p => (
                  <div 
                    key={p.id}
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                    onClick={() => handleOpenProject(p)}
                  >
                    {/* SVG Layout Preview Thumbnail */}
                    <div style={{ height: '110px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', position: 'relative' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', fill: 'none', stroke: 'var(--border2)', strokeWidth: 1.5 }}>
                        <rect x="5" y="5" width="90" height="90" stroke="var(--accent)" strokeWidth="2.5" opacity="0.3" fill="rgba(124,111,247,0.02)" />
                        {/* Render simple previews of placed rooms */}
                        {p.rooms && p.rooms.map((rm, idx) => (
                          <rect 
                            key={idx}
                            x={rm.x} 
                            y={rm.y} 
                            width={rm.width} 
                            height={rm.height} 
                            fill="rgba(124, 111, 247, 0.08)"
                            stroke="var(--accent)"
                            strokeWidth="1"
                          />
                        ))}
                      </svg>

                      {/* Favorite/Star indicator */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteProject(p.id); }}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        <i className={`ti ti-star${p.isFavorite ? '-filled' : ''}`} style={{ color: p.isFavorite ? 'var(--gold)' : 'var(--text3)', fontSize: '16px' }}></i>
                      </button>

                      {/* Vastu Score tag */}
                      {p.roomsCount > 0 && (
                        <div style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'var(--emerald-dim)', color: 'var(--emerald)', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                          Score: {p.vastuScore}%
                        </div>
                      )}
                    </div>

                    {/* Meta info card content */}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold' }}>{p.name}</h4>
                        
                        {/* Quick actions popup menu triggers */}
                        <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                          <i 
                            className="ti ti-dots-vertical" 
                            style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--text3)' }}
                            onClick={(e) => {
                              const menu = e.currentTarget.nextSibling
                              menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex'
                            }}
                          ></i>
                          <div 
                            style={{ 
                              display: 'none', 
                              position: 'absolute', 
                              bottom: '18px', 
                              right: 0, 
                              background: 'var(--bg3)', 
                              border: '1px solid var(--border)', 
                              borderRadius: '8px', 
                              flexDirection: 'column', 
                              zIndex: 100, 
                              boxShadow: 'var(--shadow)',
                              minWidth: '100px'
                            }}
                          >
                            <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => { handleOpenProject(p) }}>Open</button>
                            <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => { setNewNameText(p.name); setShowRenameModal(p.id); }}>Rename</button>
                            <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => duplicateProject(p.id)}>Duplicate</button>
                            <button className="floating-context-btn" style={{ padding: '6px 12px' }} onClick={() => archiveProject(p.id)}>{p.isArchived ? 'Unarchive' : 'Archive'}</button>
                            <button className="floating-context-btn" style={{ padding: '6px 12px', color: 'var(--red)' }} onClick={() => deleteProject(p.id)}>Delete</button>
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '10.5px', color: 'var(--text2)' }}>📍 {p.location} • {p.width}'x{p.length}'</span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text3)' }}>Edited: {p.lastEdited}</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: 'var(--accent)' }}>
                          {p.owner[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline Sidebar Panel */}
          <div style={{ width: '220px', borderLeft: '1px solid var(--border)', background: 'var(--bg2)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Recent Log History</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {activities.map(act => (
                <div key={act.id} style={{ borderLeft: '1.5px solid var(--border2)', paddingLeft: '10px', marginLeft: '6px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text)', display: 'block', lineHeight: 1.3 }}>{act.text}</span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text3)', display: 'block', marginTop: '2px' }}>{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* CREATE NEW PROJECT MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <form 
            onSubmit={handleCreateSubmit}
            style={{ width: '100%', maxWidth: '400px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 'bold', margin: 0 }}>Create New Project</h3>
              <i className="ti ti-x" style={{ fontSize: '20px', cursor: 'pointer', color: 'var(--text3)' }} onClick={() => setShowCreateModal(false)}></i>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Project Name *</span>
              <input 
                type="text" className="chat-input" style={{ width: '100%', padding: '10px' }}
                placeholder="e.g. My Dream Home" required
                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Owner Name</span>
              <input 
                type="text" className="chat-input" style={{ width: '100%', padding: '10px' }}
                placeholder="e.g. Amit Gupta"
                value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Location</span>
              <input 
                type="text" className="chat-input" style={{ width: '100%', padding: '10px' }}
                placeholder="e.g. Sector 15, Dwarka"
                value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Width (ft)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '8px' }}
                  value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Length (ft)</span>
                <input 
                  type="number" className="chat-input" style={{ width: '100%', padding: '8px' }}
                  value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Facing Direction</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '8px' }}
                  value={formData.facing} onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                >
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Property Type</span>
                <select 
                  className="btn" style={{ width: '100%', padding: '8px' }}
                  value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Office">Office</option>
                  <option value="Shop">Shop</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn" style={{ flex: 1, padding: '12px', justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Create & Open</button>
            </div>
          </form>
        </div>
      )}

      {/* RENAME MODAL */}
      {showRenameModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '360px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 'bold', margin: 0, textAlign: 'left' }}>Rename Layout</h3>
            <input 
              type="text" className="chat-input" style={{ width: '100%', padding: '10px' }}
              value={newNameText} onChange={(e) => setNewNameText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn" style={{ flex: 1, padding: '10px', justifyContent: 'center' }} onClick={() => setShowRenameModal(null)}>Cancel</button>
              <button 
                className="btn btn-primary" style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                onClick={() => { renameProject(showRenameModal, newNameText); setShowRenameModal(null); }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
