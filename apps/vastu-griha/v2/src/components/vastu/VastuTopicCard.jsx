import React from 'react'
import RoomScene from './RoomScene'
import ShopPanel from './ShopPanel'
import { t } from '../../lib/vastuLang'
import {
  getObjectType, getItemName, normalizeDirections, getDirectionGranularity,
  isLowConfidence, isColorRuleEntry, findDevanagariAlias,
} from '../../lib/vastuEntryHelpers'

// One locked template for every KB topic, built to match
// ItemPlacementWidget.jsx's layout, sizing, and CSS-variable styling
// exactly (same outer card, same chip style, same flex ratio between the
// room-scene illustration and the product panel) — the only things that
// change per topic are the data driving it: item name, which directions
// are "correct", how many pills to show, and which product shows on the
// right (via ShopPanel's existing tier lookup).

const DIRECTION_LABELS = {
  N: { hinglish: 'North', hi: 'उत्तर', en: 'North' },
  NE: { hinglish: 'Northeast', hi: 'उत्तर-पूर्व', en: 'Northeast' },
  E: { hinglish: 'East', hi: 'पूर्व', en: 'East' },
  SE: { hinglish: 'Southeast', hi: 'दक्षिण-पूर्व', en: 'Southeast' },
  S: { hinglish: 'South', hi: 'दक्षिण', en: 'South' },
  SW: { hinglish: 'Southwest', hi: 'दक्षिण-पश्चिम', en: 'Southwest' },
  W: { hinglish: 'West', hi: 'पश्चिम', en: 'West' },
  NW: { hinglish: 'Northwest', hi: 'उत्तर-पश्चिम', en: 'Northwest' },
}
const FOUR_POINT = ['N', 'E', 'S', 'W']
const EIGHT_POINT = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function directionLabel(token, lang) {
  const entry = DIRECTION_LABELS[token]
  if (!entry) return token
  return entry[lang] || entry.hinglish
}

function ColorGrid({ entry }) {
  const zoneData = entry.detail?.by_zone || entry.detail?.by_room || {}
  return (
    <div style={{
      width: '100%', minWidth: '180px', background: '#faf5ec', borderRadius: '16px',
      border: '1px solid var(--border)', padding: '14px', display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', alignContent: 'start', boxSizing: 'border-box',
    }}>
      {Object.entries(zoneData).slice(0, 9).map(([zone, rules]) => (
        <div key={zone} style={{ textAlign: 'center' }}>
          <div style={{
            width: '100%', aspectRatio: '1', borderRadius: '8px',
            background: colorSwatch(rules?.rec?.[0] || 'white'), border: '1px solid var(--border)', marginBottom: '3px',
          }} />
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text2)' }}>{zone}</span>
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
  const { bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText } = normalizeDirections(entry)
  const lowConfidence = isLowConfidence(entry)
  const colorRule = isColorRuleEntry(entry)
  const hindiAlias = findDevanagariAlias(entry)
  const itemName = lang === 'hi' && hindiAlias ? hindiAlias : getItemName(entry, lang)

  // Pill count comes from what the entry's own data actually distinguishes
  // (see getDirectionGranularity) — never a fixed 4 or 8 across the board.
  const granularity = getDirectionGranularity(entry)
  const pillTokens = granularity === 8 ? EIGHT_POINT : FOUR_POINT
  const hasPills = !colorRule && (bestDirections.length > 0 || avoidDirections.length > 0 || fallbackDirections.length > 0)

  const [selectedDirection, setSelectedDirection] = React.useState(
    bestDirections[0] || fallbackDirections[0] || pillTokens[0]
  )

  // Explicit membership in each list, not a single "is it the good one"
  // boolean — some entries (e.g. SD-01..04 with an avoid_universal or
  // contested_mixed verdict) only ever populate avoidDirections or
  // fallbackDirections and leave bestDirections empty. A boolean derived
  // from bestDirections.includes() alone would then be false for every
  // pill, painting every direction red "Conflict Zone" even ones the data
  // never actually flagged as bad. A direction only reads as avoid/red if
  // it's explicitly in avoidDirections; anything not explicitly best or
  // avoid (including a contested_mixed fallback direction) is genuinely
  // unrated by this entry and shows neutral instead.
  const isAvoidDirection = avoidDirections.includes(selectedDirection)
  const isBestDirection = bestDirections.includes(selectedDirection)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '24px', padding: '18px', textAlign: 'left', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#2B2010', fontFamily: 'Poppins, sans-serif' }}>{t(lang, 'whereToPlaceTitle')}</h3>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {t(lang, 'itemLabel')}: <span style={{ fontWeight: 600 }}>{itemName}</span>
        </div>
        {bestDirections.length > 0 && (
          <div style={{ fontSize: '12px', marginTop: '2px' }}>
            {t(lang, 'bestDirectionsLabel')}: <span style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>
              {bestDirections.map((d) => directionLabel(d, lang)).join(', ')}
            </span>
          </div>
        )}
        {hasVerdictOnly && verdictText && (
          <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text2)' }}>{verdictText}</div>
        )}
      </div>

      {hasPills && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {pillTokens.map((dir) => {
            const isActive = selectedDirection === dir
            return (
              <button
                key={dir}
                onClick={() => setSelectedDirection(dir)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border2)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text2)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {directionLabel(dir, lang)}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
        <div style={{ flex: 1.2, minWidth: '180px' }}>
          {colorRule ? (
            <ColorGrid entry={entry} />
          ) : (
            <RoomScene
              objectType={objectType}
              size="lg"
              state={
                lowConfidence ? 'lowConfidence'
                  : !hasPills ? 'neutral'
                    : isAvoidDirection ? 'avoid'
                      : isBestDirection ? 'best' : 'neutral'
              }
              highlightText={hasPills && isAvoidDirection && !lowConfidence ? t(lang, 'conflictZoneLabel') : undefined}
            />
          )}
        </div>

        <div style={{ flex: '1 1 130px' }}>
          <ShopPanel entryId={entry.entry_id} lang={lang} compact />
        </div>
      </div>
    </div>
  )
}
