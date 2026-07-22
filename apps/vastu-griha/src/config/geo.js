// Magnetic declination for Delhi NCR (~28.6°N, 77.2°E) — the angle between
// Magnetic North (what a phone compass senses) and True North (what the
// geometry engine's bearings are referenced to). This is a fixed,
// region-specific approximation, NOT a live value: declination varies by
// location and drifts by roughly 0.1-0.2° per year. If the app expands
// beyond Delhi NCR, this constant must be replaced with a real lookup keyed
// by the user's actual lat/lon (e.g. NOAA's World Magnetic Model API —
// https://www.ncei.noaa.gov/products/world-magnetic-model — or an
// equivalent WMM-based service), not hand-maintained per region.
export const DELHI_NCR_DECLINATION = 1.1
