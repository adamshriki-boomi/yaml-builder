import { test, expect } from '@playwright/test';

test.describe('Tab navigation and content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  });

  test('first tab is selected by default with visible indicator', async ({ page }) => {
    const activeTab = page.locator('.tab-bar-item--active');
    await expect(activeTab).toHaveCount(1);
    await expect(activeTab).toHaveText('Connector Configuration');
  });

  test('Connector Configuration tab shows all four accordion sections', async ({ page }) => {
    const content = page.locator('.tab-content');
    // Sections are now inside ex-accordion-item elements
    const accordionItems = content.locator('ex-accordion-item');
    expect(await accordionItems.count()).toBeGreaterThanOrEqual(4);

    const exInputs = content.locator('ex-input');
    expect(await exInputs.count()).toBeGreaterThanOrEqual(3);
    const exSelects = content.locator('ex-select');
    expect(await exSelects.count()).toBeGreaterThanOrEqual(3);
  });

  test('clicking Interface Parameters tab switches content', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tab-bar-item--active')).toHaveText('Interface Parameters');
    // Parameters tab has an accordion with "Existing Parameters" label
    await expect(page.locator('.tab-content ex-accordion-item')).toHaveCount(1);
  });

  test('clicking Workflow Steps tab switches content', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tab-bar-item--active')).toHaveText('Workflow Steps');
    // Steps tab has an accordion with "Existing Steps" label
    await expect(page.locator('.tab-content ex-accordion-item')).toHaveCount(1);
  });

  test('can cycle through all tabs and back', async ({ page }) => {
    // Connector Config: 4 accordion items
    expect(await page.locator('.tab-content ex-accordion-item').count()).toBeGreaterThanOrEqual(4);

    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(300);
    expect(await page.locator('.tab-content ex-accordion-item').count()).toBe(1);

    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(300);
    expect(await page.locator('.tab-content ex-accordion-item').count()).toBe(1);

    await page.locator('.tab-bar-item', { hasText: 'Connector Configuration' }).click();
    await page.waitForTimeout(300);
    expect(await page.locator('.tab-content ex-accordion-item').count()).toBeGreaterThanOrEqual(4);
  });
});

test.describe('YAML Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  });

  test('YAML editor panel is visible with header and CodeMirror', async ({ page }) => {
    await expect(page.locator('.yaml-side-panel')).toBeVisible();
    await expect(page.getByText('YAML Configuration')).toBeVisible();
    await expect(page.locator('.cm-editor')).toBeVisible();
  });

  test('Copy YAML button exists', async ({ page }) => {
    await expect(page.getByText('Copy YAML')).toBeVisible();
  });
});

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  });

  test('Templates button opens dialog with template options', async ({ page }) => {
    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('ex-dialog')).toHaveCount(1);
    const hasBasic = await page.evaluate(() =>
      document.body.textContent?.includes('Basic Connector')
    );
    expect(hasBasic).toBe(true);
  });

  test('Selecting a template populates YAML editor', async ({ page }) => {
    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);

    // ex-dialog renders slot content inside shadow DOM — use JS to find and click
    await page.evaluate(() => {
      // Template cards are inside [slot="body"] inside ex-dialog
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

    // After template load, the YAML should have more content
    const cmText = await page.evaluate(() => {
      const cmLines = document.querySelectorAll('.cm-line');
      return Array.from(cmLines).map(l => l.textContent).join('\n');
    });
    expect(cmText.length).toBeGreaterThan(50);
  });
});

test.describe('Light mode only', () => {
  test('app is always in light mode with no theme toggle', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await expect(page.locator('.theme-toggle')).toHaveCount(0);
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('ex-theme-light');
  });
});

