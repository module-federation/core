import { type ModuleInfo } from '@module-federation/sdk';
import { getRemoteEntryInfoFromSnapshot } from '../src/utils';

const originalWindow = global.window;

describe('tool', () => {
  afterAll(() => {
    global.window = originalWindow;
  });
  it('return remoteEntry when server manifest does not contain ssrRemoteEntry', () => {
    // Server environment
    (global as any).window = undefined;

    const snapshot = {
      remoteEntry:
        'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json',
      remoteEntryType: 'global',
      globalName: 'remote1',
    } as ModuleInfo;

    const result = getRemoteEntryInfoFromSnapshot(snapshot);

    expect(result).toEqual({
      url: 'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json',
      type: 'global',
      globalName: 'remote1',
    });
  });
});
