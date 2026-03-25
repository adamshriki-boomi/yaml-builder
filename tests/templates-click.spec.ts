import { test, expect } from '@playwright/test';

test('click template and verify it loads', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Open dialog
  await page.getByText('Templates').first().click();
  await page.waitForTimeout(1000);

  // The template cards are now visible in the default slot — click directly
  await page.getByText('Basic Connector').first().click();
  await page.waitForTimeout(2000);

  // Dialog should be closed
  await page.screenshot({ path: 'tests/screenshots/templates-loaded.png', fullPage: false });

  // YAML should have template content
  const cmText = await page.evaluate(() => {
    const lines = document.querySelectorAll('.cm-line');
    return Array.from(lines).map(l => l.textContent).join('\n');
  });
  console.log('YAML content:', cmText.substring(0, 300));
  expect(cmText).toContain('My REST Connector');
});
