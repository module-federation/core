import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __EAGER_SHARE__,
  __ENABLE_FAST_REFRESH__,
  __FEDERATION_DEVTOOLS__,
} from '../src/template/constant';

const resetWindowState = () => {
  localStorage.clear();

  const testWindow = window as Record<string, any>;

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
  class MockXMLHttpRequest {
    status = 200;
    responseText = '';
    private url = '';
    private isAsync = true;
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;

    open(_method: string, url: string, async = true) {
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

  vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest as typeof XMLHttpRequest);
};

const getPlugin = async () => {
  await import('../src/utils/chrome/fast-refresh');
  return (window as any).__FEDERATION__.__GLOBAL_PLUGIN__.at(-1);
};

describe('fast refresh shared scope globals', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    resetWindowState();
  });

  it('hydrates scope globals from eager share cache on import', async () => {
    localStorage.setItem(
      __FEDERATION_DEVTOOLS__,
      JSON.stringify({
        [__ENABLE_FAST_REFRESH__]: true,
        [__EAGER_SHARE__]: ['react', '19.2.0', ['scope']],
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
        [__EAGER_SHARE__]: ['react', '19.2.0', ['scope-a', 'scope-b']],
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
        [__EAGER_SHARE__]: ['react', '19.2.0', ['scope']],
      }),
    );
    stubUmdRequest();

    const plugin = await getPlugin();

    (window as any).React = { source: 'root-react' };
    (window as any).ReactDOM = { source: 'root-react-dom' };
    (window as any).scope_react = { source: 'scope-react' };
    (window as any).scope_react_dom = { source: 'scope-react-dom' };

    const reactShared = {
      version: '19.2.0',
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
      version: '19.2.0',
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
      version: '19.2.0',
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
      version: '19.2.0',
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
