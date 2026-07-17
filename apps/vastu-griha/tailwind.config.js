/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Vastu Griha brand system: white/cream + purple, distinct from the
        // dark-slate/violet theme used by admin-panel and vendor-portal —
        // this is a new, standalone app, per the task's requested palette
        // (#5A1FB3 primary / #5D35AE gradient end, white/cream background).
        bg:              '#FBF8F4',
        surface:         '#FFFFFF',
        surface2:        '#F5F1FB',
        surface3:        '#E4DEF2',
        ink1:            '#241344',
        ink2:            '#5C567A',
        ink3:            '#9891B3',
        brand:           '#5A1FB3',
        brandGradientEnd:'#5D35AE',
        brandDim:        '#EFE7FB',
        green:           '#16A34A',
        greenDim:        '#E7F7EE',
        greenMuted:      '#166534',
        amber:           '#D97706',
        amberDim:        '#FDF3E3',
        amberMuted:      '#92400E',
        red:             '#DC2626',
        redDim:          '#FCEAEA',
        redMuted:        '#991B1B',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5A1FB3 0%, #5D35AE 100%)',
      },
      fontFamily: {
        ui:   ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
