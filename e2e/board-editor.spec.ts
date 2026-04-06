import { test, expect } from '@playwright/test';

test.describe('Board Editor View - Facilitator Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('board-editor');
  });

  test('shows the configuration page with default board', async ({ page }) => {
    await expect(page.getByText('Configuración')).toBeVisible();
    await expect(page.getByText('Tablero predeterminado')).toBeVisible();
  });

  test('creates a new board', async ({ page }) => {
    await page.getByPlaceholder('Nombre del nuevo tablero').fill('Mi tablero de prueba');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByText('Mi tablero de prueba')).toBeVisible();
  });

  test('navigates to sharing view', async ({ page }) => {
    await page.getByRole('button', { name: 'Compartir' }).click();
    await expect(page.getByText('Compartir Tableros')).toBeVisible();
  });

  test('navigates back to communicator view', async ({ page }) => {
    await page.getByRole('button', { name: 'Volver al inicio' }).click();
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible();
  });

  test('shows the tree content of the active board', async ({ page }) => {
    await expect(page.getByText('Necesidades Básicas')).toBeVisible();
    await expect(page.getByText('Cómo me siento')).toBeVisible();
    await expect(page.getByText('Quiero hacer')).toBeVisible();
  });
});
