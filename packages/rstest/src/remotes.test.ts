import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { describe, expect, it } from '@rstest/core';

import { collectRemoteNames } from './remotes';

describe('collectRemoteNames', () => {
  it('collects remote names from every federation plugin shape', () => {
    expect(
      collectRemoteNames([
        new ModuleFederationPlugin({
          name: 'object_host',
          remotes: {
            objectRemote: 'remote@http://localhost:3001/remoteEntry.js',
            stringlessObjectRemote: {
              external: 'commonjs /tmp/remoteEntry.js',
            },
          },
        }),
        new ModuleFederationPlugin({
          name: 'string_host',
          remotes: [
            'stringRemote@http://localhost:3002/mf-manifest.json',
            {
              name: 'namedRemote@http://localhost:3003/remoteEntry.js',
            },
            {
              alias: 'aliasedContainer@http://localhost:3004/remoteEntry.js',
            },
            {
              first: 'firstContainer@http://localhost:3005/remoteEntry.js',
              second: 'secondContainer@http://localhost:3006/remoteEntry.js',
            },
          ],
        }),
      ]),
    ).toEqual(
      new Set([
        'objectRemote',
        'stringlessObjectRemote',
        'stringRemote',
        'name',
        'alias',
        'first',
        'second',
      ]),
    );
  });

  it('parses scoped string remotes as name@entry', () => {
    expect(
      collectRemoteNames([
        new ModuleFederationPlugin({
          name: 'scoped_host',
          remotes: [
            '@scope/remote@http://localhost:3001/remoteEntry.js',
            '@scope/manifest-remote@http://localhost:3002/mf-manifest.json',
          ],
        }),
      ]),
    ).toEqual(new Set(['@scope/remote', '@scope/manifest-remote']));
  });

  it('collects remote names from multiple federation plugins', () => {
    expect(
      collectRemoteNames([
        new ModuleFederationPlugin({
          name: 'first_host',
          remotes: {
            firstRemote: 'firstRemote@http://localhost:3005/remoteEntry.js',
          },
        }),
        new ModuleFederationPlugin({
          name: 'second_host',
          remotes: {
            secondRemote: 'secondRemote@http://localhost:3006/remoteEntry.js',
          },
        }),
      ]),
    ).toEqual(new Set(['firstRemote', 'secondRemote']));
  });

  it('ignores similarly shaped non-federation plugins', () => {
    expect(
      collectRemoteNames([
        {
          name: 'WrappedFederationPlugin',
          _options: {
            name: 'wrapped_host',
            remotes: {
              duckRemote: 'duckRemote@http://localhost:3006/remoteEntry.js',
            },
          },
        },
      ]),
    ).toEqual(new Set());
  });
});
