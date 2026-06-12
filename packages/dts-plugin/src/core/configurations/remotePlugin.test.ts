import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import { dirname, join, resolve } from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { retrieveRemoteConfig } from './remotePlugin';

describe('hostPlugin', () => {
  const tempDirs: string[] = [];

  const createTemporaryProject = (files: Record<string, string>) => {
    const context = mkdtempSync(join(os.tmpdir(), 'mf-dts-plugin-remote-'));
    tempDirs.push(context);

    writeFileSync(
      join(context, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'es2017',
            module: 'esnext',
            lib: ['esnext'],
            moduleResolution: 'node',
            esModuleInterop: true,
            strict: true,
            strictNullChecks: true,
            resolveJsonModule: true,
            rootDir: '.',
          },
        },
        null,
        2,
      ),
    );

    for (const [relativePath, contents] of Object.entries(files)) {
      const absolutePath = join(context, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, contents);
    }

    return context;
  };

  afterEach(() => {
    for (const tempDir of tempDirs.splice(0)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const moduleFederationConfig = {
    name: 'remotePluginTestHost',
    filename: 'remoteEntry.js',
    exposes: {
      './button': './src/components/button',
      './anotherButton': './src/components/anotherButton',
    },
    shared: {
      react: { singleton: true, eager: true },
      'react-dom': { singleton: true, eager: true },
    },
  };

  describe('retrieveRemoteConfig', () => {
    it('throws for missing module federation configuration', () => {
      // @ts-expect-error Missing module federation configuration
      const invokeRetrieve = () => retrieveRemoteConfig({});
      expect(invokeRetrieve).toThrowError('moduleFederationConfig is required');
    });

    describe('correctly intersect with default options', () => {
      it('only moduleFederationConfig provided', () => {
        const tsConfigPath = join(__dirname, './tsconfig.test.json');

        const { tsConfig, mapComponentsToExpose, remoteOptions } =
          retrieveRemoteConfig({
            moduleFederationConfig,
            tsConfigPath,
          });

        expect(tsConfig).toStrictEqual({
          extends: tsConfigPath,
          compileOnSave: false,
          compilerOptions: {
            target: 'es2017',
            module: 'esnext',
            lib: ['esnext'],
            moduleResolution: 'node',
            esModuleInterop: true,
            strict: true,
            strictNullChecks: true,
            resolveJsonModule: true,
            emitDeclarationOnly: true,
            noEmit: false,
            declaration: true,
            outDir: resolve(
              remoteOptions.context,
              'dist/@mf-types/compiled-types',
            ),
            declarationDir: resolve(
              remoteOptions.context,
              'dist/@mf-types/compiled-types',
            ),
            rootDir: resolve(__dirname),
            incremental: true,
            tsBuildInfoFile: resolve(
              remoteOptions.context,
              'node_modules/.cache/mf-types/.tsbuildinfo',
            ),
          },
          files: ['./src/components/button', './src/components/anotherButton'],
          include: [],
          exclude: [],
        });

        expect(mapComponentsToExpose).toStrictEqual({
          './anotherButton': './src/components/anotherButton',
          './button': './src/components/button',
        });

        expect(remoteOptions).toStrictEqual({
          additionalFilesToCompile: [],
          tsConfigPath,
          typesFolder: '@mf-types',
          compiledTypesFolder: 'compiled-types',
          hostRemoteTypesFolder: '@mf-types',
          deleteTypesFolder: false,
          moduleFederationConfig,
          compilerInstance: 'tsc',
          compileInChildProcess: false,
          implementation: '',
          generateAPITypes: false,
          context: process.cwd(),
          deleteTsConfig: true,
          outputDir: '',
          abortOnError: true,
          extractRemoteTypes: false,
          extractThirdParty: false,
        });
      });

      it('all options provided', () => {
        const tsConfigPath = join(__dirname, 'tsconfig.test.json');
        const { tsConfig, mapComponentsToExpose, remoteOptions } =
          retrieveRemoteConfig({
            moduleFederationConfig,
            tsConfigPath,
            typesFolder: 'typesFolder',
            hostRemoteTypesFolder: '@mf-types',
            compiledTypesFolder: 'compiledTypesFolder',
            deleteTypesFolder: false,
            compilerInstance: 'vue-tsc',
          });

        expect(tsConfig).toStrictEqual({
          compileOnSave: false,
          extends: tsConfigPath,
          compilerOptions: {
            module: 'esnext',
            resolveJsonModule: true,
            strict: true,
            strictNullChecks: true,
            target: 'es2017',
            lib: ['esnext'],
            moduleResolution: 'node',
            esModuleInterop: true,
            emitDeclarationOnly: true,
            noEmit: false,
            declaration: true,
            outDir: resolve(
              remoteOptions.context,
              'dist/typesFolder/compiledTypesFolder',
            ),
            declarationDir: resolve(
              remoteOptions.context,
              'dist/typesFolder/compiledTypesFolder',
            ),
            rootDir: resolve(__dirname),
            incremental: true,
            tsBuildInfoFile: resolve(
              remoteOptions.context,
              'node_modules/.cache/mf-types/.tsbuildinfo',
            ),
          },
          exclude: [],
          include: [],
          files: ['./src/components/button', './src/components/anotherButton'],
        });

        expect(mapComponentsToExpose).toStrictEqual({
          './anotherButton': './src/components/anotherButton',
          './button': './src/components/button',
        });

        expect(remoteOptions).toStrictEqual({
          additionalFilesToCompile: [],
          tsConfigPath,
          typesFolder: 'typesFolder',
          hostRemoteTypesFolder: '@mf-types',
          compiledTypesFolder: 'compiledTypesFolder',
          deleteTypesFolder: false,
          moduleFederationConfig,
          compilerInstance: 'vue-tsc',
          compileInChildProcess: false,
          generateAPITypes: false,
          implementation: '',
          context: process.cwd(),
          deleteTsConfig: true,
          outputDir: '',
          abortOnError: true,
          extractRemoteTypes: false,
          extractThirdParty: false,
        });
      });

      it('custom outputDir changes outDir base path', () => {
        const tsConfigPath = join(__dirname, 'tsconfig.test.json');
        const customOutputDir = 'dist/react/production';
        const { tsConfig, remoteOptions } = retrieveRemoteConfig({
          moduleFederationConfig,
          tsConfigPath,
          outputDir: customOutputDir,
        });

        expect(remoteOptions.outputDir).toBe(customOutputDir);
        expect(tsConfig.compilerOptions.outDir).toBe(
          resolve(
            remoteOptions.context,
            customOutputDir,
            '@mf-types',
            'compiled-types',
          ),
        );
      });

      it('custom outputDir combined with custom typesFolder', () => {
        const tsConfigPath = join(__dirname, 'tsconfig.test.json');
        const { tsConfig, remoteOptions } = retrieveRemoteConfig({
          moduleFederationConfig,
          tsConfigPath,
          outputDir: 'dist/react/staging',
          typesFolder: 'my-types',
          compiledTypesFolder: 'compiled',
        });

        expect(remoteOptions.outputDir).toBe('dist/react/staging');
        expect(remoteOptions.typesFolder).toBe('my-types');
        expect(tsConfig.compilerOptions.outDir).toBe(
          resolve(
            remoteOptions.context,
            'dist/react/staging',
            'my-types',
            'compiled',
          ),
        );
      });
    });
    describe('resolves expose paths with supported extensions', () => {
      const resolveExpose = (
        exposePath: string,
        files: Record<string, string>,
      ) => {
        const context = createTemporaryProject(files);
        const { mapComponentsToExpose } = retrieveRemoteConfig({
          context,
          tsConfigPath: './tsconfig.json',
          moduleFederationConfig: {
            name: 'remotePluginTestHost',
            filename: 'remoteEntry.js',
            exposes: {
              './component': exposePath,
            },
          },
        });

        return {
          context,
          resolvedPath: mapComponentsToExpose['./component'],
        };
      };

      it('keeps existing single-segment inference for ts files', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo',
          {
            'src/components/foo.ts': 'export const foo = 1;\n',
          },
        );

        expect(resolvedPath).toBe(resolve(context, 'src/components/foo.ts'));
      });

      it('infers ts files for multi-dot expose paths', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.generated',
          {
            'src/components/foo.generated.ts': 'export const foo = 1;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.generated.ts'),
        );
      });

      it('preserves explicit multi-dot ts paths', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.generated.ts',
          {
            'src/components/foo.generated.ts': 'export const foo = 1;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.generated.ts'),
        );
      });

      it('infers tsx files for multi-dot expose paths', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.generated',
          {
            'src/components/foo.generated.tsx':
              'export const Foo = () => null;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.generated.tsx'),
        );
      });

      it('infers vue files for multi-dot expose paths', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.generated',
          {
            'src/components/foo.generated.vue':
              '<script setup lang="ts">const foo = 1;</script>\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.generated.vue'),
        );
      });

      it('infers jsx files for multi-dot expose paths', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.generated',
          {
            'src/components/foo.generated.jsx':
              'export const Foo = () => null;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.generated.jsx'),
        );
      });

      it('falls back to dotted directory index files', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo.bar',
          {
            'src/components/foo.bar/index.ts': 'export const foo = 1;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo.bar/index.ts'),
        );
      });

      it('falls back to normal directory index files', () => {
        const { context, resolvedPath } = resolveExpose(
          './src/components/foo',
          {
            'src/components/foo/index.ts': 'export const foo = 1;\n',
          },
        );

        expect(resolvedPath).toBe(
          resolve(context, 'src/components/foo/index.ts'),
        );
      });
    });
  });

  describe('successfully parse tsconfig with project references', () => {
    it.each([
      {
        tsConfigFile: './testconfig-reference.test.json',
        expectedRootDir: resolve(__dirname),
      },
      {
        tsConfigFile: './testconfig-reference-2.test.json',
        expectedRootDir: resolve(__dirname),
      },
      {
        tsConfigFile: './testconfig-reference-relative.test.json',
        expectedRootDir: resolve(__dirname, '..'),
      },
    ])(
      'infers rootDir from project references',
      ({ tsConfigFile, expectedRootDir }) => {
        const tsConfigPath = join(__dirname, tsConfigFile);
        const { tsConfig } = retrieveRemoteConfig({
          moduleFederationConfig,
          tsConfigPath,
        });

        expect(tsConfig.compilerOptions.rootDir).toBe(expectedRootDir);
      },
    );
  });
});
