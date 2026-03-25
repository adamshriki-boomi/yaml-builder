import { test, expect } from '@playwright/test';

test.describe('Left panel scroll - all tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 700 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test('Workflow Steps: add 3 REST steps and verify all content is scrollable', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    // Add 3 REST steps
    for (let i = 0; i < 3; i++) {
      await page.getByText('Add REST Step').first().click();
      await page.waitForTimeout(300);
    }

    // The "+ Add REST Step" button at the bottom should be scrollable into view
    const addBtn = page.locator('ex-button', { hasText: '+ Add REST Step' }).last();
    await addBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(addBtn).toBeVisible();

    // Take screenshot showing scrolled state
    await page.screenshot({ path: 'tests/screenshots/scroll-steps-bottom.png', fullPage: false });

    // Scroll back to top — the tab bar and first step should be visible
    await page.locator('.tab-content').evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/scroll-steps-top.png', fullPage: false });
  });

  test('Interface Parameters: add 5 params and verify scroll works', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);

    // Add 5 parameters
    for (let i = 0; i < 5; i++) {
      // Click the Add button (first one available)
      const addBtns = page.locator('.tab-content ex-button');
      await addBtns.first().click();
      await page.waitForTimeout(300);
    }

    // The "+ Add Parameter" button at the bottom should be scrollable into view
    const addBtn = page.locator('ex-button', { hasText: '+ Add Parameter' });
    await addBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(addBtn).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/scroll-params-bottom.png', fullPage: false });
  });

  test('Connector Configuration: all accordion sections are scrollable', async ({ page }) => {
    // Add several headers to make content long
    for (let i = 0; i < 5; i++) {
      await page.locator('.tab-content ex-button', { hasText: 'Add Header' }).click();
      await page.waitForTimeout(200);
    }

    // Scroll to Variables Metadata section (last accordion)
    const tabContent = page.locator('.tab-content');
    await tabContent.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'tests/screenshots/scroll-connector-bottom.png', fullPage: false });

    // Verify the bottom content is visible
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(3);
  });

  test('No theme toggle button exists', async ({ page }) => {
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toHaveCount(0);
  });

  test('App is in light mode', async ({ page }) => {
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('ex-theme-light');
    expect(htmlClass).not.toContain('ex-theme-dark');
  });
});
