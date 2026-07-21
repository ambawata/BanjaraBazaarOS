import { colors, backgroundImage, fontFamily, boxShadow } from '../../shared/ui/tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  // shared/ui/**/*.jsx added — REAL BUG FOUND DURING TESTING: without
  // this, Tailwind's JIT content scanner never sees the shared Sidebar/
  // AppShell source files at all (they live outside this app's own src/),
  // so classes used ONLY there (e.g. the arbitrary w-[70px]/w-[250px]
  // rail-width values) were silently never generated — the sidebar
  // rendered with no width utility applied at all and fell back to
  // content-based auto-sizing, which is what "confirm labels genuinely
  // disappear" testing caught (computed width was neither 70px nor
  // 250px). Any future shared/ui consumer app needs this same glob
  // addition in its own tailwind.config.js — documented here and in
  // shared/ui/tokens.js.
  content: ['./index.html', './src/**/*.{js,jsx}', '../../shared/ui/**/*.{js,jsx}'],
  theme: {
    extend: {
      // MIGRATED to shared/ui/tokens.js — this file used to hardcode
      // these hex values directly (see git history). vastu-griha's own
      // config was the CANONICAL SOURCE that tokens.js was extracted
      // from verbatim (zero value changes), and now re-imports them
      // rather than keeping a second copy. See tokens.js's own docblock
      // for the migration pattern future apps (admin-panel, vendor-portal
      // — not touched by this change) should follow.
      colors,
      backgroundImage,
      fontFamily,
      boxShadow,
    },
  },
  plugins: [],
}
