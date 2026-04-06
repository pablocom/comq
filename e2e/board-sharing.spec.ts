import { test, expect } from '@playwright/test';

test.describe('Board Sharing View - Export and Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/board-sharing');
  });

  test('shows export section with board count', async ({ page }) => {
    await expect(page.getByText('Compartir Tableros')).toBeVisible();
    await expect(page.getByText(/Exporta todos los tableros/)).toBeVisible();
  });

  test('shows JSON when clicking Ver JSON', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver JSON' }).click();
    await expect(page.locator('pre')).toBeVisible();
    await expect(page.locator('pre')).toContainText('comqVersion');
    await expect(page.locator('pre')).toContainText('boards');
  });

  test('shows import section with textarea', async ({ page }) => {
    await expect(page.getByPlaceholder('O pega el JSON aquí...')).toBeVisible();
  });

  test('validates invalid JSON and shows errors', async ({ page }) => {
    await page.getByPlaceholder('O pega el JSON aquí...').fill('{invalid}');
    await page.getByRole('button', { name: 'Validar' }).click();

    await expect(page.getByText('Errores de validación')).toBeVisible();
  });

  test('validates valid export JSON and shows preview with board list', async ({ page }) => {
    const validJson = JSON.stringify({
      comqVersion: 1,
      activeBoardId: 'import-test',
      boards: [
        {
          id: 'import-test',
          name: 'Tablero importado',
          rootNodes: [
            {
              id: 'n1',
              label: 'Categoría importada',
              children: [{ id: 'n2', label: 'Mensaje importado', children: [], order: 0 }],
              order: 0,
            },
          ],
          locale: 'es-ES',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    await page.getByPlaceholder('O pega el JSON aquí...').fill(validJson);
    await page.getByRole('button', { name: 'Validar' }).click();

    await expect(page.getByText('Vista previa')).toBeVisible();
    await expect(page.getByText('Tableros a importar: 1')).toBeVisible();
    await expect(page.getByText(/Tablero importado — 1 categorías/)).toBeVisible();
  });
});
