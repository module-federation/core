import { beforeEach, describe, expect, it, rs } from '@rstest/core';

import {
  __EAGER_SHARE__,
  __ENABLE_FAST_REFRESH__,
  __FEDERATION_DEVTOOLS__,
} from '../src/template/constant';
import { getUnpkgUrl } from '../src/utils/sdk';

const resetWindowState = () => {
  localStorage.clear();

  const testWindow = window as Record<string, any>;

  delete testWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  delete testWindow.React;
  delete testWindow.ReactDOM;
  delete testWindow.scope_react;
  delete testWindow.scope_react_dom;
  testWindow.__FEDERATION__ = {
    __GLOBAL_PLUGIN__: [],
    __INSTANCES__: [],
    moduleInfo: {},
    __SHARE__: {},
    __MANIFEST_LOADING__: {},
    __PRELOADED_MAP__: new Map(),
  };
  testWindow.__VMOK__ = testWindow.__FEDERATION__;
};

const stubUmdRequest = ({
  reactScript = 'window.React = { source: "react" };',
  reactDomScript = 'window.ReactDOM = { source: "react-dom" };',
}: {
  reactScript?: string;
  reactDomScript?: string;
} = {}) => {
  const requests: Array<{ url: string; async: boolean }> = [];
  class MockXMLHttpRequest {
    status = 200;
    responseText = '';
    private url = '';
    private isAsync = true;
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;

    open(_method: string, url: string, async = true) {
      requests.push({ url, async });
      this.url = url;
      this.isAsync = async;
    }

    overrideMimeType() {}

    private hydrateResponse() {
      this.responseText = this.url.includes('react-dom')
        ? reactDomScript
        : reactScript;
    }

    send() {
      this.hydrateResponse();

      if (!this.isAsync) {
        return;
      }

      queueMicrotask(() => {
        this.onload?.();
      });
    }
  }

  rs.stubGlobal('XMLHttpRequest', MockXMLHttpRequest as typeof XMLHttpRequest);
  return requests;
};

const getPlugin = async () => {
  await import('../src/utils/chrome/fast-refresh');
  return (window as any).__FEDERATION__.__GLOBAL_PLUGIN__.at(-1);
};

