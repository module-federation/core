import path from 'node:path';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');

describe('disabled handler selectors', () => {
  it('preserves the remote-disabled error through the public loader', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-remote'],
        "const { getRemoteEntry } = require('./dist/index.cjs'); getRemoteEntry({}).catch((error) => console.log(error.message));",
      ),
    ).toBe(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  });

  it('preserves the remote-disabled error through ModuleFederation', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-remote'],
        "const { ModuleFederation } = require('./dist/index.cjs'); new ModuleFederation({ name: 'host', remotes: [] }).loadRemote('app/value').catch((error) => console.log(error.message));",
      ),
    ).toBe(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  });

  it('keeps share-scope storage and rejects shared loading', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-shared'],
        "const { ModuleFederation } = require('./dist/index.cjs'); const runtime = new ModuleFederation({ name: 'host', remotes: [] }); runtime.initShareScopeMap('custom', { react: {} }); runtime.loadShare('react').catch((error) => console.log(`${Object.keys(runtime.shareScopeMap).join(',')}:${error.message}`));",
      ),
    ).toBe(
      'custom:Shared dependency loading is disabled by experiments.optimization.disableShared.',
    );
  });

  it('removes default snapshot plugins only for the matching condition', () => {
    const code =
      "const { ModuleFederation } = require('./dist/index.cjs'); console.log(new ModuleFederation({ name: 'host', remotes: [] }).options.plugins.map((plugin) => plugin.name).join(','));";

    expect(runNodeWithConditions(packageDir, [], code)).toBe(
      'snapshot-plugin,generate-preload-assets-plugin',
    );
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-snapshot-plugins'],
        code,
      ),
    ).toBe('');
  });
});
