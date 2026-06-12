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
});
