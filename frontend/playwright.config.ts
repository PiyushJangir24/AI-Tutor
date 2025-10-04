import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  workers: 1,
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5173',
    video: 'on',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run preview',
    port: 5173,
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
