import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Repo root, i.e. BanjaraBazaarOS/ — two levels up from apps/admin-panel/.
// Same @shared alias + fs.allow pattern as apps/vastu-griha's vite.config.js
// (the first shared/ui/ consumer, PR #5) — admin-panel is the second.
const repoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(repoRoot, 'shared'),
      // REAL BUG FOUND DURING TESTING (pre-existing in shared/ui/ since
      // PR #5, reproduced independently against vastu-griha's own
      // unmodified files too — not something introduced here): Vite's dev
      // server resolves shared/ui/AppShell.jsx's bare `react-router-dom`
      // import fine (its optimizeDeps prebundling rewrites all bare
      // imports to its own cache regardless of the importing file's
      // location), but a production `vite build` uses Rollup's per-file
      // Node resolution, which only walks UP from the importing file's own
      // directory (shared/ui/) — never sideways into a sibling app's
      // node_modules — so it can't find react-router-dom at all and the
      // build fails outright. Explicit alias works around it; not fixed in
      // shared/ui/ itself or in vastu-griha's own vite.config.js since
      // this task's scope is admin-panel only (vastu-griha needs the same
      // fix separately).
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
