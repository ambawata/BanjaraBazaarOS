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
