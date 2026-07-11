import React from 'react'
import RoomScene from './RoomScene'
import DirectionPills from './DirectionPills'
import { t, categoryLabel } from '../../lib/vastuLang'
import {
  getRoomType, getItemName, getBestDirections, getAvoidDirections,
  isLowConfidence, isColorRuleEntry, findDevanagariAlias,
} from '../../lib/vastuEntryHelpers'

function ConfidenceBar({ label, value, lang }) {
  return (
    <div style={{ flex: 1, background: '#FBE6D0', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A4A0F', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ height: '5px', background: '#F0D3AC', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
        <div style={{ height: '100%', width: `${value ?? 0}%`, background: '#E08A3C', borderRadius: '4px' }} />
      </div>
      <div style={{ fontSize: '11px', color: '#8A7A5C' }}>
        {value ?? '—'}% {t(lang, 'sourceConsensus')}
      </div>
    </div>
  )
}

export default function VastuDetailView({ entry, lang, onBack }) {
  const roomType = getRoomType(entry)
  const best = getBestDirections(entry)
  const avoid = getAvoidDirections(entry)
  const lowConfidence = isLowConfidence(entry)
  const colorRule = isColorRuleEntry(entry)
  const hindiAlias = findDevanagariAlias(entry)
  const itemName = lang === 'hi' && hindiAlias ? hindiAlias : getItemName(entry, lang)

  const [activeDirection, setActiveDirection] = React.useState(best[0] || null)
  const [showBothSides, setShowBothSides] = React.useState(false)

  const isActiveBest = activeDirection && best.some((b) => b.startsWith(activeDirection))
  const isActiveAvoid = activeDirection && avoid.some((a) => a.startsWith(activeDirection))
  const sceneState = lowConfidence ? 'lowConfidence' : isActiveAvoid ? 'avoid' : isActiveBest ? 'best' : 'neutral'

  const hasBothSides = Boolean(entry.both_sides?.has_disagreement && entry.both_sides?.note)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start',
          background: 'none', border: 'none', color: '#C96F24', fontWeight: 700,
          fontSize: '13px', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif',
        }}
      >
        <i className="ti ti-arrow-left" /> {t(lang, 'back')}
      </button>

      <div style={{ background: '#ffffff', border: '1px solid #EFE3D0', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#C96F24', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {categoryLabel(lang, entry.category)}
          </div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '19px', color: '#2B2010', marginTop: '3px' }}>
            {itemName}
          </div>
        </div>

        {colorRule ? (
          <ColorGrid entry={entry} lang={lang} />
        ) : (
          <>
            <div style={{ padding: '14px 18px 0' }}>
              <RoomScene roomType={roomType} size="lg" state={sceneState} />
            </div>

            <div style={{ padding: '14px 18px 0' }}>
              {lowConfidence ? (
                <span style={{
                  display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#8A7A5C',
                  background: '#F1ECE0', padding: '5px 12px', borderRadius: '999px',
                }}>
                  {t(lang, 'lowConfidenceBadge')}
                </span>
              ) : (
                <span style={{
                  display: 'inline-block', fontSize: '11px', fontWeight: 700,
                  color: isActiveAvoid ? '#C24545' : '#ffffff',
                  background: isActiveAvoid ? '#FBEAEA' : '#E08A3C',
                  border: isActiveAvoid ? '1px solid #E27C7C' : 'none',
                  padding: '5px 12px', borderRadius: '999px',
                }}>
                  {isActiveAvoid ? t(lang, 'wrongBadge') : t(lang, 'correctBadge')}
                </span>
              )}
            </div>

            <div style={{ padding: '12px 18px 0' }}>
              <DirectionPills
                best={best}
                avoid={avoid}
                activeDirection={activeDirection}
                onSelect={setActiveDirection}
              />
            </div>
          </>
        )}

        {(entry.confidence?.location !== null || entry.confidence?.effect !== null) && (
          <div style={{ display: 'flex', gap: '10px', padding: '16px 18px 0' }}>
            <ConfidenceBar label={t(lang, 'locationConfidence')} value={entry.confidence?.location} lang={lang} />
            <ConfidenceBar label={t(lang, 'effectConfidence')} value={entry.confidence?.effect} lang={lang} />
          </div>
        )}

        {entry.remedy?.text && (
          <div style={{ padding: '16px 18px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A4A0F', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E08A3C' }} />
              {t(lang, 'remedyLabel')}
            </div>
            <p style={{ fontSize: '13px', color: '#2B2010', lineHeight: 1.55, margin: 0 }}>{entry.remedy.text}</p>
            <p style={{ fontSize: '11px', color: '#A99A80', fontStyle: 'italic', marginTop: '6px' }}>{entry.remedy.caveat}</p>
          </div>
        )}

        {hasBothSides && (
          <div style={{ padding: '14px 18px 0' }}>
            <button
              onClick={() => setShowBothSides((v) => !v)}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', background: '#FBE6D0',
                border: '1px solid #F0D3AC', color: '#C96F24', fontWeight: 700, fontSize: '12.5px',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {showBothSides ? t(lang, 'hideBothSidesBtn') : t(lang, 'bothSidesBtn')}
            </button>
            {showBothSides && (
              <p style={{ fontSize: '12px', color: '#5C4319', lineHeight: 1.55, background: '#FBF0DD', borderRadius: '10px', padding: '12px', marginTop: '8px' }}>
                {entry.both_sides.note}
              </p>
            )}
          </div>
        )}

        {entry.sources?.length > 0 && (
          <div style={{ padding: '14px 18px 18px', fontSize: '11px', color: '#A99A80' }}>
            <b style={{ color: '#8A7A5C' }}>{entry.sources.length}</b> {t(lang, 'sourcesChecked')}
          </div>
        )}
      </div>
    </div>
  )
}

function ColorGrid({ entry, lang }) {
  const zoneData = entry.detail?.by_zone || entry.detail?.by_room || {}
  return (
    <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Object.entries(zoneData).map(([zone, rules]) => (
        <div key={zone} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '46px', fontSize: '11px', fontWeight: 700, color: '#8A7A5C', flexShrink: 0 }}>{zone}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {(rules.rec || []).slice(0, 4).map((c) => (
              <span key={c} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '999px', background: '#FBE6D0', color: '#8A4A0F' }}>
                {c.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
