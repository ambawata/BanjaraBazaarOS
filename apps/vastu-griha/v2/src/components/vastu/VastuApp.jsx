import React from 'react'
import VastuTopicCard from './VastuTopicCard'
import { LANGS, t, categoryLabel, allCategories } from '../../lib/vastuLang'
import { searchVastuKb, fetchTopVastuTopics } from '../../lib/vastuKbApi'

const BRAND = { primary: '#E08A3C', dark: '#C96F24', light: '#FBE6D0', cream: '#FAF5EC' }

export default function VastuApp() {
  const [lang, setLang] = React.useState('hinglish')
  const [query, setQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [entries, setEntries] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

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
            border: '1.5px solid #EFE3D0', fontSize: '13px', color: '#2B2010',
            outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#A99A80' }}>{t(lang, 'searchHint')}</p>

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

      {loading && <p style={{ fontSize: '12px', color: '#A99A80' }}>{t(lang, 'loading')}</p>}
      {error && !loading && <p style={{ fontSize: '12px', color: '#C24545' }}>{t(lang, 'connectionError')} ({error}).</p>}
      {!loading && !error && entries.length === 0 && (
        <p style={{ fontSize: '12px', color: '#A99A80' }}>{t(lang, 'noMatch', query || activeCategory)}</p>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry) => (
            <VastuTopicCard key={entry.entry_id} entry={entry} lang={lang} />
          ))}
        </div>
      )}
    </Shell>
  )
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
          <p style={{ margin: 0, fontSize: '11px', color: '#A99A80' }}>{t(lang, 'brandSub')}</p>
        </div>
        <div style={{ display: 'flex', gap: '3px', background: '#ffffff', borderRadius: '999px', padding: '3px', border: '1px solid #EFE3D0' }}>
          {Object.keys(LANGS).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                padding: '4px 9px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                fontSize: '10.5px', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                background: lang === code ? BRAND.primary : 'transparent',
                color: lang === code ? '#ffffff' : '#A99A80',
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
        border: active ? `1px solid ${BRAND.primary}` : '1px solid #EFE3D0',
        color: active ? BRAND.dark : '#8A7A5C', fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  )
}
