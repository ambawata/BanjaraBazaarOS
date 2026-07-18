// Maps every KB entry_id -> { tier, productId, labelKey }. This is the ONLY
// place that decides which product a Vastu answer points to — swap this
// file (or point it at a real vendor lookup) when real marketplace data
// arrives; nothing in the KB or the card components needs to change.
//
// Tier 1 = direct match ("Perfect ke liye yeh disha!", solid Add to Cart)
// Tier 2 = closest match ("Is disha mein theek karne ke liye", solid Add to Cart)
// Tier 3 = no match ("Apna ghar Vastu-friendly banayein", outline "Shop Vastu Essentials")
//
// Coverage note: the live KB has 60 entries, not the 63 assumed in the
// original spec, and RZ only goes up to RZ-07 (no RZ-08..RZ-14 exist yet).
// Five entries weren't covered by the original tier list at all
// (SD-08, RZ-00, RZ-02, RZ-03, RZ-PADA) — assigned below by the same logic
// used for their siblings (SD-08 is a bed-orientation entry like SD-01..04;
// RZ-00/02/03/PADA are foundation/status entries like the other Tier-3
// conceptual ones) so every entry still has a purchase path, per the core
// principle. If RZ-08+ facing-direction entries are added later, they
// should default to Tier 3 / vastuComboKit until someone assigns them
// properly — see the DEFAULT fallback at the bottom of this file.

const TIER1_LABEL = 'shopLabelTier1'
const TIER2_LABEL = 'shopLabelTier2'
const TIER3_LABEL = 'shopLabelTier3'

const TIERS = {
  // ---- Tier 1: direct match ----
  'FF-01': { tier: 1, productId: 'wardrobe', labelKey: TIER1_LABEL },
  'FF-02': { tier: 1, productId: 'locker', labelKey: TIER1_LABEL },
  'FF-03': { tier: 1, productId: 'mirror', labelKey: TIER1_LABEL },
  'FF-04': { tier: 1, productId: 'studyTable', labelKey: TIER1_LABEL },
  'FF-05': { tier: 1, productId: 'tvUnit', labelKey: TIER1_LABEL },
  'FF-06': { tier: 1, productId: 'sofa', labelKey: TIER1_LABEL },
  'FF-07': { tier: 1, productId: 'bed', labelKey: TIER1_LABEL },
  'SD-05': { tier: 1, productId: 'masterBed', labelKey: TIER1_LABEL },
  'SD-06': { tier: 1, productId: 'kidsBed', labelKey: TIER1_LABEL },
  'SD-07': { tier: 1, productId: 'guestBed', labelKey: TIER1_LABEL },
  'SD-09': { tier: 1, productId: 'mattress', labelKey: TIER1_LABEL },
  'KI-02': { tier: 1, productId: 'gasStove', labelKey: TIER1_LABEL },
  'KI-04': { tier: 1, productId: 'kitchenSink', labelKey: TIER1_LABEL },
  'KI-05': { tier: 1, productId: 'refrigerator', labelKey: TIER1_LABEL },
  'PJ-01': { tier: 1, productId: 'templeCabinet', labelKey: TIER1_LABEL },
  'PJ-02': { tier: 1, productId: 'idolStatue', labelKey: TIER1_LABEL },
  'PJ-03': { tier: 1, productId: 'poojaAccessories', labelKey: TIER1_LABEL },
  'EA-02': { tier: 1, productId: 'diningTable', labelKey: TIER1_LABEL },
  'MI-01': { tier: 1, productId: 'bathroomFittings', labelKey: TIER1_LABEL },
  'MI-03a': { tier: 1, productId: 'tulsiPlant', labelKey: TIER1_LABEL },
  'MI-03b': { tier: 1, productId: 'moneyPlant', labelKey: TIER1_LABEL },
  'MI-04': { tier: 1, productId: 'mirror', labelKey: TIER1_LABEL },
  'MI-07': { tier: 1, productId: 'aquarium', labelKey: TIER1_LABEL },
  'MI-10': { tier: 1, productId: 'remedyKit', labelKey: TIER1_LABEL },
  'DE-01': { tier: 1, productId: 'mainDoor', labelKey: TIER1_LABEL },
  'WE-01': { tier: 1, productId: 'tankUnderground', labelKey: TIER1_LABEL },
  'WE-02': { tier: 1, productId: 'tankOverhead', labelKey: TIER1_LABEL },
  'FF-08': { tier: 1, productId: 'wallArt', labelKey: TIER1_LABEL },

  // ---- Tier 2: closest match ----
  'SD-01': { tier: 2, productId: 'bedHeadboard', labelKey: TIER2_LABEL },
  'SD-02': { tier: 2, productId: 'bedHeadboard', labelKey: TIER2_LABEL },
  'SD-03': { tier: 2, productId: 'bedHeadboard', labelKey: TIER2_LABEL },
  'SD-04': { tier: 2, productId: 'bedHeadboard', labelKey: TIER2_LABEL },
  'SD-08': { tier: 2, productId: 'bedHeadboard', labelKey: TIER2_LABEL }, // not in original spec — same bed-orientation family as SD-01..04
  'EA-01': { tier: 2, productId: 'diningChair', labelKey: TIER2_LABEL },
  'CO-01': { tier: 2, productId: 'paintSampleSet', labelKey: TIER2_LABEL },
  'CO-02': { tier: 2, productId: 'paintSampleSet', labelKey: TIER2_LABEL },
  'KI-01': { tier: 2, productId: 'kitchenBundle', labelKey: TIER2_LABEL },
  'KI-03': { tier: 2, productId: 'gasStove', labelKey: TIER2_LABEL },
  'DE-02': { tier: 2, productId: 'doorThreshold', labelKey: TIER2_LABEL },
  'DE-03': { tier: 2, productId: 'mainDoor', labelKey: TIER2_LABEL },
  'DE-04': { tier: 2, productId: 'roomDoor', labelKey: TIER2_LABEL },
  'MI-06': { tier: 2, productId: 'remedyKit', labelKey: TIER2_LABEL },
  'MI-03': { tier: 2, productId: 'indoorPlant', labelKey: TIER2_LABEL },

  // ---- Tier 3: no match — generic Vastu-shopping CTA ----
  'RZ-01': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-04': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-05': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-06': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-07': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'WE-03': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'WE-04': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'WE-05': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'MI-02': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'MI-05': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'MI-08': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'MI-09': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'KI-06': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  // Not in original spec — foundation/status/explainer entries, same
  // "no single product fits" logic as the rest of Tier 3.
  'RZ-00': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-02': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-03': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
  'RZ-PADA': { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL },
}

const DEFAULT_TIER = { tier: 3, productId: 'vastuComboKit', labelKey: TIER3_LABEL }

export function getShoppingInfo(entryId) {
  return TIERS[entryId] || DEFAULT_TIER
}

export { TIER1_LABEL, TIER2_LABEL, TIER3_LABEL }
