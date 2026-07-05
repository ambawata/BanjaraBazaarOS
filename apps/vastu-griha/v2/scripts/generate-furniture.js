import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DATA = [
  // 1. Rooms Category
  {
    id: "room-bedroom",
    name: "Master Bedroom Layout",
    category: "rooms",
    tags: ["bedroom", "master", "room", "floorplan"],
    defaultWidthFt: 14.0,
    defaultDepthFt: 16.0,
    description: "Standard layout blueprint for a Master Bedroom. Vastu recommends South-West placement for the house owner to secure stability and authority.",
    rooms: ["Master Bedroom"],
    directions: ["South-West"],
    material: "Multi-Material",
    color: "Neutral Warm",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="90" rx="4" stroke="#3d2616" stroke-width="2" stroke-dasharray="2 2" />
      <rect x="25" y="30" width="50" height="60" rx="3" stroke="#3d2616" stroke-width="1.5" fill="#fdfaf6" />
      <rect x="30" y="35" width="16" height="10" rx="1" stroke="#3d2616" stroke-width="1.2" />
      <rect x="54" y="35" width="16" height="10" rx="1" stroke="#3d2616" stroke-width="1.2" />
      <line x1="25" y1="55" x2="75" y2="55" stroke="#3d2616" stroke-width="1.5" />
      <rect x="12" y="30" width="10" height="12" rx="1" stroke="#3d2616" stroke-width="1" fill="#e6c594" />
      <rect x="78" y="30" width="10" height="12" rx="1" stroke="#3d2616" stroke-width="1" fill="#e6c594" />
      <text x="50" y="20" fill="#3d2616" font-family="sans-serif" font-size="6" text-anchor="middle" letter-spacing="1">BEDROOM</text>
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="90" rx="4" stroke="#3d2616" stroke-width="2.5" />
      <text x="50" y="52" fill="#3d2616" font-family="sans-serif" font-size="7" text-anchor="middle">BEDROOM</text>
    </svg>`
  },

  // 2. Decor Category
  {
    id: "decor-mirror",
    name: "Sacred Circular Mirror",
    category: "decor",
    tags: ["mirror", "decor", "glass", "reflection"],
    defaultWidthFt: 2.0,
    defaultDepthFt: 0.2,
    description: "Sacred round wall mirror framed in copper. Mirrors reflect energy; placement on North or East walls attracts wealth and abundance.",
    rooms: ["Living Room", "Dressing Room", "Foyer"],
    directions: ["North", "East", "North-East"],
    material: "Copper Frame & Glass",
    color: "Copper & Mirror",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" stroke="#3d2616" stroke-width="3" fill="#fdfaf6" />
      <circle cx="50" cy="50" r="34" stroke="#3d2616" stroke-width="1" stroke-dasharray="3 3" />
      <path d="M 65 30 L 72 23 M 55 25 L 68 12 M 72 45 L 78 39" stroke="#e6c594" stroke-width="2" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="50" x2="80" y2="50" stroke="#3d2616" stroke-width="4" stroke-linecap="round" />
      <line x1="20" y1="46" x2="80" y2="46" stroke="#cfa15c" stroke-width="1" />
    </svg>`
  },

  // 3. Plants Category
  {
    id: "plants-tulsi",
    name: "Potted Tulsi Plant",
    category: "plants",
    tags: ["tulsi", "plant", "sacred", "natural"],
    defaultWidthFt: 1.5,
    defaultDepthFt: 1.5,
    description: "Sacred potted Holy Basil (Tulsi) plant. Emits high sattvic vibrations; must be kept in the North-East or Center (Brahmasthan) of the house.",
    rooms: ["Courtyard", "Balcony", "Pooja Room"],
    directions: ["North-East", "East", "North", "Center"],
    material: "Clay Pot & Plant",
    color: "Terracotta & Green",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 65 L 35 90 L 65 90 L 70 65 Z" stroke="#3d2616" stroke-width="2" fill="#e07a5f" />
      <line x1="28" y1="65" x2="72" y2="65" stroke="#3d2616" stroke-width="2" />
      <path d="M 50 65 L 50 20" stroke="#3d2616" stroke-width="2" />
      <path d="M 50 50 Q 30 45 25 35" stroke="#3d2616" stroke-width="1.5" />
      <path d="M 50 45 Q 70 40 75 30" stroke="#3d2616" stroke-width="1.5" />
      <path d="M 50 35 Q 35 25 40 15" stroke="#3d2616" stroke-width="1.5" />
      <path d="M 50 30 Q 65 20 60 10" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="25" cy="35" r="4" fill="#81b29a" />
      <circle cx="75" cy="30" r="4" fill="#81b29a" />
      <circle cx="40" cy="15" r="3.5" fill="#81b29a" />
      <circle cx="60" cy="10" r="3.5" fill="#81b29a" />
      <circle cx="50" cy="20" r="3" fill="#81b29a" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="20" fill="#e07a5f" stroke="#3d2616" stroke-width="2" />
      <circle cx="50" cy="50" r="14" fill="#81b29a" />
    </svg>`
  },

  // 4. Utilities Category
  {
    id: "utilities-water-tank",
    name: "Overhead Water Tank",
    category: "utilities",
    tags: ["water", "tank", "utility", "overhead"],
    defaultWidthFt: 5.0,
    defaultDepthFt: 5.0,
    description: "Heavy overhead storage water tank. Water represents elements; should be located in the West or North-West to prevent financial leakage.",
    rooms: ["Roof", "Utility Area"],
    directions: ["West", "North-West"],
    material: "Polyethylene",
    color: "Dark Blue",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="60" height="55" rx="5" stroke="#3d2616" stroke-width="2.5" fill="#3d405b" />
      <line x1="20" y1="40" x2="80" y2="40" stroke="#3d2616" stroke-width="1.5" />
      <line x1="20" y1="52" x2="80" y2="52" stroke="#3d2616" stroke-width="1.5" />
      <line x1="20" y1="64" x2="80" y2="64" stroke="#3d2616" stroke-width="1.5" />
      <rect x="40" y="15" width="20" height="10" rx="1" stroke="#3d2616" stroke-width="2" fill="#3d405b" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#3d405b" stroke="#3d2616" stroke-width="3" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },

  // 5. Structure Category
  {
    id: "structure-main-door",
    name: "Main Entrance Door",
    category: "structure",
    tags: ["door", "entrance", "main", "structure"],
    defaultWidthFt: 4.0,
    defaultDepthFt: 0.8,
    description: "Main entryway door opening inwards clockwise. Must be placed in auspicious grid coordinates (Pada) on the North or East wall to invite prosperity.",
    rooms: ["Entrance Lobby", "Foyer"],
    directions: ["North", "East", "North-East"],
    material: "Teak Wood & Brass Fittings",
    color: "Natural Teak & Gold",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="50" x2="30" y2="50" stroke="#3d2616" stroke-width="4" stroke-linecap="round" />
      <line x1="70" y1="50" x2="90" y2="50" stroke="#3d2616" stroke-width="4" stroke-linecap="round" />
      <line x1="30" y1="50" x2="30" y2="10" stroke="#cfa15c" stroke-width="3" stroke-linecap="round" />
      <path d="M 30 10 A 40 40 0 0 1 70 50" stroke="#3d2616" stroke-width="1.5" stroke-dasharray="3 3" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="50" x2="30" y2="50" stroke="#3d2616" stroke-width="5" />
      <line x1="70" y1="50" x2="90" y2="50" stroke="#3d2616" stroke-width="5" />
      <line x1="30" y1="50" x2="30" y2="10" stroke="#3d2616" stroke-width="2.5" />
      <path d="M 30 10 A 40 40 0 0 1 70 50" stroke="#3d2616" stroke-width="1.5" stroke-dasharray="2 3" />
    </svg>`
  },

  // 6. Vastu Remedies Category
  {
    id: "vastu-pyramid",
    name: "Vastu Copper Pyramid",
    category: "vastu",
    tags: ["pyramid", "copper", "vastu", "remedy"],
    defaultWidthFt: 0.8,
    defaultDepthFt: 0.8,
    description: "Sacred 9x9 grid copper pyramid. Emits neutralizing scalar energy; placed in sub-optimal zones (like a toilet in the North-East) to absorb defects.",
    rooms: ["Living Room", "Toilet", "Entrance"],
    directions: ["North-East", "South-West", "Center"],
    material: "Solid Pure Copper",
    color: "Shiny Copper Rose",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,75 50,85 80,75 50,60" stroke="#3d2616" stroke-width="1.5" fill="#fdfaf6" />
      <line x1="50" y1="20" x2="20" y2="75" stroke="#cfa15c" stroke-width="2.5" />
      <line x1="50" y1="20" x2="50" y2="85" stroke="#cfa15c" stroke-width="2.5" />
      <line x1="50" y1="20" x2="80" y2="75" stroke="#cfa15c" stroke-width="2.5" />
      <line x1="50" y1="20" x2="50" y2="60" stroke="#3d2616" stroke-width="1" stroke-dasharray="2 2" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="50" height="50" stroke="#3d2616" stroke-width="3" fill="#fdfaf6" />
      <line x1="25" y1="25" x2="75" y2="75" stroke="#3d2616" stroke-width="1.5" />
      <line x1="75" y1="25" x2="25" y2="75" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },

  // 7. Symbols Category
  {
    id: "symbols-swastika",
    name: "Auspicious Swastika",
    category: "symbols",
    tags: ["swastika", "symbol", "sacred", "auspicious"],
    defaultWidthFt: 0.8,
    defaultDepthFt: 0.8,
    description: "Sacred geometric Swastika symbol. Invites Ganesha's energy and removes spatial obstacles; placed above main doors or inside pooja altars.",
    rooms: ["Pooja Room", "Entrance"],
    directions: ["North-East", "East", "North"],
    material: "Brass Plate",
    color: "Gold Brass",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 15 L 50 85 M 15 50 L 85 50 M 50 15 L 75 15 M 50 85 L 25 85 M 15 50 L 15 25 M 85 50 L 85 75" 
            stroke="#e07a5f" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter" />
      <circle cx="35" cy="35" r="3" fill="#e07a5f" />
      <circle cx="65" cy="35" r="3" fill="#e07a5f" />
      <circle cx="35" cy="65" r="3" fill="#e07a5f" />
      <circle cx="65" cy="65" r="3" fill="#e07a5f" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 20 L 50 80 M 20 50 L 80 50 M 50 20 H 70 M 50 80 H 30 M 20 50 V 30 M 80 50 V 70" stroke="#3d2616" stroke-width="4" stroke-linecap="round" />
    </svg>`
  },

  // 8. Backgrounds Category
  {
    id: "backgrounds-grid-pattern",
    name: "Modular Alignment Grid",
    category: "backgrounds",
    tags: ["grid", "background", "pattern", "blueprint"],
    defaultWidthFt: 30.0,
    defaultDepthFt: 40.0,
    description: "Aligning diagnostic layout grid corresponding to Vastu's 9x9 Pada division. Serves as coordinates backdrop for planning.",
    rooms: ["Canvas Background"],
    directions: ["Center", "North", "South", "East", "West"],
    material: "Digital Layer",
    color: "Grid White & Blue",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" />
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3d2616" stroke-width="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />
      <line x1="50" y1="0" x2="50" y2="100" stroke="#3d2616" stroke-width="1" opacity="0.5" stroke-dasharray="2 2" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#3d2616" stroke-width="1" opacity="0.5" stroke-dasharray="2 2" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="33" y1="0" x2="33" y2="100" stroke="#3d2616" stroke-width="1" opacity="0.2" />
      <line x1="66" y1="0" x2="66" y2="100" stroke="#3d2616" stroke-width="1" opacity="0.2" />
      <line x1="0" y1="33" x2="100" y2="33" stroke="#3d2616" stroke-width="1" opacity="0.2" />
      <line x1="0" y1="66" x2="100" y2="66" stroke="#3d2616" stroke-width="1" opacity="0.2" />
    </svg>`
  },

  // 9. Avatars Category
  {
    id: "avatars-expert",
    name: "Vastu Expert Consultant",
    category: "avatars",
    tags: ["avatar", "expert", "consultant", "profile"],
    defaultWidthFt: 2.0,
    defaultDepthFt: 2.0,
    description: "Profile avatar template representing certified Vastu consultants and Acharyas.",
    rooms: ["Expert Consultation Panel"],
    directions: ["Center"],
    material: "Digital Graphic",
    color: "Gold & White Aura",
    previewSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="35" r="18" stroke="#3d2616" stroke-width="2" fill="#fdfaf6" />
      <path d="M 20 80 C 20 62, 80 62, 80 80" stroke="#3d2616" stroke-width="2" stroke-linecap="round" fill="#e6c594" />
      <circle cx="50" cy="50" r="44" stroke="#cfa15c" stroke-width="0.8" stroke-dasharray="4 4" opacity="0.6" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <circle cx="50" cy="50" r="10" fill="#fdfaf6" />
    </svg>`
  },

  // 10. Furniture Category (26 items)
  {
    id: "furniture-sofa",
    name: "Premium Three-Seater Sofa",
    category: "furniture",
    tags: ["sofa", "couch", "seating", "living room", "modern"],
    defaultWidthFt: 7.0,
    defaultDepthFt: 3.2,
    description: "Premium three-seater upholstered fabric sofa with natural oak details and soft cushions. Placed in the South or West for grounding stability.",
    rooms: ["Living Room", "Family Lounge"],
    directions: ["South", "West", "South-West"],
    material: "Oak Wood & Linen Fabric",
    color: "Warm Cream",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="145" rx="75" ry="15" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 30 110 L 30 75 Q 30 65 40 65 L 160 65 Q 170 65 170 75 L 170 110 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 25 110 L 25 95 Q 25 90 32 90 L 45 90 Q 52 90 52 95 L 52 125 L 35 125 Q 25 125 25 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 175 110 L 175 95 Q 175 90 168 90 L 155 90 Q 148 90 148 95 L 148 125 L 165 125 Q 175 125 175 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="48" y="105" width="104" height="28" rx="6" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <line x1="82" y1="105" x2="82" y2="133" stroke="#3d2616" stroke-width="1.8" />
      <line x1="118" y1="105" x2="118" y2="133" stroke="#3d2616" stroke-width="1.8" />
      <rect x="52" y="72" width="30" height="33" rx="4" fill="#e07a5f" stroke="#3d2616" stroke-width="2" />
      <rect x="85" y="72" width="30" height="33" rx="4" fill="#e07a5f" stroke="#3d2616" stroke-width="2" />
      <rect x="118" y="72" width="30" height="33" rx="4" fill="#e07a5f" stroke="#3d2616" stroke-width="2" />
      <line x1="32" y1="125" x2="28" y2="142" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="168" y1="125" x2="172" y2="142" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="160" height="120" rx="8" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <rect x="20" y="40" width="20" height="120" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="160" y="40" width="20" height="120" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="40" y="40" width="120" height="20" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <line x1="80" y1="60" x2="80" y2="160" stroke="#3d2616" stroke-width="2" />
      <line x1="120" y1="60" x2="120" y2="160" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-armchair",
    name: "Linen Cushion Armchair",
    category: "furniture",
    tags: ["armchair", "chair", "seating", "bedroom", "living room"],
    defaultWidthFt: 3.0,
    defaultDepthFt: 3.0,
    description: "Cozy upholstered armchair with oak wood trims and sage green velvet back support cushion. Perfect accent seating for living rooms or bedroom reading corners.",
    rooms: ["Living Room", "Bedroom", "Study"],
    directions: ["South", "West", "North-West"],
    material: "Oak Wood & Linen Fabric",
    color: "Sage Green & Cream",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="145" rx="50" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 50 110 L 50 75 Q 50 65 60 65 L 140 65 Q 150 65 150 75 L 150 110 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 45 110 L 45 92 Q 45 87 52 87 L 65 87 Q 72 87 72 92 L 72 125 L 55 125 Q 45 125 45 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 155 110 L 155 92 Q 155 87 148 87 L 135 87 Q 128 87 128 92 L 128 125 L 145 125 Q 155 125 155 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="68" y="102" width="64" height="28" rx="6" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="72" y="72" width="56" height="30" rx="4" fill="#a3b19b" stroke="#3d2616" stroke-width="2" />
      <line x1="55" y1="125" x2="50" y2="142" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="145" y1="125" x2="150" y2="142" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="120" height="120" rx="8" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <rect x="40" y="40" width="20" height="120" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="140" y="40" width="20" height="120" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="60" y="40" width="80" height="20" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-recliner",
    name: "Ergonomic Lounge Recliner",
    category: "furniture",
    tags: ["recliner", "lounge", "chair", "seating", "comfort"],
    defaultWidthFt: 3.2,
    defaultDepthFt: 3.5,
    description: "Premium ergonomic recliner with terracotta cushioning and high lumbar support. Perfect remedy chair for grounding and stress relief.",
    rooms: ["Living Room", "Study"],
    directions: ["South", "West", "South-West"],
    material: "Walnut Wood & Suede Fabric",
    color: "Terracotta Red",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="148" rx="46" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 60 100 L 50 65 Q 46 55 58 55 L 142 55 Q 154 55 150 65 L 140 100 Z" fill="#e07a5f" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="74" y="62" width="52" height="18" rx="9" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <rect x="58" y="98" width="84" height="34" rx="8" fill="#e07a5f" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 44 110 L 44 95 Q 44 90 52 90 L 64 90 Q 72 90 72 95 L 72 130 L 58 130 Q 44 130 44 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 156 110 L 156 95 Q 156 90 148 90 L 136 90 Q 128 90 128 95 L 128 130 L 142 130 Q 156 130 156 110 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 85 130 L 80 145 L 120 145 L 115 130 Z" fill="#3d2616" stroke="#3d2616" stroke-width="1" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="140" rx="10" fill="#e07a5f" stroke="#3d2616" stroke-width="3" />
      <rect x="40" y="45" width="20" height="100" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="140" y="45" width="20" height="100" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="60" y="30" width="80" height="25" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-dining-chair",
    name: "Oak Wood Dining Chair",
    category: "furniture",
    tags: ["chair", "dining", "seating", "wooden", "dining room"],
    defaultWidthFt: 1.8,
    defaultDepthFt: 1.8,
    description: "Sleek dining chair made from solid natural oak with comfortable cushioned seat. Follows clean Scandinavian design principles.",
    rooms: ["Dining Room", "Kitchen"],
    directions: ["East", "North", "West"],
    material: "Oak Wood & Cushion",
    color: "Natural Wood & Ivory",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="145" rx="30" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="75" y1="110" x2="68" y2="145" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="125" y1="110" x2="132" y2="145" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="85" y1="110" x2="80" y2="140" stroke="#3d2616" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <line x1="115" y1="110" x2="120" y2="140" stroke="#3d2616" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <path d="M 72 105 L 75 55 M 128 105 L 125 55" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <path d="M 72 58 C 85 52, 115 52, 128 58" stroke="#3d2616" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M 73 70 C 85 66, 115 66, 127 70" stroke="#e6c594" stroke="#3d2616" stroke-width="2" stroke-linecap="round" />
      <path d="M 68 98 Q 100 95 132 98 L 128 112 Q 100 115 72 112 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="110" r="45" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <path d="M 60 78 C 75 65, 125 65, 140 78" stroke="#3d2616" stroke-width="5" fill="none" stroke-linecap="round" />
    </svg>`
  },
  {
    id: "furniture-office-chair",
    name: "Ergonomic Office Task Chair",
    category: "furniture",
    tags: ["chair", "office", "desk", "task", "work", "seating"],
    defaultWidthFt: 2.2,
    defaultDepthFt: 2.2,
    description: "High-back office task chair featuring lumbar support adjustments and double-wheel casters. Perfect for maximizing focus and productivity in study sectors.",
    rooms: ["Study", "Home Office"],
    directions: ["West", "North", "East"],
    material: "Nylon Frame & Mesh Fabric",
    color: "Slate Blue & Black",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="155" rx="38" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 100 135 L 70 152 M 100 135 L 130 152 M 100 135 L 100 158 M 100 135 L 82 140 M 100 135 L 118 140" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <circle cx="70" cy="154" r="4" fill="#3d2616" />
      <circle cx="130" cy="154" r="4" fill="#3d2616" />
      <circle cx="100" cy="159" r="4" fill="#3d2616" />
      <rect x="96" y="112" width="8" height="25" rx="1" fill="#3d2616" stroke="#3d2616" stroke-width="1" />
      <path d="M 52 90 L 52 82 Q 52 76 60 76 L 68 76" stroke="#3d2616" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 148 90 L 148 82 Q 148 76 140 76 L 132 76" stroke="#3d2616" stroke-width="3" stroke-linecap="round" fill="none" />
      <rect x="60" y="88" width="80" height="24" rx="6" fill="#3d405b" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 66 88 L 66 50 Q 66 40 78 40 L 122 40 Q 134 40 134 50 L 134 88 Z" fill="#81b29a" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 72 68 Q 100 62 128 68" stroke="#3d2616" stroke-width="1.8" fill="none" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="45" fill="#3d405b" stroke="#3d2616" stroke-width="3" />
      <path d="M 50 100 L 40 100 M 150 100 L 160 100" stroke="#3d2616" stroke-width="4" stroke-linecap="round" />
      <path d="M 65 65 C 80 50, 120 50, 135 65" stroke="#3d2616" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M 75 140 L 125 140" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-coffee-table",
    name: "Organic Wood Coffee Table",
    category: "furniture",
    tags: ["table", "coffee", "wood", "living room", "centerpiece"],
    defaultWidthFt: 4.2,
    defaultDepthFt: 2.2,
    description: "Low-profile solid oak table featuring organic grain lines and curved edges. Balances space energy when placed in the North-East center of the living area.",
    rooms: ["Living Room", "Family Lounge"],
    directions: ["North-East", "East", "North"],
    material: "Oak Wood",
    color: "Natural Wood Honey",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="148" rx="55" ry="15" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="70" y1="95" x2="60" y2="148" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
      <line x1="130" y1="95" x2="140" y2="148" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
      <line x1="100" y1="95" x2="100" y2="152" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 45 92 C 30 78, 60 62, 100 62 C 140 62, 170 78, 155 92 C 140 106, 110 110, 100 110 C 90 110, 60 106, 45 92 Z" fill="#e6c594" stroke="#3d2616" stroke-width="3" stroke-linejoin="round" />
      <path d="M 45 92 C 60 106, 90 110, 100 110 C 110 110, 140 106, 155 92 L 155 98 C 140 112, 110 116, 100 116 C 90 116, 60 112, 45 98 Z" fill="#d4a373" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <path d="M 68 80 Q 100 72 132 80" stroke="#3d2616" stroke-width="1" stroke-linecap="round" opacity="0.4" />
      <path d="M 80 88 Q 100 82 120 88" stroke="#3d2616" stroke-width="1" stroke-linecap="round" opacity="0.3" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="100" rx="75" ry="40" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#d4a373" stroke-width="1" stroke-dasharray="3 3" />
    </svg>`
  },
  {
    id: "furniture-dining-table",
    name: "Oak Wood Dining Table",
    category: "furniture",
    tags: ["table", "dining", "wood", "dining room"],
    defaultWidthFt: 6.0,
    defaultDepthFt: 3.5,
    description: "Solid oak dining table designed for family gatherings. Provides stable grounding when oriented in the West dining zone.",
    rooms: ["Dining Room"],
    directions: ["West", "South", "North-West"],
    material: "Oak Wood",
    color: "Oak Honey",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="35,150 165,150 155,160 45,160" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="36" y="90" width="14" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <rect x="150" y="90" width="14" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <rect x="58" y="90" width="10" height="54" rx="1" fill="#3d2616" opacity="0.15" />
      <rect x="132" y="90" width="10" height="54" rx="1" fill="#3d2616" opacity="0.15" />
      <polygon points="20,70 180,70 170,95 30,95" fill="#e6c594" stroke="#3d2616" stroke-width="3" stroke-linejoin="round" />
      <polygon points="30,95 170,95 170,103 30,103" fill="#d4a373" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <polygon points="90,70 110,70 106,95 94,95" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="100" cy="80" r="4" fill="#a3b19b" stroke="#3d2616" stroke-width="1" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="45" width="170" height="110" rx="4" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <line x1="15" y1="100" x2="185" y2="100" stroke="#d4a373" stroke-width="1.5" stroke-dasharray="4 4" />
      <rect x="90" y="45" width="20" height="110" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-study-table",
    name: "Home Study Desk",
    category: "furniture",
    tags: ["table", "desk", "study", "work", "drawers"],
    defaultWidthFt: 4.5,
    defaultDepthFt: 2.2,
    description: "Compact study desk with integrated drawer storage cabinet. Recommended placement in the North or West directions to stimulate concentration and academic success.",
    rooms: ["Study", "Bedroom", "Home Office"],
    directions: ["North", "East", "West"],
    material: "Teak Wood",
    color: "Natural Teak Brown",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="148" width="130" height="12" rx="4" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="125" y="86" width="35" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <line x1="125" y1="108" x2="160" y2="108" stroke="#3d2616" stroke-width="2.2" />
      <line x1="125" y1="130" x2="160" y2="130" stroke="#3d2616" stroke-width="2.2" />
      <rect x="140" y="94" width="5" height="6" rx="1" fill="#3d2616" />
      <rect x="140" y="116" width="5" height="6" rx="1" fill="#3d2616" />
      <rect x="140" y="138" width="5" height="6" rx="1" fill="#3d2616" />
      <rect x="40" y="86" width="12" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <polygon points="30,64 170,64 165,86 35,86" fill="#e6c594" stroke="#3d2616" stroke-width="3" stroke-linejoin="round" />
      <polygon points="42,86 125,86 125,120 42,120" fill="#3d2616" opacity="0.08" />
      <rect x="80" y="70" width="30" height="10" rx="1" fill="#3d405b" stroke="#3d2616" stroke-width="1.2" />
      <line x1="75" y1="81" x2="115" y2="81" stroke="#3d2616" stroke-width="2" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="150" height="110" rx="4" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <rect x="125" y="45" width="35" height="110" fill="none" stroke="#3d2616" stroke-width="1.5" />
      <rect x="80" y="55" width="40" height="15" fill="#3d405b" stroke="#3d2616" stroke-width="1" />
    </svg>`
  },
  {
    id: "furniture-console-table",
    name: "Entryway Console Table",
    category: "furniture",
    tags: ["table", "console", "entryway", "hallway"],
    defaultWidthFt: 4.0,
    defaultDepthFt: 1.5,
    description: "Slender, low-depth entryway console table with lower display shelf. Holds sacred objects or plants to greet positive energy at the home's main threshold.",
    rooms: ["Entryway", "Foyer", "Hallway"],
    directions: ["North-East", "East", "North"],
    material: "Oak Wood & Clay Base",
    color: "Oak Honey & Clay",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="155" rx="55" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="56" y1="85" x2="52" y2="155" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="144" y1="85" x2="148" y2="155" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="68" y1="85" x2="68" y2="150" stroke="#3d2616" stroke-width="1.8" opacity="0.6" />
      <line x1="132" y1="85" x2="132" y2="150" stroke="#3d2616" stroke-width="1.8" opacity="0.6" />
      <polygon points="56,125 144,125 141,130 59,130" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" />
      <polygon points="45,66 155,66 150,85 50,85" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <polygon points="50,85 150,85 150,91 50,91" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M 94 66 L 96 56 Q 96 52 100 52 Q 104 52 104 56 L 106 66 Z" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
      <rect x="95" y="60" width="10" height="6" rx="1" fill="#e07a5f" stroke="#3d2616" stroke-width="1" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="70" width="140" height="60" rx="3" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <ellipse cx="100" cy="100" rx="8" ry="6" fill="#81b29a" stroke="#3d2616" stroke-width="1" />
    </svg>`
  },
  {
    id: "furniture-tv-unit",
    name: "Minimalist Media TV Unit",
    category: "furniture",
    tags: ["tv", "unit", "media", "living room", "cabinet"],
    defaultWidthFt: 5.5,
    defaultDepthFt: 1.8,
    description: "Low-profile media unit with storage drawers and oak finishes. Helps clean and organize electronic energies in living spaces.",
    rooms: ["Living Room", "Bedroom", "Family Lounge"],
    directions: ["South-East", "North-West", "East"],
    material: "Teak Wood & Acrylic panels",
    color: "Natural Teak & Warm White",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="154" rx="72" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 30 115 L 30 142 L 170 142 L 170 115 Z" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="36" y="119" width="38" height="19" rx="1" fill="#e6c594" stroke="#3d2616" stroke-width="1.8" />
      <rect x="78" y="119" width="44" height="19" rx="1" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.8" />
      <rect x="126" y="119" width="38" height="19" rx="1" fill="#e6c594" stroke="#3d2616" stroke-width="1.8" />
      <polygon points="20,95 180,95 170,115 30,115" fill="#e6c594" stroke="#3d2616" stroke-width="3" stroke-linejoin="round" />
      <rect x="94" y="85" width="12" height="10" fill="#3d2616" />
      <polygon points="85,95 115,95 110,97 90,97" fill="#3d2616" />
      <rect x="52" y="46" width="96" height="42" rx="3" fill="#3d405b" stroke="#3d2616" stroke-width="3" />
      <path d="M 125 50 L 138 50 L 115 84 L 102 84 Z" fill="#ffffff" opacity="0.1" />
      <line x1="42" y1="142" x2="38" y2="152" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
      <line x1="158" y1="142" x2="162" y2="152" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="65" width="150" height="70" rx="3" fill="#d4a373" stroke="#3d2616" stroke-width="3" />
      <rect x="35" y="94" width="130" height="12" fill="#3d405b" stroke="#3d2616" stroke-width="2.5" />
    </svg>`
  },
  {
    id: "furniture-wardrobe",
    name: "Double Door Wooden Wardrobe",
    category: "furniture",
    tags: ["wardrobe", "closet", "cabinet", "bedroom", "storage"],
    defaultWidthFt: 4.0,
    defaultDepthFt: 2.2,
    description: "Tall wooden wardrobe cabinet with custom copper fittings. Excellent storage organizer for bedrooms, providing solid mass structure in heavier zones.",
    rooms: ["Bedroom", "Dressing Room"],
    directions: ["South-West", "South", "West"],
    material: "Walnut Wood & Brass details",
    color: "Natural Walnut Wood",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="65,160 135,160 145,165 55,165" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="60" y="45" width="80" height="115" rx="3" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <polygon points="56,38 144,38 140,46 60,46" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="65" y="50" width="33" height="104" fill="#e6c594" stroke="#3d2616" stroke-width="1.8" />
      <rect x="102" y="50" width="33" height="104" fill="#e6c594" stroke="#3d2616" stroke-width="1.8" />
      <rect x="65" y="132" width="70" height="22" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" />
      <line x1="90" y1="143" x2="110" y2="143" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <rect x="94" y="90" width="3" height="18" rx="1" fill="#cfa15c" stroke="#3d2616" stroke-width="1" />
      <rect x="103" y="90" width="3" height="18" rx="1" fill="#cfa15c" stroke="#3d2616" stroke-width="1" />
      <rect x="65" y="160" width="70" height="6" fill="#3d2616" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="45" width="120" height="110" rx="3" fill="#d4a373" stroke="#3d2616" stroke-width="3" />
      <line x1="100" y1="45" x2="100" y2="155" stroke="#3d2616" stroke-width="2" />
      <rect x="90" y="90" width="8" height="20" rx="1" fill="#cfa15c" />
      <rect x="102" y="90" width="8" height="20" rx="1" fill="#cfa15c" />
    </svg>`
  },
  {
    id: "furniture-bookshelf",
    name: "Ladder Bookcase Shelf",
    category: "furniture",
    tags: ["bookshelf", "bookcase", "shelf", "library", "storage"],
    defaultWidthFt: 3.5,
    defaultDepthFt: 1.5,
    description: "Ladder-style storage shelf in warm teak wood finish. Holds spiritual and academic texts to optimize wisdom energy when situated in the North-East.",
    rooms: ["Study", "Living Room", "Home Office"],
    directions: ["North-East", "North", "West"],
    material: "Teak Wood & Ceramic",
    color: "Natural Teak & Terracotta",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,162 140,162 145,166 55,166" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="68" y1="40" x2="60" y2="162" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="132" y1="40" x2="140" y2="162" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <polygon points="73,65 127,65 125,70 75,70" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <polygon points="70,95 130,95 128,100 72,100" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <polygon points="66,125 134,125 131,130 69,130" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <polygon points="62,152 138,152 135,157 65,157" fill="#e6c594" stroke="#3d2616" stroke-width="2" />
      <rect x="76" y="106" width="6" height="19" fill="#e07a5f" stroke="#3d2616" stroke-width="1.2" />
      <rect x="83" y="109" width="6" height="16" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
      <rect x="90" y="112" width="6" height="13" fill="#3d405b" stroke="#3d2616" stroke-width="1.2" />
      <path d="M 107 83 C 107 77, 115 77, 115 83 L 117 95 L 105 95 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="111" cy="88" r="3.5" fill="#e07a5f" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="65" width="100" height="70" rx="2" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <rect x="54" y="70" width="10" height="60" fill="#e07a5f" stroke="#3d2616" stroke-width="1.5" />
      <rect x="136" y="70" width="10" height="60" fill="#81b29a" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-bed",
    name: "Premium Double Bed",
    category: "furniture",
    tags: ["bed", "double", "sleeping", "bedroom", "headboard"],
    defaultWidthFt: 6.6,
    defaultDepthFt: 7.0,
    description: "Luxury double bed with robust walnut headboard and terracotta throw covers. The bed head must face South to ensure sound sleep.",
    rooms: ["Bedroom"],
    directions: ["South", "West", "South-West"],
    material: "Walnut Wood & Fabrics",
    color: "Natural Walnut & Terracotta",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="148" rx="66" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 40 100 L 40 55 Q 40 48 48 48 L 152 48 Q 160 48 160 55 L 160 100 Z" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="42" y="80" width="116" height="66" rx="6" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="50" y="60" width="44" height="26" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <rect x="106" y="60" width="44" height="26" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <rect x="58" y="70" width="28" height="10" rx="3" fill="#a3b19b" stroke="#3d2616" stroke-width="1.2" />
      <rect x="114" y="70" width="28" height="10" rx="3" fill="#a3b19b" stroke="#3d2616" stroke-width="1.2" />
      <path d="M 42 105 C 70 100, 130 100, 158 105" stroke="#3d2616" stroke-width="2" />
      <polygon points="42,105 158,105 158,146 42,146" fill="#e07a5f" opacity="0.15" />
      <path d="M 42 125 C 70 120, 130 120, 158 125 L 158 146 L 42 146 Z" fill="#e07a5f" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <line x1="48" y1="146" x2="44" y2="155" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="152" y1="146" x2="156" y2="155" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="140" height="140" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <rect x="30" y="30" width="140" height="15" fill="#d4a373" stroke="#3d2616" stroke-width="2" />
      <rect x="40" y="50" width="50" height="30" rx="2" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <rect x="110" y="50" width="50" height="30" rx="2" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <path d="M 30 110 H 170" stroke="#3d2616" stroke-width="2" />
      <path d="M 30 140 H 170" fill="#e07a5f" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-bunk-bed",
    name: "Dual Tier Bunk Bed",
    category: "furniture",
    tags: ["bed", "bunk", "kids", "bedroom", "frame"],
    defaultWidthFt: 3.5,
    defaultDepthFt: 6.6,
    description: "Compact dual-tier bunk bed in solid timber wood. Smart safety railings and built-in ladder makes it optimal for children's bedrooms.",
    rooms: ["Kids Bedroom", "Bedroom"],
    directions: ["North-West", "West", "East"],
    material: "Timber Wood & Cushions",
    color: "Linen Cream & Sage",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="162" rx="64" ry="10" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="42" y1="35" x2="42" y2="160" stroke="#3d2616" stroke-width="4.5" stroke-linecap="round" />
      <line x1="158" y1="35" x2="158" y2="160" stroke="#3d2616" stroke-width="4.5" stroke-linecap="round" />
      <rect x="44" y="115" width="112" height="38" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <polygon points="44,125 156,125 156,153 44,153" fill="#a3b19b" stroke="#3d2616" stroke-width="1.8" />
      <rect x="50" y="122" width="28" height="15" rx="2" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <rect x="44" y="55" width="112" height="38" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
      <polygon points="44,65 156,65 156,93 44,93" fill="#e07a5f" stroke="#3d2616" stroke-width="1.8" />
      <rect x="50" y="62" width="28" height="15" rx="2" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <line x1="82" y1="55" x2="156" y2="55" stroke="#3d2616" stroke-width="2" />
      <line x1="82" y1="65" x2="156" y2="65" stroke="#3d2616" stroke-width="2" />
      <line x1="100" y1="55" x2="100" y2="65" stroke="#3d2616" stroke-width="1.5" />
      <line x1="125" y1="55" x2="125" y2="65" stroke="#3d2616" stroke-width="1.5" />
      <line x1="68" y1="55" x2="68" y2="158" stroke="#d4a373" stroke-width="3.5" stroke-linecap="round" />
      <line x1="80" y1="55" x2="80" y2="158" stroke="#d4a373" stroke-width="3.5" stroke-linecap="round" />
      <line x1="68" y1="75" x2="80" y2="75" stroke="#3d2616" stroke-width="2" />
      <line x1="68" y1="95" x2="80" y2="95" stroke="#3d2616" stroke-width="2" />
      <line x1="68" y1="115" x2="80" y2="115" stroke="#3d2616" stroke-width="2" />
      <line x1="68" y1="135" x2="80" y2="135" stroke="#3d2616" stroke-width="2" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="30" width="100" height="140" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <line x1="50" y1="100" x2="150" y2="100" stroke="#3d2616" stroke-width="1.5" stroke-dasharray="4 4" />
      <rect x="70" y="35" width="60" height="15" fill="#d4a373" stroke="#3d2616" stroke-width="1.5" />
      <rect x="70" y="145" width="60" height="15" fill="#d4a373" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-side-table",
    name: "Oak Nightstand Side Table",
    category: "furniture",
    tags: ["table", "side", "nightstand", "bedroom"],
    defaultWidthFt: 2.0,
    defaultDepthFt: 2.0,
    description: "Compact single drawer bedroom nightstand table made from honey oak wood. Excellent bedside convenience companion.",
    rooms: ["Bedroom", "Living Room"],
    directions: ["South", "West", "North-West"],
    material: "Oak Wood & Brass",
    color: "Oak Honey",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="154" rx="30" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="70" y="94" width="60" height="52" rx="3" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <rect x="75" y="100" width="50" height="40" fill="#e6c594" stroke="#3d2616" stroke-width="1.8" />
      <circle cx="114" cy="120" r="3.5" fill="#cfa15c" stroke="#3d2616" stroke-width="1" />
      <polygon points="62,80 138,80 132,94 68,94" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <line x1="78" y1="146" x2="74" y2="154" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="122" y1="146" x2="126" y2="154" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="65" y="65" width="70" height="70" rx="3" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <circle cx="100" cy="100" r="5" fill="#cfa15c" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-bench",
    name: "Upholstered Entryway Bench",
    category: "furniture",
    tags: ["bench", "seating", "entryway", "cushion"],
    defaultWidthFt: 4.5,
    defaultDepthFt: 1.5,
    description: "Elegant tufted cushion entryway bench with supporting wooden frame legs. Provides simple visitor rest and hallway comfort.",
    rooms: ["Entryway", "Foyer", "Living Room"],
    directions: ["North", "East", "West"],
    material: "Walnut Wood & Velvet Fabric",
    color: "Terracotta Red",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="148" rx="72" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="38" y1="112" x2="162" y2="112" stroke="#3d2616" stroke-width="2.5" />
      <line x1="45" y1="124" x2="155" y2="124" stroke="#3d2616" stroke-width="1.8" />
      <line x1="45" y1="112" x2="38" y2="148" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="155" y1="112" x2="162" y2="148" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="55" y1="112" x2="52" y2="145" stroke="#3d2616" stroke-width="2" stroke-linecap="round" opacity="0.4" />
      <line x1="145" y1="112" x2="148" y2="145" stroke="#3d2616" stroke-width="2" stroke-linecap="round" opacity="0.4" />
      <rect x="32" y="85" width="136" height="28" rx="6" fill="#e07a5f" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <circle cx="60" cy="99" r="2.5" fill="#3d2616" />
      <circle cx="100" cy="99" r="2.5" fill="#3d2616" />
      <circle cx="140" cy="99" r="2.5" fill="#3d2616" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="70" width="150" height="60" rx="6" fill="#e07a5f" stroke="#3d2616" stroke-width="3" />
      <line x1="25" y1="100" x2="175" y2="100" stroke="#3d2616" stroke-width="1" stroke-dasharray="2 4" />
    </svg>`
  },
  {
    id: "furniture-ottoman",
    name: "Round Velvet Ottoman Pouf",
    category: "furniture",
    tags: ["ottoman", "pouf", "stool", "seating", "living room"],
    defaultWidthFt: 2.0,
    defaultDepthFt: 2.0,
    description: "Compact round tufted footrest pouf with wooden trim base. Fits easily near coffee tables to augment casual seating layouts.",
    rooms: ["Living Room", "Bedroom", "Family Lounge"],
    directions: ["North-West", "East", "West"],
    material: "Timber Wood & Suede Cushion",
    color: "Sage Green & Beech",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="148" rx="46" ry="12" fill="rgba(61, 38, 22, 0.08)" />
      <ellipse cx="100" cy="132" rx="40" ry="12" fill="#d4a373" stroke="#3d2616" stroke-width="2" />
      <path d="M 60 90 C 60 75, 140 75, 140 90 L 140 125 C 140 135, 60 135, 60 125 Z" fill="#81b29a" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <ellipse cx="100" cy="90" rx="40" ry="12" fill="#81b29a" stroke="#3d2616" stroke-width="2" />
      <circle cx="100" cy="90" r="3.5" fill="#3d2616" />
      <path d="M 100 90 L 70 86 M 100 90 L 130 86 M 100 90 L 100 78 M 100 90 L 100 102 M 100 90 L 80 96 M 100 90 L 120 96" stroke="#3d2616" stroke-width="1.2" opacity="0.3" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="45" fill="#81b29a" stroke="#3d2616" stroke-width="3" />
      <circle cx="100" cy="100" r="3" fill="#3d2616" />
      <circle cx="100" cy="100" r="35" fill="none" stroke="#3d2616" stroke-width="1" stroke-dasharray="2 3" />
    </svg>`
  },
  {
    id: "furniture-mirror",
    name: "Full-Length Floor Mirror",
    category: "furniture",
    tags: ["mirror", "floor", "dressing", "decor"],
    defaultWidthFt: 2.2,
    defaultDepthFt: 1.5,
    description: "Elegant arched wood floor-standing dressing mirror. Encourages clean reflective energy flows inside bedrooms or dressing chambers.",
    rooms: ["Dressing Room", "Bedroom", "Entryway"],
    directions: ["North", "East", "North-East"],
    material: "Teak Wood & Silver Mirror",
    color: "Oak Wood & Mirror Glass",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="164" rx="42" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="82" y1="95" x2="68" y2="164" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="118" y1="95" x2="132" y2="164" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <path d="M 68 152 L 68 55 Q 68 45 100 45 Q 132 45 132 55 L 132 152 Z" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 74 148 L 74 58 Q 74 51 100 51 Q 126 51 126 58 L 126 148 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.8" />
      <line x1="114" y1="62" x2="122" y2="54" stroke="#e6c594" stroke-width="2.5" stroke-linecap="round" />
      <line x1="108" y1="78" x2="122" y2="64" stroke="#e6c594" stroke-width="2.5" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="80" width="100" height="40" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="3" />
      <rect x="55" y="85" width="90" height="10" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-floor-lamp",
    name: "Arched Brass Floor Lamp",
    category: "furniture",
    tags: ["lamp", "floor", "lighting", "brass", "living room"],
    defaultWidthFt: 2.5,
    defaultDepthFt: 2.5,
    description: "Stunning arched brass floor lamp with fabric shade and marble weight base. Soft warm light source recommended for study and lounge environments.",
    rooms: ["Living Room", "Study", "Library"],
    directions: ["South-East", "North-West", "North-East"],
    material: "Brass & Marble & Linen",
    color: "Gold & Ivory",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="165" rx="34" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 65 160 L 95 160 Q 100 160 100 156 L 100 152 L 60 152 L 60 156 Q 60 160 65 160 Z" fill="#3d405b" stroke="#3d2616" stroke-width="2" />
      <path d="M 80 152 L 80 80 C 80 40, 140 40, 140 76" stroke="#cfa15c" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 80 152 Q 95 158 110 150" stroke="#3d2616" stroke-width="1" stroke-linecap="round" fill="none" />
      <rect x="135" y="74" width="10" height="6" fill="#3d2616" />
      <path d="M 120 98 L 160 98 Q 160 80 140 80 Q 120 80 120 98 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <polygon points="120,98 160,98 175,140 105,140" fill="#e6c594" opacity="0.12" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="15" fill="#3d405b" stroke="#3d2616" stroke-width="2.5" />
      <circle cx="100" cy="100" r="30" fill="none" stroke="#3d2616" stroke-width="2" stroke-dasharray="4 6" />
      <path d="M 100 100 L 140 130" stroke="#cfa15c" stroke-width="4.5" stroke-linecap="round" />
      <circle cx="140" cy="130" r="20" fill="#fdfaf6" stroke="#3d2616" stroke-width="2" />
    </svg>`
  },
  {
    id: "furniture-table-lamp",
    name: "Ceramic Shade Table Lamp",
    category: "furniture",
    tags: ["lamp", "table", "lighting", "shade", "nightstand"],
    defaultWidthFt: 1.5,
    defaultDepthFt: 1.5,
    description: "Compact ceramic-body table lamp with textured linen pleated shade. Emits soothing, warm ambient glow perfect for nightstands.",
    rooms: ["Bedroom", "Study", "Living Room"],
    directions: ["South-East", "North-West", "East"],
    material: "Ceramic & Pleated Linen",
    color: "Celadon Green & Cream",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="152" rx="26" ry="6" fill="rgba(61, 38, 22, 0.08)" />
      <path d="M 85 146 C 85 125, 115 125, 115 146 Z" fill="#81b29a" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <ellipse cx="100" cy="146" rx="15" ry="4" fill="#3d2616" opacity="0.1" />
      <line x1="100" y1="126" x2="100" y2="108" stroke="#3d2616" stroke-width="3.5" stroke-linecap="round" />
      <polygon points="76,108 124,108 134,74 66,74" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <line x1="100" y1="74" x2="100" y2="108" stroke="#3d2616" stroke-width="1.2" opacity="0.15" />
      <line x1="88" y1="74" x2="90" y2="108" stroke="#3d2616" stroke-width="1.2" opacity="0.1" />
      <line x1="112" y1="74" x2="110" y2="108" stroke="#3d2616" stroke-width="1.2" opacity="0.1" />
      <polygon points="76,108 124,108 140,146 60,146" fill="#e6c594" opacity="0.14" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="30" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <circle cx="100" cy="100" r="10" fill="#81b29a" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-ceiling-fan",
    name: "Modern Wood Ceiling Fan",
    category: "furniture",
    tags: ["fan", "ceiling", "cooling", "ventilation"],
    defaultWidthFt: 4.0,
    defaultDepthFt: 4.0,
    description: "Premium wood ceiling fan with 3 blades and central casing cap. Establishes healthy air circulation in bedrooms or lounges.",
    rooms: ["Living Room", "Bedroom", "Family Lounge"],
    directions: ["North-West", "East", "West"],
    material: "Maple Wood & Steel",
    color: "Maple Wood Gold",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="100" y1="20" x2="100" y2="75" stroke="#3d2616" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 90 30 L 110 30 L 105 20 L 95 20 Z" fill="#3d2616" />
      <circle cx="100" cy="115" r="70" stroke="rgba(61, 38, 22, 0.06)" stroke-width="1.5" stroke-dasharray="8 12" />
      <ellipse cx="100" cy="115" rx="24" ry="14" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <ellipse cx="100" cy="112" rx="24" ry="4" fill="#cfa15c" stroke="#3d2616" stroke-width="1.2" />
      <path d="M 85 120 C 70 128, 30 148, 25 142 C 20 136, 50 120, 80 114 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <path d="M 115 110 C 130 102, 170 82, 175 88 C 180 94, 150 110, 120 116 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <path d="M 100 125 C 100 142, 104 182, 98 185 C 92 188, 88 148, 92 125 Z" fill="#e6c594" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="16" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <path d="M 100 84 V 20 M 114 108 L 158 142 M 86 108 L 42 142" stroke="#e6c594" stroke-width="10" stroke-linecap="round" />
      <path d="M 100 84 V 20 M 114 108 L 158 142 M 86 108 L 42 142" stroke="#3d2616" stroke-width="1" stroke-linecap="round" fill="none" />
    </svg>`
  },
  {
    id: "furniture-carpet",
    name: "Woven Textured Carpet",
    category: "furniture",
    tags: ["carpet", "rug", "woven", "floor", "living room"],
    defaultWidthFt: 8.0,
    defaultDepthFt: 5.0,
    description: "Premium woven area rug with geometric motifs and corner tassels. Anchors furniture layouts and introduces warm organic earth energy.",
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    directions: ["North-East", "East", "West"],
    material: "Woven Natural Wool",
    color: "Tan & Terracotta Accent",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="23" y="53" width="154" height="98" rx="6" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="25" y="50" width="150" height="94" rx="4" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" />
      <rect x="36" y="61" width="128" height="72" rx="2" stroke="#e07a5f" stroke-width="3" fill="none" />
      <polygon points="100,82 115,97 100,112 85,97" fill="#81b29a" stroke="#3d2616" stroke-width="1.8" />
      <circle cx="100" cy="97" r="4" fill="#e07a5f" />
      <circle cx="43" cy="68" r="3" fill="#3d2616" />
      <circle cx="157" cy="68" r="3" fill="#3d2616" />
      <circle cx="43" cy="126" r="3" fill="#3d2616" />
      <circle cx="157" cy="126" r="3" fill="#3d2616" />
      <path d="M 25 55 L 18 55 M 25 65 L 18 65 M 25 75 L 18 75 M 25 85 L 18 85 M 25 95 L 18 95 M 25 105 L 18 105 M 25 115 L 18 115 M 25 125 L 18 125 M 25 135 L 18 135" stroke="#3d2616" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 175 55 L 182 55 M 175 65 L 182 65 M 175 75 L 182 75 M 175 85 L 182 85 M 175 95 L 182 95 M 175 105 L 182 105 M 175 115 L 182 115 M 175 125 L 182 125 M 175 135 L 182 135" stroke="#3d2616" stroke-width="1.5" stroke-linecap="round" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="160" height="120" rx="3" fill="#fdfaf6" stroke="#3d2616" stroke-width="3" />
      <rect x="30" y="50" width="140" height="100" rx="1" stroke="#e07a5f" stroke-width="2" fill="none" />
      <polygon points="100,85 115,100 100,115 85,100" fill="#81b29a" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-curtains",
    name: "Linen Window Curtains",
    category: "furniture",
    tags: ["curtains", "drape", "window", "fabric", "decor"],
    defaultWidthFt: 5.0,
    defaultDepthFt: 0.8,
    description: "Hanging linen curtain panel pair, creating soft light filtration and energy buffering for large windows.",
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    directions: ["North", "East", "West"],
    material: "Linen Fabric & Brass Rod",
    color: "Ivory White",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="35" x2="180" y2="35" stroke="#3d2616" stroke-width="4.5" stroke-linecap="round" />
      <circle cx="20" cy="35" r="4.5" fill="#cfa15c" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="180" cy="35" r="4.5" fill="#cfa15c" stroke="#3d2616" stroke-width="1.5" />
      <line x1="40" y1="35" x2="40" y2="28" stroke="#3d2616" stroke-width="3" />
      <line x1="160" y1="35" x2="160" y2="28" stroke="#3d2616" stroke-width="3" />
      <path d="M 32 38 Q 45 42 45 52 L 45 165 C 45 172, 28 172, 28 165 L 28 38 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 45 38 Q 58 42 58 52 L 58 152 C 58 158, 45 158, 45 152 L 45 38 Z" fill="#f2efea" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <line x1="30" y1="115" x2="45" y2="125" stroke="#3d2616" stroke-width="1.5" fill="none" />
      <path d="M 168 38 Q 155 42 155 52 L 155 165 C 155 172, 172 172, 172 165 L 172 38 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M 155 38 Q 142 42 142 52 L 142 152 C 142 158, 155 158, 155 152 L 155 38 Z" fill="#f2efea" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <line x1="170" y1="115" x2="155" y2="125" stroke="#3d2616" stroke-width="1.5" fill="none" />
      <circle cx="34" cy="118" r="3" fill="#cfa15c" stroke="#3d2616" stroke-width="1" />
      <circle cx="166" cy="118" r="3" fill="#cfa15c" stroke="#3d2616" stroke-width="1" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="100" x2="180" y2="100" stroke="#3d2616" stroke-width="6" stroke-linecap="round" />
      <path d="M 22 100 Q 35 105 50 100 Q 65 95 80 100 Q 95 105 110 100 Q 125 95 140 100 Q 155 105 178 100" stroke="#fdfaf6" stroke-width="4.5" fill="none" />
    </svg>`
  },
  {
    id: "furniture-wall-shelf",
    name: "Floating Wall Shelf",
    category: "furniture",
    tags: ["shelf", "wall", "floating", "decor", "storage"],
    defaultWidthFt: 3.5,
    defaultDepthFt: 0.8,
    description: "Floating timber shelf pane with bracket mount support. Holds decorative books and items cleanly off floor surfaces.",
    rooms: ["Living Room", "Study", "Bedroom"],
    directions: ["North", "East", "West"],
    material: "Oak Wood & Steel Brackets",
    color: "Oak Light & Charcoal",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,110 160,110 156,115 44,115" fill="rgba(61, 38, 22, 0.06)" />
      <polygon points="30,85 170,85 160,102 40,102" fill="#e6c594" stroke="#3d2616" stroke-width="2.5" stroke-linejoin="round" />
      <polygon points="40,102 160,102 160,108 40,108" fill="#d4a373" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <line x1="50" y1="102" x2="50" y2="120" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="50" y1="102" x2="56" y2="102" stroke="#3d2616" stroke-width="2" />
      <line x1="150" y1="102" x2="150" y2="120" stroke="#3d2616" stroke-width="2.5" stroke-linecap="round" />
      <line x1="150" y1="102" x2="144" y2="102" stroke="#3d2616" stroke-width="2" />
      <path d="M 68 85 L 68 76 Q 68 72 72 72 L 80 72 Q 84 72 84 76 L 84 85 Z" fill="#81b29a" stroke="#3d2616" stroke-width="1.8" />
      <rect x="69" y="80" width="14" height="5" rx="1" fill="#e07a5f" />
      <rect x="110" y="55" width="8" height="30" fill="#e07a5f" stroke="#3d2616" stroke-width="1.5" />
      <rect x="118" y="58" width="8" height="27" fill="#3d405b" stroke="#3d2616" stroke-width="1.5" />
      <rect x="126" y="62" width="8" height="23" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <polygon points="134,85 142,85 134,68" fill="#d4a373" stroke="#3d2616" stroke-width="1.5" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="85" width="140" height="30" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <rect x="50" y="87" width="12" height="26" fill="#e07a5f" stroke="#3d2616" stroke-width="1" />
    </svg>`
  },
  {
    id: "furniture-plant-stand",
    name: "Tiers Metal Plant Stand",
    category: "furniture",
    tags: ["stand", "plant", "metal", "foliage", "pot"],
    defaultWidthFt: 2.2,
    defaultDepthFt: 2.2,
    description: "Three-tiered metal framing plant display stand. Highly recommended remedy for boosting North-East air quality and vitality.",
    rooms: ["Living Room", "Balcony", "Study"],
    directions: ["North", "East", "North-East"],
    material: "Wrought Iron & Pine Wood",
    color: "Black & Pine Gold",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="165" rx="38" ry="8" fill="rgba(61, 38, 22, 0.08)" />
      <line x1="82" y1="65" x2="65" y2="162" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="118" y1="65" x2="135" y2="162" stroke="#3d2616" stroke-width="3" stroke-linecap="round" />
      <line x1="68" y1="162" x2="132" y2="162" stroke="#3d2616" stroke-width="2.5" />
      <polygon points="110,120 148,120 144,124 114,124" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" />
      <path d="M 120 120 L 122 108 L 138 108 L 140 120 Z" fill="#e07a5f" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="130" cy="98" r="10" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
      <circle cx="125" cy="100" r="7" fill="#81b29a" />
      <circle cx="135" cy="96" r="7" fill="#81b29a" />
      <polygon points="52,95 90,95 86,99 56,99" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" />
      <path d="M 62 95 L 64 83 L 78 83 L 80 95 Z" fill="#e07a5f" stroke="#3d2616" stroke-width="1.5" />
      <path d="M 71 83 C 71 70, 60 70, 65 65 C 70 60, 75 75, 71 83 Z" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
      <path d="M 71 83 C 71 70, 82 70, 77 65 C 72 60, 67 75, 71 83 Z" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
      <polygon points="80,62 120,62 116,66 84,66" fill="#d4a373" stroke="#3d2616" stroke-width="1.8" />
      <path d="M 92 62 L 94 50 L 106 50 L 108 62 Z" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="100" cy="42" r="8" fill="#81b29a" stroke="#3d2616" stroke-width="1.2" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="30" fill="#3d2616" stroke="#3d2616" stroke-width="2" />
      <circle cx="100" cy="100" r="16" fill="#81b29a" />
      <circle cx="68" cy="100" r="12" fill="#81b29a" stroke="#3d2616" stroke-width="1.5" />
      <circle cx="132" cy="100" r="12" fill="#81b29a" stroke="#3d2616" stroke-width="1.5" />
    </svg>`
  },
  {
    id: "furniture-office-desk",
    name: "Premium Office Desk",
    category: "furniture",
    tags: ["desk", "office", "table", "work", "executive"],
    defaultWidthFt: 5.5,
    defaultDepthFt: 3.0,
    description: "Premium study and work desk featuring thick oak top panel and built-in filing drawers. Recommended to orient facing North or East inside the study sector.",
    rooms: ["Study", "Home Office"],
    directions: ["North", "East", "West"],
    material: "Oak Wood & Walnut Veneer",
    color: "Oak Honey & Dark Walnut",
    previewSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="25,148 175,148 165,158 35,158" fill="rgba(61, 38, 22, 0.08)" />
      <rect x="30" y="86" width="14" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <rect x="156" y="86" width="14" height="64" rx="2" fill="#d4a373" stroke="#3d2616" stroke-width="2.5" />
      <rect x="122" y="98" width="22" height="42" rx="1" fill="#3d405b" stroke="#3d2616" stroke-width="1.8" />
      <polygon points="15,64 185,64 175,86 25,86" fill="#e6c594" stroke="#3d2616" stroke-width="3" stroke-linejoin="round" />
      <polygon points="25,86 175,86 175,92 25,92" fill="#d4a373" stroke="#3d2616" stroke-width="2" stroke-linejoin="round" />
      <polygon points="65,70 135,70 131,84 69,84" fill="#3d405b" stroke="#3d2616" stroke-width="1.5" />
      <rect x="78" y="44" width="44" height="24" rx="2" fill="#3d405b" stroke="#3d2616" stroke-width="2" />
      <rect x="94" y="68" width="12" height="4" fill="#3d2616" />
      <polygon points="34,68 50,68 47,80 37,80" fill="#fdfaf6" stroke="#3d2616" stroke-width="1.2" />
      <line x1="42" y1="68" x2="42" y2="80" stroke="#3d2616" stroke-width="1" />
    </svg>`,
    plannerTopSvg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="45" width="170" height="110" rx="3" fill="#e6c594" stroke="#3d2616" stroke-width="3" />
      <rect x="25" y="55" width="110" height="10" fill="#3d405b" />
      <rect x="145" y="55" width="30" height="90" fill="none" stroke="#3d2616" stroke-dasharray="2 3" />
    </svg>`
  }
];