test.describe('Connector Configuration - interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  });

  test('can add a default header', async ({ page }) => {
    const inputsBefore = await page.locator('.tab-content ex-input').count();

    await page.locator('.tab-content ex-button', { hasText: 'Add Header' }).click();
    await page.waitForTimeout(500);

    // Should have 2 more inputs (header name + value)
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBe(inputsBefore + 2);

    // Add a second header
    await page.locator('.tab-content ex-button', { hasText: 'Add Header' }).click();
    await page.waitForTimeout(500);

    const inputsFinal = await page.locator('.tab-content ex-input').count();
    expect(inputsFinal).toBe(inputsBefore + 4);
  });

  test('auth, storage, and data format selects are rendered', async ({ page }) => {
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(3);
  });

  test('results directory input is rendered', async ({ page }) => {
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Interface Parameters - interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.locator('.tab-content').getByText('No', { exact: false })).toBeVisible();
  });

  test('can add a parameter with all expected fields', async ({ page }) => {
    await page.locator('.tab-content ex-button').first().click();
    await page.waitForTimeout(500);

    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2);
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(2);
    const toggles = await page.locator('.tab-content ex-toggle').count();
    expect(toggles).toBeGreaterThanOrEqual(1);
  });

  test('can duplicate and delete a parameter', async ({ page }) => {
    await page.locator('.tab-content ex-button').first().click();
    await page.waitForTimeout(500);

    const paramsBefore = await page.locator('.tab-content ex-input').count();

    await page.locator('.tab-content ex-icon-button').first().click();
    await page.waitForTimeout(500);

    const paramsAfter = await page.locator('.tab-content ex-input').count();
    expect(paramsAfter).toBeGreaterThan(paramsBefore);

    await page.locator('.tab-content ex-icon-button').nth(1).click();
    await page.waitForTimeout(500);

    const paramsEnd = await page.locator('.tab-content ex-input').count();
    expect(paramsEnd).toBeLessThan(paramsAfter);
  });
});

test.describe('Workflow Steps - interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.locator('.tab-content').getByText('No', { exact: false })).toBeVisible();
  });

  test('can add a REST step and see form fields', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    await expect(page.locator('ex-badge').first()).toBeVisible();
    expect(await page.locator('.tab-content ex-input').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('.tab-content ex-select').count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByText('Pagination')).toBeVisible();
    await expect(page.getByText('Retry Strategy')).toBeVisible();
    await expect(page.getByText('Variable Outputs')).toBeVisible();
  });

  test('can add a Loop step with nested REST step', async ({ page }) => {
    await page.getByText('Add Loop Step').first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Nested Step 1')).toBeVisible();
    expect(await page.locator('.tab-content ex-input').count()).toBeGreaterThanOrEqual(3);
  });

  test('step has reorder, duplicate, delete buttons', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);
    const iconBtns = await page.locator('.tab-content ex-icon-button').count();
    expect(iconBtns).toBeGreaterThanOrEqual(4);
  });

  test('can duplicate a step', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const badgesBefore = await page.locator('.tab-content ex-badge').count();
    await page.locator('.tab-content ex-icon-button').nth(2).click();
    await page.waitForTimeout(500);

    const badgesAfter = await page.locator('.tab-content ex-badge').count();
    expect(badgesAfter).toBe(badgesBefore + 1);
  });

  test('can enable pagination', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const selectsBefore = await page.locator('.tab-content ex-select').count();
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).first().click();
    await page.waitForTimeout(500);

    const selectsAfter = await page.locator('.tab-content ex-select').count();
    expect(selectsAfter).toBeGreaterThan(selectsBefore);
  });

  test('can enable retry', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).nth(1).click();
    await page.waitForTimeout(500);

    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });

  test('can add a variable output', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();

    // The Variable Outputs "Add" button — find all section-title level "Add" buttons
    // and click the last one (Variable Outputs is the last section)
    const sectionAddButtons = page.locator('.form-section-title ex-button');
    await sectionAddButtons.last().click();
    await page.waitForTimeout(500);

    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });
});

test.describe('Resizable panels', () => {
  test('side resizer is visible in wide mode', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await expect(page.locator('.side-resizer')).toBeVisible();
  });
});

test.describe('Visual verification', () => {
  test('take final screenshots of all tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/final-tab1-connector.png', fullPage: false });

    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/final-tab2-parameters.png', fullPage: false });

    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/final-tab3-steps.png', fullPage: false });
  });
});
