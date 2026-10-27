/** @jest-environment node */
import type { Compilation, Module, Dependency } from 'webpack';
import {
  createBridgeMetadataReader,
  annotateBridgeExposes,
} from '../src/bridgeMetadata';
import type { Stats } from '@module-federation/sdk';

describe('Bridge built module metadata', () => {
  let modules: Map<string, Module>;
  let read: ReturnType<typeof createBridgeMetadataReader>;
  beforeEach(() => {
    modules = new Map();
    read = createBridgeMetadataReader({
      moduleGraph: {
        getModule: (dependency: Dependency & { request: string }) =>
          modules.get(dependency.request) || null,
      },
    } as unknown as Compilation);
  });
  function source(code: string, filename = 'entry.tsx'): Module {
    const module = {
      type: 'javascript/auto',
      identifier: () => filename,
      originalSource: () => ({ source: () => code }),
      get dependencies() {
        return [...modules.keys()].map((request) => ({ request }));
      },
    } as unknown as Module;
    modules.set(`./${filename}`, module);
    modules.set(`./${filename.replace(/\.[^.]+$/, '')}`, module);
    return module;
  }
  it.each([
    "import { createBridgeComponent } from '@module-federation/bridge-react'; export default createBridgeComponent({ rootComponent: () => null });",
    "import { createBridgeComponent as bridge } from '@module-federation/bridge-react/v18'; const provider = bridge({ rootComponent: App }); export default provider;",
    "import * as bridge from '@module-federation/bridge-react/base'; const provider = bridge.createBridgeComponent({ rootComponent: App, isService: false }); export { provider as default };",
    "import { createBridgeComponent as bridge } from '@custom/runtime/mf'; export default bridge({ rootComponent: App });",
    "import { createBridgeComponent } from '@framework/bundled-provider'; export default createBridgeComponent({ rootComponent: App });",
    "import createBridgeComponent from './bundled-factory'; export default createBridgeComponent({ rootComponent: App });",
    'function createBridgeComponent(options) { return options; } export default createBridgeComponent({ rootComponent: App });',
    "import { createBridgeComponent as coreBridge } from '@framework/core'; function createBridgeComponent(options) { return coreBridge(options); } export default createBridgeComponent({ rootComponent: App });",
    'const createBridgeComponent = (options) => options; const make = createBridgeComponent; export default make({ rootComponent: App });',
    "import { createBridgeComponent as make } from '@framework/mf'; const bridge = make; export default bridge({ rootComponent: App });",
    "import * as framework from '@framework/mf'; export default framework['createBridgeComponent']({ rootComponent: App });",
  ])(
    'identifies provider bindings without executing source: %s',
    async (code) => {
      expect(
        await read(source(`throw new Error('must not execute'); ${code}`)),
      ).toBe(true);
    },
  );
  it('follows static imports and re-exports', async () => {
    source(
      "import {createBridgeComponent as bridge} from '@module-federation/bridge-react'; export const provider = bridge({rootComponent: App});",
      'provider.ts',
    );
    source("export {provider as default} from './provider';", 'barrel.ts');
    expect(
      await read(
        source("import Provider from './barrel'; export default Provider;"),
      ),
    ).toBe(true);
  });
  it.each(['remote', 'external', 'ignored'])(
    'keeps %s modules opaque',
    async (kind) => {
      modules.set('checkout/Page', {
        type: 'javascript/dynamic',
        identifier: () => kind,
        originalSource: () => null,
        dependencies: [],
      } as unknown as Module);
      expect(await read(source("export {default} from 'checkout/Page';"))).toBe(
        false,
      );
    },
  );
  it('terminates cyclic re-exports', async () => {
    source("export {default} from './entry';", 'barrel.ts');
    expect(await read(source("export {default} from './barrel';"))).toBe(false);
  });
  it('reuses parser metadata without reading the module source', async () => {
    const originalSource = jest.fn(() => {
      throw new Error('must reuse parser metadata');
    });
    const module = {
      buildInfo: { federationBridgeExports: { default: { bridge: true } } },
      originalSource,
    } as unknown as Module;
    expect(await read(module)).toBe(true);
    expect(originalSource).not.toHaveBeenCalled();
  });
  it('caches built source analysis within a compilation', async () => {
    const module = source(
      'const createBridgeComponent = x => x; export default createBridgeComponent({});',
    );
    const originalSource = jest.spyOn(module, 'originalSource');
    expect(await read(module)).toBe(true);
    expect(await read(module)).toBe(true);
    expect(originalSource).toHaveBeenCalledTimes(1);
  });
  it('preserves explicit metadata for opaque exports', () => {
    const stats = {
      exposes: [{ name: 'App', path: './App', render: 'bridge' }],
    } as Stats;
    expect(annotateBridgeExposes(stats, new Map())).toBe(stats);
    expect(stats.exposes[0].render).toBe('bridge');
  });
  it('diagnoses conflicting manifest metadata with the expose name', () => {
    const stats = {
      exposes: [{ name: 'App', path: './App', render: 'component' }],
    } as Stats;
    expect(() =>
      annotateBridgeExposes(stats, new Map([['./App', true]])),
    ).toThrow(/\.\/App: Bridge export conflicts/);
  });
  it.each([
    'export default function Card() { return <div />; }',
    'function otherFactory(x) { return x; } export default otherFactory({});',
    "import { createBridgeComponent } from '@framework/mf'; const provider = createBridgeComponent({rootComponent: App}); export default function Card() {return null;}",
    "import { createBridgeComponent } from '@framework/mf'; export const provider = createBridgeComponent({rootComponent: App});",
    "import { createBridgeComponent } from './factory'; export default createBridgeComponent;",
    "import { otherFactory } from '@module-federation/bridge-react'; export default otherFactory({rootComponent: App});",
    "import { createBridgeComponent } from '@framework/mf'; export default () => createBridgeComponent({rootComponent: App});",
    "import { createBridgeComponent } from '@framework/mf'; function createWeatherApp(options) { return createBridgeComponent(options); } export default createWeatherApp({rootComponent: App});",
    'const a = b; const b = a; export default a({});',
  ])(
    'keeps default exports not produced by the named factory unmarked: %s',
    async (code) => {
      expect(await read(source(code))).toBe(false);
    },
  );
  it.each([
    ['export default bridge(options);', /statically analyzable object/],
    ['export default bridge({...options});', /spreads/],
    [
      'export default bridge({isService: chooseService()});',
      /statically known boolean/,
    ],
    ['export default bridge({isService: true});', /Service App/],
    [
      'export default decorate(bridge({rootComponent: App}));',
      /wrapped Bridge/,
    ],
  ])('diagnoses unsupported declarations: %s', async (code, message) => {
    await expect(
      read(
        source(
          `import {createBridgeComponent as bridge} from '@module-federation/bridge-react'; ${code}`,
        ),
      ),
    ).rejects.toThrow(message);
  });
});
