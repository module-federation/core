import { expect, it } from '@rstest/core';
import { readHttpDynamicRemote } from '../src/http-dynamic-reader';

it('executes a dynamic HTTP federated import from the Rsbuild remote', async () => {
  await expect(readHttpDynamicRemote()).resolves.toBe(
    'dynamic value from the Rsbuild federation remote',
  );
});
