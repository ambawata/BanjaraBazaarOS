import React from 'react'
import RoomScene from './RoomScene'
import DirectionPills from './DirectionPills'
import { t, categoryLabel } from '../../lib/vastuLang'
import {
  getRoomType, getItemName, getBestDirections, getAvoidDirections, isLowConfidence,
} from '../../lib/vastuEntryHelpers'

export default function VastuCard({ entry, lang, onOpen }) {
  const roomType = getRoomType(entry)
  const best = getBestDirections(entry)
  const avoid = getAvoidDirections(entry)
  const lowConfidence = isLowConfidence(entry)

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

      <div style={{ padding: '12px 16px 0' }}>
        <RoomScene
          roomType={roomType}
          size="sm"
          state={lowConfidence ? 'lowConfidence' : 'best'}
        />
      </div>

      <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lowConfidence ? (
          <span style={{
            display: 'inline-block', width: 'fit-content', fontSize: '10.5px', fontWeight: 700,
            color: '#8A7A5C', background: '#F1ECE0', padding: '3px 9px', borderRadius: '999px',
          }}>
            {t(lang, 'lowConfidenceBadge')}
          </span>
        ) : (
          <DirectionPills best={best} avoid={avoid} size="sm" />
        )}
      </div>

      <button
        onClick={onOpen}
        style={{
          margin: '0 16px 16px', padding: '10px', borderRadius: '10px',
          background: '#FBE6D0', border: 'none', color: '#C96F24',
          fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        {t(lang, 'moreDekhein')}
      </button>
    </div>
  )
}
