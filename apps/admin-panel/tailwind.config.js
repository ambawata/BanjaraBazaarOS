import { colors, backgroundImage, fontFamily } from '../../shared/ui/tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  // shared/ui/**/*.jsx added — same real bug already fixed for vastu-griha
  // (PR #5): without this, Tailwind's JIT content scanner never sees the
  // shared Sidebar/AppShell source files (they live outside this app's own
  // src/), so classes used only there (e.g. the arbitrary w-[70px]/w-[250px]
  // rail widths) are silently never generated.
  content: ['./index.html', './src/**/*.{js,jsx}', '../../shared/ui/**/*.{js,jsx}'],
  theme: {
    extend: {
      // MIGRATED to shared/ui/tokens.js — replaces this app's own former
      // dark-slate/violet palette (brand:#7C6FF7 on bg:#0C0D10) with the
      // canonical BanjaraBazaarOS light/purple/cream brand (#5A1FB3 /
      // #5D35AE), same source of truth apps/vastu-griha uses. The bulk of
      // this app's actual screen content is styled via its own
      // src/index.css CSS custom properties (:root), not these Tailwind
      // classes — those were re-themed separately to the same palette, see
      // index.css. These Tailwind colors matter for the shared
      // Sidebar/AppShell chrome specifically.
      colors,
      backgroundImage,
      fontFamily,
    },
  },
  plugins: [],
}
