import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rm } from 'fs/promises';
import { join, resolve } from 'path';
import { UnpluginOptions } from 'unplugin';
import { describe, expect, it, vi } from 'vitest';

import {
  NativeFederationTestsHost,
  NativeFederationTestsRemote,
} from './index';

describe('index', () => {
  const projectRoot = join(__dirname, '..', '..', '..');
  const exposedIndex = join(__dirname, 'index.ts');

  describe('NativeFederationTestsRemote', () => {
    it('throws for missing moduleFederationConfig', () => {
      // @ts-expect-error missing moduleFederationConfig
      const writeBundle = () => NativeFederationTestsRemote.rollup({});
      expect(writeBundle).toThrowError('moduleFederationConfig is required');
    });

    it('correctly writeBundle', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          exposes: {
            index: exposedIndex,
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
          },
        },
        deleteTestsFolder: false,
        testsFolder: '@mf-tests',
      };

      const distFolder = join(projectRoot, 'dist', options.testsFolder);

      const unplugin = NativeFederationTestsRemote.rollup(
        options,
      ) as UnpluginOptions;
      await unplugin.writeBundle?.();

      expect(dirTree(distFolder)).toMatchObject({
        name: '@mf-tests',
        children: [{ name: 'index.js' }],
      });
    });

    it('correctly enrich webpack config', async () => {
      const options = {
        moduleFederationConfig: {
          name: 'moduleFederationTypescript',
          filename: 'remoteEntry.js',
          exposes: {
            './index': exposedIndex,
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
      };

      const unplugin = NativeFederationTestsRemote.rollup(
        options,
      ) as UnpluginOptions;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
            './index': exposedIndex,
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

      const unplugin = NativeFederationTestsRemote.rollup(
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

  describe('NativeFederationTestsHost', () => {
    it('throws for missing moduleFederationConfig', () => {
      // @ts-expect-error missing moduleFederationConfig
      const writeBundle = () => NativeFederationTestsHost.rollup({});
      expect(writeBundle).toThrowError('moduleFederationConfig is required');
    });

    it('correctly writeBundle', async () => {
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
        testsFolder: '@mf-tests',
        mocksFolder: '__mocks__',
      };

      const distFolder = join(projectRoot, 'dist', options.testsFolder);
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(distFolder, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      const unplugin = NativeFederationTestsHost.rollup(
        options,
      ) as UnpluginOptions;
      await expect(unplugin.writeBundle?.()).resolves.not.toThrow();

      const testsFolder = join(projectRoot, options.mocksFolder);

      expect(dirTree(testsFolder)).toMatchObject({
        name: '__mocks__',
        children: [
          {
            name: 'remotes',
            children: [{ name: 'index.js' }],
          },
        ],
      });

      await rm(options.mocksFolder, { recursive: true, force: true });
    });
  });
});
