import { beforeEach, describe, expect, it, rs } from '@rstest/core';

import {
  BasicProxyCore,
  resolveBasicProxyCore,
} from '../src/utils/chrome/resolve-basic-proxy-core';

describe('resolveBasicProxyCore', () => {
  const basicProxyCore: BasicProxyCore = {
    registerOverridePlugin: () => undefined,
  };

  it('uses a direct CommonJS export', () => {
    expect(resolveBasicProxyCore(basicProxyCore)).toBe(basicProxyCore);
  });

  it('unwraps an interop default export', () => {
    expect(resolveBasicProxyCore({ default: basicProxyCore })).toBe(
      basicProxyCore,
    );
  });
});

describe('override remote entry', () => {
  beforeEach(() => {
    rs.resetModules();

    const testWindow = window as Record<string, any>;
    testWindow.__FEDERATION__ = {
      __GLOBAL_PLUGIN__: [],
      moduleInfo: {},
    };
    testWindow.__VMOK__ = testWindow.__FEDERATION__;
  });

  it('registers the override plugin', async () => {
    await import('../src/utils/chrome/override-remote');

    expect(
      (window as any).__FEDERATION__.__GLOBAL_PLUGIN__.map(
        (plugin: { name: string }) => plugin.name,
      ),
    ).toContain('mf-chrome-devtools-override-remotes-plugin');
  });
});
