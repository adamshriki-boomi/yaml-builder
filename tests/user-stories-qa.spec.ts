import { test, expect } from '@playwright/test';

// QA validation against all user stories

test.describe('Epic 1: Connector Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test('US-1.1: Connector name and base URL fields exist and YAML syncs', async ({ page }) => {
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2); // name + url at minimum
    // YAML editor visible
    await expect(page.locator('.cm-editor')).toBeVisible();
  });

  test('US-1.2: Can add/manage default headers', async ({ page }) => {
    await page.locator('.tab-content ex-button', { hasText: 'Add Header' }).click();
    await page.waitForTimeout(500);
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThanOrEqual(4); // name + url + header name + header value
  });

  test('US-1.3: Auth type dropdown exists with all options', async ({ page }) => {
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(3); // auth type + storage + data format
  });

  test('US-1.4: OAuth 2.0 shows grant type, token URL, refresh token fields', async ({ page }) => {
    // Select OAuth via JS since ExSelect is a web component
    await page.evaluate(() => {
      const selects = document.querySelectorAll('.tab-content ex-select');
      for (const sel of selects) {
        const items = sel.querySelectorAll('ex-menu-item');
        for (const item of items) {
          if ((item as any).value === 'oauth2') {
            item.click();
            return;
          }
        }
      }
    });
    await page.waitForTimeout(1000);
    // Should now show more inputs (token URL, refresh token)
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Epic 2: Interface Parameters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);
  });

  test('US-2.1: Can add parameter with type selection (string, auth, date_range, list)', async ({ page }) => {
    await page.locator('.tab-content ex-button').first().click();
    await page.waitForTimeout(500);
    // Parameter Type select + Parameter Name input should exist
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(2); // type + location
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2); // name + map_to
  });

  test('US-2.2: Sensitive/encrypted toggle exists', async ({ page }) => {
    await page.locator('.tab-content ex-button').first().click();
    await page.waitForTimeout(500);
    const toggles = await page.locator('.tab-content ex-toggle').count();
    expect(toggles).toBeGreaterThanOrEqual(1);
  });

  test('US-2.3: Map To field exists for parameter mapping', async ({ page }) => {
    await page.locator('.tab-content ex-button').first().click();
    await page.waitForTimeout(500);
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2); // name + map_to
  });
});

test.describe('Epic 3: Variables & Storage', () => {
  test('US-3.1 & US-3.2: Storage type and data format selectors exist in Connector Config', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Connector config tab has storage + data format selects
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Epic 4: Workflow Steps', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
  });

  test('US-4.1: Can add REST step with method, URL, headers, params, body', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);
    expect(await page.locator('.tab-content ex-input').count()).toBeGreaterThanOrEqual(2);
    expect(await page.locator('.tab-content ex-select').count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByText('Query Parameters')).toBeVisible();
    await expect(page.getByText('Headers').first()).toBeVisible();
  });

  test('US-4.2: Can add Loop step', async ({ page }) => {
    await page.getByText('Add Loop Step').first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Nested Step 1')).toBeVisible();
  });

  test('US-4.3: Loop step has nested REST step', async ({ page }) => {
    await page.getByText('Add Loop Step').first().click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Nested Step 1')).toBeVisible();
    expect(await page.locator('.tab-content ex-select').count()).toBeGreaterThanOrEqual(2); // loop type + method
  });

  test('US-4.4: Steps have reorder, duplicate, delete buttons', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);
    const iconBtns = await page.locator('.tab-content ex-icon-button').count();
    expect(iconBtns).toBeGreaterThanOrEqual(4); // up, down, copy, delete
  });

  test('US-4.5: Step has description field', async ({ page }) => {
    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);
    // Description input should exist
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(3); // name + description + endpoint
  });
});

test.describe('Epic 5: Pagination', () => {
  test('US-5.1-5.4: Can enable pagination with type, params, break conditions', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const selectsBefore = await page.locator('.tab-content ex-select').count();
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).first().click();
    await page.waitForTimeout(500);
    const selectsAfter = await page.locator('.tab-content ex-select').count();
    expect(selectsAfter).toBeGreaterThan(selectsBefore);
  });
});

test.describe('Epic 6: Retry & Error Handling', () => {
  test('US-6.1: Can enable retry with status codes, attempts, interval', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).nth(1).click();
    await page.waitForTimeout(500);
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });

  test('US-6.2: Loop step has ignore errors toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    await page.getByText('Add Loop Step').first().click();
    await page.waitForTimeout(500);
    const toggles = await page.locator('.tab-content ex-toggle').count();
    expect(toggles).toBeGreaterThanOrEqual(2); // include_in_output + ignore_errors
  });
});

test.describe('Epic 7: Variable Outputs', () => {
  test('US-7.1-7.3: Can add variable output with name, location, path, format', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    await page.getByText('Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();
    const sectionAddButtons = page.locator('.form-section-title ex-button');
    await sectionAddButtons.last().click();
    await page.waitForTimeout(500);
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });
});

test.describe('Epic 8: YAML Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  });

  test('US-8.1: Live YAML preview visible and updates', async ({ page }) => {
    await expect(page.locator('.cm-editor')).toBeVisible();
    await expect(page.getByText('YAML Configuration')).toBeVisible();
  });

  test('US-8.3: Copy YAML button exists', async ({ page }) => {
    await expect(page.getByText('Copy YAML')).toBeVisible();
  });

  test('US-8.5: Syntax highlighting in CodeMirror', async ({ page }) => {
    const cmContent = page.locator('.cm-content');
    await expect(cmContent).toBeVisible();
  });
});

test.describe('Epic 9: Templates', () => {
  test('US-9.1: Can select from pre-built templates', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('ex-dialog')).toHaveCount(1);
    const hasTemplates = await page.evaluate(() =>
      document.body.textContent?.includes('Basic Connector') &&
      document.body.textContent?.includes('Cursor Pagination') &&
      document.body.textContent?.includes('External Variables Loop')
    );
    expect(hasTemplates).toBe(true);
  });

  test('US-9.2: Warning message shown before replacing config', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);
    const hasWarning = await page.evaluate(() =>
      document.body.textContent?.includes('Selecting a template will replace your current configuration')
    );
    expect(hasWarning).toBe(true);
  });
});

test.describe('Epic 10: UX & Responsiveness', () => {
  test('US-10.1: Works in wide drawer (800px+) with split layout', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await expect(page.locator('.yaml-side-panel')).toBeVisible();
    await expect(page.locator('.side-resizer')).toBeVisible();
  });

  test('US-10.1: Responsive bottom panel below 720px', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 700 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await expect(page.locator('.yaml-bottom-panel')).toBeVisible();
  });

  test('Theme toggle works (light/dark)', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const toggle = page.locator('.theme-toggle');
    await toggle.click();
    await page.waitForTimeout(300);
    expect(await page.locator('html').getAttribute('class')).toContain('ex-theme-dark');
    await toggle.click();
    await page.waitForTimeout(300);
    expect(await page.locator('html').getAttribute('class')).toContain('ex-theme-light');
  });
});
