import { describe, expect, it } from 'vitest';
import { join } from 'path';
import dirTree from 'directory-tree';
import { execSync } from 'child_process';
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
