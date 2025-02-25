import { join, resolve } from 'path';
import { describe, expect, it } from 'vitest';

import { retrieveRemoteConfig } from './remotePlugin';

describe('hostPlugin', () => {
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
          outputDir: '',
          abortOnError: true,
          extractRemoteTypes: false,
          extractThirdParty: false,
        });
      });
    });
  });
});
