import React, { useState, useMemo, useEffect } from 'react'
import AssetLoader from '../lib/AssetLoader'

// 12 Modern Shopping Categories + Recently Used + Favorites
const SHOPPING_CATEGORIES = [
  { id: 'living-room', label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { id: 'plants', label: 'Plants', icon: '🪴' },
  { id: 'mirrors', label: 'Mirrors', icon: '🪞' },
  { id: 'temple', label: 'Temple', icon: '🪔' },
  { id: 'doors-windows', label: 'Doors & Windows', icon: '🚪' },
  { id: 'lighting', label: 'Lighting', icon: '💡' },
  { id: 'outdoor', label: 'Outdoor', icon: '🏡' },
  { id: 'vastu-remedies', label: 'Vastu Remedies', icon: '✨' },
  { id: 'recent', label: 'Recently Used', icon: '⭐' },
  { id: 'favorites', label: 'Favorites', icon: '❤️' }
]

// Available filter chips
const FILTER_CHIPS = [
  'Modern', 'Traditional', 'Wood', 'Luxury', 'Budget',
  'Living Room', 'Bedroom', 'Kitchen', 'Temple', 'Plants', 'Mirrors',
  'North', 'East', 'South', 'West', 'Vastu Recommended'
]

// Explicit mapping function to classify raw manifest assets into shopping categories
const mapAssetToCategories = (asset) => {
  const cats = []
  const id = asset.id.toLowerCase()
  const name = (asset.name || '').toLowerCase()
  const cat = (asset.category || '').toLowerCase()
  const tags = (asset.tags || []).map(t => t.toLowerCase())
  const rooms = (asset.recommendedRooms || []).map(r => r.toLowerCase())

  // Bedroom
  if (cat === 'rooms' || tags.includes('bedroom') || rooms.includes('bedroom') || rooms.includes('master bedroom') || rooms.includes('kids bedroom') || name.includes('bed') || name.includes('nightstand') || name.includes('wardrobe')) {
    cats.push('bedroom')
  }
  // Living Room
  if (tags.includes('living room') || rooms.includes('living room') || rooms.includes('family lounge') || name.includes('sofa') || name.includes('armchair') || name.includes('bench') || name.includes('coffee') || name.includes('tv unit') || name.includes('ottoman') || name.includes('recliner') || name.includes('carpet') || name.includes('console table') || name.includes('bookcase')) {
    cats.push('living-room')
  }
  // Dining
  if (tags.includes('dining') || rooms.includes('dining room') || name.includes('dining')) {
    cats.push('dining')
  }
  // Kitchen
  if (tags.includes('kitchen') || rooms.includes('kitchen') || name.includes('kitchen') || name.includes('cooktop')) {
    cats.push('kitchen')
  }
  // Bathroom
  if (tags.includes('bathroom') || tags.includes('toilet') || rooms.includes('toilet') || rooms.includes('bathroom') || name.includes('toilet') || name.includes('bath') || name.includes('sink')) {
    cats.push('bathroom')
  }
  // Plants
  if (cat === 'plants' || tags.includes('plant') || tags.includes('tulsi') || name.includes('plant') || name.includes('tulsi') || name.includes('stand')) {
    cats.push('plants')
  }
  // Mirrors
  if (tags.includes('mirror') || name.includes('mirror')) {
    cats.push('mirrors')
  }
  // Temple
  if (tags.includes('pooja') || rooms.includes('pooja room') || rooms.includes('pooja mandir') || name.includes('swastika') || name.includes('pooja') || name.includes('mandir') || name.includes('temple') || name.includes('pyramid')) {
    cats.push('temple')
  }
  // Doors & Windows
  if (cat === 'structure' || tags.includes('door') || tags.includes('window') || tags.includes('structure') || name.includes('door') || name.includes('window')) {
    cats.push('doors-windows')
  }
  // Lighting
  if (tags.includes('lamp') || tags.includes('fan') || tags.includes('lighting') || name.includes('lamp') || name.includes('light') || name.includes('fan')) {
    cats.push('lighting')
  }
  // Outdoor
  if (tags.includes('balcony') || tags.includes('garden') || tags.includes('outdoor') || tags.includes('patio') || rooms.includes('balcony') || rooms.includes('roof') || rooms.includes('courtyard') || name.includes('water tank') || name.includes('outdoor')) {
    cats.push('outdoor')
  }
  // Vastu Remedies
  if (cat === 'vastu' || cat === 'symbols' || tags.includes('remedy') || tags.includes('pyramid') || tags.includes('swastika') || name.includes('pyramid') || name.includes('swastika') || name.includes('remedy')) {
    cats.push('vastu-remedies')
  }

  // Fallback
  if (cats.length === 0 && cat !== 'avatars' && cat !== 'backgrounds') {
    cats.push('living-room')
  }

  return cats
}

// Dynamic realistic price generator based on ID
const getAssetPrice = (id) => {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  const base = 2500 + (sum % 20) * 1250
  return `₹${base.toLocaleString('en-IN')}`
}

// Dynamic rating generator (between 4.4 and 4.9)
const getAssetRating = (id) => {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  const rating = 4.4 + (sum % 6) * 0.1
  return rating.toFixed(1)
}

// Check if an asset is considered "New"
const isAssetNew = (id) => {
  const newItems = ['furniture-sofa', 'decor-mirror', 'furniture-bed', 'plants-tulsi', 'vastu-pyramid']
  return newItems.includes(id)
}

// Check if an asset is Vastu Recommended (has specific recommendations)
const isAssetVastuRecommended = (asset) => {
  return (asset.recommendedDirections && asset.recommendedDirections.length > 0) || asset.category === 'vastu'
}

// Vastu Placement Evaluation Diagnostic
const evaluateVastuPlacement = (asset, direction) => {
  if (!asset) return { grade: 'Average', text: 'Select an direction to inspect.' }
  
  const recDirs = (asset.recommendedDirections || []).map(d => d.toLowerCase())
  const dirLower = direction.toLowerCase()
  
  // Match check
  const isRecommended = recDirs.some(rd => rd.includes(dirLower) || dirLower.includes(rd))
  
  if (isRecommended) {
    return {
      grade: 'Excellent',
      text: `Excellent Placement! Position in the ${direction} aligns perfectly with Vastu shastra, boosting positive energy flow, prosperity, and peace.`,
      color: '#2e7d32',
      bg: '#e8f5e9',
      border: '#a5d6a7'
    }
  }

  // Avoid constraints
  const id = asset.id.toLowerCase()
  let avoid = false
  if (id.includes('bed') && (dirLower === 'north' || dirLower === 'northeast')) {
    avoid = true
  } else if (id.includes('mirror') && (dirLower === 'south' || dirLower === 'southwest' || dirLower === 'west')) {
    avoid = true
  } else if (id.includes('water-tank') && (dirLower === 'southeast' || dirLower === 'northeast' || dirLower === 'east')) {
    avoid = true
  } else if ((id.includes('pyramid') || id.includes('swastika') || id.includes('tulsi')) && dirLower === 'south') {
    avoid = true
  } else if (id.includes('wardrobe') && (dirLower === 'north' || dirLower === 'northeast')) {
    avoid = true
  }

  if (avoid) {
    return {
      grade: 'Avoid',
      text: `Avoid Placement! Placing this item in the ${direction} creates structural Vastu conflicts, potentially leading to stress or leakage of energy.`,
      color: '#c62828',
      bg: '#ffebee',
      border: '#ffcdd2'
    }
  }

  // Average fallback
  return {
    grade: 'Average',
    text: `Average Placement. Position in the ${direction} provides a neutral energy balance. Consider placing it in recommended zones (like ${asset.recommendedDirections?.join(', ') || 'N/E'}) for peak results.`,
    color: '#b78103',
    bg: '#fff8e1',
    border: '#ffe082'
  }
}

export default function AssetGallery() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('living-room')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [activeChips, setActiveChips] = useState([])
  
  // Room Preview Modal state
  const [previewModalAsset, setPreviewModalAsset] = useState(null)
  const [previewDirection, setPreviewDirection] = useState('North')

  // Favorites & Recently Used
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('vastu_favorites')
    return saved ? JSON.parse(saved) : []
  })
  
  const [recentlyUsed, setRecentlyUsed] = useState(() => {
    const saved = localStorage.getItem('vastu_recently_used')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('vastu_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('vastu_recently_used', JSON.stringify(recentlyUsed))
  }, [recentlyUsed])

  // Toggle favorite
  const toggleFavorite = (e, id) => {
    e.stopPropagation()
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    )
  }

  // Select asset action
  const selectAsset = (asset) => {
    setSelectedAsset(asset)
    
    // Add to recently used (keep last 6, unique)
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== asset.id)
      return [asset.id, ...filtered].slice(0, 6)
    })
  }

  // Drag and drop event handlers
  const handleDragStart = (e, asset) => {
    e.dataTransfer.setData('text/plain', asset.id)
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    e.dataTransfer.effectAllowed = 'copy'
    
    // Maintain top-down footprint drag preview
    const dragImg = new Image()
    dragImg.src = AssetLoader.getAssetPlannerTopUrl(asset.id)
    dragImg.width = 60
    dragImg.height = 60
    e.dataTransfer.setDragImage(dragImg, 30, 30)
    
    e.currentTarget.style.opacity = '0.4'
  }

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1'
  }

  // Toggle filter chip
  const handleChipClick = (chip) => {
    setActiveChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip) 
        : [...prev, chip]
    )
  }

  // Clear all filters & query
  const clearAllFilters = () => {
    setSearchQuery('')
    setActiveChips([])
  }

  // Filter Assets list
  const filteredAssets = useMemo(() => {
    let list = AssetLoader.getAllAssets()
    
    // Exclude technical developer utilities
    list = list.filter(asset => asset.category !== 'avatars' && asset.category !== 'backgrounds')

    // Sidebar Category Filter
    if (selectedCategory === 'favorites') {
      list = list.filter(asset => favorites.includes(asset.id))
    } else if (selectedCategory === 'recent') {
      list = list.filter(asset => recentlyUsed.includes(asset.id))
    } else {
      list = list.filter(asset => {
        const cats = mapAssetToCategories(asset)
        return cats.includes(selectedCategory)
      })
    }

    // Search Query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(asset => {
        return (
          asset.name?.toLowerCase().includes(q) ||
          asset.description?.toLowerCase().includes(q) ||
          asset.material?.toLowerCase().includes(q) ||
          asset.color?.toLowerCase().includes(q) ||
          asset.tags?.some(t => t.toLowerCase().includes(q))
        )
      })
    }

    // Active Chips filter (AND logic)
    if (activeChips.length > 0) {
      list = list.filter(asset => {
        return activeChips.every(chip => {
          const c = chip.toLowerCase()
          if (c === 'modern') {
            return asset.tags?.includes('modern') || asset.description?.toLowerCase().includes('modern')
          }
          if (c === 'traditional') {
            return asset.tags?.includes('sacred') || asset.tags?.includes('auspicious') || asset.description?.toLowerCase().includes('traditional') || asset.description?.toLowerCase().includes('vedic')
          }
          if (c === 'wood') {
            const mat = asset.material?.toLowerCase() || ''
            return mat.includes('wood') || mat.includes('teak') || mat.includes('walnut') || mat.includes('oak') || mat.includes('timber') || mat.includes('maple')
          }
          if (c === 'luxury') {
            const desc = asset.description?.toLowerCase() || ''
            const mat = asset.material?.toLowerCase() || ''
            return desc.includes('premium') || desc.includes('luxury') || mat.includes('velvet') || mat.includes('suede') || mat.includes('brass')
          }
          if (c === 'budget') {
            const desc = asset.description?.toLowerCase() || ''
            return desc.includes('compact') || desc.includes('standard') || desc.includes('simple') || desc.includes('modular') || (!desc.includes('premium') && !desc.includes('luxury'))
          }
          if (c === 'living room') return mapAssetToCategories(asset).includes('living-room')
          if (c === 'bedroom') return mapAssetToCategories(asset).includes('bedroom')
          if (c === 'kitchen') return mapAssetToCategories(asset).includes('kitchen')
          if (c === 'temple') return mapAssetToCategories(asset).includes('temple')
          if (c === 'plants') return mapAssetToCategories(asset).includes('plants')
          if (c === 'mirrors') return mapAssetToCategories(asset).includes('mirrors')
          if (['north', 'east', 'south', 'west'].includes(c)) {
            return asset.recommendedDirections?.some(d => d.toLowerCase().includes(c))
          }
          if (c === 'vastu recommended') {
            return isAssetVastuRecommended(asset)
          }
          return true
        })
      })
    }

    return list
  }, [selectedCategory, searchQuery, activeChips, favorites, recentlyUsed])

  // Related assets mapping (excluding current)
  const relatedAssets = useMemo(() => {
    if (!selectedAsset) return []
    return AssetLoader.getAllAssets()
      .filter(asset => asset.category !== 'avatars' && asset.category !== 'backgrounds')
      .filter(asset => asset.id !== selectedAsset.id && mapAssetToCategories(asset).some(c => mapAssetToCategories(selectedAsset).includes(c)))
      .slice(0, 3)
  }, [selectedAsset])

  // Recently Viewed details mapper
  const recentlyViewedDetails = useMemo(() => {
    return recentlyUsed
      .map(id => AssetLoader.getAsset(id))
      .filter(Boolean)
      .filter(asset => asset.id !== selectedAsset?.id)
      .slice(0, 3)
  }, [recentlyUsed, selectedAsset])

  // Action: Opening room preview
  const openRoomPreview = (asset) => {
    setPreviewModalAsset(asset)
    // Default to the first recommended direction if exists, else North
    if (asset.recommendedDirections && asset.recommendedDirections.length > 0) {
      const match = asset.recommendedDirections.find(d => ['North', 'East', 'South', 'West'].includes(d))
      setPreviewDirection(match || asset.recommendedDirections[0].split('-')[0] || 'North')
    } else {
      setPreviewDirection('North')
    }
  }

  // Room Preview placement diagnosis helper
  const placementDiagnosis = useMemo(() => {
    return evaluateVastuPlacement(previewModalAsset, previewDirection)
  }, [previewModalAsset, previewDirection])

  // Helper for dynamic preview offsets based on directions
  const previewAssetTranslate = useMemo(() => {
    switch (previewDirection) {
      case 'North': return { x: 120, y: 140, rot: 0 } // placement near North wall
      case 'East': return { x: 280, y: 140, rot: 90 }  // placement near East wall
      case 'South': return { x: 140, y: 220, rot: 180 } // placement near South zone
      case 'West': return { x: 260, y: 220, rot: 270 }  // placement near West zone
      default: return { x: 200, y: 180, rot: 0 }
    }
  }, [previewDirection])

  return (
    <div 
      className="catalog-container"
      style={{ 
        display: 'flex', 
        flex: 1, 
        height: 'calc(100vh - var(--header-h) - 40px)', 
        overflow: 'hidden', 
        gap: '24px', 
        padding: '24px',
        color: '#3d2616',
        backgroundColor: '#FDFBF7',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
    >
      
      {/* LEFT SIDEBAR: Modern Shopping Menu */}
      <div 
        className="catalog-sidebar"
        style={{ 
          width: '260px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px', 
          background: '#FAF8F5', 
          borderRight: '1px solid #EAE6DF',
          paddingRight: '16px',
          overflowY: 'auto'
        }}
      >
        <span style={{ 
          fontSize: '11px', 
          color: '#8A7B6E', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px', 
          marginBottom: '10px', 
          paddingLeft: '12px',
          display: 'block' 
        }}>
          Collections
        </span>
        {SHOPPING_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setSelectedAsset(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '14px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '16px',
                border: 'none',
                background: isSelected ? '#3D2616' : 'transparent',
                color: isSelected ? '#FAF8F5' : '#5C4E43',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: isSelected ? '600' : '500'
              }}
              className="category-btn"
            >
              <span style={{ fontSize: '18px' }}>{cat.icon}</span>
              <span style={{ fontSize: '14px' }}>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* CENTRAL AREA: Grid & Search/Filters */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
        
        {/* Large Search Container & Filter Chips */}
        <div 
          className="search-section"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px', 
            background: '#FAF8F5', 
            padding: '20px', 
            borderRadius: '24px', 
            border: '1px solid #EAE6DF',
            boxShadow: '0 4px 20px rgba(45, 41, 37, 0.02)'
          }}
        >
          {/* Large Search box */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#8A7B6E', fontSize: '18px' }}></i>
              <input
                type="text"
                placeholder="Search furniture, decor or remedies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 54px',
                  borderRadius: '20px',
                  border: '1px solid #E4DFD5',
                  background: '#FDFBF7',
                  color: '#3D2616',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(45, 41, 37, 0.02)'
                }}
                className="search-input"
              />
            </div>
            {(searchQuery || activeChips.length > 0) && (
              <button 
                onClick={clearAllFilters}
                style={{
                  padding: '14px 24px',
                  border: '1px solid #D6CEBF',
                  borderRadius: '18px',
                  background: '#FAF8F5',
                  color: '#8A7B6E',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                className="btn-clear"
              >
                <i className="ti ti-rotate"></i> Clear Filters
              </button>
            )}
            <span style={{ fontSize: '14px', color: '#8A7B6E', fontWeight: 600, paddingRight: '8px' }}>
              {filteredAssets.length} item{filteredAssets.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filter Chips Container */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              paddingBottom: '4px',
              scrollbarWidth: 'none'
            }}
            className="chips-wrapper"
          >
            {FILTER_CHIPS.map(chip => {
              const isActive = activeChips.includes(chip)
              return (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isActive ? '#3D2616' : '#EAE6DF',
                    background: isActive ? '#3D2616' : '#FDFBF7',
                    color: isActive ? '#FAF8F5' : '#5C4E43',
                    fontSize: '12.5px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="filter-chip"
                >
                  {isActive && <i className="ti ti-check" style={{ marginRight: '6px', fontSize: '11px' }}></i>}
                  {chip}
                </button>
              )
            })}
          </div>
        </div>

        {/* Catalog Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {filteredAssets.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#8A7B6E' }}>
              <i className="ti ti-mood-empty" style={{ fontSize: '56px', color: '#E4DFD5' }}></i>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>No items found</span>
                <span style={{ fontSize: '14px' }}>Try selecting another collection or clearing filters.</span>
              </div>
              <button 
                onClick={clearAllFilters}
                style={{
                  padding: '10px 20px',
                  background: '#3D2616',
                  color: '#FAF8F5',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                gap: '24px',
                paddingBottom: '32px'
              }}
            >
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id
                const isFavorite = favorites.includes(asset.id)
                const showNewBadge = isAssetNew(asset.id)
                const showVastuBadge = isAssetVastuRecommended(asset)
                const rating = getAssetRating(asset.id)
                const price = getAssetPrice(asset.id)
                
                return (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset)}
                    onDragEnd={handleDragEnd}
                    onClick={() => selectAsset(asset)}
                    style={{
                      background: '#FAF8F5',
                      border: isSelected ? '2px solid #3D2616' : '1px solid #EAE6DF',
                      borderRadius: '24px',
                      padding: '16px',
                      cursor: 'grab',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: isSelected ? '0 10px 30px rgba(61, 38, 22, 0.08)' : '0 2px 8px rgba(45, 41, 37, 0.02)'
                    }}
                    className="catalog-card"
                  >
                    
                    {/* Hero Illustration Container (75% height of upper portion) */}
                    <div 
                      style={{ 
                        height: '180px', 
                        background: '#F5F2EC', 
                        borderRadius: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        padding: '20px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={AssetLoader.getAssetPreviewUrl(asset.id)} 
                        alt={asset.name} 
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        draggable="false"
                      />

                      {/* Badges Container */}
                      <div style={{ position: 'absolute', left: '10px', top: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {showNewBadge && (
                          <span style={{
                            fontSize: '9px',
                            background: '#D4A373',
                            color: '#FDFBF7',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            New
                          </span>
                        )}
                        {showVastuBadge && (
                          <span style={{
                            fontSize: '9px',
                            background: '#708238',
                            color: '#FDFBF7',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Vastu OK
                          </span>
                        )}
                      </div>

                      {/* Favorite Button (❤️) */}
                      <button
                        onClick={(e) => toggleFavorite(e, asset.id)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          background: '#FDFBF7',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                          color: isFavorite ? '#E07A5F' : '#8A7B6E',
                          transition: 'transform 0.2s ease'
                        }}
                        className="fav-btn"
                      >
                        <i className={isFavorite ? "ti ti-heart-filled" : "ti ti-heart"} style={{ fontSize: '15px' }}></i>
                      </button>
                    </div>

                    {/* Metadata details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 600, textTransform: 'uppercase' }}>
                          {asset.recommendedRooms?.[0] || 'Decor'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ color: '#D4A373', fontSize: '12px' }}>★</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#3D2616' }}>{rating}</span>
                        </div>
                      </div>
                      
                      <h4 style={{ 
                        fontSize: '16px', 
                        color: '#3D2616', 
                        fontWeight: '700', 
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {asset.name}
                      </h4>

                      <p style={{ 
                        fontSize: '12px', 
                        color: '#8A7B6E', 
                        lineHeight: '1.4', 
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '34px'
                      }}>
                        {asset.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#3D2616' }}>{price}</span>
                        {asset.recommendedDirections?.[0] && (
                          <span style={{ fontSize: '10.5px', color: '#708238', fontWeight: 600, background: '#EAEFE2', padding: '3px 8px', borderRadius: '8px' }}>
                            🧭 {asset.recommendedDirections[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Floorplan drag overlay prompt */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '72px', 
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(61, 38, 22, 0.95)', 
                        borderRadius: '10px', 
                        padding: '6px 12px', 
                        display: 'flex', 
                        gap: '6px', 
                        alignItems: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        color: '#FAF8F5',
                        fontSize: '11px',
                        fontWeight: '600',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                      className="drag-overlay"
                    >
                      <i className="ti ti-hand-grab" style={{ fontSize: '12px', color: '#D4A373' }}></i> Drag to floorplan
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL: Redesigned Product Details Page */}
      {selectedAsset && (
        <div 
          className="catalog-details-drawer"
          style={{ 
            width: '380px', 
            background: '#FAF8F5', 
            borderLeft: '1px solid #EAE6DF',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            overflowY: 'auto',
            animation: 'slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          
          {/* Header Drawer Control */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase', letterSpacing: '1px' }}>Catalog View</span>
            <button 
              onClick={() => setSelectedAsset(null)}
              style={{ 
                background: '#F5F2EC', 
                border: 'none', 
                color: '#3D2616', 
                cursor: 'pointer', 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'background 0.2s' 
              }}
              className="close-drawer-btn"
            >
              <i className="ti ti-x" style={{ fontSize: '14px' }}></i>
            </button>
          </div>

          {/* Product Hero Image */}
          <div 
            style={{ 
              height: '200px', 
              background: '#F5F2EC', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '24px',
              position: 'relative'
            }}
          >
            <img 
              src={AssetLoader.getAssetPreviewUrl(selectedAsset.id)} 
              alt={selectedAsset.name} 
              style={{ width: '90%', height: '90%', objectFit: 'contain' }}
            />
          </div>

          {/* Identity & Rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#3D2616' }}>
                {getAssetPrice(selectedAsset.id)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#D4A373' }}>★★★★★</span>
                <span style={{ fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>{getAssetRating(selectedAsset.id)} Rating</span>
              </div>
            </div>

            <h3 style={{ fontSize: '22px', color: '#3D2616', fontWeight: 800, margin: '4px 0 0 0', lineHeight: 1.2 }}>
              {selectedAsset.name}
            </h3>
            
            <p style={{ fontSize: '14px', color: '#5C4E43', lineHeight: '1.5', margin: '8px 0 0 0' }}>
              {selectedAsset.description}
            </p>
          </div>

          {/* Vastu Placements section */}
          {selectedAsset.recommendedDirections && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Recommended Vastu Directions
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedAsset.recommendedDirections.map((dir) => (
                  <span 
                    key={dir} 
                    style={{ 
                      fontSize: '12px', 
                      background: '#EAEFE2', 
                      color: '#4B5E26', 
                      padding: '6px 12px', 
                      borderRadius: '10px', 
                      border: '1px solid #D1DCC0',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🧭 {dir}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Placement Rooms */}
          {selectedAsset.recommendedRooms && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Suitable Rooms
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedAsset.recommendedRooms.map((room) => (
                  <span 
                    key={room} 
                    style={{ 
                      fontSize: '12px', 
                      background: '#F5F2EC', 
                      color: '#5C4E43', 
                      padding: '6px 12px', 
                      borderRadius: '10px', 
                      border: '1px solid #E4DFD5',
                      fontWeight: '500'
                    }}
                  >
                    {room}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specs Sheet */}
          <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Specifications
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #F5F2EC' }}>
              <span style={{ color: '#8A7B6E' }}>Dimensions</span>
              <span style={{ fontWeight: '600', color: '#3D2616' }}>{selectedAsset.defaultWidthFt} ft × {selectedAsset.defaultDepthFt} ft</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #F5F2EC' }}>
              <span style={{ color: '#8A7B6E' }}>Materials</span>
              <span style={{ fontWeight: '600', color: '#3D2616' }}>{selectedAsset.material}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#8A7B6E' }}>Colors available</span>
              <span style={{ fontWeight: '600', color: '#3D2616' }}>{selectedAsset.color}</span>
            </div>
          </div>

          {/* Main call to actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={() => alert(`To place, simply drag and drop the "${selectedAsset.name}" card directly into the Planner Workspace canvas layout.`)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '18px',
                border: 'none',
                background: '#3D2616',
                color: '#FAF8F5',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(61, 38, 22, 0.15)'
              }}
              className="primary-action-btn"
            >
              <i className="ti ti-hand-grab" style={{ fontSize: '16px', color: '#D4A373' }}></i>
              Drag to Planner Floorplan
            </button>
            <button
              onClick={() => openRoomPreview(selectedAsset)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '18px',
                border: '1px solid #D6CEBF',
                background: '#FDFBF7',
                color: '#3D2616',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              className="secondary-action-btn"
            >
              <i className="ti ti-3d-rotate" style={{ fontSize: '16px', color: '#8A7B6E' }}></i>
              Preview in Room
            </button>
          </div>

          {/* Related Items carousel */}
          {relatedAssets.length > 0 && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '20px' }}>
              <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                Related Products
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {relatedAssets.map(item => (
                  <div
                    key={item.id}
                    onClick={() => selectAsset(item)}
                    style={{
                      flex: 1,
                      background: '#FDFBF7',
                      border: '1px solid #EAE6DF',
                      borderRadius: '14px',
                      padding: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    className="related-item-card"
                  >
                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={AssetLoader.getAssetPreviewUrl(item.id)} 
                        alt={item.name} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        color: '#3D2616', 
                        textAlign: 'center', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '30px',
                        lineHeight: '1.3',
                        fontWeight: '600'
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Carousel */}
          {recentlyViewedDetails.length > 0 && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '20px' }}>
              <span style={{ fontSize: '11px', color: '#8A7B6E', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                Recently Viewed
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {recentlyViewedDetails.map(item => (
                  <div
                    key={item.id}
                    onClick={() => selectAsset(item)}
                    style={{
                      flex: 1,
                      background: '#FDFBF7',
                      border: '1px solid #EAE6DF',
                      borderRadius: '14px',
                      padding: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    className="related-item-card"
                  >
                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={AssetLoader.getAssetPreviewUrl(item.id)} 
                        alt={item.name} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        color: '#3D2616', 
                        textAlign: 'center', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '30px',
                        lineHeight: '1.3',
                        fontWeight: '600'
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ROOM PREVIEW EXPERIENCE MODAL */}
      {previewModalAsset && (
        <div 
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(45, 41, 37, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setPreviewModalAsset(null)}
        >
          <div 
            style={{
              background: '#FDFBF7',
              borderRadius: '32px',
              width: '90%',
              maxWidth: '640px',
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#8A7B6E' }}>
                  Interactive placement diagnosis
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#3D2616', margin: '2px 0 0 0' }}>
                  Room Preview: {previewModalAsset.name}
                </h3>
              </div>
              <button 
                onClick={() => setPreviewModalAsset(null)}
                style={{ 
                  background: '#F5F2EC', 
                  border: 'none', 
                  color: '#3D2616', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="ti ti-x" style={{ fontSize: '16px' }}></i>
              </button>
            </div>

            {/* Visual Room Mockup */}
            <div 
              style={{
                height: '260px',
                background: '#FAF8F5',
                borderRadius: '24px',
                border: '1px solid #EAE6DF',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Isometric Room Outline Drawing inside SVG */}
              <svg viewBox="0 0 400 260" style={{ width: '100%', height: '100%' }}>
                {/* Wall Back Drop Grid */}
                <polygon points="40,30 200,90 200,230 40,170" fill="#f5f2ec" stroke="#eae5d8" strokeWidth="1.5" />
                <polygon points="200,90 360,30 360,170 200,230" fill="#faf8f5" stroke="#eae5d8" strokeWidth="1.5" />
                <polygon points="40,170 200,230 360,170 200,110" fill="#efebe2" stroke="#eae5d8" strokeWidth="1.5" />
                
                {/* Floor grids for realistic size */}
                <line x1="80" y1="185" x2="240" y2="125" stroke="#e4dfd5" strokeWidth="1" />
                <line x1="120" y1="200" x2="280" y2="140" stroke="#e4dfd5" strokeWidth="1" />
                <line x1="160" y1="215" x2="320" y2="155" stroke="#e4dfd5" strokeWidth="1" />
                
                <line x1="120" y1="125" x2="280" y2="185" stroke="#e4dfd5" strokeWidth="1" />
                <line x1="160" y1="140" x2="320" y2="200" stroke="#e4dfd5" strokeWidth="1" />
                <line x1="80" y1="155" x2="240" y2="215" stroke="#e4dfd5" strokeWidth="1" />

                {/* Cardinal Direction Guides on walls */}
                <text x="70" y="80" fill="#c3bcaf" fontSize="12" fontWeight="bold" transform="skewY(20)">NORTH WALL</text>
                <text x="260" y="80" fill="#c3bcaf" fontSize="12" fontWeight="bold" transform="skewY(-20)">EAST WALL</text>
                
                {/* Glow placement ring */}
                <ellipse 
                  cx={previewAssetTranslate.x} 
                  cy={previewAssetTranslate.y + 15} 
                  rx="30" 
                  ry="12" 
                  fill={placementDiagnosis.color} 
                  opacity="0.15" 
                />

                {/* Selected Asset Rendered with responsive translation and scale offsets */}
                <image 
                  href={AssetLoader.getAssetPreviewUrl(previewModalAsset.id)} 
                  x={previewAssetTranslate.x - 30} 
                  y={previewAssetTranslate.y - 30} 
                  width="60" 
                  height="60"
                  style={{
                    filter: 'drop-shadow(0 6px 12px rgba(45, 41, 37, 0.15))',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                />
              </svg>

              {/* Compass Direction overlay */}
              <div 
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  background: '#FDFBF7',
                  border: '1px solid #EAE6DF',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <i className="ti ti-compass" style={{ animation: 'rotateCompass 20s linear infinite', color: '#D4A373' }}></i>
                <span>Mandala Focus</span>
              </div>
            </div>

            {/* Vastu Diagnostic Rating Banner */}
            <div 
              style={{
                background: placementDiagnosis.bg,
                border: `1px solid ${placementDiagnosis.border}`,
                color: placementDiagnosis.color,
                padding: '16px 20px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: placementDiagnosis.color, 
                  color: '#FAF8F5', 
                  fontSize: '10px', 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  padding: '3px 8px', 
                  borderRadius: '6px',
                  letterSpacing: '0.5px'
                }}>
                  {placementDiagnosis.grade} Placement
                </span>
              </div>
              <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#3D2616', marginTop: '6px' }}>
                {placementDiagnosis.text}
              </span>
            </div>

            {/* Direction Select Button Toggles */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#8A7B6E', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Switch Direction Orientation
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['North', 'East', 'South', 'West'].map(dir => {
                  const isActive = previewDirection === dir
                  const checkGrading = evaluateVastuPlacement(previewModalAsset, dir)
                  
                  return (
                    <button
                      key={dir}
                      onClick={() => setPreviewDirection(dir)}
                      style={{
                        flex: 1,
                        padding: '12px 6px',
                        borderRadius: '16px',
                        border: '2px solid',
                        borderColor: isActive ? '#3D2616' : '#EAE6DF',
                        background: isActive ? '#3D2616' : '#FDFBF7',
                        color: isActive ? '#FAF8F5' : '#3D2616',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className="direction-toggle-btn"
                    >
                      <span>{dir}</span>
                      <span style={{ 
                        fontSize: '9.5px', 
                        color: isActive ? '#FAF8F5' : checkGrading.color, 
                        fontWeight: 700,
                        opacity: isActive ? 0.8 : 1
                      }}>
                        {checkGrading.grade}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footnote */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
              <button 
                onClick={() => setPreviewModalAsset(null)}
                style={{
                  padding: '12px 24px',
                  background: '#F5F2EC',
                  color: '#3D2616',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
              <button 
                onClick={() => {
                  alert(`To place on floorplan canvas, close this window and drag the card directly!`)
                  setPreviewModalAsset(null)
                }}
                style={{
                  padding: '12px 24px',
                  background: '#3D2616',
                  color: '#FAF8F5',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Got it
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Embedded High Fidelity Styles */}
      <style>{`
        /* Categories hover states */
        .category-btn:hover {
          background-color: #F5F2EC !important;
          color: #3D2616 !important;
          transform: translateX(4px);
        }
        
        /* Catalog Card styles & lift hover */
        .catalog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(61, 38, 22, 0.08) !important;
          border-color: #3D2616 !important;
        }
        .catalog-card:hover .drag-overlay {
          opacity: 1 !important;
        }

        /* Fav button animation */
        .fav-btn:hover {
          transform: scale(1.18);
        }

        /* Related products hover */
        .related-item-card:hover {
          border-color: #3D2616 !important;
          background-color: #FAF8F5 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 41, 37, 0.03);
        }

        /* Chips scroll bar invisible */
        .chips-wrapper::-webkit-scrollbar {
          display: none;
        }

        /* Interactive close buttons */
        .close-drawer-btn:hover {
          background-color: #EAE6DF !important;
        }

        /* Primary action button glows */
        .primary-action-btn:hover {
          background-color: #5C4E43 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(61, 38, 22, 0.25) !important;
        }
        .secondary-action-btn:hover {
          background-color: #F5F2EC !important;
          transform: translateY(-1px);
        }

        /* Direction buttons */
        .direction-toggle-btn:hover {
          border-color: #3D2616 !important;
        }

        /* Animations */
        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rotateCompass {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile styling overlays */
        @media (max-width: 768px) {
          .catalog-container {
            flex-direction: column !important;
            height: auto !important;
            overflow: visible !important;
            padding: 12px !important;
            gap: 16px !important;
          }
          .catalog-sidebar {
            width: 100% !important;
            flex-direction: row !important;
            white-space: nowrap !important;
            border-right: none !important;
            border-bottom: 1px solid #EAE6DF !important;
            padding-bottom: 10px !important;
            padding-right: 0 !important;
          }
          .catalog-sidebar button {
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .catalog-details-drawer {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid #EAE6DF !important;
            margin-top: 24px !important;
          }
        }
      `}</style>

    </div>
  )
}
