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
    remoteTypeUrls: {
      remotes: {
        zip: 'https://foo.it/@mf-types.zip',
        api: 'https://foo.it/@mf-types.d.ts',
        alias: 'remotes',
      },
    },
  };

  const dtsManager = new DTSManager({
    remote: remoteOptions,
    host: hostOptions,
  });

  beforeAll(async () => {
    try {
      rmSync(join(projectRoot, 'node_modules/.cache/mf-types'), {
        recursive: true,
      });
    } catch (err) {
      //noop
    }

    // Generate types once for all tests to use
    await dtsManager.generateTypes();
  }, 30000); // Increased timeout to 30 seconds

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

      // The types should already be generated in beforeAll
      expect(existsSync(distFolder)).toBeTruthy();

      const zip = new AdmZip();
      zip.addLocalFolder(distFolder);

      // Mock axios.get to handle multiple calls (for both API types and zip files)
      axios.get = vi.fn().mockImplementation((url, options) => {
        if (url.includes('.d.ts')) {
          // For API types file, return empty string or minimal content
          return Promise.resolve({ data: '', headers: {} });
        }
        // For zip file - convert Buffer to ArrayBuffer when responseType is 'arraybuffer'
        const buffer = zip.toBuffer();
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        );
        return Promise.resolve({
          data: options?.responseType === 'arraybuffer' ? arrayBuffer : buffer,
          headers: {
            'content-type': 'application/zip',
          },
        });
      });

      await dtsManager.consumeTypes();

      const initialTree = dirTree(targetFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      });
      expect(initialTree).toMatchObject(expectedStructure);
    });

    it('no delete exist remote types if fetch new remote types failed', async () => {
      // Ensure the folder exists from previous test or create it
      if (!existsSync(targetFolder)) {
        const distFolder = join(projectRoot, TEST_DIT_DIR, typesFolder);
        const zip = new AdmZip();
        zip.addLocalFolder(distFolder);
        // Mock axios.get to handle multiple calls
        axios.get = vi.fn().mockImplementation((url, options) => {
          if (url.includes('.d.ts')) {
            return Promise.resolve({ data: '', headers: {} });
          }
          // Convert Buffer to ArrayBuffer when responseType is 'arraybuffer'
          const buffer = zip.toBuffer();
          const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
          );
          return Promise.resolve({
            data:
              options?.responseType === 'arraybuffer' ? arrayBuffer : buffer,
            headers: {
              'content-type': 'application/zip',
            },
          });
        });
        await dtsManager.consumeTypes();
      }

      axios.get = vi.fn().mockRejectedValue(new Error('error'));
      await dtsManager.consumeTypes();
      const failedFetchTree = dirTree(targetFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      });
      expect(failedFetchTree).toMatchObject(expectedStructure);
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
    rmSync(targetFolder, { recursive: true, force: true });
    expect(existsSync(targetFolder)).toEqual(false);

    const distFolder = join(projectRoot, TEST_DIT_DIR, typesFolder);

    // The types should already be generated in beforeAll
    expect(existsSync(distFolder)).toBeTruthy();

    const zip = new AdmZip();
    zip.addLocalFolder(distFolder);
    // Mock axios.get to handle multiple calls
    axios.get = vi.fn().mockImplementation((url, options) => {
      if (url.includes('.d.ts')) {
        return Promise.resolve({ data: '', headers: {} });
      }
      // Convert Buffer to ArrayBuffer when responseType is 'arraybuffer'
      const buffer = zip.toBuffer();
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
      return Promise.resolve({
        data: options?.responseType === 'arraybuffer' ? arrayBuffer : buffer,
        headers: {
          'content-type': 'application/zip',
        },
      });
    });

    await dtsManager.updateTypes({
      remoteName: 'remote',
      remoteTarPath: '',
      updateMode: UpdateMode.PASSIVE,
    });

    // Check if directory was created
    const tree = dirTree(targetFolder, {
      exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
    });
    if (tree?.children?.[0]?.children) {
      tree.children[0].children = tree.children[0].children.filter(
        (child) => child.name !== 'apis.d.ts',
      );
    }

    expect(tree).toMatchObject({
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
