import React from 'react'
import RoomScene from './RoomScene'
import DirectionPills from './DirectionPills'
import ShopPanel from './ShopPanel'
import { t, categoryLabel } from '../../lib/vastuLang'
import {
  getObjectType, getItemName, normalizeDirections,
  isLowConfidence, isColorRuleEntry, findDevanagariAlias,
} from '../../lib/vastuEntryHelpers'

// THE locked template — every topic (all 60 today, any added later via the
// zero-hit-report workflow) renders through this one component. Layout is
// modelled on the original "Where do you want to place?" mirror tool
// (ItemPlacementWidget.jsx, now retired): header with best-directions
// summary, a direction-chip row, then a split box — illustration/color
// grid on the left, shop panel on the right — with the deeper knowledge
// content (confidence, remedy, both-sides, sources) beneath.

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

function ColorGrid({ entry }) {
  const zoneData = entry.detail?.by_zone || entry.detail?.by_room || {}
  return (
    <div style={{
      flex: '0 1 240px', minWidth: '200px', background: '#faf5ec', borderRadius: '16px',
      border: '1px solid #EFE3D0', padding: '14px', display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', alignContent: 'start',
    }}>
      {Object.entries(zoneData).slice(0, 9).map(([zone, rules]) => (
        <div key={zone} style={{ textAlign: 'center' }}>
          <div style={{
            width: '100%', aspectRatio: '1', borderRadius: '8px',
            background: colorSwatch(rules?.rec?.[0] || 'white'), border: '1px solid #EFE3D0', marginBottom: '3px',
          }} />
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#8A7A5C' }}>{zone}</span>
        </div>
      ))}
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

export default function VastuTopicCard({ entry, lang }) {
  const objectType = getObjectType(entry)
  const {
    bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText, conditions,
  } = normalizeDirections(entry)
  const lowConfidence = isLowConfidence(entry)
  const colorRule = isColorRuleEntry(entry)
  const hindiAlias = findDevanagariAlias(entry)
  const itemName = lang === 'hi' && hindiAlias ? hindiAlias : getItemName(entry, lang)
  const hasPills = bestDirections.length > 0 || avoidDirections.length > 0 || fallbackDirections.length > 0

  const [activeDirection, setActiveDirection] = React.useState(bestDirections[0] || fallbackDirections[0] || null)
  const [showBothSides, setShowBothSides] = React.useState(false)

  const isActiveBest = activeDirection && bestDirections.some((b) => b.startsWith(activeDirection))
  const isActiveAvoid = activeDirection && avoidDirections.some((a) => a.startsWith(activeDirection))
  const isActiveFallback = activeDirection && !isActiveBest && !isActiveAvoid && fallbackDirections.some((f) => f.startsWith(activeDirection))
  const sceneState = lowConfidence ? 'lowConfidence' : isActiveAvoid ? 'avoid' : isActiveBest ? 'best' : 'neutral'
  const hasBothSides = Boolean(entry.both_sides?.has_disagreement && entry.both_sides?.note)

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #EFE3D0', borderRadius: '20px',
      padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left',
    }}>
      {/* Header — mirrors the old "Where do you want to place?" pattern */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#C96F24', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {categoryLabel(lang, entry.category)}
        </div>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '17px', color: '#2B2010', margin: '3px 0 0' }}>
          {t(lang, 'whereToPlace', itemName)}
        </h3>
        {bestDirections.length > 0 && (
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#8A7A5C' }}>
            {t(lang, 'bestDirectionsLabel')}: <span style={{ color: '#3D8B5F', fontWeight: 700 }}>{bestDirections.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Direction chip row — all 8, tappable, drives the illustration below live */}
      {hasPills && (
        <DirectionPills
          best={bestDirections}
          avoid={avoidDirections}
          fallback={fallbackDirections}
          activeDirection={activeDirection}
          onSelect={setActiveDirection}
        />
      )}

      {(lowConfidence || (hasVerdictOnly && verdictText)) && (
        <span style={{
          display: 'inline-block', width: 'fit-content', fontSize: '11px', fontWeight: 700,
          color: lowConfidence ? '#8A7A5C' : '#2B2010',
          background: lowConfidence ? '#F1ECE0' : 'transparent',
          padding: lowConfidence ? '4px 10px' : 0, borderRadius: '999px',
        }}>
          {lowConfidence ? t(lang, 'lowConfidenceBadge') : verdictText}
        </span>
      )}

      {!hasVerdictOnly && hasPills && !lowConfidence && (
        <span style={{
          display: 'inline-block', width: 'fit-content', fontSize: '11px', fontWeight: 700,
          color: isActiveAvoid ? '#C24545' : isActiveFallback ? '#C96F24' : '#ffffff',
          background: isActiveAvoid ? '#FBEAEA' : isActiveFallback ? '#FBE6D0' : '#E08A3C',
          border: isActiveAvoid ? '1px solid #E27C7C' : isActiveFallback ? '1px dashed #E08A3C' : 'none',
          padding: '4px 10px', borderRadius: '999px',
        }}>
          {isActiveAvoid ? t(lang, 'wrongBadge') : isActiveFallback ? t(lang, 'mixedBadge') : t(lang, 'correctBadge')}
        </span>
      )}

      {/* Split box — illustration/colors (left) + shop panel (right), the
          exact structure locked from the original mirror tool. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
        {colorRule ? (
          <ColorGrid entry={entry} />
        ) : (
          <div style={{ flex: '0 1 260px', minWidth: '200px' }}>
            <RoomScene objectType={objectType} size="lg" state={sceneState} />
          </div>
        )}
        <div style={{ flex: '1 1 150px' }}>
          <ShopPanel entryId={entry.entry_id} lang={lang} />
        </div>
      </div>

      {(entry.confidence?.location !== null || entry.confidence?.effect !== null) && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <ConfidenceBar label={t(lang, 'locationConfidence')} value={entry.confidence?.location} lang={lang} />
          <ConfidenceBar label={t(lang, 'effectConfidence')} value={entry.confidence?.effect} lang={lang} />
        </div>
      )}

      {entry.remedy?.text && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A4A0F', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E08A3C' }} />
            {t(lang, 'remedyLabel')}
          </div>
          <p style={{ fontSize: '13px', color: '#2B2010', lineHeight: 1.55, margin: 0 }}>{entry.remedy.text}</p>
          <p style={{ fontSize: '11px', color: '#A99A80', fontStyle: 'italic', marginTop: '6px' }}>{entry.remedy.caveat}</p>
        </div>
      )}

      {conditions && conditions.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A4A0F', marginBottom: '6px' }}>
            {t(lang, 'conditionsLabel')}
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {conditions.map((c) => (
              <li key={c} style={{ fontSize: '12.5px', color: '#2B2010', lineHeight: 1.5 }}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {hasBothSides && (
        <div>
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
        <div style={{ fontSize: '11px', color: '#A99A80' }}>
          <b style={{ color: '#8A7A5C' }}>{entry.sources.length}</b> {t(lang, 'sourcesChecked')}
        </div>
      )}
    </div>
  )
}
