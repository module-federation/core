import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it } from '@rstest/core';
import { registerPlugins } from '@module-federation/enhanced/runtime';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';
import { withExpectedError } from '../../../../tools/rstest/expected-errors';

registerPlugins([
  {
    name: 'test-script-errors',
    createScript({ url, attrs = {} }) {
      const script = document.createElement('script');
      for (const [name, value] of Object.entries(attrs)) {
        script.setAttribute(name, String(value));
      }
      script.src = url;
      script.crossOrigin = 'anonymous';
      return script;
    },
  },
]);

async function renderRoute(route: string) {
  window.history.replaceState({}, '', route);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

afterEach(async () => {
  await cleanup();
  window.history.replaceState({}, '', '/');
});

it('renders the host home page', async () => {
  await renderRoute('/');
  await expect.element(page.getByText('Router host Home page')).toBeVisible();
});

it('renders a remote at a nested initial URL', async () => {
  await renderRoute('/remote6/about');
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  await expect
    .element(
      page.getByText('This is a React Router v7 demo in Module Federation'),
    )
    .toBeVisible();
  expect(window.location.pathname).toBe('/remote6/about');
});

it('restores remote routes through browser history', async () => {
  await renderRoute('/remote6');
  await page.locator('.self-remote6-about-link').click();
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  await page.locator('.self-remote6-detail-link').click();
  await expect
    .element(page.getByRole('heading', { name: 'Remote6 detail page' }))
    .toBeVisible();

  window.history.back();
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6/about');
  window.history.back();
  await expect.element(page.getByText('hello remote6 home page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6');
  window.history.forward();
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6/about');
});

it('shows the error boundary when a real remote throws while rendering', async () => {
  await withExpectedError('This is a deliberately thrown error!', async () => {
    await renderRoute('/remote-render-error');
    await expect.element(page.getByText('Something went wrong:')).toBeVisible();
    await expect
      .element(
        page.getByText('This is a deliberately thrown error!', { exact: true }),
      )
      .toBeVisible();
    await cleanup();
  });
});

it('shows loading and an error boundary when a remote resource is unavailable', async () => {
  const message =
    'Make sure that remote-resource-error/export-app has the correct export when export is default';
  await withExpectedError(message, async () => {
    await renderRoute('/remote-resource-error');
    await expect
      .element(page.locator('[data-test-id="loading"]'))
      .toHaveText('loading...');
    await expect
      .element(page.getByText('Something went wrong:'))
      .toBeVisible({ timeout: 15_000 });
    await expect
      .element(page.getByText(message, { exact: true }))
      .toBeVisible();
    await cleanup();
  });
});

it('passes props and a DOM ref to the React 17 remote', async () => {
  await renderRoute('/remote1');
  await expect.element(page.getByText('Remote1 home page')).toBeVisible();
  await expect.element(page.getByText('name: Ming, age: 12')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote1-React17' })
    .hover();
  await page.locator('.menu-remote1-detail-link').click();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote1-React17' })
    .hover();
  await page.locator('.menu-remote1-home-link').click();
  await expect.element(page.getByText('Remote1 home page')).toBeVisible();
  await expect.element(page.getByText('Some text')).toBeVisible();
  await page.locator('.self-remote1-detail-link').click();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
});

it('renders the named React 18 provider export', async () => {
  await renderRoute('/remote2');
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote2-React18' })
    .hover();
  await page.locator('.menu-remote2-detail-link').click();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote2-React18' })
    .hover();
  await page.locator('.menu-remote2-home-link').click();
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  await page.locator('.self-remote2-detail-link').click();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
});

it('renders and navigates a Vue remote in the React host', async () => {
  await renderRoute('/remote3');
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote3-Vue3' })
    .hover();
  await page.locator('.menu-remote3-detail-link').click();
  await expect.element(page.getByText('Remote3 detail page')).toBeVisible();
  await page
    .locator('.ant-menu-submenu-title')
    .filter({ hasText: 'Remote3-Vue3' })
    .hover();
  await page.locator('.menu-remote3-home-link').click();
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();
  await page.locator('.self-remote3-detail-link').click();
  await expect.element(page.getByText('Remote3 detail page')).toBeVisible();
});

it('renders a React 19 remote in the React 18 host', async () => {
  await renderRoute('/remote5');
  await expect
    .element(page.getByText('This is the remote app5 with React 19.'))
    .toBeVisible();
});

it('keeps memory routes independent of the Vue remote and host URL', async () => {
  await renderRoute('/memory-router');
  await expect.element(page.getByText('Remote1 home page')).toBeVisible();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();

  await page.locator('.self-remote1-detail-link').click();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote2 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote3 home page')).toBeVisible();
  await page.locator('.self-remote2-home-link').click();
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  expect(window.location.pathname).toMatch(/^\/memory-router\/?$/);
  await page.locator('.self-remote3-detail-link').click();
  await expect.element(page.getByText('Remote3 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote1 detail page')).toBeVisible();
  await expect.element(page.getByText('Remote2 home page')).toBeVisible();
  expect(window.location.pathname).toBe('/memory-router/detail');
});

it('synchronizes remote navigation with the host URL', async () => {
  await renderRoute('/remote6');
  await expect.element(page.getByText('hello remote6 home page')).toBeVisible();
  await page.locator('.self-remote6-about-link').click();
  await expect.element(page.getByText('Remote6 about page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6/about');
  await expect
    .element(page.getByText('Enhanced error boundaries'))
    .toBeVisible();
  await page.locator('.self-remote6-detail-link').click();
  await expect
    .element(page.getByRole('heading', { name: 'Remote6 detail page' }))
    .toBeVisible();
  expect(window.location.pathname).toBe('/remote6/detail');
  await page.locator('.self-remote6-home-link').click();
  await expect.element(page.getByText('hello remote6 home page')).toBeVisible();
  expect(window.location.pathname).toBe('/remote6');
});

it('preserves inner state when outer props change', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  await page.getByTestId('remote6-inner-increment').click();
  await page.getByTestId('remote6-inner-increment').click();
  await page.getByTestId('remote6-inner-increment').click();
  await expect.element(page.getByText('Outer Counter: 0')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 3');
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await expect.element(page.getByText('Outer Counter: 3')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 3');
});

it('updates outer props without changing the inner counter', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  for (let count = 0; count < 4; count++) {
    await page.getByTestId('remote6-outer-increment').click();
  }
  await expect.element(page.getByText('Outer Counter: 4')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 0');
});

it('keeps alternating inner and outer updates independent', async () => {
  await renderRoute('/remote6/detail');
  await expect.element(page.getByTestId('remote6-inner-counter')).toBeVisible();
  for (let count = 0; count < 2; count++) {
    await page.getByTestId('remote6-outer-increment').click();
    await expect
      .element(page.getByText(`Outer Counter: ${count + 1}`))
      .toBeVisible();
    await expect
      .element(page.getByTestId('remote6-inner-counter'))
      .toHaveText(`Inner Counter: ${count}`);
    await page.getByTestId('remote6-inner-increment').click();
    await expect
      .element(page.getByText(`Outer Counter: ${count + 1}`))
      .toBeVisible();
    await expect
      .element(page.getByTestId('remote6-inner-counter'))
      .toHaveText(`Inner Counter: ${count + 1}`);
  }
  await page.getByTestId('remote6-outer-increment').click();
  await page.getByTestId('remote6-outer-increment').click();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 2');
  for (let count = 0; count < 3; count++) {
    await page.getByTestId('remote6-inner-increment').click();
  }
  await expect.element(page.getByText('Outer Counter: 4')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 5');
});

it('unmounts a remote when leaving its route and starts fresh on return', async () => {
  await renderRoute('/remote6/detail');
  await page.getByTestId('remote6-inner-increment').click();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 1');

  await page
    .locator('.host-menu')
    .getByRole('link', { name: 'Home', exact: true })
    .click();
  await expect.element(page.getByText('Router host Home page')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveCount(0);

  await page.locator('.host-menu .ant-menu-overflow-item-rest').hover();
  await page
    .getByRole('link', { name: 'Remote6-ReactRouteV7', exact: true })
    .click();
  await page.locator('.self-remote6-detail-link').click();
  await expect.element(page.getByText('Outer Counter: 0')).toBeVisible();
  await expect
    .element(page.getByTestId('remote6-inner-counter'))
    .toHaveText('Inner Counter: 0');
});
