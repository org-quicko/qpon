import { defineConfig, devices } from '@playwright/test';
import { env } from './src/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Every test owns its organization, so nothing is shared between tests.
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // The layouts are fixed-width desktop designs.
    viewport: { width: 1440, height: 900 },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      dependencies: ['setup'],
    },
  ],
});
