import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import dirTree from 'directory-tree';
import { execSync } from 'child_process';
import { isDebugMode } from './utils';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

const TEST_DIT_DIR = 'dist-test';

describe('generateTypesInChildProcess', () => {
  const projectRoot = join(__dirname, '../../..');
  const typesFolder = '@mf-types-dts-test-child-process';
  const remoteOptions = {
    moduleFederationConfig: {
      name: 'dtsWorkerSpecRemote',
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
    context: projectRoot,
    moduleFederationConfig: {
      name: 'dtsWorkerSpecHost',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://foo.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    },
    typesFolder: `${TEST_DIT_DIR}/@mf-types-dts-test-child-process-consume-types`,
  };

  it('generateTypesInChildProcess', async () => {
    // createRpcWorker will use dist assets , so it need to test dist
    const { DtsWorker } =
      require('../../../dist/core') as typeof import('../index');
    const dtsWorker = new DtsWorker({
      host: hostOptions,
      remote: remoteOptions,
    });
    const distFolder = join(
      projectRoot,
      TEST_DIT_DIR,
      remoteOptions.typesFolder,
    );
    const pid = dtsWorker.rpcWorker.process?.pid;
    if (!pid) {
      throw new Error('pid must be existed!');
    }
    const checkProcess = () => {
      try {
        const stdout = execSync(`ps -p ${pid} | grep -v '<defunct>'`)
          .toString()
          .split('\n');
        console.log('stdout: ', stdout);
        const rootPid = process.pid;
        console.log('rootPid: ', rootPid);
        console.log('child process pid: ', pid);
        if (rootPid === pid) {
          return true;
        }
        return Boolean(stdout[1].length);
      } catch (err) {
        console.error(err);
        return false;
      }
    };
    expect(checkProcess()).toEqual(true);
    await dtsWorker.controlledPromise;
    expect(
      dirTree(distFolder, {
        exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
      }),
    ).toMatchObject({
      name: '@mf-types-dts-test-child-process',
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
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
    // the child process should be killed after generateTypes
    expect(checkProcess()).toEqual(false);
  });
});

describe('DtsWorker Unit Tests', () => {
  let dtsWorker: any;
  let originalKill: typeof process.kill;
  let originalDebugMode: typeof isDebugMode;
  let DtsWorkerClass: any;

  const projectRoot = join(__dirname, '../../..');
  const typesFolder = '@mf-types-dts-test';

  const mockRemoteOptions = {
    moduleFederationConfig: {
      name: 'dtsWorkerSpecRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './index': join(__dirname, '..', './index.ts'),
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
      manifest: true,
    },
    tsConfigPath: join(projectRoot, './tsconfig.spec.json'),
    typesFolder: typesFolder,
    compiledTypesFolder: 'compiled-types',
    deleteTypesFolder: false,
    additionalFilesToCompile: [],
    context: projectRoot,
    extractRemoteTypes: true,
  };

  const mockHostOptions = {
    moduleFederationConfig: {
      name: 'dtsWorkerSpecHost',
      filename: 'remoteEntry.js',
      remotes: {
        remotes: 'remote@https://foo.it',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
      manifest: true,
    },
    typesFolder: `dist-test/@mf-types-dts-test-consume-types`,
    context: projectRoot,
    deleteTypesFolder: true,
    remoteTypesFolder: 'remote-types',
  };

  const mockOptions: DTSManagerOptions = {
    host: mockHostOptions,
    remote: mockRemoteOptions,
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    originalKill = process.kill;
    originalDebugMode = isDebugMode;
    DtsWorkerClass = require('../../../dist/core').DtsWorker;
    // Reset isDebugMode for each test
    vi.mock('./utils', () => ({
      isDebugMode: () => false,
      cloneDeepOptions: (options: any) => JSON.parse(JSON.stringify(options)),
    }));
    // Mock logger
    vi.mock('../../server', () => ({
      logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
      fileLog: vi.fn(),
    }));
  });

  afterEach(async () => {
    if (dtsWorker) {
      try {
        dtsWorker.exit();
      } catch (err) {
        // Ignore exit errors
      }
      dtsWorker = null;
    }
    process.kill = originalKill;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('initialization', () => {
    it('should create a new instance with valid options', () => {
      dtsWorker = new DtsWorkerClass(mockOptions);

      expect(dtsWorker).toBeDefined();
      expect(dtsWorker.rpcWorker).toBeDefined();
      expect(dtsWorker._options).toBeDefined();
    });

    it('should remove unserializable manifest data from options', () => {
      const optionsWithManifest = {
        ...mockOptions,
        remote: {
          ...mockOptions.remote,
          moduleFederationConfig: {
            ...mockOptions.remote.moduleFederationConfig,
            manifest: { some: 'data' },
          },
        },
      };

      vi.mock('./utils', () => ({
        isDebugMode: () => false,
        cloneDeepOptions: (options: any) => {
          const cloned = JSON.parse(JSON.stringify(options));
          if (cloned.remote?.moduleFederationConfig?.manifest) {
            delete cloned.remote.moduleFederationConfig.manifest;
          }
          if (cloned.host?.moduleFederationConfig?.manifest) {
            delete cloned.host.moduleFederationConfig.manifest;
          }
          return cloned;
        },
      }));

      dtsWorker = new DtsWorkerClass(optionsWithManifest);
      expect(
        dtsWorker._options.remote.moduleFederationConfig.manifest,
      ).toBeFalsy();
    });
  });

  describe('process management', () => {
    it('should handle exit gracefully when worker termination fails', async () => {
      dtsWorker = new DtsWorkerClass(mockOptions);

      dtsWorker.rpcWorker.terminate = () => {
        throw new Error('Termination failed');
      };

      expect(() => dtsWorker.exit()).not.toThrow();
    });

    it('should ensure child process exits even when promise rejects', async () => {
      vi.mock('../rpc/index', () => ({
        createRpcWorker: () => ({
          connect: () => Promise.resolve(),
          terminate: vi.fn(),
          process: {
            pid: process.pid,
            connected: true,
            send: (message: any, callback?: (error: Error | null) => void) => {
              if (callback) callback(null);
            },
          },
        }),
      }));

      dtsWorker = new DtsWorkerClass(mockOptions);
      dtsWorker._res = Promise.reject(new Error('Test error'));

      await expect(dtsWorker.controlledPromise).resolves.toBeUndefined();
    });
  });

  describe('debug mode handling', () => {
    it('should log errors in debug mode', async () => {
      vi.mock('./utils', () => ({
        isDebugMode: () => true,
        cloneDeepOptions: (options: any) => JSON.parse(JSON.stringify(options)),
      }));

      vi.mock('../rpc/index', () => ({
        createRpcWorker: () => ({
          connect: () => Promise.resolve(),
          terminate: vi.fn(),
          process: {
            pid: process.pid,
            connected: true,
            send: (message: any, callback?: (error: Error | null) => void) => {
              if (callback) callback(null);
            },
          },
        }),
      }));

      const consoleSpy = vi.spyOn(console, 'error');
      dtsWorker = new DtsWorkerClass(mockOptions);
      dtsWorker._res = Promise.reject(new Error('Test error'));

      await dtsWorker.controlledPromise;
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not log errors when not in debug mode', async () => {
      vi.mock('./utils', () => ({
        isDebugMode: () => false,
        cloneDeepOptions: (options: any) => JSON.parse(JSON.stringify(options)),
      }));

      vi.mock('../rpc/index', () => ({
        createRpcWorker: () => ({
          connect: () => Promise.resolve(),
          terminate: vi.fn(),
          process: {
            pid: process.pid,
            connected: true,
            send: (message: any, callback?: (error: Error | null) => void) => {
              if (callback) callback(null);
            },
          },
        }),
      }));

      const consoleSpy = vi.spyOn(console, 'error');
      dtsWorker = new DtsWorkerClass(mockOptions);

      // Mock process.kill to not throw
      process.kill = vi.fn();

      // Mock the promise to resolve normally
      dtsWorker._res = Promise.resolve();

      // Clear any previous calls to console.error
      consoleSpy.mockClear();

      await dtsWorker.controlledPromise;
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
