import { test, expect } from '@playwright/test';

test('screenshot template dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.getByText('Templates').first().click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tests/screenshots/templates-dialog.png', fullPage: false });

  // Check what's visible in the dialog
  const dialogHTML = await page.evaluate(() => {
    const dialog = document.querySelector('ex-dialog');
    return dialog?.innerHTML?.substring(0, 3000);
  });
  console.log('Dialog HTML:', dialogHTML);

  // Check if dialog is visually open
  const dialogVisible = await page.evaluate(() => {
    const dialog = document.querySelector('ex-dialog');
    if (!dialog) return 'no dialog';
    return (dialog as any).open ? 'open' : 'not open';
  });
  console.log('Dialog state:', dialogVisible);
});

test('screenshot after loading a template', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.getByText('Templates').first().click();
  await page.waitForTimeout(1000);

  // Click Basic Connector template
  await page.evaluate(() => {
    const bodySlot = document.querySelector('ex-dialog [slot="body"]');
    if (!bodySlot) return;
    const cards = bodySlot.querySelectorAll('div[style]');
    for (const card of cards) {
      if (card.querySelector('div')?.textContent === 'Basic Connector') {
        card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return;
      }
    }
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tests/screenshots/templates-after-load.png', fullPage: false });
});
