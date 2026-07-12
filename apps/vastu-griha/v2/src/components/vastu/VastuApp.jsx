import React from 'react'
import VastuCarousel from './VastuCarousel'
import { LANGS, t } from '../../lib/vastuLang'
import { fetchTopVastuTopics } from '../../lib/vastuKbApi'

const BRAND = { primary: '#E08A3C', dark: '#C96F24', light: '#FBE6D0', cream: '#FAF5EC' }

// The carousel's default order is category/topic alphabetical from the
// backend. The retired ItemPlacementWidget mirror tool was the app's first
// Vastu feature, so the carousel now opens on the same topic (FF-03,
// "mirror_placement") rather than wherever it falls alphabetically —
// everything else keeps its existing relative order after that.
function leadWithMirror(entries) {
  const idx = entries.findIndex((e) => e.entry_id === 'FF-03')
  if (idx <= 0) return entries
  const copy = entries.slice()
  const [mirror] = copy.splice(idx, 1)
  copy.unshift(mirror)
  return copy
}

// Search bar, category chips, and the old vertical card-per-topic list are
// gone by request — replaced entirely by one sideways-swipeable carousel
// covering every topic (all ~60 today, plus anything added later). Each
// card is VastuTopicCard, the single locked template for every topic.
export default function VastuApp() {
  const [lang, setLang] = React.useState('hinglish')
  const [entries, setEntries] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    fetchTopVastuTopics()
      .then((data) => { setEntries(leadWithMirror(data.results || [])); setError(null) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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

      {loading && <p style={{ fontSize: '12px', color: '#A99A80' }}>{t(lang, 'loading')}</p>}
      {error && !loading && <p style={{ fontSize: '12px', color: '#C24545' }}>{t(lang, 'connectionError')} ({error}).</p>}
      {!loading && !error && <VastuCarousel entries={entries} lang={lang} />}
    </div>
  )
}
