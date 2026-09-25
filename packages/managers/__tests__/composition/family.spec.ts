/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';
import { resolveRuntimeFamily } from '../../src/composition/family';
import {
  composableFamily,
  dualExports,
  packageDir,
  tempDir,
  writePackage,
} from './fixtures';

describe('resolveRuntimeFamily', () => {
  it('records the real root, name, and exports of every member', () => {
    const root = composableFamily(tempDir());
    const family = resolveRuntimeFamily(root);

    expect(Object.keys(family.members)).toEqual([
      '@module-federation/runtime-tools',
      '@module-federation/webpack-bundler-runtime',
      '@module-federation/runtime',
      '@module-federation/runtime-core',
      '@module-federation/sdk',
    ]);
    const core = family.members['@module-federation/runtime-core']!;
    expect(core.root).toBe(packageDir(root, '@module-federation/runtime-core'));
    expect(core.name).toBe('@module-federation/runtime-core');
    expect(Object.keys(core.exports as object)).toContain('./kernel');
  });

  it('follows the runtime edge when two runtime-core copies are installed', () => {
    const root = composableFamily(tempDir());
    const runtimeDir = packageDir(root, '@module-federation/runtime');
    const nested = writePackage(
      packageDir(runtimeDir, '@module-federation/runtime-core'),
      '@module-federation/runtime-core',
      dualExports(['./kernel']),
    );

    const family = resolveRuntimeFamily(root);

    expect(family.members['@module-federation/runtime-core']!.root).toBe(
      nested,
    );
  });

  it('records real paths through symlinked members', () => {
    const store = composableFamily(tempDir());
    const app = tempDir();
    fs.mkdirSync(path.join(app, 'node_modules'));
    fs.symlinkSync(
      path.join(store, 'node_modules', '@module-federation'),
      path.join(app, 'node_modules', '@module-federation'),
    );

    const family = resolveRuntimeFamily(app);

    expect(family.members['@module-federation/sdk']!.root).toBe(
      packageDir(store, '@module-federation/sdk'),
    );
  });

  it('skips a nameless package.json between the entry and the package root', () => {
    const root = composableFamily(tempDir());
    const sdk = packageDir(root, '@module-federation/sdk');
    fs.writeFileSync(
      path.join(sdk, 'dist', 'package.json'),
      '{"type":"module"}',
    );

    expect(
      resolveRuntimeFamily(root).members['@module-federation/sdk']!.root,
    ).toBe(sdk);
  });

  it('stops at the first member that does not resolve', () => {
    const root = composableFamily(tempDir());
    fs.rmSync(packageDir(root, '@module-federation/runtime-core'), {
      recursive: true,
    });

    expect(Object.keys(resolveRuntimeFamily(root).members)).toEqual([
      '@module-federation/runtime-tools',
      '@module-federation/webpack-bundler-runtime',
      '@module-federation/runtime',
    ]);
  });
});
