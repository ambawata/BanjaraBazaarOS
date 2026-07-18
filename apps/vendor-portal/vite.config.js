import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Repo root, i.e. BanjaraBazaarOS/ — two levels up from apps/vendor-portal/.
// Same @shared alias + fs.allow + react-router-dom resolve-alias pattern as
// apps/admin-panel's vite.config.js (PR #7) and apps/vastu-griha's (PR #8) —
// vendor-portal is the third shared/ui/ consumer, applying the
// react-router-dom production-build fix from the start rather than
// reproducing the bug PR #8 fixed.
const repoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(repoRoot, 'shared'),
      // Rollup's production build does per-file Node resolution for
      // shared/ui/AppShell.jsx's bare `react-router-dom` import, which only
      // walks UP from shared/ui/'s own directory — never sideways into a
      // sibling app's node_modules — so it fails outright unless aliased
      // explicitly. Vite's dev server doesn't hit this (its optimizeDeps
      // prebundling resolves bare imports independent of the importing
      // file's location). See PR #8 for the original discovery/fix.
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
