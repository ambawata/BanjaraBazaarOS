import React from 'react'

const ALL_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function normalizeDirToken(token) {
  // Entries sometimes use qualifiers like "NW_minority" or "bad_padas_any_direction" —
  // only match the clean compass token at the start.
  const m = /^([NSEW]{1,3})/.exec(String(token).toUpperCase())
  return m ? m[1] : null
}

/**
 * best/avoid/fallback are three tiers, not two: fallback is a genuine but
 * secondary recommendation (or, for sleeping-direction entries, a
 * contested/mixed-opinion direction) — it must render distinctly from
 * "best," not merge into it and not silently disappear.
 */
export default function DirectionPills({ best = [], avoid = [], fallback = [], activeDirection, onSelect, size = 'md' }) {
  const bestSet = new Set(best.map(normalizeDirToken).filter(Boolean))
  const avoidSet = new Set(avoid.map(normalizeDirToken).filter(Boolean))
  const fallbackSet = new Set(fallback.map(normalizeDirToken).filter(Boolean))
  const small = size === 'sm'

  return (
    <div style={{ display: 'flex', gap: small ? '4px' : '6px', flexWrap: 'wrap' }}>
      {ALL_DIRECTIONS.map((dir) => {
        const isBest = bestSet.has(dir)
        const isAvoid = avoidSet.has(dir)
        const isFallback = !isBest && !isAvoid && fallbackSet.has(dir)
        const isActive = activeDirection === dir
        const interactive = typeof onSelect === 'function'

        let background = '#ffffff'
        let border = '1px solid #EFE3D0'
        let color = '#8A7A5C'
        if (isBest) {
          background = '#E08A3C'
          border = '1px solid #E08A3C'
          color = '#ffffff'
        } else if (isAvoid) {
          background = '#FBEAEA'
          border = '1px solid #E27C7C'
          color = '#C24545'
        } else if (isFallback) {
          background = '#FBE6D0'
          border = '1px dashed #E08A3C'
          color = '#C96F24'
        }
        if (isActive) {
          border = '2px solid #241408'
        }

        return (
          <button
            key={dir}
            onClick={interactive ? () => onSelect(dir) : undefined}
            style={{
              padding: small ? '3px 8px' : '5px 11px',
              borderRadius: '999px',
              fontSize: small ? '10px' : '11.5px',
              fontWeight: 700,
              background,
              border,
              color,
              cursor: interactive ? 'pointer' : 'default',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {dir}
          </button>
        )
      })}
    </div>
  )
}
