// Lightweight string-dictionary i18n for the Vastu Knowledge Engine screens.
// Three flat objects, one active at a time — no library, just a lookup.
// Default language is Hinglish (Roman script), matching how the app's own
// users actually type search queries ("toilet kis disha mein").

export const LANGS = {
  hinglish: 'Hinglish',
  hi: 'हिंदी',
  en: 'English',
}

const STRINGS = {
  hinglish: {
    brandSub: 'Vastu Gyan Kendra',
    searchPlaceholder: 'jaise: almari kis disha mein rakhein',
    searchHint: 'ya niche kisi category par tap karein',
    allChip: 'Sab kuch',
    moreDekhein: 'More dekhein',
    back: 'Wapas',
    bestLabel: 'Sabse achha',
    avoidLabel: 'Bachein',
    correctBadge: 'IS DISHA MEIN SAHI!',
    wrongBadge: 'IS DISHA MEIN NAHI',
    lowConfidenceBadge: 'Confidence kam hai',
    locationConfidence: 'Disha bharosa',
    effectConfidence: 'Asar bharosa',
    sourceConsensus: 'source consensus',
    remedyLabel: 'Upay (agar galat disha mein hai)',
    bothSidesBtn: 'Dono pakh dekhein',
    hideBothSidesBtn: 'Dono pakh chhupayein',
    sourcesChecked: 'sources se jancha gaya',
    noMatch: (q) => `"${q}" ke liye kuchh nahi mila`,
    loading: 'Load ho raha hai…',
    connectionError: 'Vastu Knowledge service tak nahi pahunch paye',
    discoverTitle: 'Aur jaanein',
    discoverSub: 'Sabse zyada khoje gaye topics',
    colorRecommended: 'Achhe rang',
    colorAvoid: 'Bachein',
  },
  hi: {
    brandSub: 'वास्तु ज्ञान केंद्र',
    searchPlaceholder: 'जैसे: अलमारी किस दिशा में रखें',
    searchHint: 'या नीचे किसी विषय पर टैप करें',
    allChip: 'सब कुछ',
    moreDekhein: 'और देखें',
    back: 'वापस',
    bestLabel: 'सबसे अच्छा',
    avoidLabel: 'बचें',
    correctBadge: 'यह दिशा सही है!',
    wrongBadge: 'यह दिशा सही नहीं है',
    lowConfidenceBadge: 'भरोसा कम है',
    locationConfidence: 'दिशा भरोसा',
    effectConfidence: 'प्रभाव भरोसा',
    sourceConsensus: 'स्रोत सहमति',
    remedyLabel: 'उपाय (अगर गलत दिशा में है)',
    bothSidesBtn: 'दोनों पक्ष देखें',
    hideBothSidesBtn: 'दोनों पक्ष छुपाएं',
    sourcesChecked: 'स्रोतों से जांचा गया',
    noMatch: (q) => `"${q}" के लिए कुछ नहीं मिला`,
    loading: 'लोड हो रहा है…',
    connectionError: 'सेवा तक नहीं पहुंच पाए',
    discoverTitle: 'और जानें',
    discoverSub: 'सबसे ज़्यादा खोजे गए विषय',
    colorRecommended: 'अच्छे रंग',
    colorAvoid: 'बचें',
  },
  en: {
    brandSub: 'Vastu Knowledge Engine',
    searchPlaceholder: 'e.g. which direction for wardrobe',
    searchHint: 'or tap a category below',
    allChip: 'All',
    moreDekhein: 'See more',
    back: 'Back',
    bestLabel: 'Best',
    avoidLabel: 'Avoid',
    correctBadge: 'CORRECT DIRECTION!',
    wrongBadge: 'NOT RECOMMENDED',
    lowConfidenceBadge: 'Lower confidence',
    locationConfidence: 'Location confidence',
    effectConfidence: 'Effect confidence',
    sourceConsensus: 'source consensus',
    remedyLabel: 'Remedy (if placed wrong)',
    bothSidesBtn: 'See both sides',
    hideBothSidesBtn: 'Hide both sides',
    sourcesChecked: 'sources checked',
    noMatch: (q) => `No matches for "${q}"`,
    loading: 'Loading…',
    connectionError: "Couldn't reach the Vastu Knowledge service",
    discoverTitle: 'Discover more',
    discoverSub: 'Most-searched topics',
    colorRecommended: 'Recommended',
    colorAvoid: 'Avoid',
  },
}

const CATEGORY_LABELS = {
  water_elements: { hinglish: 'Paani', hi: 'जल तत्व', en: 'Water' },
  sleeping_direction: { hinglish: 'Sona', hi: 'शयन दिशा', en: 'Sleeping' },
  doors_entry: { hinglish: 'Mukhya Dwar', hi: 'मुख्य द्वार', en: 'Main Door' },
  kitchen: { hinglish: 'Rasoi', hi: 'रसोई', en: 'Kitchen' },
  pooja_room: { hinglish: 'Pooja Ghar', hi: 'पूजा घर', en: 'Pooja Room' },
  eating_direction: { hinglish: 'Khana', hi: 'भोजन', en: 'Dining' },
  furniture_fixtures: { hinglish: 'Furniture', hi: 'फर्नीचर', en: 'Furniture' },
  colors: { hinglish: 'Rang', hi: 'रंग', en: 'Colors' },
  misc: { hinglish: 'Aur Bhi', hi: 'विविध', en: 'Misc' },
  room_zone_placement: { hinglish: 'Room Zones', hi: 'कक्ष क्षेत्र', en: 'Room Zones' },
}

export function t(lang, key, ...args) {
  const dict = STRINGS[lang] || STRINGS.hinglish
  const value = dict[key] ?? STRINGS.hinglish[key]
  return typeof value === 'function' ? value(...args) : value
}

export function categoryLabel(lang, category) {
  const entry = CATEGORY_LABELS[category]
  if (!entry) return category?.replace(/_/g, ' ') ?? ''
  return entry[lang] || entry.hinglish
}

export function allCategories() {
  return Object.keys(CATEGORY_LABELS)
}
