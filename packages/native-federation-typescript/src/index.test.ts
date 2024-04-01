import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rm } from 'fs/promises';
import { join } from 'path';
import { UnpluginOptions } from 'unplugin';
import { describe, expect, it, vi } from 'vitest';
import webpack from 'webpack';
import { rspack } from '@rspack/core';

import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from './index';
import { RemoteOptions } from '@module-federation/dts-kit';

describe('index', () => {
  const projectRoot = join(__dirname, '..', '..', '..');

  describe('NativeFederationTypeScriptRemote', () => {
    it('throws for missing moduleFederationConfig', () => {
      const writeBundle = () => NativeFederationTypeScriptRemote.rollup({});
      expect(writeBundle).toThrowError('moduleFederationConfig is required');
    });

    it('correctly writeBundle', async () => {
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
      await rm(distFolder, { recursive: true, force: true });

      const unplugin = NativeFederationTypeScriptRemote.rollup(
        options,
      ) as UnpluginOptions;
      await unplugin.writeBundle?.();
      expect(dirTree(distFolder, { exclude: /node_modules/ })).toMatchObject({
        name: '@mf-types',
        children: [
          {
            name: 'compiled-types',
            children: [{ name: 'index.d.ts' }],
          },
          { name: 'index.d.ts' },
        ],
      });
    });

    it('correctly enrich webpack config', async () => {
      const options: RemoteOptions = {
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
        deleteTypesFolder: false,
        typesFolder: '@mf-tests-webpack',
      };

      console.log('webpack options: ', JSON.stringify(options));
      const distFolder = join(projectRoot, 'dist', options.typesFolder!);
      await rm(distFolder, { recursive: true, force: true });

      const webpackCompiler = webpack({
        target: 'web',
        entry: 'data:application/node;base64,',
        output: {
          publicPath: '/',
        },
        plugins: [NativeFederationTypeScriptRemote.webpack(options)],
      });

      const assets = (await new Promise((resolve, reject) => {
        webpackCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          webpackCompiler.close((closeErr) => {
            if (closeErr) {
              console.error(closeErr);
              reject(closeErr);
            } else {
              resolve(stats?.toJson().assets as webpack.StatsAsset[]);
            }
          });
        });
      })) as webpack.StatsAsset[];
      console.log('compile webpack done');

      expect(
        Boolean(assets.find((asset) => asset.name === '@mf-tests-webpack.zip')),
      ).toEqual(true);

      expect(dirTree(distFolder, { exclude: /node_modules/ })).toMatchObject({
        name: '@mf-tests-webpack',
        children: [
          {
            name: 'compiled-types',
            children: [{ name: 'index.d.ts' }],
          },
          { name: 'index.d.ts' },
        ],
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
        tsConfigPath: join(__dirname, '..', './tsconfig.json'),
        deleteTypesFolder: false,
        typesFolder: '@mf-tests-rspack',
      };
      console.log('rspack options: ', JSON.stringify(options));
      const distFolder = join(projectRoot, 'dist', options.typesFolder!);

      await rm(distFolder, { recursive: true, force: true });

      const rspackCompiler = rspack({
        target: 'web',
        entry: 'data:application/node;base64,',
        output: {
          publicPath: '/',
        },
        // @ts-expect-error ignore
        plugins: [NativeFederationTypeScriptRemote.rspack(options)],
      });

      const assets = (await new Promise((resolve, reject) => {
        rspackCompiler.run((err, stats) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          rspackCompiler.close((closeErr) => {
            if (closeErr) {
              console.error(closeErr);
              reject(closeErr);
            } else {
              resolve(stats?.toJson().assets as webpack.StatsAsset[]);
            }
          });
        });
      })) as webpack.StatsAsset[];
      console.log('compile rspack done');
      expect(
        Boolean(assets.find((asset) => asset.name === '@mf-tests-rspack.zip')),
      ).toEqual(true);

      expect(dirTree(distFolder, { exclude: /node_modules/ })).toMatchObject({
        name: '@mf-tests-rspack',
        children: [
          {
            name: 'compiled-types',
            children: [{ name: 'index.d.ts' }],
          },
          { name: 'index.d.ts' },
        ],
      });
    });
  });

  describe('NativeFederationTypeScriptHost', () => {
    it('throws for missing moduleFederationConfig', () => {
      const writeBundle = () => NativeFederationTypeScriptHost.rollup({});
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
        typesFolder: 'dist/@mf-types-host',
      };

      const distFolder = join(projectRoot, 'dist', '@mf-types');
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(distFolder, {});

      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

      const unplugin = NativeFederationTypeScriptHost.rollup(
        options,
      ) as UnpluginOptions;
      await expect(unplugin.writeBundle?.()).resolves.not.toThrow();

      const typesFolder = join(projectRoot, options.typesFolder);
      expect(dirTree(typesFolder, { exclude: /node_modules/ })).toMatchObject({
        name: '@mf-types-host',
        children: [
          {
            children: [
              {
                children: [
                  {
                    name: 'index.d.ts',
                  },
                ],
                name: 'compiled-types',
              },
              {
                name: 'index.d.ts',
              },
            ],
            name: 'remotes',
          },
        ],
      });

      await rm(options.typesFolder, { recursive: true, force: true });
    });
  });
});
