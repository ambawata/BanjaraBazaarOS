/** @type {import('tailwindcss').Config} */
/* DEAD CODE (confirmed Phase 1a of the standardization plan): this file is
   never loaded. Tailwind v4 (this project uses `@import "tailwindcss"` in
   index.css) only reads a JS config when an explicit `@config` directive
   points to it — grepped the whole app, no such directive exists anywhere.
   Verified empirically too: the custom `accent`/`accent-secondary` colors
   below produced zero CSS in a production build, and `rounded-3xl` fell
   back to Tailwind's own built-in default instead of this file's 28px.
   The theme values that were actually needed (accent color, 3xl radius)
   are now defined properly in src/styles/tokens.css's @theme block instead.
   Left in place, not deleted, pending explicit DELETE approval. */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#6D4AFF',
        'accent-secondary': '#F5F3FF',
      },
      borderRadius: {
        '3xl': '28px',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px 0 rgba(0, 0, 0, 0.07)',
      }
    },
  },
  plugins: [],
}
