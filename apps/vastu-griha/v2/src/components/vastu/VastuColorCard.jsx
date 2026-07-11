import React from 'react'
import { t, categoryLabel } from '../../lib/vastuLang'
import { getItemName } from '../../lib/vastuEntryHelpers'

// CO-01 / CO-02 don't fit the room-scene pattern (no single best/avoid
// direction, just a nested by_zone / by_room color map) — same card shell,
// a color-swatch grid instead of an illustration.
export default function VastuColorCard({ entry, lang, onOpen }) {
  const zoneData = entry.detail?.by_zone || entry.detail?.by_room || {}
  const zoneKeys = Object.keys(zoneData).slice(0, 4)

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '14px 16px' }}>
        {zoneKeys.map((zone) => {
          const rec = zoneData[zone]?.rec?.[0] || 'white'
          return (
            <div key={zone} style={{ textAlign: 'center' }}>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '10px',
                background: colorSwatch(rec), border: '1px solid #EFE3D0', marginBottom: '4px',
              }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#8A7A5C' }}>{zone}</span>
            </div>
          )
        })}
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

function colorSwatch(name) {
  const map = {
    green: '#7CB88F', pista_green: '#B7CE8A', light_blue: '#AEC8E0', white: '#F7F3EA',
    cream: '#F3E6C9', light_yellow: '#F0DE9C', brown: '#A9835C', orange: '#E08A3C',
    pink: '#E8B4C0', silver: '#CBCBCB', red: '#C24545', yellow: '#E8C765', coral: '#E39178',
    terracotta: '#C77B4E', beige: '#DCCBAA', peach: '#F0C9A8', biscuit: '#D8B98C', mud: '#9C7A52',
    blue: '#7FA6C9', grey: '#B7B2A8', light_grey: '#D6D2C8', black: '#3A342A', dark: '#5A4E3A',
  }
  return map[name] || '#E7DCC4'
}
