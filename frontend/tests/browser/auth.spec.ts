import { test, expect } from '@playwright/test';
test('signed success, decline without network, retry and readable error response', async ({ page }, testInfo) => {
  let requests = 0;
  let fail = false;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname === '/api/fixture') {
      requests++;
      expect(url.searchParams.get('sign')).toBe('synthetic-browser-signature');
      expect(url.searchParams.get('vk_id')).toBe('123');
      return route.fulfill({ status: fail ? 400 : 200, contentType: 'application/json', body: JSON.stringify({ message: fail ? 'Тело ошибки доступно' : 'Подписанный запрос принят' }) });
    }
    return route.continue();
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tests/browser/fixture.html');
  await page.getByRole('button', { name: 'Подписанный запрос', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Подписанный запрос принят');
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Отказ подписи' }).click();
  await expect(page.getByRole('status')).toHaveText('Подпись отклонена');
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Подписанный запрос', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Подписанный запрос принят');
  expect(requests).toBe(2);
  fail = true;
  await page.getByRole('button', { name: 'Подписанный запрос', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Тело ошибки доступно');
  expect(requests).toBe(3);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('auth-fixture.png'), fullPage: true });
});
