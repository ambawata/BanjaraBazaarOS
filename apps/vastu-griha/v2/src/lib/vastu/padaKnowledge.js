// Vastu Knowledge Engine — single source of truth for every pada-based
// judgment the app makes (main door, kitchen, bedrooms, toilets,
// staircase, Brahmasthan, etc).
//
// HONEST SOURCING NOTE (read before adding more records or trusting this
// file blindly): the deity name / zone / ring fields below come from one
// compiled modern source (iiag.co.in's 45-devta chart) reconciled against
// well-established classical convention (e.g. the 8 Ashtadikpala guardians
// — Vayu=NW, Agni=SE, Yama=S, Kubera=N etc — which is near-universal
// Hindu cosmology, not specific to any one Vastu school). This is NOT the
// full multi-source cross-check (vaastuinternational.com, jasbirmundi.com,
// ganeshaspeaks.com, modernvastu.in, connectwithvastu.com, etc.) that the
// knowledge-engine spec calls for — that is real research work, tracked
// as its own follow-up, not something to fabricate here. That's why
// location_confidence below is 85, not 100: it reflects one compiled
// source plus editorial reconciliation, not a genuine 5+ source audit.
//
// effect_confidence / reported_benefits / reported_challenges /
// source_disagreement_note are populated ONLY for the padas this app's
// shipped features actually surface today (main entrance, kitchen,
// bedroom, toilet, pooja zones) using well-documented classical Vastu
// literature. Every other pada is left with effectResearched: false and
// an explicit "not yet researched" note — never a fabricated verdict.

