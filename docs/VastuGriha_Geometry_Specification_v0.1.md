# Vastu Griha — Geometry Specification (Engineering Standard)

**Version:** 0.1 (Draft — for review)
**Status:** Geometry layer only. NO Vastu rules, deity mappings, or remedies are defined in this document.
**Reference test case:** AmbNiwas (Vinod's house) — all formulas below must reproduce/validate against this property before being locked to v1.0.
**Scope boundary:** This document answers "where is everything, precisely, and how do we know" — nothing about "what does it mean." Rule attachment (classical texts, KB, verdicts) is a separate downstream layer that consumes this spec's outputs and must never feed back into it.

---

## 0. Conventions (prerequisite for all sections below)

These must be fixed before any of the 6 items make sense — included here as scaffolding, not as a 7th requirement.

| Item | Convention |
|---|---|
| Primary real-world unit | Feet (ft), matching survey/floor-plan practice already in use |
| Coordinate system | Local planar ENU (East-North-Up), origin at plot centroid, units = feet |
| Angle convention | Compass bearing: N = 0°, clockwise positive, range [0°, 360°) |
| Positive rotation | Clockwise / toward East |
| Source coordinate systems that must be converted into the above | (a) GPS lat/long from satellite imagery, (b) pixel coordinates from floor-plan images, (c) pixel coordinates from satellite screenshots |

### 0.1 Lat/Long → local planar feet (for satellite-derived corners)

For plot sizes under ~1000 ft (flat-earth approximation is valid, error negligible):
```
x_ft (East) = (lon - lon0) * cos(radians(lat0)) * 364000
y_ft (North) = (lat - lat0) * 364000
```
(364000 ≈ feet per degree latitude; lon0/lat0 = an arbitrary local reference point, e.g. plot centroid)

### 0.2 Pixel space → bearing (for satellite screenshots, which are north-up by definition)
```
dx = x2 - x1
dy_north = -(y2 - y1) # image y increases downward, must invert
bearing = atan2(dx, dy_north) normalized to [0, 360)
```
No rotation correction needed here — satellite pixel bearings ARE true bearings, provided the screenshot is confirmed north-up (check against the unzoomed/un-rotated map view).

---

## 1. True North Determination

**Confidence tiers (use highest available):**

| Tier | Source | Reliability |
|---|---|---|
| 1 | Land survey document / architect's plan with stated true north + GPS reference | Highest |
| 2 | Satellite imagery, pixel-bearing calculation (§0.2), cross-validated across ≥2 independent screenshots | High |
| 3 | On-site magnetic compass | Low — flag for correction |

**Method (Tier 2, primary method until Tier 1 available):**
1. Obtain a satellite screenshot with ALL plot boundary corners fully visible, no clipping, at max usable zoom.
2. Digitize corner pixel coordinates (minimum 2 non-adjacent corners on one edge; all 4 corners preferred for cross-check).
3. Compute edge bearing via §0.2.
4. Repeat on a second, independently-captured screenshot (different zoom/crop/session).
5. **Accept only if the two measurements agree within ±2°.** If not, re-measure or source a third image.
6. Output: **True North Rotation Angle (R)** = signed angular offset between the building's primary axis (front-wall-parallel, or longest boundary edge) and true north. Positive = building rotated clockwise/East of true north.

**Compass fallback caveat:** On-site compass readings are treated as low-confidence by default and must be corroborated by Tier 1/2 data. (Validated in this project: on-site compass read 15° West; satellite measurement — cross-validated twice — read 25–26° East. A 40° discrepancy, almost certainly magnetic interference from rebar/appliances. Compass alone is not an acceptable sole source.)

**Magnetic declination** is applied ONLY when the input source is a magnetic compass, never to satellite-derived bearings. Must be pulled from a live declination model (e.g. WMM/NOAA), not hardcoded — it drifts yearly and varies by location.

---

## 2. Building / Plot Centroid Calculation

The centroid is the **true geometric (area) centroid of the boundary polygon** — NOT the bounding-box midpoint. Bounding-box center is wrong for any irregular/cut-corner plot (which AmbNiwas is).

**Formula (polygon centroid, shoelace-based):**
```
A = 0.5 * Σ (x_i * y_(i+1) − x_(i+1) * y_i)
Cx = (1/(6A)) * Σ (x_i + x_(i+1)) * (x_i * y_(i+1) − x_(i+1) * y_i)
Cy = (1/(6A)) * Σ (y_i + y_(i+1)) * (x_i * y_(i+1) − x_(i+1) * y_i)
```
Vertices ordered consistently (clockwise or counter-clockwise) in local planar feet (§0.1).

**Two distinct centroids must be tracked, never conflated:**
- **Plot centroid** — from the land boundary polygon. This is the Brahmasthan reference point for the classical Vastu Purusha Mandala. **Default source of truth.**
- **Building footprint centroid** — from the constructed structure's outline, if it doesn't cover the full plot. Used only when a specific rule explicitly calls for structure-only analysis.

---

## 3. 360° Angle Measurement Standard

**Reference point:** the centroid from §2 (plot centroid by default).

**Bearing of any point P from centroid C**, both in local planar feet:
```
East_component = Px − Cx
North_component = Py − Cy
bearing = atan2(East_component, North_component), normalized to [0, 360)
```

**Converting a floor-plan (non-north-up, "plan-north") bearing to a true bearing:**
```
true_bearing = plan_bearing + R (R = True North Rotation Angle from §1, signed)
```
This correction is ONLY needed for floor-plan-derived angles. Satellite-derived bearings are already true (§0.2).

**Zone resolution:**
- 16-direction (22.5° sectors), used for general facing classification.
- 32-direction (11.25° sectors), used for pada-level precision (§4).
- **Boundary rule:** if a bearing falls within ±0.5° of a sector edge, do not silently round — flag as `boundary_case: true` and surface both adjacent zones to the rule layer. (This matters: AmbNiwas's front wall measured 203.8°, only 1.3° from the SSW center — close but not a boundary case. A rotation input off by 2° could have made it one.)

---

## 4. Irregular Wall → Pada Division

Applied **per physical wall segment** (each edge of the plot polygon as it actually exists — no force-fitting to a rectangular bounding box).

**Per wall:**
1. Compute real-world wall length via distance formula between its two corner vertices (local planar feet, calibrated against at least one known real-world dimension).
2. Divide into 9 equal-length padas (classical 9×9 Vastu Purusha Mandala; app must also support finer 32-division per wall — see Open Question below).
3. Number padas sequentially from a **defined reference corner**, direction to be confirmed against source texts (see Open Question — texts may disagree; treat as a source-disagreement item, tiered classical-vs-modern like the rest of the KB).
4. For cut/irregular plots: missing corners = "missing pada" (dosha flag); extended corners = "extended pada," classified shubh/ashubh per its §3 zone. No interpretation of severity happens here — this layer only flags the geometric fact.

**Each pada stores (data only, no verdict):**
`wall_id, pada_index, start_ft, end_ft, midpoint_coord, bearing_from_centroid, zone_16, zone_32`

---

## 5. Room Centroid Computation

1. Each room = closed polygon, ideally from CAD vector data; if only raster, corners must be digitized (manually or via wall-vectorization).
2. Apply the §2 polygon centroid formula (area centroid) — matters for L-shaped/irregular rooms, not just bounding-box center.
3. **Critical calibration step:** the floor plan's pixel space must be registered to the plot's real-world coordinate system via an affine/similarity transform (scale + rotation + translation), computed from ≥2 matching reference points visible in both the floor plan and the satellite/survey outline.
   - **This transform is where §1's rotation correction gets applied programmatically** — replacing the manual/visual room-position estimation used earlier in this project (which was an approximation, not the final method).
4. Output per room: `centroid_coord, bearing_from_plot_centroid (true), distance_from_centroid, zone_16, zone_32`

---

## 6. Door / Gate Pada Inheritance

1. A door/gate is a point (or short segment) located **on a wall**, not room-interior.
2. Its pada = whichever §4 pada's start/end range (in real-world feet along that wall) contains the door's position.
3. Preferred position input: the door's own centroid coordinate in the registered coordinate system (§5.3) — more robust than "distance from a named corner," which is ambiguous about which corner is the reference.
4. **Wide gates spanning a pada boundary:** record both padas, flag `spans: [pada_x, pada_y]` — do not force a single assignment.
5. **Critical separation of concerns:** a door's zone is determined by its **pada-level bearing** (§4/§6), which is independent from the **wall's overall facing bearing** (§3, whole-building). These are stored as two separate fields and must never be collapsed into a single verdict.
   - This is the exact resolution to the discrepancy in this project: the shastri's "entry is perfect" call was a pada-level judgment (gate falls in a favorable pada on the West wall); the "SW/SSW-facing" call was a whole-building facing judgment (Wall C's outward bearing). Both are correct simultaneously because they answer different questions.

---

## 7. Open Questions (must be resolved before rule-layer work begins)

1. **Pada numbering start point/direction** — which corner, which rotation direction (CW/CCW)? Source texts (Mayamata, Manasara, Vishwakarma Prakash, Samarangana Sutradhara) may disagree — needs explicit KB entries per text, not a single silent default.
2. **9-pada-per-wall vs. continuous 32-mark perimeter numbering** — the shastri's hand-marked photo shows a continuous scale (10, 20, 30 ... 370) running around the whole perimeter. This looks like **raw perimeter distance measurements** (tape reading from a fixed start point, in feet), used manually to locate padas — not a competing pada system itself. Needs direct confirmation of the shastri's method before being encoded. Until confirmed, treat these numbers as raw input data that feeds §4's algorithm, not as an alternate output.
3. **9×9 vs 32-division reconciliation** — app must support both; need a documented mapping between them (32-division is finer, should nest cleanly inside the 9×9 grid — needs a worked example on AmbNiwas to confirm no rounding conflicts at pada edges).

---

## 8. Data Model — Quick Reference

| Entity | Key fields |
|---|---|
| Plot | boundary_vertices[], centroid, true_north_rotation_R, confidence_tier |
| Wall | wall_id, corner_start, corner_end, length_ft, facing_bearing_true |
| Pada | wall_id, pada_index, start_ft, end_ft, midpoint_coord, bearing_from_centroid, zone_16, zone_32 |
| Room | room_id, polygon_vertices[], centroid, bearing_from_centroid, zone_16, zone_32 |
| Door/Gate | wall_id, position_coord, pada_id (or spans[]), bearing_from_centroid, zone_16, zone_32 |

---

## 9. Validation Plan

Before this spec is locked to v1.0:
- Re-run §1–§6 on AmbNiwas with a **clean, non-clipped satellite screenshot** (current best has one corner cut off in the historical image).
- Confirm front-wall facing (currently 203.8°/SSW) stays within ±2° across a third independent satellite measurement.
- Digitize actual room polygon corners from the CAD floor plan (not visual estimation) and re-run centroid + bearing calculations — compare against the approximated version already produced.
- Resolve Open Questions in §7 before pada numbering is treated as final.

## 10. Explicitly Out of Scope (this document)

Vastu rule attachment, deity/pada name mapping, severity/verdict logic, remedy tiers (classical vs. popular), and KB linking. These consume this spec's outputs (bearings, zones, pada IDs) in a later phase and must not influence any formula above.
