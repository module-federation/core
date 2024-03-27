import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import fs from 'fs';
import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { DTSManager } from './DTSManager';

describe('DTSManager advance usage', () => {
  const projectRoot = join(__dirname, '..', '..', '..', '..');
  const typesFolder = '@mf-types-dts-test-advance';
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
    generateAPITypes: true,
  };

  const hostOptions = {
    moduleFederationConfig: {
      name: 'moduleFederationTypescript',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://bar.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    typesFolder: 'dist/@mf-types-dts-test-consume-types-advance',
  };

  const dtsManager = new DTSManager({
    remote: remoteOptions,
    host: hostOptions,
  });

  it('generate types with api declaration file', async () => {
    const distFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
    await dtsManager.generateTypes();

    const apiFile = `${distFolder}.d.ts`;
    expect(fs.readFileSync(apiFile, 'utf8')).toEqual(`
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/index';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/index' ? typeof import('REMOTE_ALIAS_IDENTIFIER/index') :any;`);
  });

  it('correct consumeTypes', async () => {
    const distFolder = join(projectRoot, 'dist', typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});

    const apiDistFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
    const apiFile = `${apiDistFolder}.d.ts`;
    // const prevAxiosGet = axios.get;
    axios.get = (url) => {
      if (url.includes('.d.ts')) {
        return vi
          .fn()
          .mockResolvedValueOnce({ data: fs.readFileSync(apiFile, 'utf8') })();
      }
      return vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() })();
    };

    await dtsManager.consumeTypes();

    const targetFolder = join(projectRoot, hostOptions.typesFolder);
    expect(dirTree(targetFolder, { exclude: /node_modules/ })).toMatchObject({
      name: '@mf-types-dts-test-consume-types-advance',
      children: [
        {
          name: 'index.d.ts',
        },
        {
          children: [
            {
              name: 'apis.d.ts',
            },
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
