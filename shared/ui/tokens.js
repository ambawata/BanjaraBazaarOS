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
  bg: '#FBF8F4',
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
  red: '#DC2626',
  redDim: '#FCEAEA',
  redMuted: '#991B1B',
}

export const backgroundImage = {
  'brand-gradient': 'linear-gradient(135deg, #5A1FB3 0%, #5D35AE 100%)',
}

export const fontFamily = {
  ui: ['DM Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
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
