import { expect, describe, it } from 'vitest';

import { getModuleInfo } from '../src/utils';

describe('basic proxy core bridge', () => {
  it('uses the bundled core asset for proxy calculation', async () => {
    const moduleInfo = {
      host: {
        remotesInfo: {
          remote: {
            matchedVersion: '1.0.0',
          },
        },
      },
    };
    const proxyRules = [{ key: 'remote', value: '2.0.0' }];

    window.__FEDERATION__ = {
      moduleInfo,
    } as any;

    const result = await getModuleInfo(proxyRules);

    expect(result).toMatchObject({
      status: 'success',
      moduleInfo: {
        host: {
          remotesInfo: {
            remote: {
              matchedVersion: '2.0.0',
            },
          },
        },
        'remote:2.0.0': {
          remoteEntry: '2.0.0',
          version: '2.0.0',
        },
      },
      overrides: {
        remote: '2.0.0',
      },
    });
  });
});
