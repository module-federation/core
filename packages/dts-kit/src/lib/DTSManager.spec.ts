import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rm } from 'fs/promises';
import fs from 'fs';
import { join } from 'path';
import { UnpluginOptions } from 'unplugin';
import { describe, expect, it, vi } from 'vitest';
import { HostOptions } from '../interfaces/HostOptions';
import { DTSManager } from './DTSManager';
import { UpdateMode } from '@module-federation/dev-server';

describe('DTSManager', () => {
  const projectRoot = join(__dirname, '..', '..', '..', '..');
  const typesFolder = '@mf-types-dts-test';
  const remoteOptions = {
    moduleFederationConfig: {
      name: 'moduleFederationTypescript',
      filename: 'remoteEntry.js',
      exposes: {
        './index': join(__dirname, '..', './index.ts'),
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    tsConfigPath: join(__dirname, '../..', './tsconfig.json'),
    typesFolder: typesFolder,
    compiledTypesFolder: 'compiled-types',
    deleteTypesFolder: false,
    additionalFilesToCompile: [],
    context: process.cwd(),
  };

  const hostOptions = {
    moduleFederationConfig: {
      name: 'moduleFederationTypescript',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://foo.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    typesFolder: 'dist/@mf-types-dts-test-consume-types',
  };

  const dtsManager = new DTSManager({
    remote: remoteOptions,
    host: hostOptions,
  });

  it('generate types', async () => {
    const distFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
    await dtsManager.generateTypes();

    expect(dirTree(distFolder)).toMatchObject({
      name: typesFolder,
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

  it('correct consumeTypes', async () => {
    const distFolder = join(projectRoot, 'dist', typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});
    axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

    await dtsManager.consumeTypes();

    const targetFolder = join(projectRoot, hostOptions.typesFolder);
    expect(dirTree(targetFolder)).toMatchObject({
      name: '@mf-types-dts-test-consume-types',
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

  it('update self while updateMode is POSITIVE', async () => {
    const distFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
    await rm(distFolder, { recursive: true, force: true });
    expect(fs.existsSync(distFolder)).toEqual(false);
    await dtsManager.updateTypes({
      remoteName: remoteOptions.moduleFederationConfig.name,
      remoteTarPath: '',
      updateMode: UpdateMode.POSITIVE,
    });

    expect(dirTree(distFolder)).toMatchObject({
      name: typesFolder,
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

  it('update specific remote while updateMode is PASSIVE', async () => {
    const targetFolder = join(projectRoot, hostOptions.typesFolder);

    await rm(targetFolder, { recursive: true, force: true });
    expect(fs.existsSync(targetFolder)).toEqual(false);

    const distFolder = join(projectRoot, 'dist', typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});
    axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

    await dtsManager.updateTypes({
      remoteName: 'remote',
      remoteTarPath: '',
      updateMode: UpdateMode.PASSIVE,
    });

    expect(dirTree(targetFolder)).toMatchObject({
      name: '@mf-types-dts-test-consume-types',
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
