import path from 'node:path';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

describe('disabled handler selectors', () => {
  it('keeps the public entry loader working when remotes are disabled', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-remote'],
        "globalThis.FEDERATION_OPTIMIZE_NO_REMOTE = true; const { ModuleFederation, getRemoteEntry } = require('./dist/index.cjs'); const origin = new ModuleFederation({ name: 'host', remotes: [], plugins: [{ name: 'fallback-entry', loadEntry: () => ({ init() {}, get: () => () => 'fallback loaded' }) }] }); getRemoteEntry({ origin, remoteInfo: { name: 'fallback', entry: 'http://localhost/fallback.js', type: 'global', entryGlobalName: 'fallback', shareScope: 'default' } }).then((entry) => console.log(entry.get()()));",
      ),
    ).toBe('fallback loaded');
  });

  it('follows the FEDERATION_OPTIMIZE_NO_REMOTE define without a condition', () => {
    const code = (value: string) =>
      `globalThis.FEDERATION_OPTIMIZE_NO_REMOTE = ${value}; const { ModuleFederation } = require('./dist/index.cjs'); new ModuleFederation({ name: 'host', remotes: [] }).loadRemote('app/value').catch((error) => console.log(error.message.split('\\n')[0]));`;

    expect(runNodeWithConditions(packageDir, [], code('true'))).toBe(
      REMOTE_DISABLED_MESSAGE,
    );
    expect(runNodeWithConditions(packageDir, [], code('false'))).toContain(
      '#RUNTIME-004',
    );
    expect(runNodeWithConditions(packageDir, [], code('undefined'))).toContain(
      '#RUNTIME-004',
    );
  });

  it('preserves the remote-disabled error through ModuleFederation', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:no-remote'],
        "const { ModuleFederation } = require('./dist/index.cjs'); new ModuleFederation({ name: 'host', remotes: [] }).loadRemote('app/value').catch((error) => console.log(error.message));",
      ),
    ).toBe(REMOTE_DISABLED_MESSAGE);
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
