import { expect, type Locator, type Page } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

export const longProduct =
  'Producto artesanal presentación familiar de edición especial con ingredientes regionales y empaque conmemorativo';
export const longLocation =
  'Almacén principal de distribución y resguardo para inventario de temporada · UBICACION-EXTENSA-001';

export async function openInventoryWithLongValues(page: Page) {
  page.on('console', (message) => {
    if (message.type() === 'error') throw new Error(`console.error: ${message.text()}`);
  });
  page.on('pageerror', (error) => {
    throw error;
  });
  page.on('requestfailed', (request) => {
    throw new Error(`requestfailed: ${request.method()} ${request.url()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) {
      throw new Error(
        `HTTP ${response.status()}: ${response.request().method()} ${response.url()}`,
      );
    }
  });
  await login(page);
  await page.goto(`${web}/inventory`);
  const product = page.getByRole('combobox', { name: 'Producto o presentación' });
  const location = page.getByRole('combobox', { name: 'Ubicación de inventario' });
  await expect(product).toBeVisible();
  await product.evaluate((node, label) => {
    const value = node.querySelector('.nexo-select-trigger__value > span:last-child');
    if (value) value.textContent = label;
    node.title = label;
  }, longProduct);
  await location.evaluate((node, label) => {
    const value = node.querySelector('.nexo-select-trigger__value > span:last-child');
    if (value) value.textContent = label;
    node.title = label;
  }, longLocation);
  return { product, location, button: page.getByRole('button', { name: 'Consultar existencias' }) };
}

export async function rect(locator: Locator) {
  return locator.evaluate((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right };
  });
}