export const PADA_KNOWLEDGE = [
  { pada_id: 1, deity_name: 'Shikhi', sanskrit_name: 'शिखी', zone: 'NE', ring: 'outer', meaning: 'Fire deity at the head of the Vastu Purusha; governs the NE entry point.' },
  { pada_id: 2, deity_name: 'Parjanya', sanskrit_name: 'पर्जन्य', zone: 'E', ring: 'outer', meaning: 'Rain-cloud deity; associated with fertility and female progeny.' },
  { pada_id: 3, deity_name: 'Jayanta', sanskrit_name: 'जयन्त', zone: 'E', ring: 'outer', meaning: "Indra's son; associated with wealth and fame." },
  { pada_id: 4, deity_name: 'Indra', sanskrit_name: 'इन्द्र', zone: 'E', ring: 'outer', meaning: 'King of the devas; lord of wealth and the eastern quarter.' },
  { pada_id: 5, deity_name: 'Surya', sanskrit_name: 'सूर्य', zone: 'E', ring: 'outer', meaning: 'Sun god; source of health and vitality.' },
  { pada_id: 6, deity_name: 'Satya', sanskrit_name: 'सत्य', zone: 'E', ring: 'outer', meaning: 'Embodiment of truth; sunrise energy.' },
  { pada_id: 7, deity_name: 'Bhrisha', sanskrit_name: 'भृश', zone: 'E', ring: 'outer', meaning: 'Dawn/beauty deity, sometimes described as Ushas.' },
  { pada_id: 8, deity_name: 'Akasha', sanskrit_name: 'आकाश', zone: 'NE', ring: 'outer', meaning: 'Sky/ether deity; formless divine essence.' },
  { pada_id: 9, deity_name: 'Vayu (Anila)', sanskrit_name: 'वायु', zone: 'NW', ring: 'outer', meaning: 'Wind god; one of the 8 classical direction guardians (Ashtadikpala) of the Northwest.' },
  { pada_id: 10, deity_name: 'Pusha', sanskrit_name: 'पूषा', zone: 'S', ring: 'outer', meaning: 'Solar deity; lord of animals/livestock.' },
  { pada_id: 11, deity_name: 'Vitatha', sanskrit_name: 'वितथ', zone: 'SW', ring: 'outer', meaning: 'Deity of illusion/disguise.' },
  { pada_id: 12, deity_name: 'Grihakshata', sanskrit_name: 'गृहक्षत', zone: 'SW', ring: 'outer', meaning: 'Protector of the home from structural damage.' },
  { pada_id: 13, deity_name: 'Yama', sanskrit_name: 'यम', zone: 'S', ring: 'outer', meaning: 'God of death and dharma; one of the 8 Ashtadikpala, guardian of the South.' },
  { pada_id: 14, deity_name: 'Gandharva', sanskrit_name: 'गन्धर्व', zone: 'S', ring: 'outer', meaning: 'Celestial musician/messenger; associated with art, communication, discord-mediation.' },
  { pada_id: 15, deity_name: 'Bhringaraja', sanskrit_name: 'भृंगराज', zone: 'SE', ring: 'outer', meaning: 'King of bees; associated with desire (kama).' },
  { pada_id: 16, deity_name: 'Mriga', sanskrit_name: 'मृग', zone: 'S', ring: 'outer', meaning: 'Deer/deity linked to the Margashirsha lunar month.' },
  { pada_id: 17, deity_name: 'Pitru', sanskrit_name: 'पितृ', zone: 'SE', ring: 'outer', meaning: 'Ancestral souls; family lineage.' },
  { pada_id: 18, deity_name: 'Dauwarika', sanskrit_name: 'द्वारिक', zone: 'SW', ring: 'outer', meaning: 'Gatekeeper deity.' },
  { pada_id: 19, deity_name: 'Sugriva', sanskrit_name: 'सुग्रीव', zone: 'W', ring: 'outer', meaning: 'Horse-headed form; associated with learning.' },
  { pada_id: 20, deity_name: 'Pushpadanta', sanskrit_name: 'पुष्पदन्त', zone: 'W', ring: 'outer', meaning: "Gana of Shiva; gandharva lineage." },
  { pada_id: 21, deity_name: 'Varuna', sanskrit_name: 'वरुण', zone: 'W', ring: 'outer', meaning: 'God of water and cosmic order; Ashtadikpala guardian of the West.' },
  { pada_id: 22, deity_name: 'Asura', sanskrit_name: 'असुर', zone: 'W', ring: 'outer', meaning: 'Seeker of power; demonic-leaning nature.' },
  { pada_id: 23, deity_name: 'Shosha', sanskrit_name: 'शोष', zone: 'SW', ring: 'outer', meaning: 'Deity of drying/withering energy.' },
  { pada_id: 24, deity_name: 'Papyakshma', sanskrit_name: 'पाप्यक्ष्मा', zone: 'W', ring: 'outer', meaning: 'Disease deity, associated with consumptive illness.' },
  { pada_id: 25, deity_name: 'Roga', sanskrit_name: 'रोग', zone: 'W', ring: 'outer', meaning: 'Disease/affliction deity.' },
  { pada_id: 26, deity_name: 'Ahi (Naga)', sanskrit_name: 'अहि', zone: 'NW', ring: 'outer', meaning: 'Serpent deity.' },
  { pada_id: 27, deity_name: 'Mukhya (Vishvakarma)', sanskrit_name: 'मुख्य', zone: 'NW', ring: 'outer', meaning: 'Divine architect; creator-of-Vastu figure.' },
  { pada_id: 28, deity_name: 'Bhallata', sanskrit_name: 'भल्लाट', zone: 'NW', ring: 'outer', meaning: 'Moon-linked form; associated with wealth.' },
  { pada_id: 29, deity_name: 'Soma', sanskrit_name: 'सोम', zone: 'N', ring: 'outer', meaning: 'Moon deity; king of plants and medicine.' },
  { pada_id: 30, deity_name: 'Sarpa (Bhujanga)', sanskrit_name: 'सर्प', zone: 'N', ring: 'outer', meaning: 'Serpent deity, many-faced.' },
  { pada_id: 31, deity_name: 'Aditi', sanskrit_name: 'अदिति', zone: 'N', ring: 'outer', meaning: 'Mother goddess; associated with savings/accumulation.' },
  { pada_id: 32, deity_name: 'Diti', sanskrit_name: 'दिति', zone: 'NE', ring: 'outer', meaning: 'Mother of the daityas.' },
  { pada_id: 33, deity_name: 'Apa', sanskrit_name: 'आप', zone: 'NE', ring: 'inner', meaning: 'Water deity.' },
  { pada_id: 34, deity_name: 'Apavatsa', sanskrit_name: 'आपवत्स', zone: 'NE', ring: 'inner', meaning: 'River/water-source deity.' },
  { pada_id: 35, deity_name: 'Savita', sanskrit_name: 'सविता', zone: 'NE', ring: 'inner', meaning: 'Pre-sunrise solar energy.' },
  { pada_id: 36, deity_name: 'Savitra', sanskrit_name: 'सावित्र', zone: 'NE', ring: 'inner', meaning: 'Transition/dawn-linked deity.' },
  { pada_id: 37, deity_name: 'Indra (inner)', sanskrit_name: 'इन्द्र', zone: 'E', ring: 'inner', meaning: 'Inner-ring aspect of Indra; wealth and victory.' },
  { pada_id: 38, deity_name: 'Jaya', sanskrit_name: 'जय', zone: 'SE', ring: 'inner', meaning: 'Victory deity.' },
  { pada_id: 39, deity_name: 'Rudra', sanskrit_name: 'रुद्र', zone: 'S', ring: 'inner', meaning: 'Fierce form of Shiva.' },
  { pada_id: 40, deity_name: 'Rajayakshma', sanskrit_name: 'राजयक्ष्मा', zone: 'Center', ring: 'inner', meaning: 'Fierce Rudra aspect, linked to wasting illness — a caution pada near Brahmasthan.' },
  { pada_id: 41, deity_name: 'Aryama', sanskrit_name: 'अर्यमा', zone: 'SW', ring: 'inner', meaning: 'Ancestral/friendship deity.' },
  { pada_id: 42, deity_name: 'Vivasvan', sanskrit_name: 'विवस्वान्', zone: 'S', ring: 'inner', meaning: 'Solar deity, father of Yama.' },
  { pada_id: 43, deity_name: 'Mitra', sanskrit_name: 'मित्र', zone: 'W', ring: 'inner', meaning: 'Aditya of friendship and daylight.' },
  { pada_id: 44, deity_name: 'Prithvidhara', sanskrit_name: 'पृथ्वीधर', zone: 'Center', ring: 'inner', meaning: 'Earth-bearing (Shesha Naga) aspect.' },
  { pada_id: 45, deity_name: 'Brahma', sanskrit_name: 'ब्रह्मा', zone: 'Center', ring: 'inner', meaning: 'The creator; occupies the Brahmasthan, the most sacred point of the plan.' }
]

