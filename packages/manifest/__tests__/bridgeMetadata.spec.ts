/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import webpack from 'webpack';
import type { Compilation } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { createBridgeMetadataReader } from '../src/bridgeMetadata';

describe('Bridge expose source metadata', () => {
  let directory: string;
  let compiler: webpack.Compiler;
  let read: ReturnType<typeof createBridgeMetadataReader>;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-bridge-metadata-'));
    source(
      'export const createBridgeComponent = (options) => options;',
      'factory.ts',
    );
    compiler = webpack({
      mode: 'none',
      context: directory,
      resolve: { extensions: ['.ts', '.tsx', '.js'] },
    });
    read = createBridgeMetadataReader(compiler, {
      fileDependencies: new Set(),
    } as unknown as Compilation);
  });
  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      compiler.close((error) => (error ? reject(error) : resolve())),
    );
    fs.rmSync(directory, { recursive: true, force: true });
  });
  function source(code: string, filename = 'entry.tsx') {
    fs.writeFileSync(path.join(directory, filename), code);
    return `./${filename}`;
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
  it.each<moduleFederationPlugin.ModuleFederationPluginOptions['remotes']>([
    { checkout: 'checkout@https://example.test/remoteEntry.js' },
    { checkout: { external: 'checkout@https://example.test/remoteEntry.js' } },
    { checkout: ['checkout@https://example.test/remoteEntry.js'] },
    ['checkout'],
    [{ checkout: 'checkout@https://example.test/remoteEntry.js' }],
  ])('stops forwarding analysis at configured remotes: %j', async (remotes) => {
    const readRemote = createBridgeMetadataReader(
      compiler,
      {
        fileDependencies: new Set(),
      } as unknown as Compilation,
      remotes,
    );
    let index = 0;
    for (const request of ['checkout', 'checkout/pages/checkout/[...slug]']) {
      for (const code of [
        `import Page from '${request}'; export default Page;`,
        `export {default} from '${request}';`,
      ]) {
        expect(await readRemote(source(code, `remote-${index++}.tsx`))).toBe(
          false,
        );
      }
    }
    expect(await readRemote('checkout/Page')).toBe(false);
    await expect(
      readRemote(
        source("export {default} from 'checkout-other/page';", 'prefix.ts'),
      ),
    ).rejects.toThrow(/Can't resolve/);
    await expect(
      readRemote(source("export {default} from './missing';", 'local.ts')),
    ).rejects.toThrow(/Can't resolve/);
  });
  it('recognizes scoped remote aliases', async () => {
    const readRemote = createBridgeMetadataReader(
      compiler,
      {
        fileDependencies: new Set(),
      } as unknown as Compilation,
      {
        '@scope/checkout': 'checkout@https://example.test/remoteEntry.js',
      },
    );
    expect(
      await readRemote(source("export {default} from '@scope/checkout/Page';")),
    ).toBe(false);
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
