import fs from 'fs';
import { mkdtemp, writeFile } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import fse from 'fs-extra';
import { afterEach, describe, expect, it } from 'vitest';

import { syncRemoteTypesPackage } from './virtualRemotePackage';

const createTempContext = async () => {
  const context = await mkdtemp(path.join(tmpdir(), 'mf-dts-virtual-package-'));
  await fse.ensureDir(path.join(context, 'node_modules'));
  return context;
};

describe('syncRemoteTypesPackage', () => {
  const contexts: string[] = [];

  afterEach(async () => {
    await Promise.all(contexts.map((context) => fse.remove(context)));
    contexts.length = 0;
  });

  it('creates virtual package files for remote declarations', async () => {
    const context = await createTempContext();
    contexts.push(context);

    const remoteAlias = 'remote1';
    const remoteTypesFolder = path.join(context, '@mf-types', remoteAlias);
    await fse.ensureDir(path.join(remoteTypesFolder, 'nested'));
    await fse.ensureDir(path.join(remoteTypesFolder, 'node_modules', 'react'));
    await writeFile(path.join(remoteTypesFolder, 'index.d.ts'), 'export {};');
    await writeFile(path.join(remoteTypesFolder, 'Button.d.ts'), 'export {};');
    await writeFile(
      path.join(remoteTypesFolder, 'nested', 'Card.d.ts'),
      'export {};',
    );
    await writeFile(
      path.join(remoteTypesFolder, 'node_modules', 'react', 'index.d.ts'),
      'export {};',
    );

    const created = await syncRemoteTypesPackage({
      context,
      remoteAlias,
      remoteTypesFolder,
    });

    expect(created).toBe(true);
    expect(
      fs.existsSync(path.join(context, 'node_modules', remoteAlias, 'index.d.ts')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(context, 'node_modules', remoteAlias, 'Button.d.ts')),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(context, 'node_modules', remoteAlias, 'nested', 'Card.d.ts'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          context,
          'node_modules',
          remoteAlias,
          'node_modules',
          'react',
          'index.d.ts',
        ),
      ),
    ).toBe(false);

    const buttonDeclaration = await fse.readFile(
      path.join(context, 'node_modules', remoteAlias, 'Button.d.ts'),
      'utf-8',
    );
    expect(buttonDeclaration).toContain("export * from '../../@mf-types/remote1/Button';");
  });

  it('skips overwriting existing non-managed packages', async () => {
    const context = await createTempContext();
    contexts.push(context);

    const remoteAlias = 'remote2';
    const remoteTypesFolder = path.join(context, '@mf-types', remoteAlias);
    await fse.ensureDir(remoteTypesFolder);
    await writeFile(path.join(remoteTypesFolder, 'index.d.ts'), 'export {};');

    const existingPackagePath = path.join(context, 'node_modules', remoteAlias);
    await fse.ensureDir(existingPackagePath);
    await writeFile(
      path.join(existingPackagePath, 'package.json'),
      JSON.stringify({ name: remoteAlias }),
    );

    const created = await syncRemoteTypesPackage({
      context,
      remoteAlias,
      remoteTypesFolder,
    });

    expect(created).toBe(false);
    expect(fs.existsSync(path.join(existingPackagePath, '.mf-types-generated'))).toBe(
      false,
    );
  });

  it('rebuilds previously generated virtual package', async () => {
    const context = await createTempContext();
    contexts.push(context);

    const remoteAlias = 'remote3';
    const remoteTypesFolder = path.join(context, '@mf-types', remoteAlias);
    await fse.ensureDir(remoteTypesFolder);
    await writeFile(path.join(remoteTypesFolder, 'OldModule.d.ts'), 'export {};');

    await syncRemoteTypesPackage({
      context,
      remoteAlias,
      remoteTypesFolder,
    });

    await fse.remove(path.join(remoteTypesFolder, 'OldModule.d.ts'));
    await writeFile(path.join(remoteTypesFolder, 'NewModule.d.ts'), 'export {};');

    const created = await syncRemoteTypesPackage({
      context,
      remoteAlias,
      remoteTypesFolder,
    });

    expect(created).toBe(true);
    expect(
      fs.existsSync(path.join(context, 'node_modules', remoteAlias, 'OldModule.d.ts')),
    ).toBe(false);
    expect(
      fs.existsSync(path.join(context, 'node_modules', remoteAlias, 'NewModule.d.ts')),
    ).toBe(true);
  });
});