// Content researched so far — keyed by pada_id. Anything not listed here
// is genuinely un-researched; the engine below must say so rather than
// inventing a verdict.
export const PADA_EFFECTS = {
  1: {
    location_confidence: 85,
    effect_confidence: 75,
    classical_references: ['Brihat Samhita (Vastu Purusha Mandala)', 'Modern compilations: iiag.co.in, vaastuinternational.com'],
    reported_benefits: ['Spiritual clarity', 'Good for meditation/pooja space nearby', 'Supports the NE "water & wisdom" quality of the plot'],
    reported_challenges: ['A main entrance placed exactly here is described by some traditions as inviting fire-related loss or fear (Shikhi = a fire-linked deity at the head position)'],
    source_disagreement_note: 'Most modern Vastu sources agree the NE corner overall is auspicious for entrances, pooja rooms, and water elements. Where they diverge is specifically on the Shikhi pada within NE: some texts read it as fire-adjacent and caution against a door landing exactly on it, while others treat the whole NE zone as uniformly favorable and don\'t single out this sub-pada. Treat the "avoid this exact pada for the main door" reading as one specific tradition\'s caution, not universal consensus.'
  },
  13: {
    location_confidence: 90,
    effect_confidence: 85,
    classical_references: ['Ashtadikpala (8 classical direction guardians) — Yama as South guardian is near-universal', 'Modern compilations: iiag.co.in'],
    reported_benefits: ['Consistently read as inauspicious for a main door or bedroom by nearly all sources — rare point of high agreement'],
    reported_challenges: ['Yama is the god of death; a door or bedroom on this pada is almost universally discouraged across Vastu schools'],
    source_disagreement_note: 'This is one of the few padas where sources largely agree: avoid a main entrance or bedroom directly on Yama\'s pada. The disagreement that exists is about severity (some call it a strict prohibition, others a soft caution to be balanced with remedies), not about the direction of the effect.'
  },
  14: {
    location_confidence: 85,
    effect_confidence: 70,
    classical_references: ['Brihat Samhita', 'Mayamata', 'Manasara', 'Modern commentaries: vaastuinternational.com, connectwithvastu.com, modernvastu.in, vastuenergetics.com'],
    reported_benefits: ['Artistic growth', 'Social recognition', 'Communication skills', 'Confidence', 'Hospitality'],
    reported_challenges: ['Reputation issues (some traditions)', 'Unnecessary expenses (some traditions)', 'Digestive imbalance (some traditions)', 'Emotional instability (some traditions)'],
    source_disagreement_note: 'Some references (e.g. Vaastu International) describe this pada as making occupants fearless/confident (positive). Others (e.g. ConnectWithVastu, ModernVastu) describe financial loss and reputation damage (negative). VastuEnergetics describes a mixed effect (wealth gain with digestive issues). This is a genuine cross-tradition disagreement, not an error.'
  },
  21: {
    location_confidence: 90,
    effect_confidence: 80,
    classical_references: ['Ashtadikpala — Varuna as West guardian is near-universal', 'Modern compilations: iiag.co.in'],
    reported_benefits: ['Water-element placements (tanks, borewells) are consistently read as favorable here', 'Generally stable, truth/order-linked energy'],
    reported_challenges: ['Placing fire elements (kitchen) on this pada clashes with the water association in most schools'],
    source_disagreement_note: 'Broad agreement that Varuna favors water-related use and disfavors fire-related use on this pada; disagreement is mostly about how strongly a kitchen here should be avoided vs. remedied.'
  },
  9: {
    location_confidence: 90,
    effect_confidence: 80,
    classical_references: ['Ashtadikpala — Vayu as Northwest guardian is near-universal', 'Modern compilations used throughout the existing Vastu Griha room rules'],
    reported_benefits: ['Favorable for guest rooms, air-circulation-dependent spaces, and (per several modern schools) a secondary kitchen location'],
    reported_challenges: ['Considered too "active/restless" by some schools for a primary master bedroom or long-term-stay room'],
    source_disagreement_note: 'Most sources agree NW suits movement-oriented spaces (guest rooms, storage-in-motion, secondary kitchen). They diverge on whether it\'s acceptable for a full-time bedroom — some call it fine for guests only, others extend that to any bedroom.'
  },
  40: {
    location_confidence: 80,
    effect_confidence: 75,
    classical_references: ['Brihat Samhita (Maha Marmasthana concept)', 'Modern compilations: iiag.co.in'],
    reported_benefits: ['Not associated with positive use-cases in most sources — this pada sits inside the Brahmasthan buffer, which classical texts consistently say should be left open, not built upon'],
    reported_challenges: ['Named for a wasting illness (yakshma); heavy construction or a bedroom/toilet here is discouraged across nearly all sources'],
    source_disagreement_note: 'Rare point of strong agreement: keep this pada (and the Brahmasthan generally) open, light, and unobstructed. Disagreement is limited to how large a "keep clear" radius different schools recommend around it.'
  }
}

