import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, it } from '@rstest/core';
import RemoteButton from 'rstestBrowserRemote/button';

it('renders and interacts with the browser federation remote', async () => {
  await render(<RemoteButton />);

  await expect
    .element(page.getByRole('button', { name: 'Rsbuild federation button: 0' }))
    .toBeVisible();

  await page
    .getByRole('button', { name: 'Rsbuild federation button: 0' })
    .click();

  await expect
    .element(page.getByRole('button', { name: 'Rsbuild federation button: 1' }))
    .toBeVisible();
});
