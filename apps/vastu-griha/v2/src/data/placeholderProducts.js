// PLACEHOLDER product catalog for the Vastu Knowledge Engine's shopping
// panel. Plausible but fake names/prices/ratings — explicitly meant to be
// swapped for real vendor data from BanjaraBazaarOS's actual marketplace
// once that's wired up. See vastuShoppingTiers.js for how KB entries point
// into this file, and knowledge-base/BUILD_LOG.md for the "why placeholder"
// note.
//
// icon: a key into ProductIcon.jsx's glyph set (not a photo — no product
// photography exists yet either).

const PRODUCTS = {
  wardrobe: { name: 'Solid Wood Wardrobe', meta: '3-door, sheesham finish', price: 18999, rating: 4.4, reviews: 86, icon: 'wardrobe' },
  locker: { name: 'Steel Home Locker', meta: 'Digital lock, fire-resistant', price: 4499, rating: 4.3, reviews: 52, icon: 'locker' },
  mirror: { name: 'Oval Wall Mirror', meta: '24-inch, teak frame', price: 2499, rating: 4.6, reviews: 128, icon: 'mirror' },
  studyTable: { name: 'Study Table with Drawer', meta: 'Engineered wood, 40x24 inch', price: 6499, rating: 4.3, reviews: 64, icon: 'studyTable' },
  tvUnit: { name: 'TV Console Unit', meta: 'Fits up to 55-inch TV', price: 8999, rating: 4.2, reviews: 47, icon: 'tv' },
  sofa: { name: '3-Seater Fabric Sofa', meta: 'Beige upholstery', price: 24999, rating: 4.5, reviews: 133, icon: 'sofa' },
  bed: { name: 'Queen Size Bed', meta: 'Engineered wood, no storage', price: 15999, rating: 4.4, reviews: 91, icon: 'bed' },
  masterBed: { name: 'King Size Bed with Storage', meta: 'Hydraulic storage, walnut finish', price: 22999, rating: 4.5, reviews: 74, icon: 'bed' },
  kidsBed: { name: "Kids' Single Bed", meta: 'With guard rail, pastel finish', price: 9999, rating: 4.4, reviews: 58, icon: 'bed' },
  guestBed: { name: 'Folding Guest Bed', meta: 'Space-saving, easy fold', price: 7499, rating: 4.2, reviews: 39, icon: 'bed' },
  mattress: { name: 'Orthopedic Mattress', meta: 'Queen size, medium-firm', price: 8999, rating: 4.4, reviews: 112, icon: 'bed' },
  gasStove: { name: '4-Burner Gas Stove', meta: 'Stainless steel, auto-ignition', price: 5499, rating: 4.5, reviews: 147, icon: 'stove' },
  kitchenSink: { name: 'Kitchen Sink with Faucet', meta: 'Single bowl, stainless steel', price: 3999, rating: 4.3, reviews: 68, icon: 'sink' },
  refrigerator: { name: 'Double Door Refrigerator', meta: '265L, frost-free', price: 27999, rating: 4.4, reviews: 105, icon: 'fridge' },
  templeCabinet: { name: 'Wooden Temple Cabinet', meta: 'Wall-mount, teak finish', price: 6999, rating: 4.6, reviews: 82, icon: 'pooja' },
  idolStatue: { name: 'Brass Idol Statue', meta: 'Ganesha, 6-inch', price: 1299, rating: 4.7, reviews: 96, icon: 'pooja' },
  poojaAccessories: { name: 'Pooja Accessories Set', meta: 'Thali, diya, bell — 12 pieces', price: 999, rating: 4.5, reviews: 141, icon: 'pooja' },
  diningTable: { name: '6-Seater Dining Table', meta: 'Engineered wood, with chairs', price: 19999, rating: 4.4, reviews: 63, icon: 'diningTable' },
  bathroomFittings: { name: 'Bathroom Fittings Set', meta: 'Tap, shower, accessories', price: 1899, rating: 4.2, reviews: 45, icon: 'toilet' },
  tulsiPlant: { name: 'Tulsi Plant with Pot', meta: 'Live plant, ceramic pot', price: 349, rating: 4.6, reviews: 118, icon: 'tulsi' },
  moneyPlant: { name: 'Money Plant with Pot', meta: 'Live plant, hanging pot', price: 299, rating: 4.5, reviews: 103, icon: 'moneyPlant' },
  aquarium: { name: 'Aquarium Fish Tank', meta: '2-feet, with filter', price: 1799, rating: 4.3, reviews: 57, icon: 'fishTank' },
  remedyKit: { name: 'Vastu Remedy Kit', meta: 'Pyramid, salt bowl, wind chime', price: 899, rating: 4.4, reviews: 89, icon: 'remedy' },
  mainDoor: { name: 'Main Door (Teak)', meta: '7x3.5 ft, with frame', price: 21999, rating: 4.5, reviews: 41, icon: 'door' },
  tankUnderground: { name: 'Underground Water Tank', meta: '2000L, food-grade plastic', price: 8999, rating: 4.3, reviews: 54, icon: 'tankUnderground' },
  tankOverhead: { name: 'Overhead Water Tank', meta: '1000L, with stand', price: 6499, rating: 4.3, reviews: 48, icon: 'tankOverhead' },
  wallArt: { name: 'Wall Art Painting', meta: 'Canvas, framed, 24x18 inch', price: 1499, rating: 4.4, reviews: 72, icon: 'painting' },
  bedHeadboard: { name: 'Bed with Adjustable Headboard', meta: 'Rotate-friendly frame, queen size', price: 16999, rating: 4.3, reviews: 66, icon: 'bed' },
  diningChair: { name: 'Dining Chair (Set of 2)', meta: 'Cushioned seat, wooden frame', price: 3499, rating: 4.3, reviews: 55, icon: 'diningTable' },
  paintSampleSet: { name: 'Wall Paint Sample Set', meta: '6 shades, 200ml each', price: 449, rating: 4.2, reviews: 38, icon: 'paint' },
  kitchenBundle: { name: 'Kitchen Essentials Bundle', meta: 'Storage jars, rack, organizer', price: 1599, rating: 4.3, reviews: 61, icon: 'kitchenGeneral' },
  doorThreshold: { name: 'Brass Door Threshold', meta: '36-inch, anti-skid', price: 799, rating: 4.4, reviews: 33, icon: 'door' },
  roomDoor: { name: 'Room Door (Flush)', meta: '7x2.5 ft, laminate finish', price: 8999, rating: 4.2, reviews: 40, icon: 'door' },
  indoorPlant: { name: 'Indoor Plant (Assorted)', meta: 'Live plant, ceramic pot', price: 249, rating: 4.5, reviews: 97, icon: 'plantGeneric' },
  vastuComboKit: { name: 'Vastu Compass + Remedy Kit', meta: 'Compass, pyramid, remedy guide booklet', price: 1299, rating: 4.4, reviews: 71, icon: 'compass' },
}

export default PRODUCTS
