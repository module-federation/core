import { expect, it } from '@rstest/core';
import { loadProductDetails } from '../src/load-product-details';

it('loads product details dynamically from the HTTP catalog remote', async () => {
  await expect(loadProductDetails()).resolves.toBe(
    'The catalog is served by the HTTP remote.',
  );
});
