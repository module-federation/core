import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { DTSManager } from './DTSManager';
import { UpdateMode } from '../../server/constant';

const TEST_DIT_DIR = 'dist-test';

describe('DTSManager', () => {
  const projectRoot = join(__dirname, '../../..');
  const typesFolder = '@mf-types-dts-test';
  const remoteOptions = {
    moduleFederationConfig: {
      name: 'dtsManagerSpecRemote',
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
  };

  const hostOptions = {
    moduleFederationConfig: {
      name: 'dtsManagerSpecHost',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://foo.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    typesFolder: `${TEST_DIT_DIR}/@mf-types-dts-test-consume-types`,
    context: projectRoot,
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

  it('generate types', async () => {
    const distFolder = join(
      projectRoot,
      TEST_DIT_DIR,
      remoteOptions.typesFolder,
    );
    await dtsManager.generateTypes();

    expect(
      dirTree(distFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      }),
    ).toMatchObject({
      name: '@mf-types-dts-test',
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
    });
  });

  describe('consumeTypes', async () => {
    const expectedStructure = {
      name: '@mf-types-dts-test-consume-types',
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
    };
    const targetFolder = join(projectRoot, hostOptions.typesFolder);
    it('correct consumeTypes', async () => {
      const distFolder = join(projectRoot, TEST_DIT_DIR, typesFolder);
      const zip = new AdmZip();
      await zip.addLocalFolderPromise(distFolder, {});
      axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });
      await dtsManager.consumeTypes();

      expect(
        dirTree(targetFolder, {
          exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
        }),
      ).toMatchObject(expectedStructure);
    });

    it('no delete exist remote types if fetch new remote types failed', async () => {
      axios.get = vi.fn().mockRejectedValue(new Error('error'));
      await dtsManager.consumeTypes();
      expect(
        dirTree(targetFolder, {
          exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
        }),
      ).toMatchObject(expectedStructure);
    });
  });

  it('update self while updateMode is POSITIVE', async () => {
    const distFolder = join(
      projectRoot,
      TEST_DIT_DIR,
      remoteOptions.typesFolder,
    );

    await dtsManager.updateTypes({
      remoteName: hostOptions.moduleFederationConfig.name,
      remoteTarPath: '',
      updateMode: UpdateMode.POSITIVE,
    });
    expect(
      dirTree(distFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/, ,],
      }),
    ).toMatchObject({
      name: '@mf-types-dts-test',
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
    });
  });

  it('update specific remote while updateMode is PASSIVE', async () => {
    const targetFolder = join(projectRoot, hostOptions.typesFolder);
    rmSync(targetFolder, { recursive: true });
    expect(existsSync(targetFolder)).toEqual(false);

    const distFolder = join(projectRoot, TEST_DIT_DIR, typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});
    axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

    await dtsManager.updateTypes({
      remoteName: 'remote',
      remoteTarPath: '',
      updateMode: UpdateMode.PASSIVE,
    });

    expect(
      dirTree(targetFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      }),
    ).toMatchObject({
      name: '@mf-types-dts-test-consume-types',
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
