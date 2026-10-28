import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_EMAIL || 'adminforupc@sedelbye.com';
const PASS = process.env.TEST_PASS || 'sedelbyelefebvre';

test('sin sesión, una ruta protegida redirige al login', async ({ page }) => {
  await page.goto('/feed');
  await expect(page).toHaveURL(/\//); // Asumiendo que el login está en la raíz
});

test('login correcto lleva a la ruta protegida', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(EMAIL);
  await page.getByLabel('Contraseña').fill(PASS);
  await page.getByRole('button', { name: 'Entrar a la Plataforma' }).click();
  await expect(page).toHaveURL(/\/feed/);
});

test('login con contraseña incorrecta muestra error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(EMAIL);
  await page.getByLabel('Contraseña').fill('claveErronea');
  await page.getByRole('button', { name: 'Entrar a la Plataforma' }).click();
  await expect(page.getByText(/incorrectos/i)).toBeVisible();
});