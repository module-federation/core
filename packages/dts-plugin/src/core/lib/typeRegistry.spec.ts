import { describe, expect, it } from '@rstest/core';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync,
  readFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DTSManager } from './DTSManager';
import { retrieveHostConfig } from '../configurations/hostPlugin';
import { REMOTE_ALIAS_IDENTIFIER, HOST_API_TYPES_FILE_NAME } from '../constant';

describe('generated remote module registry', () => {
  it.each(['module', 'commonjs'])(
    'type-checks %s consumers without installing React or SDK directly',
    (mode) => {
      const context = mkdtempSync(
        join(tmpdir(), 'mf-generated-type-registry-'),
      );
      const packageRoot = resolve(__dirname, '../../..');
      const packagesRoot = resolve(packageRoot, '..');
      const compiler = join(
        dirname(require.resolve('typescript/package.json')),
        'bin/tsc',
      );
      try {
        const link = (name: string, directory: string) => {
          const destination = join(context, 'node_modules', name);
          mkdirSync(dirname(destination), { recursive: true });
          symlinkSync(directory, destination, 'dir');
        };
        link('@module-federation/enhanced', join(packagesRoot, 'enhanced'));
        link('@module-federation/runtime', join(packagesRoot, 'runtime'));
        link(
          '@module-federation/runtime-tools',
          join(packagesRoot, 'runtime-tools'),
        );
        link(
          '@types/node',
          dirname(require.resolve('@types/node/package.json')),
        );
        const manager = new DTSManager({});
        const { hostOptions } = retrieveHostConfig({
          context,
          typesFolder: '@mf-types',
          moduleFederationConfig: { name: 'host', remotes: {} },
        });
        const directory = join(context, '@mf-types', 'shop');
        mkdirSync(directory, { recursive: true });
        // Use the actual producer API generator and consumer merger. No hand-built map.
        writeFileSync(
          join(directory, 'apis.d.ts'),
          manager
            .generateAPITypes({ './App': './App.ts' })
            .replaceAll(REMOTE_ALIAS_IDENTIFIER, 'shop'),
        );
        manager.loadedRemoteAPIAlias.add('shop');
        manager.consumeAPITypes(hostOptions);
        writeFileSync(
          join(context, 'remote.d.ts'),
          `declare module 'shop/App' {
        export default function App(props: {value: number}): string;
        export function named(flag: boolean): boolean;
      }`,
        );
        writeFileSync(
          join(context, 'package.json'),
          JSON.stringify({ type: mode }),
        );
        writeFileSync(
          join(context, 'index.ts'),
          `
        import { loadRemote } from '@module-federation/enhanced/runtime';
        type Module = ModuleFederation.RemoteModuleMap['shop/App'];
        const valid: Parameters<Module['default']>[0] = {value: 1};
        // @ts-expect-error generated mapping retains exported component props
        const invalid: Parameters<Module['default']>[0] = {value: 'bad'};
        loadRemote('shop/App').then(module => {
          module.default({value: 1});
          // @ts-expect-error existing runtime loadRemote inference is preserved
          module.default({value: 'bad'});
        });
      `,
        );
        writeFileSync(
          join(context, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              strict: true,
              skipLibCheck: false,
              noEmit: true,
              target: 'ES2020',
              module: 'NodeNext',
              moduleResolution: 'NodeNext',
              types: ['node'],
            },
            include: ['index.ts', 'remote.d.ts', '@mf-types/**/*.d.ts'],
          }),
        );
        const generated = readFileSync(
          join(context, '@mf-types', HOST_API_TYPES_FILE_NAME),
          'utf8',
        );
        expect(generated).not.toContain('bridge-react');
        expect(generated).not.toContain("from '@module-federation/sdk'");
        const check = spawnSync(
          process.execPath,
          [compiler, '-p', join(context, 'tsconfig.json')],
          { encoding: 'utf8' },
        );
        expect(check.stdout + check.stderr).toBe('');
        expect(check.status).toBe(0);
      } finally {
        rmSync(context, { recursive: true, force: true });
      }
    },
  );
});