const assetsBaseDir = path.join(__dirname, '../assets');

// Clean up old individual file placeholders from ALL categories to keep the folder system tidy
const oldFilePlaceholders = [
  'rooms/bedroom.svg',
  'decor/mirror.svg',
  'plants/tulsi.svg',
  'utilities/water_tank.svg',
  'structure/main_door.svg',
  'vastu/pyramid.svg',
  'symbols/swastika.svg',
  'backgrounds/grid_pattern.svg',
  'avatars/expert_avatar.svg'
];

oldFilePlaceholders.forEach(relativeFilePath => {
  const absolutePath = path.join(assetsBaseDir, relativeFilePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    console.log(`Deleted old placeholder file: ${relativeFilePath}`);
  }
});

// Also clean up any furniture SVGs left in the root of assets/furniture
const oldFurnitureFiles = ['bed.svg', 'sofa.svg', 'armchair.svg', 'recliner.svg', 'dining_chair.svg', 'office_chair.svg', 'coffee_table.svg', 'dining_table.svg', 'study_table.svg', 'console_table.svg', 'tv_unit.svg', 'wardrobe.svg', 'bookshelf.svg', 'bunk_bed.svg', 'side_table.svg', 'bench.svg', 'ottoman.svg', 'mirror.svg', 'floor_lamp.svg', 'table_lamp.svg', 'ceiling_fan.svg', 'carpet.svg', 'curtains.svg', 'wall_shelf.svg', 'plant_stand.svg', 'office_desk.svg'];
oldFurnitureFiles.forEach(f => {
  const absolutePath = path.join(assetsBaseDir, 'furniture', f);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
    console.log(`Deleted old furniture placeholder: ${f}`);
  }
});

