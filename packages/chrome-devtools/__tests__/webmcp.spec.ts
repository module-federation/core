import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import {
  createDevtoolsTools,
  startDevtoolsWebMCP,
  registerDevtoolsWebMCP,
} from '../src/utils/chrome/webmcp';
import { OBSERVABILITY_DEVTOOLS_STORAGE_KEY } from '../src/utils/chrome/messages';

const call = async (name: string, input = {}) => {
  const tool = createDevtoolsTools().find((tool) => tool.name === name)!;
  const result = await tool.execute(input);
  return {
    ...result,
    data: result.isError
      ? result.content[0].text
      : JSON.parse(result.content[0].text),
  };
};
const config = () =>
  JSON.parse(localStorage.getItem('__MF_DEVTOOLS__') || '{}');

describe('page WebMCP tools', () => {
  beforeEach(() => {
    localStorage.clear();
    window.__FEDERATION__ = {
      moduleInfo: {
        host: {
          remotesInfo: { remote: { matchedVersion: 'old' } },
          shared: [{}],
          modules: [{}],
        },
      },
      __SHARE__: {},
      __GLOBAL_PLUGIN__: [],
    } as any;
  });
  afterEach(() => {
    rs.restoreAllMocks();
    localStorage.clear();
  });

  it('persists proxy rules, disabled rows and clipping without mutating the running snapshot', async () => {
    const result = await call('mf_set_proxy', {
      rules: [
        { key: 'remote', value: 'https://localhost:3006/mf-manifest.json' },
        { key: 'other', value: 'next', checked: false },
      ],
      clip: true,
    });
    expect(result.isError).toBeUndefined();
    expect(result.data.reloadRequired).toBe(true);
    expect(config().overrides).toEqual({
      remote: 'https://localhost:3006/mf-manifest.json',
    });
    expect(config().proxyRules).toHaveLength(2);
    const snapshot = JSON.parse(
      localStorage.getItem('__MF_DEVTOOLS_MODULE_INFO__')!,
    );
    expect(snapshot.host.remotesInfo.remote.matchedVersion).toBe(
      'https://localhost:3006/mf-manifest.json',
    );
    expect(snapshot.host.shared).toEqual([]);
    expect(window.__FEDERATION__.moduleInfo.host.shared).toEqual([{}]);
  });

  it('clears proxy state without losing HMR, and removes eager metadata when HMR is disabled', async () => {
    localStorage.setItem(
      '__MF_DEVTOOLS__',
      JSON.stringify({
        enableFastRefresh: true,
        eagerShare: ['react', '18.3.1'],
      }),
    );
    await call('mf_set_proxy', { rules: [{ key: 'remote', value: 'next' }] });
    await call('mf_clear_proxy');
    expect(config().overrides).toEqual({});
    expect(config().proxyRules).toEqual([]);
    expect(config().enableFastRefresh).toBe(true);
    expect(localStorage.getItem('__MF_DEVTOOLS_MODULE_INFO__')).toBeNull();
    expect(localStorage.getItem('MF_ENV')).toBeNull();
    await call('mf_set_hmr', { enabled: false });
    expect(config().enableFastRefresh).toBe(false);
    expect(config().eagerShare).toBeUndefined();
  });

  it('rejects invalid writes without modifying storage', async () => {
    localStorage.setItem('__MF_DEVTOOLS__', '{"enableFastRefresh":true}');
    for (const value of [
      'javascript:alert(1)',
      'file:///tmp/entry.js',
      'https://user:pass@example.com/entry.js',
    ]) {
      expect(
        (await call('mf_set_proxy', { rules: [{ key: 'remote', value }] }))
          .isError,
      ).toBe(true);
    }
    expect(
      (
        await call('mf_set_proxy', {
          rules: [{ key: '__proto__', value: 'next' }],
        })
      ).isError,
    ).toBe(true);
    expect((await call('mf_set_hmr', { enabled: 'true' })).isError).toBe(true);
    expect(
      (await call('mf_set_hmr', { enabled: true, unexpected: 1 })).isError,
    ).toBe(true);
    expect(config()).toEqual({ enableFastRefresh: true });
    expect(localStorage.getItem('__MF_DEVTOOLS_MODULE_INFO__')).toBeNull();
  });

  it('rolls back partial proxy writes on quota failure', async () => {
    localStorage.setItem('__MF_DEVTOOLS__', '{"enableFastRefresh":true}');
    const original = Storage.prototype.setItem;
    const spy = rs
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(function (this: Storage, key, value) {
        if (key === 'MF_ENV') throw new Error('Quota exceeded');
        return original.call(this, key, value);
      });
    expect(
      (
        await call('mf_set_proxy', {
          rules: [{ key: 'remote', value: 'next' }],
        })
      ).isError,
    ).toBe(true);
    spy.mockRestore();
    expect(localStorage.getItem('__MF_DEVTOOLS_MODULE_INFO__')).toBeNull();
    expect(config()).toEqual({ enableFastRefresh: true });
  });

  it('configures tracing, exports reports, and disables only the extension configuration', async () => {
    (window.__FEDERATION__ as any).__OBSERVABILITY__ = {
      user: { getReports: () => [{ traceId: 'trace-1' }] },
    };
    const result = await call('mf_configure_loading_trace', {
      enabled: true,
      level: 'summary',
      maxEvents: 20,
      console: false,
      printStart: false,
    });
    expect(result.data.reloadRequired).toBe(true);
    expect(
      JSON.parse(localStorage.getItem(OBSERVABILITY_DEVTOOLS_STORAGE_KEY)!),
    ).toMatchObject({
      enabled: true,
      level: 'summary',
      maxEvents: 20,
      console: false,
      trace: { printStart: false },
    });
    expect((await call('mf_get_loading_reports')).data.reports).toEqual([
      { traceId: 'trace-1', __scope: 'user' },
    ]);
    expect((await call('mf_export_snapshot')).data.exportedAt).toBeTruthy();
    await call('mf_configure_loading_trace', { enabled: false });
    expect(localStorage.getItem(OBSERVABILITY_DEVTOOLS_STORAGE_KEY)).toBeNull();
    expect((await call('mf_get_loading_reports')).data.reports).toHaveLength(1);
  });

  it('returns serializable shared dependencies without invoking factories', async () => {
    const factory = rs.fn();
    const shared: any = { react: { lib: factory } };
    shared.self = shared;
    window.__FEDERATION__.__SHARE__ = shared;
    const result = await call('mf_get_shared');
    expect(result.isError).toBeUndefined();
    expect(factory).not.toHaveBeenCalled();
    expect(typeof result.data.react.lib).toBe('string');
    expect(
      (await call('mf_get_modules', { moduleId: 'missing' })).isError,
    ).toBe(true);
    expect((await call('mf_get_dependencies')).data.producer).toContain(
      'remote',
    );
  });

  it('registers named tools and cleans up only successful registrations on failure', async () => {
    const unregisterTool = rs.fn();
    const registerTool = rs.fn().mockImplementation((tool) => {
      if (tool.name === 'mf_get_dependencies')
        throw new Error('Host rejected tool');
    });
    await expect(
      registerDevtoolsWebMCP({ registerTool, unregisterTool }),
    ).rejects.toThrow('Host rejected tool');
    expect(unregisterTool.mock.calls.map((args) => args[0])).toEqual([
      'mf_get_state',
      'mf_get_modules',
    ]);
    const context = { registerTool: rs.fn(), unregisterTool: rs.fn() };
    const cleanup = await registerDevtoolsWebMCP(context);
    expect(context.registerTool).toHaveBeenCalledTimes(10);
    await cleanup();
    await cleanup();
    expect(context.unregisterTool).toHaveBeenCalledTimes(10);
  });

  it('does nothing on a host without WebMCP', async () => {
    await expect(registerDevtoolsWebMCP(undefined)).resolves.toBeInstanceOf(
      Function,
    );
  });
});

