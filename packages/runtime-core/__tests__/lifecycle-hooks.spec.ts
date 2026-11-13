import { expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src';

it('uses a plugin cleanup without knowing the container implementation', async () => {
  const remove = rs.fn();
  const host = new ModuleFederation({
    name: 'custom-cleanup',
    remotes: [{ name: 'a', entry: 'https://example.test/a.js' }],
    plugins: [
      { name: 'custom-container', beforeRemoveRemote: () => ({ remove }) },
    ],
  });
  await host.removeRemote('a');
  expect(remove).toHaveBeenCalledOnce();
  expect(host.options.remotes).toEqual([]);
  expect('retainedProviders' in host).toBe(false);
});
