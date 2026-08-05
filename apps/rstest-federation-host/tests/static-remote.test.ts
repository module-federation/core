import { expect, it } from '@rstest/core';
import { readStaticRemote } from '../src/index';

it('executes a static federated import from the Rsbuild host app', () => {
  expect(readStaticRemote()).toBe(
    'static value from the Rsbuild federation remote',
  );
});