describe('WebMCP startup', () => {
  afterEach(() => {
    delete (document as any).modelContext;
    delete (navigator as any).modelContext;
    delete (window as any).__MF_DEVTOOLS_WEBMCP__;
    rs.restoreAllMocks();
  });

  it('registers a late host once and reports registered names', async () => {
    const stop = startDevtoolsWebMCP(5, 100);
    expect((window as any).__MF_DEVTOOLS_WEBMCP__.status).toBe('waiting');
    const context = { registerTool: rs.fn(), unregisterTool: rs.fn() };
    (document as any).modelContext = {}; // An incomplete API must not hide the fallback.
    (navigator as any).modelContext = context;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(context.registerTool).toHaveBeenCalledTimes(10);
    expect((window as any).__MF_DEVTOOLS_WEBMCP__).toMatchObject({
      status: 'registered',
      tools: createDevtoolsTools().map((t) => t.name),
    });
    await new Promise((resolve) => setTimeout(resolve, 15));
    expect(context.registerTool).toHaveBeenCalledTimes(10);
    await stop();
    expect(context.unregisterTool).toHaveBeenCalledTimes(10);
  });

  it('reports an unavailable host and stops retrying', async () => {
    rs.spyOn(console, 'warn').mockImplementation(() => {});
    const stop = startDevtoolsWebMCP(5, 2);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect((window as any).__MF_DEVTOOLS_WEBMCP__).toMatchObject({
      status: 'unavailable',
      attempts: 2,
    });
    await stop();
  });

  it('reports registration errors and rolls back without retrying duplicates', async () => {
    rs.spyOn(console, 'warn').mockImplementation(() => {});
    const context = {
      registerTool: rs.fn(() => {
        throw new Error('rejected');
      }),
      unregisterTool: rs.fn(),
    };
    (document as any).modelContext = context;
    const stop = startDevtoolsWebMCP(5, 2);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect((window as any).__MF_DEVTOOLS_WEBMCP__).toMatchObject({
      status: 'error',
      error: 'rejected',
    });
    expect(context.registerTool).toHaveBeenCalledTimes(1);
    await stop();
  });
});
