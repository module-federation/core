import { expect, it } from '@rstest/core';
import staticValue from 'fixture-remote/value';

it('loads a local CommonJS remote through a static import', () => {
  expect(staticValue).toBe('value from the fixture remote');
});
