import { assert, describe, it } from 'vitest';
import { FederationHost } from '../src';
import {
  getGlobalSnapshot,
  resetFederationGlobalInfo,
} from '@module-federation/runtime-core';

describe('snapshot', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('The host snapshot is automatically completed', async () => {
    const Remote1Entry =
      'http://localhost:1111/resources/snapshot/remote1/federation-manifest.json';
    const Remote2Entry =
      'http://localhost:1111/resources/snapshot/remote2/federation-manifest.json';
    const FM1 = new FederationHost({
      name: '@snapshot/host',
      version: '0.0.3',
      remotes: [
        {
          name: '@snapshot/remote1',
          entry: Remote1Entry,
        },
        {
          name: '@snapshot/remote2',
          entry: Remote2Entry,
        },
      ],
    });

    const module = await FM1.loadRemote<() => string>('@snapshot/remote1/say');
    assert(module);
    expect(module()).toBe('hello world "@snapshot/remote1"');

    const module2 = await FM1.loadRemote<() => string>('@snapshot/remote2/say');
    assert(module2);
    expect(module2()).toBe('hello world "@snapshot/remote2"');

    const globalSnapshot = getGlobalSnapshot();

    assert(globalSnapshot['@snapshot/host']);
    expect(globalSnapshot['@snapshot/host']).toMatchObject({
      version: '0.0.3',
      remotesInfo: {
        '@snapshot/remote1': { matchedVersion: Remote1Entry },
        '@snapshot/remote2': { matchedVersion: Remote2Entry },
      },
    });
  });
});