export function getPadaKnowledge(padaId) {
  const base = PADA_KNOWLEDGE.find(p => p.pada_id === padaId)
  if (!base) return null
  const effects = PADA_EFFECTS[padaId]
  return {
    ...base,
    location_confidence: effects?.location_confidence ?? 85,
    effect_confidence: effects?.effect_confidence ?? null,
    classical_references: effects?.classical_references ?? ['Brihat Samhita / Vastu Purusha Mandala (name & position only — effect not yet researched)'],
    effectResearched: !!effects,
    traditional_interpretation: effects ? {
      reported_benefits: effects.reported_benefits,
      reported_challenges: effects.reported_challenges,
      source_disagreement_note: effects.source_disagreement_note
    } : {
      reported_benefits: [],
      reported_challenges: [],
      source_disagreement_note: 'Not yet researched — this pada\'s effect needs a dedicated cross-source check (classical texts + modern commentaries) before Vastu Griha shows a "Why?" verdict for it. Its name and position above are populated; its auspiciousness reading is not.'
    }
  }
}

// All padas whose zone matches the given 9-zone code (N/NE/E/SE/S/SW/W/NW/Center)
// — a coarse zone can contain several padas, since the app currently scores
// room placement on a 3x3 zone grid, not the finer 45-pada grid.
export function getPadasInZone(zone) {
  return PADA_KNOWLEDGE.filter(p => p.zone === zone).map(p => getPadaKnowledge(p.pada_id))
}
