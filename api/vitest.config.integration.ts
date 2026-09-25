import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [swc.vite()],
  test: {
    include: ['test/integration/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    globalSetup: ['test/support/postgres-container.ts'],
    // See vitest.config.e2e.ts for why these are set here rather than via
    // process.env in globalSetup.
    env: {
      NODE_ENV: 'production',
      JWT_SECRET: 'integration-test-secret',
      // MaterializedViewRefreshService reads this at class-decoration time.
      // Once a year at midnight on Jan 1 — it never fires during a run, so it
      // can't interleave with a test's open transaction. (An impossible date like
      // Feb 31 is rejected outright by the cron library.)
      REFRESH_MV_CRON: '0 0 0 1 1 *',
    },
    // Tests share one container and its schema. Running files in parallel
    // would have each worker's transaction contending for the ACCESS
    // EXCLUSIVE lock that OrganizationSubscriber's materialized-view refresh
    // takes on every organization insert.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
