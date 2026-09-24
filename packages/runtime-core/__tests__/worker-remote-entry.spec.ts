import path from 'node:path';
import { runNodeWithConditions } from '../../../tools/testing/runNodeWithConditions';

const packageDir = path.resolve(__dirname, '..');

describe('worker remote entry', () => {
  it('loads an ESM remote entry through the worker platform loader', () => {
    expect(
      runNodeWithConditions(
        packageDir,
        ['module-federation:target-worker'],
        "const { ModuleFederation, getRemoteEntry } = require('./dist/index.cjs'); const origin = new ModuleFederation({ name: 'host', remotes: [] }); getRemoteEntry({ origin, remoteInfo: { name: 'worker-remote', entry: 'data:text/javascript,export const init = () => {}; export const get = () => () => 42;', type: 'module', entryGlobalName: 'workerRemote', shareScope: 'default' } }).then((entry) => console.log(entry.get()()), (error) => console.log(error.message));",
      ),
    ).toBe('42');
  });
});
