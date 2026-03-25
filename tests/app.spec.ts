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

  test('Connector Configuration tab shows all six collapsible sections', async ({ page }) => {
    const content = page.locator('.tab-content');
    const sections = content.locator('.collapsible-section');
    await expect(sections).toHaveCount(6);

    // Verify section labels
    const labels = content.locator('.collapsible-label');
    await expect(labels.nth(0)).toHaveText('Basic Configuration');
    await expect(labels.nth(1)).toHaveText('Default Headers');
    await expect(labels.nth(2)).toHaveText('Authentication');
    await expect(labels.nth(3)).toHaveText('Default Retry Strategy');
    await expect(labels.nth(4)).toHaveText('Variables Storages');
    await expect(labels.nth(5)).toHaveText('Variables Metadata');
  });

  test('clicking Interface Parameters tab switches content', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab-bar-item--active')).toHaveText('Interface Parameters');
    // Parameters tab has a collapsible section for "Existing Parameters"
    const sections = page.locator('.tab-content .collapsible-section');
    await expect(sections).toHaveCount(1);
  });

  test('clicking Workflow Steps tab switches content', async ({ page }) => {
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab-bar-item--active')).toHaveText('Workflow Steps');
    // Steps tab has 3 collapsible sections: Pre-Run, Multi-Reports, Post-Run
    const sections = page.locator('.tab-content .collapsible-section');
    await expect(sections).toHaveCount(3);
  });

  test('can cycle through all tabs and back', async ({ page }) => {
    // Connector Config: 6 collapsible sections
    await expect(page.locator('.tab-content .collapsible-section')).toHaveCount(6);

    await page.locator('.tab-bar-item', { hasText: 'Interface Parameters' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab-content .collapsible-section')).toHaveCount(1);

    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab-content .collapsible-section')).toHaveCount(3);

    await page.locator('.tab-bar-item', { hasText: 'Connector Configuration' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab-content .collapsible-section')).toHaveCount(6);
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

  test('Templates button opens dialog with all template options', async ({ page }) => {
    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('ex-dialog')).toHaveCount(1);
    // Check all four templates exist
    const hasTemplates = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Basic Connector') &&
        text.includes('Cursor Pagination') &&
        text.includes('External Variables Loop') &&
        text.includes('Multi-Report Blueprint');
    });
    expect(hasTemplates).toBe(true);
  });

  test('Selecting a template populates YAML editor', async ({ page }) => {
    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);

    // Click the "Basic Connector" template card
    await page.evaluate(() => {
      const dialog = document.querySelector('ex-dialog');
      if (!dialog) return;
      const cards = dialog.querySelectorAll('div[style]');
      for (const card of cards) {
        const nameEl = card.querySelector('div');
        if (nameEl && nameEl.textContent?.trim() === 'Basic Connector') {
          card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return;
        }
      }
    });
    await page.waitForTimeout(2000);

    // After template load, YAML should have content
    const cmText = await page.evaluate(() => {
      const cmLines = document.querySelectorAll('.cm-line');
      return Array.from(cmLines).map(l => l.textContent).join('\n');
    });
    expect(cmText.length).toBeGreaterThan(50);
  });

  test('Multi-Report Blueprint template populates all sections', async ({ page }) => {
    await page.getByText('Templates').first().click();
    await page.waitForTimeout(500);

    // Click the "Multi-Report Blueprint" template card
    await page.evaluate(() => {
      const dialog = document.querySelector('ex-dialog');
      if (!dialog) return;
      const cards = dialog.querySelectorAll('div[style]');
      for (const card of cards) {
        const nameEl = card.querySelector('div');
        if (nameEl && nameEl.textContent?.trim() === 'Multi-Report Blueprint') {
          card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return;
        }
      }
    });
    await page.waitForTimeout(2000);

    // Verify the Workflow Steps tab now has multi-reports
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);

    // The Multi-Reports section should show reports (the label includes a count)
    const multiReportsLabel = page.locator('.collapsible-label', { hasText: 'Multi-Reports' });
    await expect(multiReportsLabel).toBeVisible();
    const labelText = await multiReportsLabel.textContent();
    // Multi-Report Blueprint has 3 reports
    expect(labelText).toContain('3');
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
  });

  test('Basic Configuration section has connector name and base URL inputs', async ({ page }) => {
    // Basic Configuration is the first section and open by default
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2); // connector name + base URL
  });

  test('Authentication section has auth type select', async ({ page }) => {
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(1); // auth type select
  });

  test('Variables Storages section allows adding storage', async ({ page }) => {
    const inputsBefore = await page.locator('.tab-content ex-input').count();
    await page.locator('.tab-content ex-button', { hasText: 'Add Storage' }).click();
    await page.waitForTimeout(500);

    // Should have a new storage name input
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
    // And a new storage type select
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(2);
  });

  test('Variables Metadata section allows adding entries', async ({ page }) => {
    const inputsBefore = await page.locator('.tab-content ex-input').count();
    await page.locator('.tab-content ex-button', { hasText: 'Add Metadata Entry' }).click();
    await page.waitForTimeout(500);

    // Should have new metadata inputs (variable name + storage name)
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });

  test('Default Retry Strategy can be enabled', async ({ page }) => {
    const inputsBefore = await page.locator('.tab-content ex-input').count();
    await page.locator('.tab-content ex-button', { hasText: 'Enable Default Retry' }).click();
    await page.waitForTimeout(500);

    // Should show status codes, attempts, interval inputs (3 more)
    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
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
    await expect(page.getByText('No parameters defined')).toBeVisible();
  });

  test('can add a parameter with all expected fields', async ({ page }) => {
    await page.getByText('Add First Parameter').click();
    await page.waitForTimeout(500);

    // Should have parameter type select and name input
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(2);
    const selects = await page.locator('.tab-content ex-select').count();
    expect(selects).toBeGreaterThanOrEqual(1);
    const toggles = await page.locator('.tab-content ex-toggle').count();
    expect(toggles).toBeGreaterThanOrEqual(2); // required + sensitive
  });

  test('parameter type select has all six types', async ({ page }) => {
    await page.getByText('Add First Parameter').click();
    await page.waitForTimeout(500);

    // Check that the parameter type select has 6 menu items (string, authentication, date_range, list, multiselect, enum)
    const menuItemCount = await page.locator('.tab-content ex-select ex-menu-item').count();
    expect(menuItemCount).toBeGreaterThanOrEqual(6);
  });

  test('can duplicate and delete a parameter', async ({ page }) => {
    await page.getByText('Add First Parameter').click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();

    // Click the first icon button (copy/duplicate)
    await page.locator('.tab-content ex-icon-button').first().click();
    await page.waitForTimeout(500);

    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);

    // Click the delete icon button on a parameter (second icon button = delete of first param)
    await page.locator('.tab-content ex-icon-button').nth(1).click();
    await page.waitForTimeout(500);

    const inputsEnd = await page.locator('.tab-content ex-input').count();
    expect(inputsEnd).toBeLessThan(inputsAfter);
  });
});

