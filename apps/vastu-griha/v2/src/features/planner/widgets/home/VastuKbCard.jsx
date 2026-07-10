import React from 'react'

// Purple brand for the Vastu Knowledge Engine feature specifically
// (primary #5A1FB3, gradient end #5D35AE) — kept local to this feature
// rather than changed globally, since the rest of the app uses its own
// existing accent tokens.
const BRAND = { primary: '#5A1FB3', gradientEnd: '#5D35AE' }

function directionText(best) {
  if (!best) return null
  if (Array.isArray(best)) return best.join(', ')
  return String(best)
}

function ConfidencePill({ label, value }) {
  if (value === null || value === undefined) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      padding: '6px 10px', borderRadius: '10px', background: '#F5F1FC', minWidth: '68px',
    }}>
      <span style={{ fontSize: '13px', fontWeight: 800, color: BRAND.primary }}>{value}%</span>
      <span style={{ fontSize: '9px', fontWeight: 600, color: '#7A6B99', textAlign: 'center', lineHeight: 1.2 }}>
        {label}<br />source consensus
      </span>
    </div>
  )
}

export default function VastuKbCard({ entry }) {
  const [showBothSides, setShowBothSides] = React.useState(false)
  const best = directionText(entry.best_direction)
  const avoid = directionText(entry.avoid)
  const title = entry.topic ? entry.topic.replace(/_/g, ' ') : entry.category

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #E7E1F5', borderRadius: '18px',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
      boxShadow: '0 2px 10px rgba(90, 31, 179, 0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
            color: BRAND.gradientEnd,
          }}>{entry.category?.replace(/_/g, ' ')}</span>
          <h3 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 800, color: '#241448', textTransform: 'capitalize' }}>
            {title}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <ConfidencePill label="Location" value={entry.confidence?.location} />
          <ConfidencePill label="Effect" value={entry.confidence?.effect} />
        </div>
      </div>

      {best && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px',
            background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.gradientEnd})`, color: '#fff',
          }}>
            Best: {best}
          </span>
          {avoid && (
            <span style={{
              fontSize: '12px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px',
              background: '#FBEAEA', color: '#B23A3A',
            }}>
              Avoid: {avoid}
            </span>
          )}
        </div>
      )}

      {entry.remedy?.text && (
        <div style={{ fontSize: '12.5px', color: '#3A2E5C', lineHeight: 1.5 }}>
          <strong style={{ color: BRAND.primary }}>Remedy: </strong>{entry.remedy.text}
          <div style={{ marginTop: '4px', fontSize: '11px', fontStyle: 'italic', color: '#8A7CAE' }}>
            {entry.remedy.caveat}
          </div>
        </div>
      )}

      {entry.both_sides?.has_disagreement && (
        <div>
          <button
            onClick={() => setShowBothSides(v => !v)}
            style={{
              fontSize: '11.5px', fontWeight: 700, color: BRAND.primary, background: '#F5F1FC',
              border: 'none', borderRadius: '999px', padding: '6px 12px', cursor: 'pointer',
            }}
          >
            {showBothSides ? 'Hide both sides' : 'Show both sides'}
          </button>
          {showBothSides && (
            <p style={{ fontSize: '12px', color: '#4A3D6B', lineHeight: 1.5, marginTop: '8px' }}>
              {entry.both_sides.note}
            </p>
          )}
        </div>
      )}

      {entry.sources?.length > 0 && (
        <div style={{ fontSize: '10.5px', color: '#9C8FBF' }}>
          Sources: {entry.sources.join(', ')}
        </div>
      )}
    </div>
  )
}
