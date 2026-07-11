// Shared derivations from a /api/v1/vastu/search or /top-topics result entry.
// Kept separate from the components so RoomScene/VastuCard/VastuDetailView
// all agree on the same room-type / item-name / confidence logic.

// Curated Hinglish/Hindi/English item names for entries whose topic slug
// alone wouldn't read naturally (e.g. "sink_water" -> "Kitchen Sink").
// Anything not listed here falls back to a humanized topic slug — still
// readable, just less polished than the hand-picked ones.
const ITEM_NAMES = {
  'WE-01': { hinglish: 'Underground Paani ki Tanki', hi: 'भूमिगत पानी की टंकी', en: 'Underground Water Tank' },
  'WE-02': { hinglish: 'Chhat ki Paani Tanki', hi: 'ऊपर की पानी टंकी', en: 'Overhead Water Tank' },
  'WE-03': { hinglish: 'Borewell', hi: 'बोरवेल', en: 'Borewell' },
  'WE-04': { hinglish: 'Kuan', hi: 'कुआं', en: 'Open Well' },
  'WE-05': { hinglish: 'Septic Tank', hi: 'सेप्टिक टैंक', en: 'Septic Tank' },
  'SD-01': { hinglish: 'Sar Dakshin Karke Sona', hi: 'सिर दक्षिण करके सोना', en: 'Sleeping Head-South' },
  'SD-02': { hinglish: 'Sar Purab Karke Sona', hi: 'सिर पूर्व करके सोना', en: 'Sleeping Head-East' },
  'SD-03': { hinglish: 'Sar Paschim Karke Sona', hi: 'सिर पश्चिम करके सोना', en: 'Sleeping Head-West' },
  'SD-04': { hinglish: 'Sar Uttar Karke Sona', hi: 'सिर उत्तर करके सोना', en: 'Sleeping Head-North' },
  'SD-05': { hinglish: 'Master Bed', hi: 'मास्टर बेड', en: 'Master Bed Placement' },
  'SD-06': { hinglish: 'Bachon ka Bed', hi: 'बच्चों का बेड', en: "Children's Bed" },
  'SD-07': { hinglish: 'Guest Room Bed', hi: 'अतिथि कक्ष बेड', en: 'Guest Bed' },
  'SD-08': { hinglish: 'Couple ka Bedroom', hi: 'दंपति का कमरा', en: "Couple's Bedroom" },
  'SD-09': { hinglish: 'Sone ki Disha', hi: 'सोने की दिशा', en: 'Sleeping Direction' },
  'DE-01': { hinglish: 'Mukhya Darwaza', hi: 'मुख्य द्वार', en: 'Main Door' },
  'DE-02': { hinglish: 'Dehleez', hi: 'देहलीज', en: 'Threshold' },
  'DE-03': { hinglish: 'Darwaza Banane ke Niyam', hi: 'दरवाजे के नियम', en: 'Door Construction Rules' },
  'DE-04': { hinglish: 'Kamre ka Darwaza', hi: 'कमरे का दरवाजा', en: 'Room Doors' },
  'KI-01': { hinglish: 'Kitchen', hi: 'रसोई', en: 'Kitchen Zone' },
  'KI-02': { hinglish: 'Gas Chulha', hi: 'गैस चूल्हा', en: 'Gas Stove' },
  'KI-03': { hinglish: 'Khana Banate Samay Mukh', hi: 'खाना बनाते समय दिशा', en: 'Cooking-Facing Direction' },
  'KI-04': { hinglish: 'Kitchen Sink', hi: 'रसोई का सिंक', en: 'Kitchen Sink' },
  'KI-05': { hinglish: 'Fridge', hi: 'फ्रिज', en: 'Fridge & Appliances' },
  'KI-06': { hinglish: 'Rasoi ke Bartan', hi: 'रसोई के बर्तन', en: 'Kitchen Storage' },
  'PJ-01': { hinglish: 'Pooja Ghar', hi: 'पूजा घर', en: 'Pooja Room' },
  'PJ-02': { hinglish: 'Murti ka Mukh', hi: 'मूर्ति की दिशा', en: 'Idol Facing' },
  'PJ-03': { hinglish: 'Pooja Ghar ke Niyam', hi: 'पूजा घर के नियम', en: 'Pooja Room Rules' },
  'EA-01': { hinglish: 'Khana Khate Samay Mukh', hi: 'भोजन करते समय दिशा', en: 'Eating-Facing Direction' },
  'EA-02': { hinglish: 'Dining Table', hi: 'डाइनिंग टेबल', en: 'Dining Table' },
  'FF-01': { hinglish: 'Almari', hi: 'अलमारी', en: 'Wardrobe' },
  'FF-02': { hinglish: 'Tijori', hi: 'तिजोरी', en: 'Locker / Safe' },
  'FF-03': { hinglish: 'Darpan (Mirror)', hi: 'दर्पण', en: 'Mirror' },
  'FF-04': { hinglish: 'Study Table', hi: 'पढ़ाई की मेज', en: 'Study Table' },
  'FF-05': { hinglish: 'TV', hi: 'टीवी', en: 'TV & Electronics' },
  'FF-06': { hinglish: 'Sofa', hi: 'सोफा', en: 'Sofa Seating' },
  'FF-07': { hinglish: 'Bed ke Niyam', hi: 'बेड के नियम', en: 'Bed Rules' },
  'FF-08': { hinglish: 'Almari ka Saman', hi: 'अलमारी का सामान', en: 'Storage Furniture' },
  'CO-01': { hinglish: 'Disha ke hisaab se Rang', hi: 'दिशा अनुसार रंग', en: 'Colors by Direction' },
  'CO-02': { hinglish: 'Kamre ke hisaab se Rang', hi: 'कमरे अनुसार रंग', en: 'Colors by Room' },
  'MI-01': { hinglish: 'Toilet Bathroom', hi: 'शौचालय', en: 'Toilet / Bathroom' },
  'MI-02': { hinglish: 'Seedhi', hi: 'सीढ़ी', en: 'Staircase' },
  'MI-03': { hinglish: 'Ghar ke Paudhe', hi: 'घर के पौधे', en: 'Plants' },
  'MI-03a': { hinglish: 'Tulsi', hi: 'तुलसी', en: 'Tulsi Plant' },
  'MI-03b': { hinglish: 'Money Plant', hi: 'मनी प्लांट', en: 'Money Plant' },
  'MI-04': { hinglish: 'Darwaze ke Saamne Mirror', hi: 'दरवाजे के सामने दर्पण', en: 'Mirror Facing Main Door' },
  'MI-05': { hinglish: 'Gaadi Parking', hi: 'वाहन पार्किंग', en: 'Vehicle Parking' },
  'MI-06': { hinglish: 'Missing Corner ka Upay', hi: 'कटा हुआ कोना', en: 'Missing Corner Remedy' },
  'MI-07': { hinglish: 'Fish Tank / Aquarium', hi: 'मछली टैंक', en: 'Fish Tank / Aquarium' },
  'MI-08': { hinglish: 'Kiraye ke Ghar ka Vastu', hi: 'किराए के घर का वास्तु', en: 'Vastu for Rented House' },
  'MI-09': { hinglish: 'Vastu vs Feng Shui', hi: 'वास्तु बनाम फेंग शुई', en: 'Vastu vs Feng Shui' },
  'MI-10': { hinglish: 'Aur Vastu Baatein', hi: 'अन्य वास्तु बातें', en: 'Other Vastu Notes' },
  'RZ-03': { hinglish: 'Vastu Purusha Mandala', hi: 'वास्तु पुरुष मंडल', en: 'Vastu Purusha Mandala' },
  'RZ-04': { hinglish: 'Plot ki Shape', hi: 'भूखंड का आकार', en: 'Plot Shape' },
  'RZ-05': { hinglish: 'Ghar ka Extension', hi: 'घर का विस्तार', en: 'House Extension' },
  'RZ-06': { hinglish: 'Living Room', hi: 'बैठक कक्ष', en: 'Living / Drawing Room' },
  'RZ-07': { hinglish: 'Dakshinmukhi Ghar', hi: 'दक्षिणमुखी घर', en: 'South-Facing House' },
}

