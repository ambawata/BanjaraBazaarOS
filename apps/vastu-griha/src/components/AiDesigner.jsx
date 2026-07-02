import React from 'react'

const TEMPLATES = [
  {
    id: 'east_2bhk',
    title: '30x40 East-Facing 2BHK',
    description: 'Perfect for small families. Optimized for maximum morning light, ventilation, and a peaceful Southwest master bedroom.',
    plot: { width: 30, length: 40, shape: 'Rectangular', facing: 'East', tilt: 0 },
    rooms: [
      { id: '1', type: 'entrance', label: 'Main Entrance', x: 90, y: 10, width: 10, height: 15 },
      { id: '2', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
      { id: '3', type: 'kitchen', label: 'Kitchen (Agneya)', x: 70, y: 70, width: 25, height: 25 },
      { id: '4', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
      { id: '5', type: 'bedroom', label: 'Kids Bedroom', x: 5, y: 5, width: 35, height: 25 },
      { id: '6', type: 'toilet', label: 'Toilet', x: 5, y: 35, width: 25, height: 20 },
      { id: '7', type: 'living', label: 'Living Room', x: 45, y: 25, width: 45, height: 35 }
    ]
  },
  {
    id: 'north_3bhk',
    title: '40x60 North-Facing 3BHK',
    description: 'Spacious multi-bedroom villa plan featuring central Brahmasthan clearance, heavy Southwest stairs, and Northeast prayer sanctuary.',
    plot: { width: 40, length: 60, shape: 'Rectangular', facing: 'North', tilt: 0 },
    rooms: [
      { id: '11', type: 'entrance', label: 'Main Entrance', x: 40, y: 0, width: 20, height: 8 },
      { id: '12', type: 'pooja', label: 'Pooja Mandir', x: 75, y: 5, width: 20, height: 15 },
      { id: '13', type: 'kitchen', label: 'Kitchen (Southeast)', x: 75, y: 75, width: 20, height: 20 },
      { id: '14', type: 'bedroom', label: 'Master Bedroom (SW)', x: 5, y: 70, width: 30, height: 25 },
      { id: '15', type: 'bedroom', label: 'Guest Bedroom', x: 5, y: 10, width: 25, height: 25 },
      { id: '16', type: 'bedroom', label: 'Kids Bedroom', x: 40, y: 70, width: 25, height: 25 },
      { id: '17', type: 'toilet', label: 'Toilet (West)', x: 5, y: 45, width: 20, height: 18 },
      { id: '18', type: 'living', label: 'Living Lounge', x: 35, y: 25, width: 35, height: 35 },
      { id: '19', type: 'staircase', label: 'Staircase (South)', x: 75, y: 40, width: 20, height: 25 }
    ]
  },
  {
    id: 'west_2bhk',
    title: '30x50 West-Facing 2BHK',
    description: 'Specialized layout for West street access. Features a safe Northwest guest space and dining area in the West sector.',
    plot: { width: 30, length: 50, shape: 'Rectangular', facing: 'West', tilt: 0 },
    rooms: [
      { id: '21', type: 'entrance', label: 'Main Entrance', x: 0, y: 10, width: 10, height: 15 },
      { id: '22', type: 'pooja', label: 'Pooja Room', x: 75, y: 5, width: 20, height: 15 },
      { id: '23', type: 'kitchen', label: 'Kitchen', x: 75, y: 70, width: 20, height: 25 },
      { id: '24', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 65, width: 35, height: 30 },
      { id: '25', type: 'bedroom', label: 'Guest Bedroom', x: 5, y: 5, width: 35, height: 25 },
      { id: '26', type: 'toilet', label: 'Toilet', x: 5, y: 35, width: 25, height: 20 },
      { id: '27', type: 'living', label: 'Living & Dining', x: 45, y: 25, width: 45, height: 35 }
    ]
  },
  {
    id: 'south_1bhk',
    title: '30x30 South-Facing 1BHK',
    description: 'Compact apartment template utilizing Southeast fire entryway adjustments to negate standard Southern entrance defects.',
    plot: { width: 30, length: 30, shape: 'Square', facing: 'South', tilt: 0 },
    rooms: [
      { id: '31', type: 'entrance', label: 'Main Entrance (SE)', x: 75, y: 90, width: 20, height: 10 },
      { id: '32', type: 'pooja', label: 'Pooja Corner', x: 75, y: 5, width: 20, height: 18 },
      { id: '33', type: 'kitchen', label: 'Kitchen', x: 75, y: 60, width: 20, height: 25 },
      { id: '34', type: 'bedroom', label: 'Master Bedroom', x: 5, y: 60, width: 40, height: 35 },
      { id: '35', type: 'toilet', label: 'Toilet (Northwest)', x: 5, y: 5, width: 25, height: 25 },
      { id: '36', type: 'living', label: 'Living Room', x: 35, y: 20, width: 35, height: 40 }
    ]
  }
]

export default function AiDesigner({ onSelectTemplate }) {
  return (
    <div className="templates-list">
      <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 700, marginBottom: '4px' }}>AI Layout Designer</h3>
      <p style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', textTransform: 'uppercase', marginBottom: '16px' }}>Select an optimized baseline</p>
      
      {TEMPLATES.map(tpl => (
        <div 
          key={tpl.id} 
          className="template-card"
          onClick={() => onSelectTemplate(tpl)}
        >
          <div className="template-card-title">{tpl.title}</div>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.4', marginBottom: '8px' }}>
            {tpl.description}
          </p>
          <div className="template-card-meta">
            <i className="ti ti-dimensions" style={{ marginRight: '4px' }}></i>
            Size: {tpl.plot.width}x{tpl.plot.length} ft | Facing: {tpl.plot.facing}
          </div>
        </div>
      ))}
      
      <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border2)', marginTop: '20px' }}>
        <h4 style={{ fontSize: '11px', fontFamily: 'var(--fm)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px' }}>What is AI Designer?</h4>
        <p style={{ fontSize: '11px', color: 'var(--text3)', lineHeight: '1.4' }}>
          Our AI generator loads configurations verified by professional Vastu Acharyas. Select a template and easily customize the sizes or positions.
        </p>
      </div>
    </div>
  )
}
