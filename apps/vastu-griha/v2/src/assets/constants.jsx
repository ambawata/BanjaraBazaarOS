import React from 'react'

export const GOAL_SVGS = {
  build: (
    <svg viewBox="0 0 100 80" width="60" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="25" y="35" width="50" height="40" rx="4" />
      <polygon points="20,35 50,10 80,35" />
      <rect x="42" y="50" width="16" height="25" />
      <circle cx="70" cy="50" r="3" fill="var(--emerald)" />
    </svg>
  ),
  renovate: (
    <svg viewBox="0 0 100 80" width="60" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <path d="M20,55 H80 V70 H20 Z" />
      <rect x="28" y="38" width="44" height="18" rx="6" />
      <line x1="15" y1="20" x2="15" y2="55" stroke="var(--gold)" />
      <circle cx="15" cy="18" r="4" fill="var(--gold)" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 100 80" width="60" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="30" y="15" width="40" height="55" rx="4" />
      <line x1="38" y1="30" x2="62" y2="30" />
      <line x1="38" y1="42" x2="62" y2="42" />
      <circle cx="70" cy="60" r="10" stroke="var(--accent)" />
      <line x1="77" y1="67" x2="85" y2="75" strokeWidth="3" />
    </svg>
  ),
  remedy: (
    <svg viewBox="0 0 100 80" width="60" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <circle cx="35" cy="65" r="5" fill="var(--accent)" />
      <circle cx="75" cy="65" r="5" fill="var(--accent)" />
      <path d="M15,20 H30 L45,55 H80 L90,28 H25" />
      <path d="M55,20 Q60,10 65,22 Q70,30 55,30" fill="var(--emerald)" stroke="var(--emerald)" />
    </svg>
  )
}

export const STYLE_SVGS = {
  modern: (
    <svg viewBox="0 0 100 60" width="80" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="15" y="10" width="70" height="40" rx="2" />
      <rect x="25" y="20" width="20" height="30" />
      <line x1="55" y1="10" x2="55" y2="50" />
      <rect x="62" y="22" width="16" height="12" />
    </svg>
  ),
  traditional: (
    <svg viewBox="0 0 100 60" width="80" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="25" y="28" width="50" height="26" />
      <polygon points="15,28 50,2 85,28" />
      <polygon points="30,16 50,4 70,16" />
      <rect x="44" y="38" width="12" height="16" />
    </svg>
  ),
  contemporary: (
    <svg viewBox="0 0 100 60" width="80" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="15" y="25" width="45" height="28" rx="2" />
      <rect x="45" y="10" width="40" height="25" rx="2" />
      <circle cx="70" cy="22" r="4" fill="var(--gold)" />
    </svg>
  ),
  minimalist: (
    <svg viewBox="0 0 100 60" width="80" height="50" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2 }}>
      <rect x="20" y="15" width="60" height="38" />
      <rect x="46" y="32" width="8" height="21" />
      <circle cx="35" cy="28" r="3" fill="var(--accent)" />
    </svg>
  )
}

export const EXPANDED_ROOMS_CATALOG = {
  private: [
    { type: 'bedroom', label: 'Master Bedroom', icon: 'ti ti-bed', w: 30, h: 25 },
    { type: 'bedroom', label: 'Parents Bedroom', icon: 'ti ti-users', w: 25, h: 25 },
    { type: 'bedroom', label: 'Kids Bedroom', icon: 'ti ti-mood-kid', w: 25, h: 25 },
    { type: 'bedroom', label: 'Guest Bedroom', icon: 'ti ti-user-plus', w: 25, h: 25 },
    { type: 'bedroom', label: 'Servant Room', icon: 'ti ti-user-cog', w: 18, h: 18 },
    { type: 'bedroom', label: 'Driver Room', icon: 'ti ti-car-crane', w: 18, h: 18 }
  ],
  living: [
    { type: 'living', label: 'Living Room', icon: 'ti ti-sofa', w: 35, h: 30 },
    { type: 'living', label: 'Dining Area', icon: 'ti ti-tools-kitchen-2', w: 25, h: 20 },
    { type: 'custom', label: 'Study Room', icon: 'ti ti-notebook', w: 20, h: 20 },
    { type: 'custom', label: 'Home Office', icon: 'ti ti-device-laptop', w: 20, h: 20 },
    { type: 'custom', label: 'Home Theatre', icon: 'ti ti-movie', w: 30, h: 25 },
    { type: 'custom', label: 'Gym Room', icon: 'ti ti-barbell', w: 24, h: 20 }
  ],
  utility: [
    { type: 'kitchen', label: 'Kitchen Cooktop', icon: 'ti ti-soup', w: 22, h: 22 },
    { type: 'custom', label: 'Utility Room', icon: 'ti ti-wash', w: 15, h: 15 },
    { type: 'custom', label: 'Store Room', icon: 'ti ti-box', w: 15, h: 12 },
    { type: 'custom', label: 'Pantry Space', icon: 'ti ti-cup', w: 12, h: 12 },
    { type: 'toilet', label: 'Bathroom / Toilet', icon: 'ti ti-wash-dryclean', w: 18, h: 15 },
    { type: 'toilet', label: 'Powder Room', icon: 'ti ti-eyeglass', w: 12, h: 12 }
  ],
  vedic_heavy: [
    { type: 'pooja', label: 'Pooja Temple Mandir', icon: 'ti ti-flame', w: 15, h: 15 },
    { type: 'staircase', label: 'Staircase Block', icon: 'ti ti-arrow-merge', w: 15, h: 25 },
    { type: 'lift', label: 'Elevator / Lift Shaft', icon: 'ti ti-arrows-up-down', w: 15, h: 15 }
  ],
  outdoor_power: [
    { type: 'entrance', label: 'Main Entrance Gate', icon: 'ti ti-door-enter', w: 15, h: 8 },
    { type: 'compound-wall', label: 'Compound Wall Boundary', icon: 'ti ti-square-toggle', w: 100, h: 6 },
    { type: 'solar', label: 'Solar Array Panels', icon: 'ti ti-sun', w: 18, h: 15 },
    { type: 'solar', label: 'EV Charging Station', icon: 'ti ti-charging-pile', w: 14, h: 14 },
    { type: 'custom', label: 'Parking Area', icon: 'ti ti-car', w: 25, h: 20 },
    { type: 'custom', label: 'Garden Area', icon: 'ti ti-leaf', w: 25, h: 20 },
    { type: 'custom', label: 'Lawn Area', icon: 'ti ti-seeding', w: 30, h: 15 },
    { type: 'custom', label: 'Courtyard Space', icon: 'ti ti-layout-grid', w: 20, h: 20 },
    { type: 'custom', label: 'Swimming Pool', icon: 'ti ti-ripple', w: 35, h: 20 }
  ],
  water_drain: [
    { type: 'borewell', label: 'Underground Water Tank', icon: 'ti ti-droplet', w: 12, h: 12 },
    { type: 'over-head-tank', label: 'Overhead Tank', icon: 'ti ti-arrow-bar-to-up', w: 14, h: 14 },
    { type: 'septic-tank', label: 'Septic Tank Block', icon: 'ti ti-arrow-bar-to-down', w: 15, h: 12 }
  ]
}
