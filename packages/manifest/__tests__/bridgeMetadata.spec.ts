/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import webpack from 'webpack';
import type { Compilation } from 'webpack';
import { createBridgeMetadataReader } from '../src/bridgeMetadata';

describe('Bridge expose source metadata', () => {
  let directory: string;
  let compiler: webpack.Compiler;
  let read: ReturnType<typeof createBridgeMetadataReader>;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-bridge-metadata-'));
    compiler = webpack({
      mode: 'none',
      context: directory,
      resolve: { extensions: ['.ts', '.tsx', '.js'] },
    });
    read = createBridgeMetadataReader(
      compiler,
      { fileDependencies: new Set() } as unknown as Compilation,
      ['@custom/runtime/mf'],
    );
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
  it('does not classify ordinary functions or similarly named local factories as Bridge', async () => {
    expect(
      await read(source('export default function Card() { return <div />; }')),
    ).toBe(false);
    expect(
      await read(
        source(
          'function createBridgeComponent(x) {return x;} export default createBridgeComponent({});',
          'other.ts',
        ),
      ),
    ).toBe(false);
  });
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