// Per-entry object illustration type. Explicit by entry_id rather than a
// category-level default — the earlier version mapped whole categories
// (e.g. every furniture_fixtures entry) to one shared scene, which is
// exactly the "generic/dummy" problem this map fixes: a wardrobe, a locker,
// a mirror, a TV, and a sofa all rendered the same sofa illustration.
// Anything not listed here falls back to a same-category best guess, but
// every entry that exists in the KB today has an explicit mapping.
const OBJECT_TYPES = {
  'WE-01': 'tankUnderground',
  'WE-02': 'tankOverhead',
  'WE-03': 'well',
  'WE-04': 'well',
  'WE-05': 'septicTank',
  'SD-01': 'bed',
  'SD-02': 'bed',
  'SD-03': 'bed',
  'SD-04': 'bed',
  'SD-05': 'bed',
  'SD-06': 'bed',
  'SD-07': 'bed',
  'SD-08': 'bed',
  'SD-09': 'bed',
  'DE-01': 'door',
  'DE-02': 'door',
  'DE-03': 'door',
  'DE-04': 'door',
  'KI-01': 'kitchenGeneral',
  'KI-02': 'stove',
  'KI-03': 'stove',
  'KI-04': 'sink',
  'KI-05': 'fridge',
  'KI-06': 'kitchenGeneral',
  'PJ-01': 'pooja',
  'PJ-02': 'pooja',
  'PJ-03': 'pooja',
  'EA-01': 'diningTable',
  'EA-02': 'diningTable',
  'FF-01': 'wardrobe',
  'FF-02': 'locker',
  'FF-03': 'mirror',
  'FF-04': 'studyTable',
  'FF-05': 'tv',
  'FF-06': 'sofa',
  'FF-07': 'bed',
  'FF-08': 'painting',
  'MI-01': 'toilet',
  'MI-02': 'staircase',
  'MI-03': 'plantGeneric',
  'MI-03a': 'tulsi',
  'MI-03b': 'moneyPlant',
  'MI-04': 'door',
  'MI-05': 'parking',
  'MI-06': 'houseCorner',
  'MI-07': 'fishTank',
  'MI-08': 'houseGeneric',
  'MI-09': 'concept',
  'MI-10': 'concept',
  'RZ-00': 'concept',
  'RZ-01': 'houseGeneric',
  'RZ-02': 'concept',
  'RZ-PADA': 'concept',
  'RZ-03': 'mandala',
  'RZ-04': 'basement',
  'RZ-05': 'plotShape',
  'RZ-06': 'sofa',
  'RZ-07': 'houseFacing',
}