describe('fast refresh shared scope globals', () => {
  beforeEach(() => {
    rs.resetModules();
    rs.unstubAllGlobals();
    resetWindowState();
  });

  it('hydrates scope globals from eager share cache on import', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
        [__EAGER_SHARE__]: ['react', '18.3.1', ['scope']],
      }),
    );
    stubUmdRequest();

    await import('../src/utils/chrome/fast-refresh');

    expect((window as any).scope_react).toEqual({ source: 'react' });
    expect((window as any).scope_react_dom).toEqual({
      source: 'react-dom',
    });
    expect((window as any).React).toBeUndefined();
    expect((window as any).ReactDOM).toBeUndefined();
  });

  it('hydrates every scoped global key when eager share contains multiple scopes', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
        [__EAGER_SHARE__]: ['react', '18.3.1', ['scope-a', 'scope-b']],
      }),
    );
    stubUmdRequest();

    await import('../src/utils/chrome/fast-refresh');

    expect((window as any).scope_a_react).toEqual({ source: 'react' });
    expect((window as any).scope_b_react).toEqual({ source: 'react' });
    expect((window as any).scope_a_react_dom).toEqual({
      source: 'react-dom',
    });
    expect((window as any).scope_b_react_dom).toEqual({
      source: 'react-dom',
    });
    expect((window as any).React).toBeUndefined();
    expect((window as any).ReactDOM).toBeUndefined();
  });

  it('prefers scope globals when reusing eager shared react and react-dom', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
        [__EAGER_SHARE__]: ['react', '18.3.1', ['scope']],
      }),
    );
    stubUmdRequest();

    const plugin = await getPlugin();

    (window as any).React = { source: 'root-react' };
    (window as any).ReactDOM = { source: 'root-react-dom' };
    (window as any).scope_react = { source: 'scope-react' };
    (window as any).scope_react_dom = { source: 'scope-react-dom' };

    const reactShared = {
      version: '18.3.1',
      scope: ['scope'],
      shareConfig: {
        eager: true,
      },
      lib: () => ({ source: 'original-react' }),
    };
    plugin.beforeRegisterShare({
      pkgName: 'react',
      shared: reactShared,
      origin: {} as never,
    });

    const reactDomShared = {
      version: '18.3.1',
      scope: ['scope'],
      shareConfig: {
        eager: true,
      },
      lib: () => ({ source: 'original-react-dom' }),
    };
    plugin.beforeRegisterShare({
      pkgName: 'react-dom',
      shared: reactDomShared,
      origin: {} as never,
    });

    expect(reactShared.lib()).toBe((window as any).scope_react);
    expect(reactDomShared.lib()).toBe((window as any).scope_react_dom);
  });

  it('copies async loaded globals into scope globals for react and react-dom', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
      }),
    );
    stubUmdRequest({
      reactScript: 'window.React = { source: "loaded-react" };',
      reactDomScript:
        'window.ReactDOM = { source: "loaded-react-dom", react: window.React };',
    });

    const plugin = await getPlugin();

    const reactShared: Record<string, any> = {
      version: '18.3.1',
      scope: ['scope'],
      shareConfig: {
        eager: false,
      },
    };
    plugin.beforeRegisterShare({
      pkgName: 'react',
      shared: reactShared,
      origin: {} as never,
    });

    const reactDomShared: Record<string, any> = {
      version: '18.3.1',
      scope: ['scope'],
      shareConfig: {
        eager: false,
      },
    };
    plugin.beforeRegisterShare({
      pkgName: 'react-dom',
      shared: reactDomShared,
      origin: {} as never,
    });

    const reactFactory = await reactShared.get();
    expect((window as any).scope_react).toEqual({ source: 'loaded-react' });
    expect((window as any).React).toBeUndefined();
    expect(reactFactory()).toBe((window as any).scope_react);

    const reactDomFactory = await reactDomShared.get();
    expect((window as any).scope_react_dom).toEqual({
      source: 'loaded-react-dom',
      react: (window as any).scope_react,
    });
    expect((window as any).ReactDOM).toBeUndefined();
    expect(reactDomFactory()).toBe((window as any).scope_react_dom);
  });
});

