import AdmZip from 'adm-zip';
import axios from 'axios';
import dirTree from 'directory-tree';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi, afterAll } from 'vitest';
import { DTSManager } from './DTSManager';
import { UpdateMode } from '../../server/constant';

describe('DTSManager', () => {
  const projectRoot = join(__dirname, '..', '..', '..', '..', '..');
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
    tsConfigPath: join(__dirname, '../../..', './tsconfig.json'),
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

  afterAll(() => {
    [
      join(projectRoot, 'dist', remoteOptions.typesFolder),
      join(projectRoot, hostOptions.typesFolder),
    ].forEach((tmpDir) => {
      rmSync(tmpDir, { recursive: true });
    });
  });

  it('generate types', async () => {
    const distFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
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

  it('correct consumeTypes', async () => {
    const distFolder = join(projectRoot, 'dist', typesFolder);
    const zip = new AdmZip();
    await zip.addLocalFolderPromise(distFolder, {});
    axios.get = vi.fn().mockResolvedValueOnce({ data: zip.toBuffer() });

    await dtsManager.consumeTypes();

    const targetFolder = join(projectRoot, hostOptions.typesFolder);
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

  it('update self while updateMode is POSITIVE', async () => {
    const distFolder = join(projectRoot, 'dist', remoteOptions.typesFolder);
    rmSync(distFolder, { recursive: true });
    expect(existsSync(distFolder)).toEqual(false);
    await dtsManager.updateTypes({
      remoteName: remoteOptions.moduleFederationConfig.name,
      remoteTarPath: '',
      updateMode: UpdateMode.POSITIVE,
    });

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

    const distFolder = join(projectRoot, 'dist', typesFolder);
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
