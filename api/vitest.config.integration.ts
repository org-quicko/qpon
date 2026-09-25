import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [swc.vite()],
  test: {
    include: ['test/integration/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    globalSetup: ['test/integration/setup/postgres-container.ts'],
    // See vitest.config.e2e.ts for why this is set here rather than via
    // process.env in globalSetup.
    env: { NODE_ENV: 'production' },
    // Tests share one container and its schema; keep them sequential so
    // each test's transaction-rollback isolation isn't racing another test.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
