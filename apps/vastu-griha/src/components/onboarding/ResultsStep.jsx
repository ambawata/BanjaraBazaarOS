import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vastuVerdictApi } from '../../lib/api'

// Plain-English compass labels, matching the task's own example ("Kitchen
// South-East mein hai") — no degree numbers, no zone_16/zone_32 jargon
// anywhere on this screen.
const ZONE_LABELS = {
  N: 'North', NE: 'North-East', E: 'East', SE: 'South-East',
  S: 'South', SW: 'South-West', W: 'West', NW: 'North-West',
  CENTER: 'Center',
}

export default function ResultsStep({ plot, taggedRooms }) {
  const [verdicts, setVerdicts] = useState(null)
  const [verdictError, setVerdictError] = useState(null)

  useEffect(() => {
    if (!plot || taggedRooms.length === 0) return
    // Verdict Layer endpoint exists on this branch (merged — see PR
    // description). If a future deploy of this wizard runs against a
    // backend where it's NOT merged yet, this fetch fails gracefully and
    // the plain facing-direction cards still render — see the
    // "Vastu Report jald aa raha hai" fallback below, exactly as the task
    // specifies for that case.
    vastuVerdictApi.getVerdicts(plot.id)
      .then(setVerdicts)
      .catch(e => setVerdictError(e.message))
  }, [plot, taggedRooms])

  function verdictsForRoom(roomId) {
    if (!verdicts) return []
    return verdicts.verdicts.filter(v => v.entity_type === 'room' && v.entity_id === roomId)
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 px-4 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-ink1 font-display text-2xl font-semibold">Aapka result</h1>
        <p className="text-ink3 text-sm">Your result</p>
      </div>

      {taggedRooms.length === 0 ? (
        <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-6 text-center">
          <p className="text-ink2 text-sm">
            Aapka plot save ho gaya! Koi room tag nahi kiya — koi baat nahi,
            baad mein "Advanced view" se add kar sakte ho.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {taggedRooms.map((room, i) => {
            const roomVerdicts = verdictsForRoom(room.roomId)
            return (
              <div key={i} className="bg-surface border border-surface3 shadow-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{room.emoji}</span>
                  <p className="text-ink1 text-lg font-semibold">
                    {room.label} <span className="text-brand">{ZONE_LABELS[room.zone] || room.zone}</span> mein hai
                  </p>
                </div>

                {!verdicts && !verdictError && (
                  <p className="text-ink3 text-xs mt-2">Vastu Report jald aa raha hai…</p>
                )}

                {verdictError && (
                  <p className="text-ink3 text-xs mt-2">Vastu Report jald aa raha hai</p>
                )}

                {verdicts && roomVerdicts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {roomVerdicts.map((v, vi) => (
                      <div
                        key={vi}
                        className={`rounded-lg px-3 py-2 text-sm flex items-start gap-2 ${
                          v.shubh_ashubh === 'shubh' ? 'bg-greenDim text-greenMuted' : 'bg-redDim text-redMuted'
                        }`}
                      >
                        <span>{v.shubh_ashubh === 'shubh' ? '✓' : '⚠'}</span>
                        <div className="flex-1">
                          <p className="font-medium">
                            {v.shubh_ashubh === 'shubh' ? 'Accha hai (Good)' : 'Dhyaan rakho (Caution)'}
                          </p>
                          {v.product_cta && (
                            <a href={v.product_cta.url} className="text-brand text-xs underline mt-1 inline-block">
                              🛒 {v.product_cta.label}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {verdicts && roomVerdicts.length === 0 && (
                  <p className="text-ink3 text-xs mt-2">Is room ke liye abhi koi Vastu tip nahi hai.</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          to={`/vastu-griha/geometry-tool?plot_id=${plot.id}`}
          className="text-ink3 text-xs underline"
        >
          Advanced/Technical view (exact coordinates &amp; degrees)
        </Link>
      </div>
    </div>
  )
}
