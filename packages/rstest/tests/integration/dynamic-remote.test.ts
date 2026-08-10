import { expect, it } from '@rstest/core';

it('loads a local CommonJS remote through a dynamic import', async () => {
  const remote = await import('fixture-remote/value');

  expect(remote.default).toBe('value from the fixture remote');
});
