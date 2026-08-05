import { expect, it } from '@rstest/core';
import { readDynamicRemote } from '../src/index';

it('executes a dynamic federated import from the Rsbuild host app', async () => {
  await expect(readDynamicRemote()).resolves.toBe(
    'dynamic value from the Rsbuild federation remote',
  );
});
