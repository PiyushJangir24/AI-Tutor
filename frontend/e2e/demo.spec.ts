import { test, expect } from '@playwright/test';

// This test runs against the built preview server and records a video
// It stubs backend responses via service worker-like page.route handlers

test.beforeEach(async ({ page }) => {
  await page.route('**/extract', async (route) => {
    const json = {
      intent: 'create_notes',
      tool: 'note_maker',
      parameters: { topic: 'Photosynthesis', depth: 'overview' },
      trace: ['Detected intent:create_notes', 'Selected tool:note_maker', 'Extracted: topic=Photosynthesis']
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });

  await page.route('**/orchestrate', async (route) => {
    const json = {
      result: { ok: true },
      normalized: { title: 'Photosynthesis Notes', text: 'Light-dependent and Calvin cycle overview.' },
      trace: ['Validated schema', 'Executed Note Maker', 'Normalized response']
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
});

test('sample demo flow with video', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Type a message...').fill('Please make concise notes on photosynthesis.');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Intent: create_notes; Tool: note_maker')).toBeVisible();

  await page.getByRole('button', { name: 'Run Note Maker' }).click();
  await expect(page.getByText('Photosynthesis Notes')).toBeVisible();

  await page.getByRole('button', { name: /Hidden Trace/ }).click();
  await expect(page.getByText('Hidden Reasoning Trace')).toBeVisible();
});
