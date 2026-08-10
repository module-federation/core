import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, it } from '@rstest/core';
import App from '../../src/App';

it('composes both browser federation remotes', async () => {
  await render(<App />);

  await expect
    .element(page.getByRole('heading', { name: 'Federated shop' }))
    .toBeVisible();
  await expect.element(page.getByText('Ada Lovelace')).toBeVisible();
  await expect.element(page.getByText('Member since 1843')).toBeVisible();

  await page.getByRole('button', { name: 'Add item (0)' }).click();

  await expect
    .element(page.getByRole('button', { name: 'Add item (1)' }))
    .toBeVisible();
});