// Write new folder structure assets
ASSETS_DATA.forEach(item => {
  const folderName = item.id.replace(item.category + '-', '');
  const folderPath = path.join(assetsBaseDir, item.category, folderName);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Define metadata block
  const metadata = {
    id: item.id,
    name: item.name,
    category: item.category,
    tags: item.tags,
    defaultWidthFt: item.defaultWidthFt,
    defaultDepthFt: item.defaultDepthFt,
    rotation: 0,
    anchor: "center",
    preview: "preview.svg",
    thumbnail: "thumbnail.svg",
    plannerTop: "planner-top.svg",
    plannerOutline: "planner-outline.svg",
    license: "MIT",
    source: "BanjaraBazaarOS Internal",
    version: "1.0.0",
    description: item.description,
    recommendedRooms: item.rooms,
    recommendedDirections: item.directions,
    material: item.material,
    color: item.color
  };

  fs.writeFileSync(path.join(folderPath, 'metadata.json'), JSON.stringify(metadata, null, 2));

  // Generate SVGs inside folder
  fs.writeFileSync(path.join(folderPath, 'preview.svg'), item.previewSvg);
  fs.writeFileSync(path.join(folderPath, 'thumbnail.svg'), item.previewSvg); // Direct vector scales
  fs.writeFileSync(path.join(folderPath, 'planner-top.svg'), item.plannerTopSvg);
  
  // Custom dashed outline
  const outlineSvg = `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="15" width="170" height="170" rx="6" stroke="#3d2616" stroke-width="2.5" stroke-dasharray="6 6" fill="rgba(124, 111, 247, 0.04)" />
  </svg>`;
  fs.writeFileSync(path.join(folderPath, 'planner-outline.svg'), outlineSvg);

  console.log(`Generated dynamic folder asset: [${item.category}] -> ${folderName}`);
});

console.log('Sprint 2 Asset regeneration completed for all categories.');
