import { expect, test } from './fixtures';

const direction = (projectName: string) =>
  projectName.startsWith('vue-host')
    ? {
        route: '/react-remote',
        detail: '/react-remote/detail',
        homeHeading: 'React Remote Home',
        detailHeading: 'React Remote Detail',
        counter: '.react-remote-counter',
        detailLink: '.react-remote-detail-link',
        hostLink: '.host-react-remote-link',
      }
    : {
        route: '/vue-remote',
        detail: '/vue-remote/detail',
        homeHeading: 'Vue Remote Home',
        detailHeading: 'Vue Remote Detail',
        counter: '.vue-remote-counter',
        detailLink: '.vue-remote-detail-link',
        hostLink: '.host-vue-remote-link',
      };

test('hydrates the direct SSR island and remains interactive', async ({
  page,
}, testInfo) => {
  const remote = direction(testInfo.project.name);
  await page.goto(remote.route);
  await expect(
    page.getByRole('heading', { name: remote.homeHeading }),
  ).toBeVisible();
  const mount = page.locator('[data-mf-bridge-ssr="true"]');
  await expect(mount).toHaveCount(1);
  const counter = page.locator(remote.counter);
  await counter.click();
  await expect(counter).toHaveText(/Count: 1/);
});

test('server-renders a deep route and remote navigation updates the URL', async ({
  page,
}, testInfo) => {
  const remote = direction(testInfo.project.name);
  await page.goto(`${remote.detail}?source=e2e#bridge-state`);
  await expect(page).toHaveURL(
    new RegExp(`${remote.detail}\\?source=e2e#bridge-state$`),
  );
  await expect(
    page.getByRole('heading', { name: remote.detailHeading }),
  ).toBeVisible();
  await page.goto(remote.route);
  await page.locator(remote.detailLink).click();
  await expect(page).toHaveURL(new RegExp(`${remote.detail}$`));
  await expect(
    page.getByRole('heading', { name: remote.detailHeading }),
  ).toBeVisible();
});

test('host navigation enters, leaves, and returns through CSR without reload', async ({
  page,
}, testInfo) => {
  const remote = direction(testInfo.project.name);
  await page.goto('/');
  await page.evaluate(() => {
    (
      window as Window & { __navigationSentinel?: string }
    ).__navigationSentinel = 'alive';
  });
  await page.locator(remote.hostLink).first().click();
  await expect(
    page.getByRole('heading', { name: remote.homeHeading }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Home' }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator(remote.hostLink).first().click();
  await expect(
    page.getByRole('heading', { name: remote.homeHeading }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__navigationSentinel))
    .toBe('alive');
});

test('consumes direct-visit SSR once and revisits through CSR', async ({
  page,
}, testInfo) => {
  const remote = direction(testInfo.project.name);
  await page.goto(remote.route);
  await expect(page.locator('[data-mf-bridge-ssr="true"]')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: remote.homeHeading }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Home' }).first().click();
  await page.locator(remote.hostLink).first().click();
  await expect(
    page.getByRole('heading', { name: remote.homeHeading }),
  ).toBeVisible();
  await expect(page.locator('[data-mf-bridge-ssr="true"]')).toHaveCount(0);
});

test('two instances of one React remote hydrate independently', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('vue-host'));
  await page.goto('/react-pair');
  const mounts = page.locator('[data-mf-bridge-ssr="true"]');
  await expect(mounts).toHaveCount(2);
  const ids = await mounts.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-mf-bridge-instance')),
  );
  expect(new Set(ids).size).toBe(2);
  const counters = page.locator('.react-remote-counter');
  await counters.nth(0).click();
  await expect(counters.nth(0)).toHaveText('Count: 1');
  await expect(counters.nth(1)).toHaveText('Count: 0');
  await expect(page.getByText('name: Left, age: 1')).toBeVisible();
  await expect(page.getByText('name: Right, age: 2')).toBeVisible();
});
