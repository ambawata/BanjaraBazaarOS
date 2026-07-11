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

// category -> base room silhouette RoomScene should draw.
const CATEGORY_ROOM_TYPE = {
  doors_entry: 'entrance',
  sleeping_direction: 'bedroom',
  kitchen: 'kitchen',
  pooja_room: 'pooja',
  eating_direction: 'living',
  furniture_fixtures: 'living',
  water_elements: 'exterior',
  misc: 'living',
  room_zone_placement: 'living',
}

// A few topics need a different room than their category's default.
const TOPIC_ROOM_TYPE_OVERRIDES = {
  toilet_bathroom: 'bathroom',
  vehicle_parking: 'exterior',
}

export function getRoomType(entry) {
  return TOPIC_ROOM_TYPE_OVERRIDES[entry.topic] || CATEGORY_ROOM_TYPE[entry.category] || 'living'
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

export function getBestDirections(entry) {
  const best = entry.best_direction
  if (Array.isArray(best)) return best
  if (typeof best === 'string') return [best]
  return []
}

export function getAvoidDirections(entry) {
  const avoid = entry.avoid
  if (Array.isArray(avoid)) return avoid
  if (typeof avoid === 'string') return [avoid]
  return []
}
