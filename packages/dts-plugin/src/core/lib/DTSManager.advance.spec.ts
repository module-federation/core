import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { DTSManager } from './DTSManager';
const TEST_DIT_DIR = 'dist-test';

describe('DTSManager advance usage', () => {
  const projectRoot = join(__dirname, '../../..');
  const typesFolder = '@mf-types-dts-test-advance';
  const remoteOptions = {
    moduleFederationConfig: {
      name: 'dtsManagerAdvanceSpecRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './index': join(__dirname, '..', './index.ts'),
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    tsConfigPath: join(projectRoot, './tsconfig.spec.json'),
    typesFolder: typesFolder,
    compiledTypesFolder: 'compiled-types',
    deleteTypesFolder: false,
    additionalFilesToCompile: [],
    context: projectRoot,
    generateAPITypes: true,
    extractRemoteTypes: true,
    extractThirdParty: true,
  };

  const hostOptions = {
    context: projectRoot,
    moduleFederationConfig: {
      name: 'dtsManagerAdvanceSpecHost',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://bar.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    typesFolder: `${TEST_DIT_DIR}/@mf-types-dts-test-consume-types-advance`,
    consumeAPITypes: true,
  };

  const dtsManager = new DTSManager({
    remote: remoteOptions,
    host: hostOptions,
  });

  beforeAll(() => {
    try {
      rmSync(join(projectRoot, 'node_modules/.cache/mf-types'), {
        recursive: true,
      });
    } catch (err) {
      //noop
    }
  });

  it('generate types with api declaration file', async () => {
    const distFolder = join(
      projectRoot,
      TEST_DIT_DIR,
      remoteOptions.typesFolder,
    );
    try {
      await dtsManager.generateTypes();
      console.log('generateTypes done');
    } catch (err) {
      console.log('generateTypes failed');
      console.error(err);
      console.log(err.stack);
    }

    const apiFile = `${distFolder}.d.ts`;
    expect(readFileSync(apiFile, 'utf8')).toEqual(`
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/index';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/index' ? typeof import('REMOTE_ALIAS_IDENTIFIER/index') :any;`);
  });

  it('correct consumeTypes', async () => {
    const distFolder = join(projectRoot, TEST_DIT_DIR, typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});

    const apiDistFolder = join(
      projectRoot,
      TEST_DIT_DIR,
      remoteOptions.typesFolder,
    );
    const apiFile = `${apiDistFolder}.d.ts`;
    // const prevAxiosGet = axios.get;
    axios.get = (url) => {
      if (url.includes('.d.ts')) {
        return vi
          .fn()
          .mockResolvedValueOnce({ data: readFileSync(apiFile, 'utf8') })();
      }
      return vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() })();
    };

    await dtsManager.consumeTypes();

    const targetFolder = join(projectRoot, hostOptions.typesFolder);
    expect(
      dirTree(targetFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      }),
    ).toMatchObject({
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
                                    {
                                      name: 'TsConfigJson.d.ts',
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
                              name: 'core',
                            },
                          ],
                          name: 'src',
                        },
                      ],
                      name: 'dts-plugin',
                    },
                  ],
                  name: 'packages',
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
