/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0C0D10',
        surface:    '#13151A',
        surface2:   '#1A1D24',
        surface3:   '#21252F',
        ink1:       '#F0F1F5',
        ink2:       '#9399A8',
        ink3:       '#5C6170',
        brand:      '#7C6FF7',
        brandDim:   '#2D2856',
        green:      '#22C55E',
        greenDim:   '#0D2B1A',
        greenMuted: '#166534',
        amber:      '#F59E0B',
        amberDim:   '#2D1F04',
        amberMuted: '#92400E',
        red:        '#EF4444',
        redDim:     '#2D0B0B',
        redMuted:   '#991B1B',
        teal:       '#14B8A6',
      },
      fontFamily: {
        ui:   ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
