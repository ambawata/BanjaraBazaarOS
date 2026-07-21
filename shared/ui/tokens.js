// BanjaraBazaarOS — canonical shared UI design tokens.
//
// SOURCE OF TRUTH: extracted verbatim from apps/vastu-griha's
// tailwind.config.js (the "Vastu Griha brand system" block) — that file
// remains the origin of these exact values, this is the first genuine
// consumer of shared/ui/ (previously an empty .gitkeep scaffold — see
// docs/PROJECT_STATUS.md discovery audit). Official brand: purple
// #5A1FB3 primary / #5D35AE gradient end, white/cream surface, white
// BB-tent logo (no logo image asset exists anywhere in the repo yet —
// apps currently render a text/initials badge instead; swap
// `brandLogoUrl` usage in Sidebar.jsx for a real <img> once one lands).
//
// MIGRATION PATTERN for future consumers (admin-panel, vendor-portal —
// NOT touched by this task; their working trees have unrelated
// in-progress changes): import this file into your own
// tailwind.config.js and spread `colors` into `theme.extend.colors`,
// exactly as apps/vastu-griha/tailwind.config.js now does. Do not
// hand-copy these hex values into a new file — that recreates the exact
// duplication (admin-panel and vendor-portal already have two
// byte-identical-but-separate token files) this shared location exists
// to fix.
//
// NOTE: admin-panel/vendor-portal currently use a DIFFERENT, unrelated
// dark-slate/violet palette (brand #7C6FF7) — that is a distinct,
// intentional theme per apps/vastu-griha's own existing comment, not an
// oversight. Migrating them to these tokens is a product decision for a
// future task, not assumed here.

export const colors = {
  // bg refined from #FBF8F4 to a slightly warmer cream per the approved
  // visual design direction (2026-07) — same palette family, no new hues.
  bg: '#FBF6EE',
  surface: '#FFFFFF',
  surface2: '#F5F1FB',
  surface3: '#E4DEF2',
  ink1: '#241344',
  ink2: '#5C567A',
  ink3: '#9891B3',
  brand: '#5A1FB3',
  brandGradientEnd: '#5D35AE',
  brandDim: '#EFE7FB',
  green: '#16A34A',
  greenDim: '#E7F7EE',
  greenMuted: '#166534',
  amber: '#D97706',
  amberDim: '#FDF3E3',
  amberMuted: '#92400E',
  // Distinct from `amber` (ashubh/caution, warmer orange) — used
  // specifically for boundary_case flags per the approved severity-pill
  // palette: green=shubh, amber-orange=ashubh, gold=boundary-case.
  gold: '#A16207',
  goldDim: '#FEF9E7',
  goldMuted: '#713F12',
  red: '#DC2626',
  redDim: '#FCEAEA',
  redMuted: '#991B1B',
}

export const backgroundImage = {
  'brand-gradient': 'linear-gradient(135deg, #5A1FB3 0%, #5D35AE 100%)',
}

// Three-font system per the approved visual design direction (2026-07):
// Fraunces (warm display serif, semibold headings — personality without
// looking generic), Manrope (clean geometric sans, body/UI text), IBM
// Plex Mono (numbers/degrees/measurements/coordinates specifically — a
// deliberate signature tying into the app's geometry/blueprint subject,
// not decoration). Replaces DM Sans/JetBrains Mono (`ui`/`mono`, both
// key names kept stable so every existing font-ui/font-mono class
// anywhere in any app re-themes automatically with zero JSX changes) and
// adds a new `display` key for headings specifically.
export const fontFamily = {
  display: ['Fraunces', 'Georgia', 'serif'],
  ui: ['Manrope', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'Fira Mono', 'monospace'],
}

// Soft, purple-tinted card shadow — replaces flat `border` as the primary
// depth cue on cards per the approved design direction ("soft purple-
// tinted shadows, not harsh/flat"). Layered (a closer tight shadow + a
// further soft one) rather than a single hard-edged box-shadow.
export const boxShadow = {
  card: '0 2px 8px -2px rgba(90, 31, 179, 0.06), 0 8px 24px -6px rgba(90, 31, 179, 0.14)',
  cardHover: '0 4px 12px -2px rgba(90, 31, 179, 0.10), 0 12px 32px -6px rgba(90, 31, 179, 0.18)',
}

// Sidebar-specific layout constants — also canonical here so any future
// consumer's Tailwind arbitrary-value classes (e.g. w-[70px]) stay in
// sync with Sidebar.jsx's own hardcoded values without a second place to
// update. Matches RentProOS's collapsed/expanded rail widths exactly
// (see Sidebar.jsx docblock) — only the colors differ from RentProOS,
// not these dimensions.
export const sidebar = {
  collapsedWidth: '70px',
  expandedWidth: '250px',
  mobileWidth: '256px', // pre-existing vastu-griha mobile drawer width (w-64), kept as-is
  mobileBreakpointPx: 768,
}
