import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it } from '@rstest/core';
import { init } from '@module-federation/runtime';
import App from '../src/App';
import customPlugin from '../src/runtimePlugin';

init({
  name: 'runtime_host',
  remotes: [
    {
      name: 'runtime_remote2',
      alias: 'dynamic-remote',
      entry: 'http://127.0.0.1:3007/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});

afterEach(async () => {
  await cleanup();
  window.history.replaceState({}, '', '/');
});

it('renders remote hooks, assets and the dynamically registered button', async () => {
  window.history.replaceState({}, '', '/');
  await render(<App />);
  await expect
    .element(page.getByRole('heading', { name: 'Runtime Demo' }))
    .toBeVisible();
  await expect
    .element(page.locator('.remote1-text'))
    .toHaveText('Custom hook from localhost:3006 works!');
  await expect
    .element(page.locator('button.test-remote2'))
    .toHaveText('Button from antd@4.24.15');
  for (const name of [
    'home-webpack-png',
    'remote1-webpack-png',
    'home-webpack-svg',
    'remote1-webpack-svg',
  ]) {
    await expect.element(page.locator(`img.${name}`)).toBeVisible();
    await expect
      .poll(() => {
        const image = document.querySelector<HTMLImageElement>(`img.${name}`);
        return image?.complete && image.naturalWidth > 0;
      })
      .toBe(true);
  }
});

it('retries a failed ESM entry and recovers with the retry query parameter', async () => {
  window.history.replaceState({}, '', '/esm-retry');
  performance.clearResourceTimings();
  await render(<App />);
  await page.getByTestId('esm-retry-load').click();
  await expect
    .element(page.getByTestId('esm-retry-status'))
    .toHaveText('ESM retry recovered');
  const requests = performance
    .getEntriesByType('resource')
    .filter(({ name }) => name.includes('/esm-retry-fixture/remoteEntry.js'));
  expect(requests).toHaveLength(2);
  expect(requests[0].name).not.toContain('retryCount');
  expect(requests[1].name).toContain('retryCount=1');
});
