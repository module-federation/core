import { expect, it, rs } from '@rstest/core';
import { ModuleFederation, helpers } from '../src';

it('preserves global snapshot publication without a snapshot policy plugin', async () => {
  const host = new ModuleFederation({ name: 'default-host' });
  const snapshot = { version: '', remoteEntry: '', remotesInfo: {} };
  helpers.global.addGlobalSnapshot({ 'default-host': snapshot });
  expect(host.snapshotHandler.getHostSnapshot()).toBe(snapshot);
});

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
