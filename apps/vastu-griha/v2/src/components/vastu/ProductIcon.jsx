import React from 'react'

// Placeholder product "photo" — no real product photography exists yet
// (nor a Track B illustration set for these specific catalog items), so
// each product gets a small consistent orange-on-cream glyph instead of a
// broken image or blank box. Swap for a real photo once vendor data lands.
const GLYPHS = {
  wardrobe: '<rect x="20" y="10" width="24" height="44" rx="2"/><line x1="32" y1="10" x2="32" y2="54"/>',
  locker: '<rect x="18" y="18" width="28" height="30" rx="2"/><circle cx="32" cy="33" r="4"/>',
  mirror: '<ellipse cx="32" cy="30" rx="10" ry="14"/><line x1="32" y1="16" x2="32" y2="10"/>',
  studyTable: '<rect x="14" y="30" width="36" height="4"/><rect x="16" y="34" width="4" height="14"/><rect x="44" y="34" width="4" height="14"/><rect x="20" y="16" width="20" height="10" rx="1"/>',
  tv: '<rect x="14" y="18" width="36" height="22" rx="2"/><rect x="26" y="42" width="12" height="4"/>',
  sofa: '<rect x="14" y="28" width="36" height="14" rx="3"/><rect x="18" y="20" width="28" height="10" rx="3"/>',
  bed: '<rect x="14" y="28" width="36" height="16" rx="2"/><rect x="14" y="20" width="36" height="10" rx="3"/><ellipse cx="24" cy="25" rx="6" ry="3.4"/><ellipse cx="38" cy="25" rx="6" ry="3.4"/>',
  stove: '<rect x="12" y="30" width="40" height="14" rx="2"/><circle cx="24" cy="30" r="4"/><circle cx="40" cy="30" r="4"/>',
  sink: '<rect x="12" y="30" width="40" height="14" rx="2"/><ellipse cx="32" cy="32" rx="12" ry="5"/>',
  fridge: '<rect x="22" y="10" width="20" height="44" rx="3"/><line x1="22" y1="26" x2="42" y2="26"/>',
  pooja: '<path d="M22 26 Q32 12 42 26 V44 H22 Z"/>',
  diningTable: '<rect x="16" y="28" width="32" height="4"/><rect x="18" y="32" width="4" height="10"/><rect x="42" y="32" width="4" height="10"/>',
  toilet: '<ellipse cx="32" cy="38" rx="12" ry="7"/><rect x="26" y="24" width="12" height="10" rx="3"/>',
  tulsi: '<rect x="27" y="34" width="10" height="12"/><path d="M32 34 Q28 20 32 8 Q36 20 32 34"/>',
  moneyPlant: '<ellipse cx="32" cy="44" rx="8" ry="4"/><path d="M32 40 Q24 26 32 8"/><ellipse cx="28" cy="24" rx="4" ry="3"/><ellipse cx="34" cy="14" rx="4" ry="3"/>',
  fishTank: '<rect x="12" y="18" width="40" height="26" rx="2"/><path d="M26 30 q5-3 9 0 q-2 3-9 0"/>',
  remedy: '<path d="M32 10 L46 42 H18 Z"/>',
  door: '<rect x="22" y="10" width="20" height="42" rx="2"/><circle cx="38" cy="32" r="1.4" fill="currentColor" stroke="none"/>',
  tankUnderground: '<line x1="12" y1="28" x2="52" y2="28" stroke-dasharray="2 3"/><rect x="18" y="30" width="28" height="14" rx="2"/>',
  tankOverhead: '<path d="M20 34 L20 20 L44 20 L44 34 Z"/><path d="M20 34 c0 5 4 6 12 6 s12-1 12-6"/>',
  painting: '<rect x="14" y="12" width="36" height="26" rx="1"/><path d="M20 32 L28 20 L36 30 L44 16" fill="none"/>',
  paint: '<rect x="26" y="10" width="12" height="20" rx="2"/><path d="M32 30 v10 a6 6 0 0 0 12 0 c0-4-3-6-6-10 c-3 4-6 6-6 10 z" transform="translate(-6,0)"/>',
  kitchenGeneral: '<rect x="12" y="30" width="40" height="14" rx="2"/><circle cx="24" cy="30" r="4"/><circle cx="40" cy="30" r="4"/>',
  plantGeneric: '<ellipse cx="32" cy="46" rx="9" ry="4"/><path d="M32 42 Q24 24 32 10 Q40 24 32 42"/>',
  compass: '<circle cx="32" cy="30" r="16"/><path d="M32 30 L38 18 L32 22 L26 18 Z" fill="currentColor" stroke="none"/>',
}

export default function ProductIcon({ icon, size = 44 }) {
  const glyph = GLYPHS[icon] || GLYPHS.remedy
  return (
    <div style={{
      width: size, height: size, borderRadius: '12px', background: '#FBE6D0',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg viewBox="0 0 64 64" width={size * 0.72} height={size * 0.72} fill="none" stroke="#C96F24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" color="#C96F24" dangerouslySetInnerHTML={{ __html: glyph }} />
    </div>
  )
}
