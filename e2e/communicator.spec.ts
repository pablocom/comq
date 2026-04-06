import { test, expect } from '@playwright/test';

test.describe('Communicator View - Scanning Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await page.evaluate(() => localStorage.clear());
    await page.goto('');
  });

  test('displays the first root category on load', async ({ page }) => {
    const display = page.locator('[role="status"]');
    await expect(display).toContainText('Necesidades Básicas');
  });

  test('shows three scan buttons: Siguiente, Seleccionar, Volver', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Seleccionar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Volver' })).toBeVisible();
  });

  test('scans to the next root category when clicking Siguiente', async ({ page }) => {
    await page.getByRole('button', { name: 'Siguiente' }).click();
    const display = page.locator('[role="status"]');
    await expect(display).toContainText('Cómo me siento');
  });

  test('enters a category when clicking Seleccionar on a category', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    const display = page.locator('[role="status"]');
    await expect(display).toContainText('Alimentación');
  });

  test('navigates to a message and produces an utterance', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    await page.getByRole('button', { name: 'Seleccionar' }).click();

    await expect(page.locator('[role="alert"]')).toContainText(
      'Necesidades Básicas, Alimentación, Tengo hambre',
    );
  });

  test('goes back to parent level when clicking Volver', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    await page.getByRole('button', { name: 'Volver' }).click();

    const display = page.locator('[role="status"]');
    await expect(display).toContainText('Necesidades Básicas');
  });

  test('Volver button is disabled at root level', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Volver' })).toBeDisabled();
  });

  test('keyboard navigation works: ArrowLeft to scan, Enter to select, Escape to go back', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[role="status"]')).toContainText('Cómo me siento');

    await page.keyboard.press('Enter');
    await expect(page.locator('[role="status"]')).toContainText('Estoy bien');

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="status"]')).toContainText('Necesidades Básicas');
  });
});