describe('pinned React 19 development provider', () => {
  beforeEach(() => {
    rs.resetModules();
    rs.unstubAllGlobals();
    resetWindowState();
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({ [__ENABLE_FAST_REFRESH__]: true }),
    );
  });

  const scripts = {
    reactScript:
      'window.React = { version: "19.2.4", createElement: () => Object.freeze({}), source: "dev-react" };',
    reactDomScript:
      'window.ReactDOM = { version: "19.2.4", createRoot() {}, react: window.React };',
  };

  it('maps every 19.x request to the pinned development pair, preserving React 18 URLs', () => {
    for (const version of ['19.0.0', '19.1.1', '19.2.0', '19.9.0-canary']) {
      expect(getUnpkgUrl('react', version)).toBe(
        'https://unpkg.com/umd-react@19.2.4/dist/react.development.js',
      );
      for (const pkg of ['react-dom', 'react-dom/client'])
        expect(getUnpkgUrl(pkg, version)).toBe(
          'https://unpkg.com/umd-react@19.2.4/dist/react-dom.development.js',
        );
    }
    expect(getUnpkgUrl('react', '18.3.1')).toBe(
      'https://unpkg.com/react@18.3.1/umd/react.development.js',
    );
    expect(getUnpkgUrl('react-dom', '18.3.1')).toBe(
      'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
    );
  });

  it('loads React before client-only async requests and shares the same DOM instance', async () => {
    const requests = stubUmdRequest(scripts);
    const plugin = await getPlugin();
    const client: any = {
      version: '19.0.0',
      scope: ['scope'],
      shareConfig: {},
    };
    const dom: any = { version: '19.1.1', scope: ['scope'], shareConfig: {} };
    const react: any = { version: '19.2.0', scope: ['scope'], shareConfig: {} };
    for (const [pkgName, shared] of [
      ['react-dom/client', client],
      ['react-dom', dom],
      ['react', react],
    ])
      plugin.beforeRegisterShare({ pkgName, shared, origin: {} });
    const [clientFactory, domFactory] = await Promise.all([
      client.get(),
      dom.get(),
    ]);
    const reactFactory = await react.get();
    expect(clientFactory()).toBe(domFactory());
    expect(clientFactory().react).toBe(reactFactory());
    expect(client.version).toBe('19.2.4');
    expect(dom.version).toBe('19.2.4');
    expect(react.version).toBe('19.2.4');
    expect(requests).toEqual([
      {
        url: 'https://unpkg.com/umd-react@19.2.4/dist/react.development.js',
        async: true,
      },
      {
        url: 'https://unpkg.com/umd-react@19.2.4/dist/react-dom.development.js',
        async: true,
      },
    ]);
  });

  it('loads eager client shares synchronously and saves the pinned version for the next navigation', async () => {
    const requests = stubUmdRequest(scripts);
    const plugin = await getPlugin();
    const client: any = {
      version: '19.1.1',
      scope: ['scope'],
      shareConfig: { eager: true },
    };
    plugin.beforeRegisterShare({
      pkgName: 'react-dom/client',
      shared: client,
      origin: {},
    });
    expect(client.lib().version).toBe('19.2.4');
    expect(client.lib().react).toBe((window as any).scope_react);
    expect(requests.every((request) => !request.async)).toBe(true);
    expect(requests).toHaveLength(2);
    expect(
      JSON.parse(localStorage.getItem(__FEDERATION_DEVTOOLS__)!)[
        __EAGER_SHARE__
      ][1],
    ).toBe('19.2.4');
    expect((await client.get())()).toBe(client.lib());
  });

  it('hydrates old React 19 eager caches with pinned URLs', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
        [__EAGER_SHARE__]: ['react', '19.0.0', ['scope']],
      }),
    );
    const requests = stubUmdRequest(scripts);
    await getPlugin();
    expect(requests.map((request) => request.url)).toEqual([
      'https://unpkg.com/umd-react@19.2.4/dist/react.development.js',
      'https://unpkg.com/umd-react@19.2.4/dist/react-dom.development.js',
    ]);
    expect((window as any).scope_react_dom.version).toBe('19.2.4');
  });

  it('preserves an installed DevTools hook and leaves disabled shares untouched', async () => {
    const hook = { inject: rs.fn() };
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
    localStorage.clear();
    const requests = stubUmdRequest(scripts);
    const plugin = await getPlugin();
    const originalGet = rs.fn();
    const shared: any = { version: '19.1.1', get: originalGet };
    plugin.beforeRegisterShare({
      pkgName: 'react-dom/client',
      shared,
      origin: {},
    });
    expect(shared.get).toBe(originalGet);
    expect(shared.version).toBe('19.1.1');
    expect((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__).toBe(hook);
    expect(requests).toHaveLength(0);
  });

  it('rejects an incorrect version or production React instead of returning it', async () => {
    stubUmdRequest({ reactScript: 'window.React = { version: "19.0.0" };' });
    const plugin = await getPlugin();
    const shared: any = { version: '19.1.1' };
    plugin.beforeRegisterShare({ pkgName: 'react', shared, origin: {} });
    await expect(shared.get()).rejects.toThrow('19.2.4');
    stubUmdRequest({
      reactScript:
        'window.React = { version: "19.2.4", createElement: () => ({}) };',
    });
    await expect(shared.get()).rejects.toThrow('not a development build');
  });
});