// Category-level fallback for any future entry not yet in OBJECT_TYPES above.
const CATEGORY_FALLBACK = {
  doors_entry: 'door',
  sleeping_direction: 'bed',
  kitchen: 'kitchenGeneral',
  pooja_room: 'pooja',
  eating_direction: 'diningTable',
  furniture_fixtures: 'sofa',
  water_elements: 'well',
  misc: 'concept',
  room_zone_placement: 'houseGeneric',
}

// Entries about a whole house's orientation ("is a south-facing house bad?")
// render a house-exterior + compass scene rather than an interior room —
// detected by topic naming (…facing…house… / house…facing…) so future
// facing-direction entries (RZ-08+) pick this up automatically too.
const FACING_HOUSE_PATTERN = /facing.*house|house.*facing/

export function getObjectType(entry) {
  if (FACING_HOUSE_PATTERN.test(entry.topic || '')) return 'houseFacing'
  return OBJECT_TYPES[entry.entry_id] || CATEGORY_FALLBACK[entry.category] || 'concept'
}

// Object types that render as a house-exterior/conceptual composition
// (ground, sky, house silhouette, compass or diagram) instead of the
// interior wall+floor+furniture+dashed-box composition.
const EXTERIOR_OBJECT_TYPES = new Set([
  'houseFacing', 'houseGeneric', 'houseCorner', 'basement', 'plotShape', 'mandala', 'concept',
])

export function isExteriorScene(objectType) {
  return EXTERIOR_OBJECT_TYPES.has(objectType)
}

