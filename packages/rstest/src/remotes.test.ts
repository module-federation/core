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
          name: 'namedRemote',
          external: 'namedRemote@http://localhost:3003/remoteEntry.js',
        },
        {
          alias: 'aliasedRemote',
          external: 'aliasedContainer@http://localhost:3004/remoteEntry.js',
        },
      ]),
    ).toEqual(new Set(['stringRemote', 'namedRemote', 'aliasedRemote']));
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
        {
          constructor: { name: 'ModuleFederationPlugin' },
          _options: {
            remotes: {
              fallbackRemote:
                'fallbackRemote@http://localhost:3005/remoteEntry.js',
            },
          },
        },
      ]),
    ).toEqual(new Set(['fallbackRemote']));
  });

  it('duck-types federation plugins whose constructor name differs', () => {
    expect(
      collectRemoteNames(undefined, [
        {
          constructor: { name: 'WrappedFederationPlugin' },
          options: {
            name: 'wrapped_host',
            remotes: {
              duckRemote: 'duckRemote@http://localhost:3006/remoteEntry.js',
            },
          },
        },
        // Not federation-shaped: must be ignored.
        {
          constructor: { name: 'SomeOtherPlugin' },
          options: { name: 'not_federation' },
        },
      ]),
    ).toEqual(new Set(['duckRemote']));
  });
});
