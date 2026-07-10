import React from 'react'
import { searchVastuKb, fetchTopVastuTopics } from '../../../../lib/vastuKbApi'
import VastuKbCard from './VastuKbCard'

const BRAND = { primary: '#5A1FB3', gradientEnd: '#5D35AE' }

// Search bar + discovery feed for the Vastu Knowledge Engine. Everything
// rendered here comes from the live /api/v1/vastu/* API — no client-side
// fabrication of directions, confidence, or remedies.
export default function VastuKnowledge() {
  const [query, setQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState(null)
  const [searching, setSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState(null)

  const [feed, setFeed] = React.useState([])
  const [feedLoading, setFeedLoading] = React.useState(true)
  const [feedError, setFeedError] = React.useState(null)

  React.useEffect(() => {
    fetchTopVastuTopics()
      .then(data => setFeed(data.results || []))
      .catch(err => setFeedError(err.message))
      .finally(() => setFeedLoading(false))
  }, [])

  React.useEffect(() => {
    const q = query.trim()
    if (q === '') {
      setSearchResults(null)
      setSearchError(null)
      return
    }
    setSearching(true)
    const timer = setTimeout(() => {
      searchVastuKb(q)
        .then(data => { setSearchResults(data.results || []); setSearchError(null) })
        .catch(err => { setSearchError(err.message); setSearchResults([]) })
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const showingSearch = query.trim() !== ''
  const list = showingSearch ? (searchResults || []) : feed
  const loading = showingSearch ? searching : feedLoading
  const error = showingSearch ? searchError : feedError

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', textAlign: 'left' }}>
      <div>
        <h2 style={{
          margin: '0 0 2px', fontSize: '16px', fontWeight: 800,
          background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.gradientEnd})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Vastu Knowledge
        </h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#8A7CAE' }}>
          Ask in English, Hindi, or Hinglish — e.g. "toilet kis disha mein"
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <i className="ti ti-search" style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: BRAND.primary, fontSize: '16px',
        }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Vastu knowledge..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: '14px',
            border: `1.5px solid #E7E1F5`, fontSize: '13px', color: '#241448',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {loading && (
        <p style={{ fontSize: '12px', color: '#8A7CAE' }}>Loading…</p>
      )}

      {error && !loading && (
        <p style={{ fontSize: '12px', color: '#B23A3A' }}>
          Couldn't reach the Vastu Knowledge service ({error}).
        </p>
      )}

      {!loading && !error && showingSearch && list.length === 0 && (
        <p style={{ fontSize: '12px', color: '#8A7CAE' }}>No matches yet for "{query}".</p>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map(entry => <VastuKbCard key={entry.entry_id} entry={entry} />)}
        </div>
      )}
    </div>
  )
}
