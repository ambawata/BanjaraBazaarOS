import React from 'react'
import RoomScene from './RoomScene'
import DirectionPills from './DirectionPills'
import ShopPanel from './ShopPanel'
import { t, categoryLabel } from '../../lib/vastuLang'
import {
  getObjectType, getItemName, normalizeDirections, isLowConfidence,
} from '../../lib/vastuEntryHelpers'

export default function VastuCard({ entry, lang, onOpen }) {
  const objectType = getObjectType(entry)
  const { bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText } = normalizeDirections(entry)
  const lowConfidence = isLowConfidence(entry)
  const hasPills = bestDirections.length > 0 || avoidDirections.length > 0 || fallbackDirections.length > 0

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #EFE3D0', borderRadius: '20px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#C96F24', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {categoryLabel(lang, entry.category)}
        </div>
        <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15.5px', color: '#2B2010', marginTop: '2px' }}>
          {getItemName(entry, lang)}
        </div>
      </div>

      {/* Two-column: existing Vastu content (left) + shop panel (right).
          Pure flex-wrap, no media query — wraps to a stack once the row
          can't fit both a ~200px illustration column and a ~150px shop
          panel side by side (i.e. narrow/mobile widths). */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '12px 16px 0' }}>
        {/* flex: '0 1 220px' (not '1 1 200px') — this column must not grow
            to soak up leftover width next to ShopPanel. RoomScene's SVG is
            aspect-ratio-locked now, but a column that's free to stretch
            wide would still make the SVG *box* wide, which just moves the
            letterboxing from the SVG's internal scaling to visible dead
            space around a smaller illustration — the column itself has to
            stay capped near its natural width. */}
        <div style={{ flex: '0 1 220px', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <RoomScene
            objectType={objectType}
            size="sm"
            state={lowConfidence ? 'lowConfidence' : 'best'}
          />
          {(lowConfidence || hasPills || (hasVerdictOnly && verdictText)) && (
            <div>
              {lowConfidence ? (
                <span style={{
                  display: 'inline-block', width: 'fit-content', fontSize: '10.5px', fontWeight: 700,
                  color: '#8A7A5C', background: '#F1ECE0', padding: '3px 9px', borderRadius: '999px',
                }}>
                  {t(lang, 'lowConfidenceBadge')}
                </span>
              ) : hasPills ? (
                <DirectionPills best={bestDirections} avoid={avoidDirections} fallback={fallbackDirections} size="sm" />
              ) : (
                <span style={{ fontSize: '11px', color: '#8A7A5C' }}>{verdictText}</span>
              )}
            </div>
          )}
        </div>

        <ShopPanel entryId={entry.entry_id} lang={lang} compact />
      </div>

      <button
        onClick={onOpen}
        style={{
          margin: '12px 16px 16px', padding: '10px', borderRadius: '10px',
          background: '#FBE6D0', border: 'none', color: '#C96F24',
          fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        {t(lang, 'moreDekhein')}
      </button>
    </div>
  )
}
