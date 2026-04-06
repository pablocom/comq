import { test, expect } from '@playwright/test';

test.describe('Communicator View - Scanning Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure fresh start with default board
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
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
    await expect(display).toContainText('Emociones');
  });

  test('enters a category when clicking Seleccionar on a category', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    const display = page.locator('[role="status"]');
    await expect(display).toContainText('Alimentación');
  });

  test('navigates to a message and produces an utterance', async ({ page }) => {
    // Enter "Necesidades Básicas"
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    // Enter "Alimentación"
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    // Select "Tengo hambre" (leaf message)
    await page.getByRole('button', { name: 'Seleccionar' }).click();

    // Utterance overlay should show the full decision path
    await expect(page.locator('[role="alert"]')).toContainText(
      'Necesidades Básicas, Alimentación, Tengo hambre',
    );
  });

  test('goes back to parent level when clicking Volver', async ({ page }) => {
    // Enter "Necesidades Básicas"
    await page.getByRole('button', { name: 'Seleccionar' }).click();
    // Go back
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
    // ArrowLeft = scan next
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[role="status"]')).toContainText('Emociones');

    // Enter = select (enter Emociones)
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="status"]')).toContainText('Estoy triste');

    // Escape = go back (returns to root, index 0 = Necesidades Básicas)
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="status"]')).toContainText('Necesidades Básicas');
  });
});
