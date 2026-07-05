/** @type {import('tailwindcss').Config} */
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
