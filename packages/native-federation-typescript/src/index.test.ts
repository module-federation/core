import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rmSync } from 'fs';
import { join } from 'path';
import { UnpluginOptions } from 'unplugin';
import { describe, expect, it, vi, afterAll } from 'vitest';
import webpack from 'webpack';
import { rspack } from '@rspack/core';

import {
  NativeFederationTypeScriptHost,
  NativeFederationTypeScriptRemote,
} from './index';
import { RemoteOptions } from './helpers';

describe('index', () => {
  const projectRoot = join(__dirname, '..', '..', '..');
  afterAll(() => {
    [
      join(projectRoot, 'dist', '@mf-types'),
      join(projectRoot, 'dist', '@mf-tests-webpack'),
      join(projectRoot, 'dist', '@mf-tests-rspack'),
      join(projectRoot, 'dist', '@mf-types-host'),
    ].forEach((tmpDir) => {
      rmSync(tmpDir, { recursive: true });
    });
  });
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

      const unplugin = NativeFederationTypeScriptRemote.rollup(
        options,
      ) as UnpluginOptions;
      await unplugin.writeBundle?.();
      expect(dirTree(distFolder, { exclude: /node_modules/ })).toMatchObject({
        name: '@mf-types',
        children: [
          {
            children: [
              {
                children: [
                  {
                    name: 'hostPlugin.d.ts',
                  },
                  {
                    name: 'remotePlugin.d.ts',
                  },
                ],
                name: 'configurations',
              },
              {
                name: 'constant.d.ts',
              },
              {
                name: 'helpers.d.ts',
              },
              {
                name: 'index.d.ts',
              },
              {
                children: [
                  {
                    name: 'DTSManagerOptions.d.ts',
                  },
                  {
                    name: 'HostOptions.d.ts',
                  },
                  {
                    name: 'RemoteOptions.d.ts',
                  },
                ],
                name: 'interfaces',
              },
              {
                children: [
                  {
                    name: 'DTSManager.d.ts',
                  },
                  {
                    name: 'DtsWorker.d.ts',
                  },
                  {
                    name: 'archiveHandler.d.ts',
                  },
                  {
                    name: 'consumeTypes.d.ts',
                  },
                  {
                    name: 'generateTypes.d.ts',
                  },
                  {
                    name: 'generateTypesInChildProcess.d.ts',
                  },
                  {
                    name: 'typeScriptCompiler.d.ts',
                  },
                  {
                    name: 'utils.d.ts',
                  },
                ],
                name: 'lib',
              },
              {
                children: [
                  {
                    name: 'expose-rpc.d.ts',
                  },
                  {
                    name: 'index.d.ts',
                  },
                  {
                    name: 'rpc-error.d.ts',
                  },
                  {
                    name: 'rpc-worker.d.ts',
                  },
                  {
                    name: 'types.d.ts',
                  },
                  {
                    name: 'wrap-rpc.d.ts',
                  },
                ],
                name: 'rpc',
              },
            ],
            name: 'compiled-types',
          },
          {
            name: 'index.d.ts',
          },
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
            children: [
              {
                children: [
                  {
                    name: 'hostPlugin.d.ts',
                  },
                  {
                    name: 'remotePlugin.d.ts',
                  },
                ],
                name: 'configurations',
              },
              {
                name: 'constant.d.ts',
              },
              {
                name: 'helpers.d.ts',
              },
              {
                name: 'index.d.ts',
              },
              {
                children: [
                  {
                    name: 'DTSManagerOptions.d.ts',
                  },
                  {
                    name: 'HostOptions.d.ts',
                  },
                  {
                    name: 'RemoteOptions.d.ts',
                  },
                ],
                name: 'interfaces',
              },
              {
                children: [
                  {
                    name: 'DTSManager.d.ts',
                  },
                  {
                    name: 'DtsWorker.d.ts',
                  },
                  {
                    name: 'archiveHandler.d.ts',
                  },
                  {
                    name: 'consumeTypes.d.ts',
                  },
                  {
                    name: 'generateTypes.d.ts',
                  },
                  {
                    name: 'generateTypesInChildProcess.d.ts',
                  },
                  {
                    name: 'typeScriptCompiler.d.ts',
                  },
                  {
                    name: 'utils.d.ts',
                  },
                ],
                name: 'lib',
              },
              {
                children: [
                  {
                    name: 'expose-rpc.d.ts',
                  },
                  {
                    name: 'index.d.ts',
                  },
                  {
                    name: 'rpc-error.d.ts',
                  },
                  {
                    name: 'rpc-worker.d.ts',
                  },
                  {
                    name: 'types.d.ts',
                  },
                  {
                    name: 'wrap-rpc.d.ts',
                  },
                ],
                name: 'rpc',
              },
            ],
            name: 'compiled-types',
          },
          {
            name: 'index.d.ts',
          },
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
            children: [
              {
                children: [
                  {
                    name: 'hostPlugin.d.ts',
                  },
                  {
                    name: 'remotePlugin.d.ts',
                  },
                ],
                name: 'configurations',
              },
              {
                name: 'constant.d.ts',
              },
              {
                name: 'helpers.d.ts',
              },
              {
                name: 'index.d.ts',
              },
              {
                children: [
                  {
                    name: 'DTSManagerOptions.d.ts',
                  },
                  {
                    name: 'HostOptions.d.ts',
                  },
                  {
                    name: 'RemoteOptions.d.ts',
                  },
                ],
                name: 'interfaces',
              },
              {
                children: [
                  {
                    name: 'DTSManager.d.ts',
                  },
                  {
                    name: 'DtsWorker.d.ts',
                  },
                  {
                    name: 'archiveHandler.d.ts',
                  },
                  {
                    name: 'consumeTypes.d.ts',
                  },
                  {
                    name: 'generateTypes.d.ts',
                  },
                  {
                    name: 'generateTypesInChildProcess.d.ts',
                  },
                  {
                    name: 'typeScriptCompiler.d.ts',
                  },
                  {
                    name: 'utils.d.ts',
                  },
                ],
                name: 'lib',
              },
              {
                children: [
                  {
                    name: 'expose-rpc.d.ts',
                  },
                  {
                    name: 'index.d.ts',
                  },
                  {
                    name: 'rpc-error.d.ts',
                  },
                  {
                    name: 'rpc-worker.d.ts',
                  },
                  {
                    name: 'types.d.ts',
                  },
                  {
                    name: 'wrap-rpc.d.ts',
                  },
                ],
                name: 'rpc',
              },
            ],
            name: 'compiled-types',
          },
          {
            name: 'index.d.ts',
          },
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
                    children: [
                      {
                        name: 'hostPlugin.d.ts',
                      },
                      {
                        name: 'remotePlugin.d.ts',
                      },
                    ],
                    name: 'configurations',
                  },
                  {
                    name: 'constant.d.ts',
                  },
                  {
                    name: 'helpers.d.ts',
                  },
                  {
                    name: 'index.d.ts',
                  },
                  {
                    children: [
                      {
                        name: 'DTSManagerOptions.d.ts',
                      },
                      {
                        name: 'HostOptions.d.ts',
                      },
                      {
                        name: 'RemoteOptions.d.ts',
                      },
                    ],
                    name: 'interfaces',
                  },
                  {
                    children: [
                      {
                        name: 'DTSManager.d.ts',
                      },
                      {
                        name: 'DtsWorker.d.ts',
                      },
                      {
                        name: 'archiveHandler.d.ts',
                      },
                      {
                        name: 'consumeTypes.d.ts',
                      },
                      {
                        name: 'generateTypes.d.ts',
                      },
                      {
                        name: 'generateTypesInChildProcess.d.ts',
                      },
                      {
                        name: 'typeScriptCompiler.d.ts',
                      },
                      {
                        name: 'utils.d.ts',
                      },
                    ],
                    name: 'lib',
                  },
                  {
                    children: [
                      {
                        name: 'expose-rpc.d.ts',
                      },
                      {
                        name: 'index.d.ts',
                      },
                      {
                        name: 'rpc-error.d.ts',
                      },
                      {
                        name: 'rpc-worker.d.ts',
                      },
                      {
                        name: 'types.d.ts',
                      },
                      {
                        name: 'wrap-rpc.d.ts',
                      },
                    ],
                    name: 'rpc',
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
    });
  });
});
