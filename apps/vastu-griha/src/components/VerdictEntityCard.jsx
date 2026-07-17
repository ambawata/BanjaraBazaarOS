const SHUBH_ASHUBH_STYLES = {
  shubh: { label: 'Shubh (auspicious)', classes: 'bg-greenDim border-green text-greenMuted', icon: '✓' },
  ashubh: { label: 'Ashubh (inauspicious)', classes: 'bg-redDim border-red text-redMuted', icon: '✗' },
}

const TIER_STYLES = {
  classical: { label: 'Classical', classes: 'bg-brandDim text-brand' },
  popular_unverified: { label: 'Popular (cross-referenced, unverified)', classes: 'bg-surface2 text-ink2' },
}

const PRODUCT_TIER_LABEL = {
  direct: 'Recommended product',
  closest_match: 'Related products',
  generic: 'Vastu essentials',
}

function ZoneBadge({ zone }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-gradient text-white text-xs font-semibold font-mono">
      {zone}
    </span>
  )
}

function ShubhAshubhBadge({ value }) {
  const style = SHUBH_ASHUBH_STYLES[value] || { label: value || 'Unclassified', classes: 'bg-surface2 text-ink2', icon: '' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${style.classes}`}>
      {style.icon} {style.label}
    </span>
  )
}

function TierBadge({ tier }) {
  const style = TIER_STYLES[tier] || { label: tier, classes: 'bg-surface2 text-ink2' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${style.classes}`}>
      {style.label}
    </span>
  )
}

function ProductCta({ cta }) {
  if (!cta) return null
  return (
    <a
      href={cta.url}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand text-brand text-xs font-medium hover:bg-brandDim"
    >
      🛒 {PRODUCT_TIER_LABEL[cta.tier] || 'Shop'}: {cta.label}
    </a>
  )
}

// One verdict row = one KB entry's judgment for one zone on this entity.
// Never merges two KB rows' content into a single displayed verdict —
// each row here traces to exactly one kb_entry_id.
function VerdictRow({ verdict }) {
  return (
    <div className="border border-surface3 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShubhAshubhBadge value={verdict.shubh_ashubh} />
          <TierBadge tier={verdict.tier} />
        </div>
        <span className="text-ink3 text-[11px] font-mono">source: {verdict.kb_entry_id}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink2">
        <span>Severity: <strong className="text-ink1">{verdict.severity || 'n/a'}</strong></span>
        <span>Location confidence: <strong className="text-ink1">{verdict.location_confidence_pct ?? 'n/a'}%</strong></span>
        <span>Effect confidence: <strong className="text-ink1">{verdict.effect_confidence_pct ?? 'n/a'}%</strong></span>
      </div>

      {verdict.source_disagreement_notes && (
        <p className="text-ink3 text-xs italic">
          Source disagreement: {verdict.source_disagreement_notes}
        </p>
      )}

      {verdict.remedy && (
        <p className="text-ink2 text-xs">
          <span className="text-ink3">Remedy: </span>{verdict.remedy}
        </p>
      )}

      <ProductCta cta={verdict.product_cta} />
    </div>
  )
}

// One card per geometry entity (room/door/wall). If the entity is a
// boundary_case, its verdicts are grouped by zone with a clear label per
// zone rather than collapsed — spec requirement: "never silently collapse
// to one".
export default function VerdictEntityCard({ group }) {
  const { entityType, entityId, zones, boundaryCase } = group

  return (
    <div className="bg-surface border border-surface3 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-ink1 font-semibold">
          <span className="uppercase text-ink3 text-xs tracking-wide mr-2">{entityType}</span>
          #{entityId}
        </h3>
        {boundaryCase && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amberDim text-amberMuted text-[11px] font-medium">
            ⚠ boundary case — verdicts shown for both adjacent zones
          </span>
        )}
      </div>

      <div className="space-y-4">
        {zones.map(({ zone, verdicts }) => (
          <div key={zone} className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoneBadge zone={zone} />
              <span className="text-ink3 text-xs">{verdicts.length} KB match{verdicts.length === 1 ? '' : 'es'}</span>
            </div>
            <div className="grid gap-2 pl-1">
              {verdicts.map((v, i) => (
                <VerdictRow key={`${v.kb_entry_id}-${i}`} verdict={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
