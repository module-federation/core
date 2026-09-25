import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { build } from 'tsdown';
import ts from 'typescript';
import { createDualFormatConfig } from './config-helpers.mjs';

const runtimePluginPackageJson = JSON.parse(
  await readFile(
    new URL(
      '../../../packages/runtime-plugins/inject-external-runtime-core-plugin/package.json',
      import.meta.url,
    ),
    'utf8',
  ),
);

const cases = [
  {
    name: 'inject-external-runtime-core-plugin',
    packageJson: {
      name: runtimePluginPackageJson.name,
      version: '0.0.0',
      type: runtimePluginPackageJson.type,
      exports: runtimePluginPackageJson.exports,
    },
    files: ['index.cjs', 'index.d.cts', 'index.d.ts', 'index.js'],
    importTypes: 'index.d.ts',
    requireTypes: 'index.d.cts',
  },
  {
    name: 'commonjs-fixture',
    packageJson: {
      name: '@module-federation/commonjs-fixture',
      version: '0.0.0',
      exports: {
        '.': {
          import: {
            types: './dist/index.d.mts',
            default: './dist/index.mjs',
          },
          require: {
            types: './dist/index.d.cts',
            default: './dist/index.cjs',
          },
        },
      },
    },
    files: ['index.cjs', 'index.d.cts', 'index.d.mts', 'index.mjs'],
    importTypes: 'index.d.mts',
    requireTypes: 'index.d.cts',
  },
];

test('dual-format packages emit and resolve separate declarations', async (t) => {
  const root = await mkdtemp(join(process.cwd(), '.tmp-mf-tsdown-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  for (const fixture of cases) {
    const packageName = fixture.packageJson.name;
    const packageDir = join(root, 'packages', fixture.name);
    const installedDir = join(
      root,
      'node_modules',
      '@module-federation',
      fixture.name,
    );
    await mkdir(join(packageDir, 'src'), { recursive: true });
    await writeFile(
      join(packageDir, 'package.json'),
      JSON.stringify(fixture.packageJson),
    );
    await writeFile(
      join(packageDir, 'tsconfig.lib.json'),
      JSON.stringify({
        compilerOptions: {
          declaration: true,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          target: 'ES2022',
          types: [],
        },
        include: ['src/**/*.ts'],
      }),
    );
    await writeFile(
      join(packageDir, 'src/index.ts'),
      'export default function greet(name: string): string { return `hello ${name}`; }\n',
    );

    await build({
      ...createDualFormatConfig({
        name: fixture.name,
        packageDir,
        entry: { index: 'src/index.ts' },
        dts: { resolver: 'tsc' },
      }),
      config: false,
      inlineOnly: false,
      logLevel: 'silent',
      sourcemap: false,
    });

    assert.deepEqual((await readdir(join(packageDir, 'dist'))).sort(), [
      ...fixture.files,
    ]);
    await mkdir(join(root, 'node_modules', '@module-federation'), {
      recursive: true,
    });
    await cp(packageDir, installedDir, { recursive: true });

    const importConsumer = join(root, `${fixture.name}.mts`);
    const requireConsumer = join(root, `${fixture.name}.cts`);
    await writeFile(
      importConsumer,
      `import greet from '${packageName}';\nconst message: string = greet('esm');\n`,
    );
    await writeFile(
      requireConsumer,
      `import greet = require('${packageName}');\nconst message: string = greet('cjs');\n`,
    );

    assert.equal(
      resolveTypes(packageName, importConsumer, ts.ModuleKind.ESNext),
      join(installedDir, 'dist', fixture.importTypes),
    );
    assert.equal(
      resolveTypes(packageName, requireConsumer, ts.ModuleKind.CommonJS),
      join(installedDir, 'dist', fixture.requireTypes),
    );

    const program = ts.createProgram([importConsumer, requireConsumer], {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      noEmit: true,
      strict: true,
      types: [],
    });
    assert.deepEqual(ts.getPreEmitDiagnostics(program), []);
  }
});

function resolveTypes(packageName, containingFile, resolutionMode) {
  return ts.resolveModuleName(
    packageName,
    containingFile,
    {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
    ts.sys,
    undefined,
    undefined,
    resolutionMode,
  ).resolvedModule?.resolvedFileName;
}
