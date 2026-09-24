import path from 'node:path';
import { pathToFileURL } from 'node:url';

type PluginFactoryModule = {
  default: () => {
    beforeInit(args: {
      options: { name: string; runtimeImage?: RuntimeImage };
      userOptions?: { runtimeImage?: RuntimeImage };
    }): unknown;
    version: string;
  };
};

type RuntimeImage = {
  contract: 1;
  compatibilityId: string;
  required: string[];
  forbidden: string[];
  available: string[];
  target: string;
  entryLoadingIdentity: string;
};

function expectInjectedRuntime(appName: string, version: string) {
  expect(typeof globalThis._FEDERATION_RUNTIME_CORE.ModuleFederation).toBe(
    'function',
  );
  expect(globalThis._FEDERATION_RUNTIME_CORE_FROM).toEqual({
    name: appName,
    version,
  });
}

describe('@module-federation/inject-external-runtime-core-plugin', () => {
  beforeEach(() => {
    delete globalThis._FEDERATION_RUNTIME_CORE;
    delete globalThis._FEDERATION_RUNTIME_CORE_FROM;
  });

  it('loads from the ESM entry and runs beforeInit without a runtime-core default export', async () => {
    const esmEntry = pathToFileURL(
      path.join(__dirname, '..', 'dist', 'index.js'),
    );
    const importModule = new Function(
      'specifier',
      'return import(specifier);',
    ) as (specifier: string) => Promise<PluginFactoryModule>;
    const mod = await importModule(`${esmEntry.href}?t=${Date.now()}`);

    expect(mod).toBeDefined();
    expect(typeof mod.default).toBe('function');

    const plugin = mod.default();
    expect(plugin).toBeDefined();
    expect(typeof plugin.beforeInit).toBe('function');
    expect(typeof plugin.version).toBe('string');
    expect(plugin.version.length).toBeGreaterThan(0);

    plugin.beforeInit({ options: { name: 'esm-test-app' } });
    expectInjectedRuntime('esm-test-app', plugin.version);
  });

  it('loads from the CJS entry and runs beforeInit', () => {
    const cjsEntry = path.join(__dirname, '..', 'dist', 'index.cjs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(cjsEntry) as PluginFactoryModule['default'];

    expect(typeof mod).toBe('function');

    const plugin = mod();
    expect(plugin).toBeDefined();
    expect(typeof plugin.beforeInit).toBe('function');
    expect(typeof plugin.version).toBe('string');
    expect(plugin.version.length).toBeGreaterThan(0);

    plugin.beforeInit({ options: { name: 'cjs-test-app' } });
    expectInjectedRuntime('cjs-test-app', plugin.version);
  });

  it('stays silent and re-publishes for providers without runtime images', () => {
    const cjsEntry = path.join(__dirname, '..', 'dist', 'index.cjs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createPlugin = require(cjsEntry) as PluginFactoryModule['default'];
    const plugin = createPlugin();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    plugin.beforeInit({ options: { name: 'legacy-provider' } });
    expectInjectedRuntime('legacy-provider', plugin.version);

    globalThis._FEDERATION_RUNTIME_CORE =
      {} as typeof globalThis._FEDERATION_RUNTIME_CORE;
    plugin.beforeInit({ options: { name: 'legacy-provider' } });
    expectInjectedRuntime('legacy-provider', plugin.version);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('publishes runtime-image metadata and rejects an incompatible provider', () => {
    const cjsEntry = path.join(__dirname, '..', 'dist', 'index.cjs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createPlugin = require(cjsEntry) as PluginFactoryModule['default'];
    const plugin = createPlugin();
    const runtimeImage: RuntimeImage = {
      contract: 1,
      compatibilityId: 'runtime-family',
      required: ['remote'],
      forbidden: [],
      available: ['remote'],
      target: 'web',
      entryLoadingIdentity: 'web-loader',
    };

    plugin.beforeInit({
      options: { name: 'metadata-provider', runtimeImage },
    });
    expect(globalThis._FEDERATION_RUNTIME_CORE_FROM.runtimeImage).toEqual(
      runtimeImage,
    );
    expect(() =>
      plugin.beforeInit({
        options: {
          name: 'other-provider',
          runtimeImage: {
            ...runtimeImage,
            compatibilityId: 'other-family',
          },
        },
      }),
    ).toThrow(
      'Refusing to reuse runtime state from runtime-family with other-family.',
    );
    expect(
      globalThis._FEDERATION_RUNTIME_CORE_FROM.runtimeImage?.compatibilityId,
    ).toBe('runtime-family');
  });
});