export function getItemName(entry, lang) {
  const curated = ITEM_NAMES[entry.entry_id]
  if (curated) return curated[lang] || curated.hinglish
  return (entry.topic || entry.category || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Devanagari alias from the raw entry, used as a best-effort Hindi item name when no curated one exists. */
export function findDevanagariAlias(entry) {
  const aliases = entry.detail?.query_aliases || []
  return aliases.find((a) => /\p{Script=Devanagari}/u.test(a)) || null
}

export function isColorRuleEntry(entry) {
  return Boolean(entry.detail?.by_zone || entry.detail?.by_room)
}

/**
 * An entry counts as "low confidence" when it has no usable location
 * confidence number, or that number is genuinely low (< 60) — same
 * honesty principle as the rest of this engine: never paper over a weak
 * or foundation-only entry with the same visual certainty as a
 * well-sourced one.
 */
export function isLowConfidence(entry) {
  const loc = entry.confidence?.location
  if (loc === null || loc === undefined) return true
  return loc < 60
}

// ---------------------------------------------------------------------------
// normalizeDirections — the ONE place that knows how to read "what
// direction(s) does this entry recommend" across every field shape the KB
// actually uses. Audited across all 60 live entries (2026-07-11):
//
//   avoid+best (+fallback, +door_open)   38 entries  — the common case
//   verdict+best_for                      2 entries  (SD-01, SD-02)
//   verdict only                          5 entries  (SD-03, SD-04, MI-08, RZ-04, KI-06)
//   best only (string, not array)         3 entries  (SD-07, DE-02, DE-04)
//   best_advanced_16zone+best_beginner    1 entry    (MI-01, two-layer)
//   by_zone / by_room                     2 entries  (CO-01/CO-02, handled by VastuColorCard, not this function)
//   map / matrix / rules                  3 entries  (RZ-00/01/02, foundation-level, no single direction)
//   conditions_for_good_outcome+verdict   1 entry    (RZ-07 — prose conditions, not compass tokens)
//   none of the above                     9 entries  (MI-03/04/06/09/10, FF-08, RZ-03/05/PADA — genuinely non-directional)
//
// The earlier version read entry.best_direction / entry.avoid directly
// (which the API only populates from raw.best / raw.avoid) — so anything
// using verdict+best_for, verdict-only, or a descriptive string instead of
// a clean direction token silently rendered as empty pills. This is most
// visible in the sleeping-direction category: SD-01 to SD-04 have no
// best/avoid arrays at all — the direction they're about is the TOPIC
// itself ("head_south", "head_east", ...), with a verdict describing
// whether that direction is good, mixed, or to avoid.
// ---------------------------------------------------------------------------

const COMPASS_TOKENS = new Set(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'CENTER'])

/** Pull any recognizable compass tokens out of a string, an array of strings, or a mix — handles both clean arrays (["NW","W"]) and compound descriptive strings ("room_NW_zone__head_S_or_W"). */
function extractDirectionTokens(value) {
  if (value === null || value === undefined) return []
  const items = Array.isArray(value) ? value : [value]
  const found = []
  for (const item of items) {
    if (typeof item !== 'string') continue
    for (const token of item.toUpperCase().split(/[^A-Z]+/)) {
      if (COMPASS_TOKENS.has(token) && !found.includes(token)) found.push(token)
    }
  }
  return found
}

const HEAD_DIRECTION_BY_TOPIC = {
  head_north: 'N',
  head_south: 'S',
  head_east: 'E',
  head_west: 'W',
}

/**
 * @returns {{
 *   bestDirections: string[],
 *   avoidDirections: string[],
 *   fallbackDirections: string[],
 *   hasVerdictOnly: boolean,
 *   verdictText: string|null,
 *   conditions: string[]|null,
 * }}
 */
export function normalizeDirections(entry) {
  const raw = entry.detail || {}

  let bestDirections = extractDirectionTokens(raw.best ?? entry.best_direction ?? raw.best_beginner)
  let avoidDirections = extractDirectionTokens(raw.avoid ?? entry.avoid)
  let fallbackDirections = extractDirectionTokens(raw.fallback)

  // Sleeping-direction entries (SD-01..04): the direction is the topic
  // itself, not a field — route it into best/avoid/fallback by verdict
  // rather than leaving it undiscoverable.
  const headDirection = HEAD_DIRECTION_BY_TOPIC[entry.topic]
  if (headDirection && bestDirections.length === 0 && avoidDirections.length === 0) {
    const verdict = raw.verdict
    if (verdict === 'avoid_universal') {
      avoidDirections = [headDirection]
    } else if (verdict === 'contested_mixed') {
      // Genuinely split opinion — same "don't overstate certainty" idea as
      // the fallback tier, not a clean recommendation either way.
      fallbackDirections = [headDirection]
    } else {
      // best_overall, second_best, or any other positive verdict.
      bestDirections = [headDirection]
    }
  }

  const conditions = Array.isArray(raw.conditions_for_good_outcome) ? raw.conditions_for_good_outcome : null

  const hasVerdictOnly = bestDirections.length === 0 && avoidDirections.length === 0 && fallbackDirections.length === 0

  // Textual fallback so a verdict/description never just disappears when
  // no compass token could be extracted from it (e.g. DE-02's best is the
  // sentence "install_raised_threshold_at_main_entrance", not a direction).
  let verdictText = null
  if (hasVerdictOnly) {
    if (typeof raw.verdict === 'string') {
      verdictText = humanizeSlug(raw.verdict)
    } else if (typeof raw.best === 'string') {
      verdictText = humanizeSlug(raw.best)
    } else if (typeof raw.rule === 'string') {
      verdictText = humanizeSlug(raw.rule)
    }
  }

  return { bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText, conditions }
}

function humanizeSlug(slug) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
