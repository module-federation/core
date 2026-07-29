import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { describe, expect, it } from '@rstest/core';

import { collectRemoteNames } from './remotes';

describe('collectRemoteNames', () => {
  it('collects remote names from object keys and string entries', () => {
    expect(
      collectRemoteNames({
        objectRemote: 'remote@http://localhost:3001/remoteEntry.js',
        stringlessObjectRemote: {
          external: 'commonjs /tmp/remoteEntry.js',
        },
      }),
    ).toEqual(new Set(['objectRemote', 'stringlessObjectRemote']));

    expect(
      collectRemoteNames([
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
      ]),
    ).toEqual(new Set(['stringRemote', 'name', 'alias', 'first', 'second']));
  });

  it('parses scoped string remotes as name@entry', () => {
    expect(
      collectRemoteNames([
        '@scope/remote@http://localhost:3001/remoteEntry.js',
        '@scope/manifest-remote@http://localhost:3002/mf-manifest.json',
      ]),
    ).toEqual(new Set(['@scope/remote', '@scope/manifest-remote']));
  });

  it('collects fallback remote names from plugin options only when provided', () => {
    expect(
      collectRemoteNames(undefined, [
        new ModuleFederationPlugin({
          name: 'fallback_host',
          remotes: {
            fallbackRemote:
              'fallbackRemote@http://localhost:3005/remoteEntry.js',
          },
        }),
      ]),
    ).toEqual(new Set(['fallbackRemote']));
  });

  it('ignores similarly shaped non-federation plugins', () => {
    expect(
      collectRemoteNames(undefined, [
        {
          name: 'WrappedFederationPlugin',
          _options: {
            name: 'wrapped_host',
            remotes: {
              duckRemote: 'duckRemote@http://localhost:3006/remoteEntry.js',
            },
          },
        },
        {
          name: 'SomeOtherPlugin',
          _options: { name: 'not_federation' },
        },
      ]),
    ).toEqual(new Set());
  });
});
