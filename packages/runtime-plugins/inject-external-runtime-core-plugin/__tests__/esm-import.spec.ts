import path from 'node:path';
import { pathToFileURL } from 'node:url';

type PluginFactoryModule = {
  default: () => {
    beforeInit(args: { options: { name: string } }): unknown;
    version: string;
  };
};

function expectInjectedRuntime(appName: string, version: string) {
  expect(globalThis._FEDERATION_RUNTIME_CORE).toBeDefined();
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
});