test.describe('Workflow Steps - multi-report structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('.tab-bar-item', { hasText: 'Workflow Steps' }).click();
    await page.waitForTimeout(500);
  });

  test('has three collapsible sections: Pre-Run, Multi-Reports, Post-Run', async ({ page }) => {
    const labels = page.locator('.tab-content .collapsible-label');
    const count = await labels.count();
    expect(count).toBe(3);

    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await labels.nth(i).textContent()) || '');
    }
    expect(texts[0]).toContain('Pre-Run Configurations');
    expect(texts[1]).toContain('Multi-Reports');
    expect(texts[2]).toContain('Post-Run Configurations');
  });

  test('Multi-Reports section shows empty state with Add First Report button', async ({ page }) => {
    await expect(page.getByText('No reports defined')).toBeVisible();
    await expect(page.getByText('Add First Report')).toBeVisible();
  });

  test('can add a multi-report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    // A report card should appear with a Report Name input (check count increased)
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(1); // Report Name input
    // Report badge should appear
    const reportBadges = await page.locator('ex-badge').count();
    expect(reportBadges).toBeGreaterThanOrEqual(1);
  });

  test('can add a REST step inside a multi-report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    // Inside the report card, click "Add REST Step"
    await page.getByText('+ Add REST Step').first().click();
    await page.waitForTimeout(500);

    // Step should appear with badge and form fields
    const badges = await page.locator('ex-badge').count();
    expect(badges).toBeGreaterThanOrEqual(2); // Report badge + REST badge
    // Step has name, description, method, endpoint fields
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(4); // Report Name + Step Name + Description + Endpoint
  });

  test('can add a Loop step inside a multi-report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    await page.getByText('+ Add Loop Step').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Nested Step 1')).toBeVisible();
  });

  test('can add multiple reports and see + Add Report button', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    // After first report, "Add First Report" should disappear and "+ Add Report" should appear
    await expect(page.getByText('+ Add Report')).toBeVisible();

    await page.getByText('+ Add Report').click();
    await page.waitForTimeout(500);

    // Should now have 2 report badges
    const reportBadges = page.locator('ex-badge', { hasText: /Report \d/ });
    await expect(reportBadges).toHaveCount(2);
  });

  test('can duplicate a report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    // Duplicate button is the first ex-icon-button in the report header
    // The report header has [copy, delete] icons
    await page.locator('.tab-content ex-icon-button').first().click();
    await page.waitForTimeout(500);

    const reportBadges = page.locator('ex-badge', { hasText: /Report \d/ });
    await expect(reportBadges).toHaveCount(2);
  });

  test('can delete a report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);
    await page.getByText('+ Add Report').click();
    await page.waitForTimeout(500);

    const reportBadgesBefore = await page.locator('ex-badge', { hasText: /Report \d/ }).count();
    expect(reportBadgesBefore).toBe(2);

    // Delete the first report - the delete icon is the 2nd icon button (after copy)
    await page.locator('.tab-content ex-icon-button').nth(1).click();
    await page.waitForTimeout(500);

    const reportBadgesAfter = await page.locator('ex-badge', { hasText: /Report \d/ }).count();
    expect(reportBadgesAfter).toBe(1);
  });

  test('step inside report has reorder, duplicate, delete buttons', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);

    await page.getByText('+ Add REST Step').first().click();
    await page.waitForTimeout(500);

    // Report header has [copy, delete] = 2 icon buttons
    // Step header has [up, down, copy, delete] = 4 icon buttons
    // Total at least 6
    const iconBtns = await page.locator('.tab-content ex-icon-button').count();
    expect(iconBtns).toBeGreaterThanOrEqual(6);
  });

  test('can enable pagination on a step inside a report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);
    await page.getByText('+ Add REST Step').first().click();
    await page.waitForTimeout(500);

    const selectsBefore = await page.locator('.tab-content ex-select').count();
    // Click "Enable" for pagination (first Enable button within the step)
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).first().click();
    await page.waitForTimeout(500);

    const selectsAfter = await page.locator('.tab-content ex-select').count();
    expect(selectsAfter).toBeGreaterThan(selectsBefore);
  });

  test('can enable retry on a step inside a report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);
    await page.getByText('+ Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();
    // "Enable" for retry is the second Enable button
    await page.locator('.tab-content ex-button', { hasText: 'Enable' }).nth(1).click();
    await page.waitForTimeout(500);

    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });

  test('can add a variable output on a step inside a report', async ({ page }) => {
    await page.getByText('Add First Report').click();
    await page.waitForTimeout(500);
    await page.getByText('+ Add REST Step').first().click();
    await page.waitForTimeout(500);

    const inputsBefore = await page.locator('.tab-content ex-input').count();
    // Variable Outputs section's Add button is inside a .form-section-title
    const sectionAddButtons = page.locator('.form-section-title ex-button');
    await sectionAddButtons.last().click();
    await page.waitForTimeout(500);

    const inputsAfter = await page.locator('.tab-content ex-input').count();
    expect(inputsAfter).toBeGreaterThan(inputsBefore);
  });

  test('Pre-Run section allows adding configuration groups', async ({ page }) => {
    // Expand Pre-Run section (it is collapsed by default)
    await page.locator('.collapsible-header', { hasText: 'Pre-Run Configurations' }).click();
    await page.waitForTimeout(500);

    await page.getByText('+ Add Pre-Run Group').click();
    await page.waitForTimeout(500);

    // Pre-Run group card should appear with Group Name input
    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(1);
    await expect(page.locator('ex-badge', { hasText: 'Pre-Run 1' })).toBeVisible();
  });

  test('Post-Run section allows adding configuration groups', async ({ page }) => {
    // Expand Post-Run section (it is collapsed by default)
    await page.locator('.collapsible-header', { hasText: 'Post-Run Configurations' }).click();
    await page.waitForTimeout(500);

    await page.getByText('+ Add Post-Run Group').click();
    await page.waitForTimeout(500);

    const inputs = await page.locator('.tab-content ex-input').count();
    expect(inputs).toBeGreaterThanOrEqual(1);
    await expect(page.locator('ex-badge', { hasText: 'Post-Run 1' })).toBeVisible();
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
