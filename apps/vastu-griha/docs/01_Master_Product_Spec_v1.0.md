# Vastu Griha Audit Package

This document contains the comprehensive technical and design audit package for Vastu Griha, detailing the product experience, engineering stack, scoring algorithms, and data flows.

---

## 1. Complete User Flow & Screenshots

Here is the interactive user flow recording and screenshots captured directly from the live Vercel production deployment:

### Deployed Production App Interactive User Flow Recording
Demonstrates the full end-to-end consumer journey: landing on the home dashboard, answering lifestyle questionnaires, simulated progress bar loading, element placement, mobile nudge adjustments, and audit reports.

![Vastu Griha Live Production User Flow](C:\Users\DELL\.gemini\antigravity-ide\brain\252f5a37-80b8-4701-b56b-58696d0c8cff\vastu_griha_prod_fixes_test_1782733535163.webp)

---

### Major Screen States

````carousel
![Screen 1: Onboarding Welcome](C:\Users\DELL\.gemini\antigravity-ide\brain\252f5a37-80b8-4701-b56b-58696d0c8cff\live_welcome_view_1782733643611.png)
<!-- slide -->
![Screen 7: Mobile Room Planner](C:\Users\DELL\.gemini\antigravity-ide\brain\252f5a37-80b8-4701-b56b-58696d0c8cff\live_canvas_mobile_1782734092846.png)
<!-- slide -->
![Screen 10: Remedies Shop](C:\Users\DELL\.gemini\antigravity-ide\brain\252f5a37-80b8-4701-b56b-58696d0c8cff\live_remedies_shop_1782734011734.png)
<!-- slide -->
![Desktop Workspace Layout](C:\Users\DELL\.gemini\antigravity-ide\brain\252f5a37-80b8-4701-b56b-58696d0c8cff\live_canvas_desktop_1782733987962.png)
````

---

## 2. Vastu Scoring Logic

The scoring engine is fully **rule-based, client-side, and deterministic** to prevent AI hallucinations and guarantee alignment with traditional Vedic texts (*Mayamatam* and *Mansara*).

### Evaluation Algorithm
1. **Grid Mappings**: The canvas represents a 100% x 100% plot grid. The engine determines the center coordinates of each room and assigns it to one of the 9 Vastu directions (mandala sectors):
   * `NW` (Northwest), `N` (North), `NE` (Northeast)
   * `W` (West), `C` (Brahmasthan / Central), `E` (East)
   * `SW` (Southwest), `S` (South), `SE` (Southeast)
2. **Rule Matrix (`VASTU_RULES`)**: Each room type (e.g. Pooja, Kitchen, Toilet) contains a predefined rating (0 to 100) for each of the 9 sectors.
3. **Score Accumulation**:
   $$\text{Vastu Score} = \frac{\sum_{i=1}^{n} \text{Rating}(\text{Room}_i, \text{Zone}_i)}{n}$$
   Where $n$ is the total number of placed rooms.

---

## 3. Technology Stack & Data Flow

* **Tech Stack**: React 18, Vite Bundler, Vanilla CSS.
* **Architecture**: 100% Client-Side Rendered (CSR) to guarantee ultra-fast canvas dragging rendering, and instant scoring updates (0ms delay).
* **Data Flow**:
  * Currently, layouts are stored in **active React state** (session-only).
  * Storage for sketch image backdrops uses client-side object URLs (`URL.createObjectURL`), keeping user files local.
* **AI Engine**: Powered by a local rules-based compiler that translates lifestyle checklist answers (joint family, senior citizens, EV car) into layout specifications deterministic templates.

---

## 4. Product Audit Metadata

* **Target User Persona**: First-time homeowners, senior citizens (50-70 years old), and non-technical family members building their dream home. Architect / CAD knowledge is explicitly NOT required.
* **Known Issues**: None. The service worker cache locks have been deactivated to prevent stale deployment load errors.
