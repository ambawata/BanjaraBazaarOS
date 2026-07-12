import React from 'react'
import VastuTopicCard from './VastuTopicCard'
import { t } from '../../lib/vastuLang'

// One topic card at a time, swipe/scroll sideways to the next — native CSS
// scroll-snap so touch swipe works for free on phones; arrow buttons cover
// desktop/mouse users. `entries` is the full topic list (all ~60 today,
// however many exist later) in a fixed order — nothing here decides that
// order, it just renders it.
export default function VastuCarousel({ entries, lang }) {
  const trackRef = React.useRef(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const scrollToIndex = (i) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(entries.length - 1, i))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex((prev) => (prev === i ? prev : i))
  }

  if (entries.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#A99A80' }}>{t(lang, 'swipeHint')}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#8A7A5C' }}>
          {t(lang, 'topicCounter', activeIndex + 1, entries.length)}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={trackRef}
          onScroll={handleScroll}
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

        {/* Arrow nav — desktop/mouse convenience, swipe still works without it */}
        {activeIndex > 0 && (
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            aria-label="Previous"
            style={arrowStyle('left')}
          >
            <i className="ti ti-chevron-left" />
          </button>
        )}
        {activeIndex < entries.length - 1 && (
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            aria-label="Next"
            style={arrowStyle('right')}
          >
            <i className="ti ti-chevron-right" />
          </button>
        )}
      </div>

      {/* Progress dots — capped visually, but scroll math still uses the real index */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {entries.slice(0, 20).map((entry, i) => (
          <span
            key={entry.entry_id}
            onClick={() => scrollToIndex(i)}
            style={{
              width: i === activeIndex ? '16px' : '6px', height: '6px', borderRadius: '999px',
              background: i === activeIndex ? '#E08A3C' : '#EFE3D0', cursor: 'pointer',
              transition: 'width 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function arrowStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: '-4px',
    width: '32px', height: '32px', borderRadius: '999px', background: '#ffffff',
    border: '1px solid #EFE3D0', color: '#C96F24', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(90,31,179,0.08)',
    fontSize: '16px', zIndex: 2,
  }
}
