import React from 'react'
import VastuTopicCard from './VastuTopicCard'
import { LANGS, t, categoryLabel, allCategories } from '../../lib/vastuLang'
import { searchVastuKb, fetchTopVastuTopics } from '../../lib/vastuKbApi'

const BRAND = { primary: 'var(--orange)', dark: 'var(--orange-dark)', light: 'var(--orange-light)', cream: 'var(--cream)' }

export default function VastuApp() {
  const [lang, setLang] = React.useState('hinglish')
  const [query, setQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [entries, setEntries] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const trackRef = React.useRef(null)

  const loadDefault = React.useCallback(() => {
    setLoading(true)
    fetchTopVastuTopics()
      .then((data) => { setEntries(data.results || []); setError(null) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { loadDefault() }, [loadDefault])

  React.useEffect(() => {
    const q = query.trim()
    if (q === '') {
      if (activeCategory === 'all') { loadDefault(); return }
      setLoading(true)
      searchVastuKb(activeCategory)
        .then((data) => { setEntries(data.results || []); setError(null) })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      searchVastuKb(q)
        .then((data) => { setEntries(data.results || []); setError(null) })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query, activeCategory, loadDefault])

  // A new search/category filter is a brand new list — jump the track back
  // to the first topic rather than leaving it scrolled to whatever index
  // the previous list happened to be at.
  React.useEffect(() => {
    setActiveIndex(0)
    trackRef.current?.scrollTo({ left: 0 })
  }, [entries])

  const scrollToIndex = (i) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(entries.length - 1, i))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
  }

  const handleTrackScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex((prev) => (prev === i ? prev : i))
  }

  return (
    <Shell lang={lang} setLang={setLang}>
      <div style={{ position: 'relative' }}>
        <i className="ti ti-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: BRAND.dark, fontSize: '16px' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, 'searchPlaceholder')}
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px',
            border: '1.5px solid var(--border-soft)', fontSize: '13px', color: 'var(--text)',
            outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--ink-faint)' }}>{t(lang, 'searchHint')}</p>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 2px' }}>
        <CategoryChip
          label={t(lang, 'allChip')}
          active={activeCategory === 'all'}
          onClick={() => { setActiveCategory('all'); setQuery('') }}
        />
        {allCategories().map((cat) => (
          <CategoryChip
            key={cat}
            label={categoryLabel(lang, cat)}
            active={activeCategory === cat}
            onClick={() => { setActiveCategory(cat); setQuery('') }}
          />
        ))}
      </div>

      {loading && <p style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{t(lang, 'loading')}</p>}
      {error && !loading && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{t(lang, 'connectionError')} ({error}).</p>}
      {!loading && !error && entries.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--ink-faint)' }}>{t(lang, 'noMatch', query || activeCategory)}</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>{t(lang, 'swipeHint')}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)' }}>
              {t(lang, 'topicCounter', activeIndex + 1, entries.length)}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              ref={trackRef}
              onScroll={handleTrackScroll}
              style={{
                display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', borderRadius: '20px',
              }}
            >
              {entries.map((entry) => (
                <div
                  key={entry.entry_id}
                  style={{ flex: '0 0 100%', scrollSnapAlign: 'start', minWidth: 0, padding: '2px' }}
                >
                  <VastuTopicCard entry={entry} lang={lang} />
                </div>
              ))}
            </div>

            {activeIndex > 0 && (
              <button onClick={() => scrollToIndex(activeIndex - 1)} aria-label="Previous" style={arrowStyle('left')}>
                <i className="ti ti-chevron-left" />
              </button>
            )}
            {activeIndex < entries.length - 1 && (
              <button onClick={() => scrollToIndex(activeIndex + 1)} aria-label="Next" style={arrowStyle('right')}>
                <i className="ti ti-chevron-right" />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {entries.slice(0, 20).map((entry, i) => (
              <span
                key={entry.entry_id}
                onClick={() => scrollToIndex(i)}
                style={{
                  width: i === activeIndex ? '16px' : '6px', height: '6px', borderRadius: '999px',
                  background: i === activeIndex ? BRAND.primary : 'var(--border-soft)', cursor: 'pointer',
                  transition: 'width 0.2s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Shell>
  )
}

function arrowStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: '-4px',
    width: '32px', height: '32px', borderRadius: '999px', background: '#ffffff',
    border: '1px solid var(--border-soft)', color: 'var(--orange-dark)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(90,31,179,0.08)',
    fontSize: '16px', zIndex: 2,
  }
}

function Shell({ lang, setLang, children }) {
  return (
    <div style={{
      background: BRAND.cream, borderRadius: '20px', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px', width: '100%',
      boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: BRAND.dark }}>
            Vastu Griha
          </h2>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-faint)' }}>{t(lang, 'brandSub')}</p>
        </div>
        <div style={{ display: 'flex', gap: '3px', background: '#ffffff', borderRadius: '999px', padding: '3px', border: '1px solid var(--border-soft)' }}>
          {Object.keys(LANGS).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                padding: '4px 9px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontSize: '10.5px', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                background: lang === code ? BRAND.primary : 'transparent',
                color: lang === code ? '#ffffff' : 'var(--ink-faint)',
              }}
            >
              {LANGS[code]}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '7px 13px', borderRadius: '999px', fontSize: '12px',
        fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', cursor: 'pointer',
        background: active ? BRAND.light : '#ffffff',
        border: active ? `1px solid ${BRAND.primary}` : '1px solid var(--border-soft)',
        color: active ? BRAND.dark : 'var(--ink-soft)', fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  )
}
