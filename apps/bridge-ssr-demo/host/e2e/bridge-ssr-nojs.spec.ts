import { expect, test } from '@playwright/test';

test('raw response contains the cross-framework remote route', async ({
  page,
  request,
}, testInfo) => {
  const vueHost = testInfo.project.name.startsWith('vue-host');
  const route = vueHost ? '/react-remote/detail' : '/vue-remote/detail';
  const heading = vueHost ? 'React Remote Detail' : 'Vue Remote Detail';
  const response = await request.get(route);
  const html = await response.text();
  expect(response.ok()).toBeTruthy();
  expect(html).toContain(heading);
  expect(html).toContain('data-mf-bridge-ssr="true"');
  expect(html).toContain('bridge-ssr-host-context');

  await page.goto(route);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
});
