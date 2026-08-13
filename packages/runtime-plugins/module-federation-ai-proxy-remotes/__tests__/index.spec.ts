import aiDebugRuntimePlugin, { generateAIDebugUrl } from '../src';
import {
  AI_DEBUG_ENV_KEY,
  AI_DEBUG_CONSOLE_KEY,
  AI_DEBUG_SNAPSHOT_KEY,
  AI_DEBUG_STORAGE_KEY,
  applyAIDebugUrlConfig,
  mergeAIDebugConfig,
  parseAIDebugUrlConfig,
} from '../src/core';
import {
  AI_DEBUG_CONSOLE_ELEMENT_ID,
  mountAIDebugConsole,
} from '../src/console';

describe('module-federation-ai-proxy-remotes', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    delete (window as typeof window & { __FEDERATION__?: unknown })
      .__FEDERATION__;
    delete (window as typeof window & { __VMOK__?: unknown }).__VMOK__;
    document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)?.remove();
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('generates a debug URL without changing the host URL', () => {
    const hostUrl = new URL('https://host.example.com/remote?keep=yes');

    const debugUrl = generateAIDebugUrl(hostUrl, {
      remote: 'http://localhost:3001/mf-manifest.json',
    });

    expect(hostUrl.searchParams.has('__mf_devtools')).toBe(false);
    const generated = new URL(debugUrl);
    expect(generated.searchParams.get('keep')).toBe('yes');
    expect(
      JSON.parse(generated.searchParams.get('__mf_devtools') ?? ''),
    ).toEqual({
      overrides: { remote: 'http://localhost:3001/mf-manifest.json' },
    });
  });

  it('generates a replacement config with a custom parameter name', () => {
    const debugUrl = new URL(
      generateAIDebugUrl(
        'https://host.example.com/remote',
        { remote: null },
        { parameterName: 'debug', replace: true },
      ),
    );

    expect(JSON.parse(debugUrl.searchParams.get('debug') ?? '')).toEqual({
      overrides: { remote: null },
      replace: true,
    });
  });

  it('merges by default, replaces on demand, and deletes null entries', () => {
    const current = {
      overrides: { old: 'http://localhost:3001/mf-manifest.json' },
      enableFastRefresh: true,
    };

    expect(
      mergeAIDebugConfig(current, {
        overrides: { added: 'http://127.0.0.1:3002/mf-manifest.json' },
      }),
    ).toEqual({
      overrides: {
        old: 'http://localhost:3001/mf-manifest.json',
        added: 'http://127.0.0.1:3002/mf-manifest.json',
      },
      enableFastRefresh: true,
    });
    expect(
      mergeAIDebugConfig(current, {
        replace: true,
        overrides: {
          old: null,
          added: 'http://localhost:3002/mf-manifest.json',
        },
      }),
    ).toEqual({
      overrides: { added: 'http://localhost:3002/mf-manifest.json' },
      enableFastRefresh: true,
    });
  });

  it('allows loopback and explicitly whitelisted hosts only', () => {
    expect(() =>
      parseAIDebugUrlConfig(
        JSON.stringify({
          overrides: { remote: 'https://assets.example.com/mf-manifest.json' },
        }),
      ),
    ).toThrow(/localhost or 127\.0\.0\.1/);

    expect(
      parseAIDebugUrlConfig(
        JSON.stringify({
          overrides: { remote: 'https://assets.example.com/mf-manifest.json' },
        }),
        { allowedHosts: ['assets.example.com'] },
      ).overrides.remote,
    ).toBe('https://assets.example.com/mf-manifest.json');
  });

  it.each([
    ['plain', (value: string) => value],
    ['URL encoded', (value: string) => encodeURIComponent(value)],
    [
      'URL encoded twice',
      (value: string) => encodeURIComponent(encodeURIComponent(value)),
    ],
  ])('parses %s JSON config', (_label, encode) => {
    const config = JSON.stringify({
      overrides: { remote: 'http://localhost:3002/mf-manifest.json' },
    });

    expect(parseAIDebugUrlConfig(encode(config))).toEqual({
      overrides: { remote: 'http://localhost:3002/mf-manifest.json' },
    });
  });

  it('applies encoded URL config, preserves other settings and cleans the URL', () => {
    sessionStorage.setItem(
      AI_DEBUG_STORAGE_KEY,
      JSON.stringify({
        overrides: { old: 'http://localhost:3001/mf-manifest.json' },
        enableFastRefresh: true,
      }),
    );
    sessionStorage.setItem(AI_DEBUG_SNAPSHOT_KEY, '{}');
    const url = new URL('/host?keep=yes', location.href);
    url.searchParams.set(
      '__mf_devtools',
      JSON.stringify({
        overrides: { remote: 'http://localhost:3002/mf-manifest.json' },
      }),
    );
    history.replaceState(null, '', url.href);

    expect(applyAIDebugUrlConfig()).toBe(true);
    expect(
      JSON.parse(sessionStorage.getItem(AI_DEBUG_STORAGE_KEY) ?? '{}'),
    ).toEqual({
      overrides: {
        old: 'http://localhost:3001/mf-manifest.json',
        remote: 'http://localhost:3002/mf-manifest.json',
      },
      enableFastRefresh: true,
    });
    expect(sessionStorage.getItem(AI_DEBUG_SNAPSHOT_KEY)).toBeNull();
    expect(sessionStorage.getItem(AI_DEBUG_ENV_KEY)).toBe('true');
    expect(sessionStorage.getItem(AI_DEBUG_CONSOLE_KEY)).toBe('true');
    expect(new URL(location.href).searchParams.has('__mf_devtools')).toBe(
      false,
    );
    expect(new URL(location.href).searchParams.get('keep')).toBe('yes');
  });

  it('loads the console asynchronously only after URL activation', async () => {
    aiDebugRuntimePlugin();
    await Promise.resolve();
    expect(document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)).toBeNull();

    const url = new URL(location.href);
    url.searchParams.set(
      '__mf_devtools',
      JSON.stringify({
        overrides: { remote: 'http://localhost:3002/mf-manifest.json' },
      }),
    );
    history.replaceState(null, '', url.href);

    aiDebugRuntimePlugin();
    expect(sessionStorage.getItem(AI_DEBUG_CONSOLE_KEY)).toBe('true');
    expect(document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)).not.toBeNull();
  });

  it('enables the console when the URL parameter has no value', async () => {
    history.replaceState(null, '', '/?__mf_devtools');

    aiDebugRuntimePlugin();

    expect(sessionStorage.getItem(AI_DEBUG_CONSOLE_KEY)).toBe('true');
    expect(new URL(location.href).searchParams.has('__mf_devtools')).toBe(
      false,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)).not.toBeNull();
  });

  it('removes the URL parameter when its config is invalid', () => {
    history.replaceState(null, '', '/host?keep=yes&__mf_devtools=invalid');

    expect(applyAIDebugUrlConfig()).toBe(false);

    const url = new URL(location.href);
    expect(url.searchParams.has('__mf_devtools')).toBe(false);
    expect(url.searchParams.get('keep')).toBe('yes');
  });

  it('globally overrides a remote during registration and snapshot loading', () => {
    sessionStorage.setItem(
      AI_DEBUG_STORAGE_KEY,
      JSON.stringify({
        overrides: { alias: 'http://localhost:3002/mf-manifest.json' },
      }),
    );
    sessionStorage.setItem(AI_DEBUG_CONSOLE_KEY, 'true');
    const plugin = aiDebugRuntimePlugin({ console: false });
    const args = {
      remote: { name: 'remote', alias: 'alias', version: '1.0.0' },
      origin: {} as never,
    };

    plugin.beforeRegisterRemote?.(args);
    expect(args.remote).toEqual({
      name: 'remote',
      alias: 'alias',
      entry: 'http://localhost:3002/mf-manifest.json',
    });

    const snapshotArgs = {
      moduleInfo: { name: 'remote', alias: 'alias', version: '1.0.0' },
      options: { inBrowser: true } as never,
      origin: {} as never,
    };
    plugin.beforeLoadRemoteSnapshot?.(snapshotArgs);
    expect(snapshotArgs.moduleInfo).toEqual({
      name: 'remote',
      alias: 'alias',
      entry: 'http://localhost:3002/mf-manifest.json',
    });
  });

  it('does not apply overrides while debugging is disabled', () => {
    sessionStorage.setItem(
      AI_DEBUG_STORAGE_KEY,
      JSON.stringify({
        overrides: { remote: 'http://localhost:3002/mf-manifest.json' },
      }),
    );
    const plugin = aiDebugRuntimePlugin({ console: false });
    const args = {
      remote: { name: 'remote', entry: 'https://example.com/remoteEntry.js' },
      origin: {} as never,
    };

    plugin.beforeRegisterRemote?.(args);

    expect(args.remote.entry).toBe('https://example.com/remoteEntry.js');
  });

  it('registers the runtime plugin globally once', () => {
    const plugin = aiDebugRuntimePlugin({ console: false });
    expect(plugin.name).toBe('ai-proxy-remotes-runtime-plugin');
    expect(window.__FEDERATION__.__GLOBAL_PLUGIN__).toEqual([plugin]);
    expect(aiDebugRuntimePlugin({ console: false })).toBe(plugin);
    expect(window.__FEDERATION__.__GLOBAL_PLUGIN__).toHaveLength(1);
  });

  it('mounts a componentized console and saves proxy rules', () => {
    (window as typeof window & { __FEDERATION__?: unknown }).__FEDERATION__ = {
      moduleInfo: {
        host: {
          remotesInfo: {
            remote: {
              matchedVersion: 'http://localhost:3000/mf-manifest.json',
            },
          },
        },
      },
      __INSTANCES__: [],
    };
    mountAIDebugConsole(
      { defaultOpen: true, reloadOnSave: false },
      { allowedHosts: [] },
    );
    const host = document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID);
    const root = host?.shadowRoot;
    expect(root).toBeDefined();

    const buttons = Array.from(root!.querySelectorAll('button'));
    buttons.find((button) => button.textContent === '+ Add remote')?.click();
    const remote = root!.querySelector<HTMLSelectElement>('select');
    expect(Array.from(remote!.options).map((option) => option.value)).toEqual([
      '',
      'remote',
    ]);
    remote!.value = 'remote';
    remote!.dispatchEvent(new Event('change'));
    const manifest = root!.querySelector<HTMLInputElement>('input[type=text]');
    manifest!.value = 'http://localhost:3001/mf-manifest.json';
    manifest!.dispatchEvent(new Event('input'));
    Array.from(root!.querySelectorAll('button'))
      .find((button) => button.textContent === 'Save')
      ?.click();

    expect(
      JSON.parse(sessionStorage.getItem(AI_DEBUG_STORAGE_KEY) ?? '{}'),
    ).toEqual({
      overrides: {
        remote: 'http://localhost:3001/mf-manifest.json',
      },
    });
  });

  it('can disable debugging from the console', () => {
    sessionStorage.setItem(AI_DEBUG_CONSOLE_KEY, 'true');
    mountAIDebugConsole({ defaultOpen: true, reloadOnSave: false });
    const host = document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID);

    Array.from(host!.shadowRoot!.querySelectorAll('button'))
      .find((button) => button.textContent === 'Disable debug')
      ?.click();

    expect(sessionStorage.getItem(AI_DEBUG_CONSOLE_KEY)).toBeNull();
    expect(document.getElementById(AI_DEBUG_CONSOLE_ELEMENT_ID)).toBeNull();
  });
});
