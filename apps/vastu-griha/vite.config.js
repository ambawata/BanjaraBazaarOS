import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Repo root, i.e. BanjaraBazaarOS/ — two levels up from apps/vastu-griha/.
const repoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // First real consumer of shared/ui/ (previously an empty .gitkeep
      // scaffold — see docs/PROJECT_STATUS.md discovery audit). Other
      // apps adopting this shared Sidebar/AppShell later should add the
      // same alias to their own vite.config.js.
      '@shared': path.resolve(repoRoot, 'shared'),
      // REAL BUG FOUND DURING TESTING (pre-existing since this app first
      // consumed shared/ui/ — only `npm run dev` had ever been tested,
      // never `npm run build`): Vite's dev server resolves
      // shared/ui/AppShell.jsx's bare `react-router-dom` import fine (its
      // optimizeDeps prebundling rewrites all bare imports to its own
      // cache regardless of the importing file's location), but a
      // production `vite build` uses Rollup's per-file Node resolution,
      // which only walks UP from the importing file's own directory
      // (shared/ui/) — never sideways into a sibling app's node_modules —
      // so it can't find react-router-dom at all and the build fails
      // outright. Same fix already applied to admin-panel's
      // vite.config.js (PR #7) when the second shared/ui/ consumer hit
      // this same issue; reproduced and confirmed identical here.
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
  },
  server: {
    fs: {
      // No npm workspace ties apps/vastu-griha to the repo root (confirmed
      // during the audit — no root package.json exists), so Vite's dev
      // server otherwise refuses to serve files outside apps/vastu-griha/
      // itself (its default project root) as a security measure. shared/
      // lives outside that root, so it must be explicitly allowed here or
      // every import from '@shared' would 403 at dev time despite
      // resolving correctly at the module-graph level.
      allow: [repoRoot],
    },
  },
})
