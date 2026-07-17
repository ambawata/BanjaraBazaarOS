import { useState } from 'react'
import { vastuGeometryApi } from '../../lib/api'
import { ROOM_TYPES } from '../../config/roomIcons'

const CELL_SIZE_FT = 10 // synthetic room polygon half-width around a tapped cell center

// 3x3 visual grid, row-major, matching the backend's zone-grid reading
// order (north row first, west column first — see
// VastuMapOnboardingService::getZoneGrid docblock). Compass points shown
// subtly instead of technical zone names, per task requirement — the
// actual zone8 string ("NE", "SW", etc.) IS used under the hood for
// matching/labeling in Step 4, just not surfaced as jargon here.
const GRID_COMPASS_HINT = ['N', '', '', '', '', '', '', '', '']

export default function RoomTaggingStep({ plot, zoneGrid, onComplete, onSkip }) {
  const [selectedRoomType, setSelectedRoomType] = useState(null)
  const [taggedRooms, setTaggedRooms] = useState([]) // [{ roomTypeKey, label, emoji, zone, row, col }]
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const cellsByPosition = new Map(zoneGrid.cells.map(c => [`${c.row}-${c.col}`, c]))

  function handleCellTap(row, col) {
    if (!selectedRoomType) return
    const cell = cellsByPosition.get(`${row}-${col}`)
    if (!cell) return

    const roomType = ROOM_TYPES.find(r => r.key === selectedRoomType)
    setTaggedRooms(prev => [
      ...prev,
      { roomTypeKey: roomType.key, label: roomType.label, emoji: roomType.emoji, zone: cell.zone, row, col, cellCenterX: cell.center_x, cellCenterY: cell.center_y },
    ])
    setSelectedRoomType(null)
  }

  function removeTag(index) {
    setTaggedRooms(prev => prev.filter((_, i) => i !== index))
  }

  async function handleContinue() {
    if (taggedRooms.length === 0) {
      onSkip()
      return
    }

    setSaving(true)
    setError(null)
    try {
      // Each tagged room becomes a real vastu_rooms row via the EXISTING
      // addRoom endpoint — a small synthetic square polygon centered on
      // the tapped zone-grid cell (see VastuMapOnboardingService::
      // getZoneGrid docblock for why this makes Step 4 able to reuse the
      // existing /verdicts endpoint completely unmodified). This is a
      // deliberate simplification vs. the advanced tool's precise
      // hand-digitized room polygons — appropriate for "roughly which
      // zone is my kitchen in", not professional survey accuracy.
      const createdRooms = []
      for (const room of taggedRooms) {
        const created = await vastuGeometryApi.addRoom(plot.id, {
          name: room.label,
          polygon_vertices: [
            { x: room.cellCenterX - CELL_SIZE_FT / 2, y: room.cellCenterY - CELL_SIZE_FT / 2 },
            { x: room.cellCenterX + CELL_SIZE_FT / 2, y: room.cellCenterY - CELL_SIZE_FT / 2 },
            { x: room.cellCenterX + CELL_SIZE_FT / 2, y: room.cellCenterY + CELL_SIZE_FT / 2 },
            { x: room.cellCenterX - CELL_SIZE_FT / 2, y: room.cellCenterY + CELL_SIZE_FT / 2 },
          ],
        })
        createdRooms.push({ ...room, roomId: created.id })
      }
      onComplete(createdRooms)
    } catch (e) {
      setError(e.message || 'Room save nahi ho paaya.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 px-4 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-ink1 text-2xl font-bold">Apne rooms batao</h1>
        <p className="text-ink3 text-sm">Tell us about your rooms (optional)</p>
      </div>

      {/* Grid, not a horizontally-scrolling row — a scrollable single row
          silently clipped "Staircase" off-screen on narrow/mobile widths
          with no visible affordance that more icons existed. A fixed
          3-column grid guarantees all 6 room types are always visible
          and reachable, at both mobile and desktop widths, with no
          scroll interaction required. */}
      <div className="grid grid-cols-3 gap-2">
        {ROOM_TYPES.map(rt => (
          <button
            key={rt.key}
            onClick={() => setSelectedRoomType(rt.key)}
            className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium ${
              selectedRoomType === rt.key
                ? 'border-brand bg-brandDim text-brand'
                : 'border-surface3 bg-surface text-ink2'
            }`}
          >
            <span className="text-2xl">{rt.emoji}</span>
            <span className="text-center leading-tight">{rt.label}</span>
          </button>
        ))}
      </div>

      {selectedRoomType && (
        <p className="text-brand text-sm text-center font-medium">
          Ab neeche grid mein tap karo jahan {ROOM_TYPES.find(r => r.key === selectedRoomType).label} hai
        </p>
      )}

      {/* Visual-reference-only 3x3 grid — compass points shown subtly, no
          technical zone_16/zone_32 names anywhere on this screen. */}
      <div className="relative aspect-square bg-surface2 rounded-xl border border-surface3 grid grid-cols-3 grid-rows-3 gap-1 p-2">
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-ink3 text-[10px]">N</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-ink3 text-[10px]">S</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-ink3 text-[10px]">W</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-ink3 text-[10px]">E</span>

        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3)
          const col = i % 3
          const roomsHere = taggedRooms.filter(r => r.row === row && r.col === col)
          return (
            <button
              key={i}
              onClick={() => handleCellTap(row, col)}
              disabled={!selectedRoomType}
              className={`rounded-lg flex flex-wrap items-center justify-center gap-0.5 p-1 ${
                selectedRoomType ? 'bg-surface hover:bg-brandDim cursor-pointer' : 'bg-surface'
              } ${row === 1 && col === 1 ? 'border border-dashed border-surface3' : ''}`}
            >
              {roomsHere.map((r, idx) => (
                <span key={idx} className="text-xl">{r.emoji}</span>
              ))}
            </button>
          )
        })}
      </div>

      {taggedRooms.length > 0 && (
        <div className="space-y-1.5">
          {taggedRooms.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-surface border border-surface3 rounded-lg px-3 py-2 text-sm">
              <span>{r.emoji} {r.label}</span>
              <button onClick={() => removeTag(i)} className="text-ink3 text-xs">✕ hatao</button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red text-sm text-center">{error}</p>}

      <div className="space-y-2">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-brand-gradient text-white text-base font-semibold disabled:opacity-50"
        >
          {saving ? 'Save ho raha hai…' : 'Aage badho'}
        </button>
        <button onClick={onSkip} className="w-full py-2 text-ink3 text-sm">
          Baad mein karunga (skip)
        </button>
      </div>
    </div>
  )
}
