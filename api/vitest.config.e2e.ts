import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [swc.vite()],
  test: {
    include: ['test/e2e/**/*.e2e-spec.ts'],
    environment: 'node',
    globals: true,
    globalSetup: ['test/support/postgres-container.ts'],
    // typeOrmConfig only reads NODE_ENV to gate `synchronize` (auto-sync
    // schema from entities) and log verbosity. Schema here comes from real
    // migrations (run in globalSetup), so synchronize must stay off or it
    // tries to recreate the materialized views and fails. Set here rather
    // than via process.env in globalSetup — Vite/Vitest special-case
    // NODE_ENV when building each worker's env, so a globalSetup mutation
    // to it doesn't reliably reach test workers the way other env vars do.
    env: {
      NODE_ENV: 'production',
      // AuthModule registers JwtModule with process.env.JWT_SECRET at import
      // time and AuthGuard verifies against it; both need this present
      // before any module is loaded.
      JWT_SECRET: 'e2e-test-secret',
      REFRESH_MV_CRON: '0 0 0 1 1 *',
    },
    // Each e2e spec boots the full Nest app against the shared container;
    // running them in parallel risks cross-test interference on shared state.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
