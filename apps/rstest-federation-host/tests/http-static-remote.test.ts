import { expect, it } from '@rstest/core';
import { readHttpStaticRemote } from '../src/http-static-reader';

it('executes a static HTTP federated import from the Rsbuild remote', () => {
  expect(readHttpStaticRemote()).toBe(
    'static value from the Rsbuild federation remote',
  );
});
