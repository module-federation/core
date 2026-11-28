import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it } from '@rstest/core';
import HelloWorld from './HelloWorld';

afterEach(cleanup);

it('renders the exposed component', async () => {
  await render(<HelloWorld />);
  await expect
    .element(
      page.getByRole('heading', {
        name: 'Hello World from Module Federation!',
      }),
    )
    .toBeVisible();
  await expect
    .element(
      page.getByText('This is an exposed component from the bundle-size app'),
    )
    .toBeVisible();
});
