import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it } from '@rstest/core';
import { init } from '@module-federation/runtime';
import App from '../src/App';
import customPlugin from '../src/runtimePlugin';

init({
  name: 'manifest_host',
  remotes: [
    {
      name: 'rspack_provider',
      alias: 'dynamic-remote',
      entry: 'http://localhost:3010/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});

afterEach(cleanup);

it('renders static and dynamic remotes with the host shared React and antd', async () => {
  await render(<App />);
  await expect
    .element(page.getByRole('heading', { name: 'Manifest Basic Usage' }))
    .toBeVisible();
  await expect
    .element(page.locator('.remote1-text'))
    .toHaveText('Custom hook from localhost:3009 works!');
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

it('preloads manifest assets and renders both manifest and JavaScript entry providers', async () => {
  const { default: Preload } = await import('../src/Preload');
  await render(<Preload />);
  await expect
    .element(page.getByRole('heading'))
    .toHaveText('MF runtime can preload assets with Manifest Provider');
  await expect
    .poll(
      () =>
        document.querySelectorAll(
          'link[rel="preload"][href="http://localhost:3011/__federation_expose_Component.js"]',
        ).length,
    )
    .toBeGreaterThan(0);
  await page
    .getByRole('button', { name: 'load manifest provider', exact: true })
    .click();
  await expect
    .element(page.locator('[id="3011-rspack-manifest-provider"]'))
    .toBeVisible();
  await page
    .getByRole('button', { name: 'load js entry provider', exact: true })
    .click();
  await expect
    .element(page.locator('[id="3012-rspack-js-entry-provider"]'))
    .toBeVisible();
  await expect.element(page.locator('#manifest-load-error')).toHaveCount(0);
});
