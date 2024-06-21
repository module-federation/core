import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rm } from 'fs/promises';
import { join, resolve } from 'path';
import { UnpluginOptions } from 'unplugin';
import { describe, expect, it, vi } from 'vitest';

import type { Compiler } from 'webpack';
import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from './index';

describe('index', () => {
  const projectRoot = join(__dirname, '..', '..', '..');

  describe('NativeFederationTypeScriptRemote', () => {
    it('throws for missing moduleFederationConfig', () => {
      // @ts-expect-error missing moduleFederationConfig
      const writeBundle = () => NativeFederationTypeScriptRemote.rollup({});
      expect(writeBundle).toThrowError('moduleFederationConfig is required');
    });

    it.skip('correctly writeBundle', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          exposes: {
            './index': join(__dirname, './index.ts'),
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
          },
        },
        tsConfigPath: join(__dirname, '..', './tsconfig.json'),
        typesFolder: '@mf-types',
        compiledTypesFolder: 'compiled-types',
        deleteTypesFolder: false,
        additionalFilesToCompile: [],
      };

      const distFolder = join(projectRoot, 'dist', options.typesFolder);

      const unplugin = NativeFederationTypeScriptRemote.rollup(
        options,
      ) as UnpluginOptions;
      await unplugin.writeBundle?.();

      expect(dirTree(distFolder)).toMatchObject({
        name: '@mf-types',
        children: [
          {
            name: 'compiled-types',
            children: [
              {
                name: 'configurations',
                children: [
                  { name: 'hostPlugin.d.ts' },
                  { name: 'remotePlugin.d.ts' },
                ],
              },
              { name: 'index.d.ts' },
              {
                name: 'interfaces',
                children: [
                  { name: 'HostOptions.d.ts' },
                  { name: 'RemoteOptions.d.ts' },
                ],
              },
              {
                name: 'lib',
                children: [
                  { name: 'archiveHandler.d.ts' },
                  { name: 'typeScriptCompiler.d.ts' },
                ],
              },
            ],
          },
          { name: 'index.d.ts' },
        ],
      });
    });

    it('correctly enrich webpack config', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          exposes: {
            './index': join(__dirname, './index.ts'),
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
          },
        },
        deleteTestsFolder: false,
        testsFolder: '@mf-tests',
      };

      const webpackCompiler = {
        options: {
          devServer: {
            foo: {},
          },
        },
      } as unknown as Compiler;

      const unplugin = NativeFederationTypeScriptRemote.rollup(
        options,
      ) as UnpluginOptions;
      await unplugin.webpack?.(webpackCompiler);

      expect(webpackCompiler).toStrictEqual({
        options: {
          devServer: {
            foo: {},
            static: {
              directory: resolve('./dist'),
            },
          },
        },
      });
    });

    it('correctly enrich rspack config', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          exposes: {
            './index': join(__dirname, './index.ts'),
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
          },
        },
        deleteTestsFolder: false,
        testsFolder: '@mf-tests',
      };

      const rspackCompiler = {
        options: {
          devServer: {
            foo: {},
          },
        },
      } as any;

      const unplugin = NativeFederationTypeScriptRemote.rollup(
        options,
      ) as UnpluginOptions;

      unplugin.rspack?.(rspackCompiler);

      expect(rspackCompiler).toStrictEqual({
        options: {
          devServer: {
            foo: {},
            static: {
              directory: resolve('./dist'),
            },
          },
        },
      });
    });
  });

  describe('NativeFederationTypeScriptHost', () => {
    it('throws for missing moduleFederationConfig', () => {
      // @ts-expect-error missing moduleFederationConfig
      const writeBundle = () => NativeFederationTypeScriptHost.rollup({});
      expect(writeBundle).toThrowError('moduleFederationConfig is required');
    });

    it.skip('correctly writeBundle', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          remotes: {
            remotes: 'https://foo.it',
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
          },
        },
        typesFolder: '@mf-types',
      };

      const distFolder = join(projectRoot, 'dist', options.typesFolder);
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(distFolder, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      const unplugin = NativeFederationTypeScriptHost.rollup(
        options,
      ) as UnpluginOptions;
      await expect(unplugin.writeBundle?.()).resolves.not.toThrow();

      const typesFolder = join(projectRoot, options.typesFolder);

      expect(dirTree(typesFolder)).toMatchObject({
        name: '@mf-types',
        children: [
          {
            name: 'remotes',
            children: [
              {
                name: 'compiled-types',
                children: [
                  {
                    name: 'configurations',
                    children: [
                      { name: 'hostPlugin.d.ts' },
                      { name: 'remotePlugin.d.ts' },
                    ],
                  },
                  {
                    name: 'index.d.ts',
                  },
                  {
                    name: 'interfaces',
                    children: [
                      { name: 'HostOptions.d.ts' },
                      { name: 'RemoteOptions.d.ts' },
                    ],
                  },
                  {
                    name: 'lib',
                    children: [
                      { name: 'archiveHandler.d.ts' },
                      { name: 'typeScriptCompiler.d.ts' },
                    ],
                  },
                ],
              },
              { name: 'index.d.ts' },
            ],
          },
        ],
      });

      await rm(options.typesFolder, { recursive: true, force: true });
    });
  });
});
