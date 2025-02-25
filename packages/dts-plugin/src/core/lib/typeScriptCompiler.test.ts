import dirTree from 'directory-tree';
import { rmSync } from 'fs';
import { readJSONSync, ensureDirSync } from 'fs-extra';
import os from 'os';
import { join, resolve, sep } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import type { TsConfigJson } from '../interfaces/TsConfigJson';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import {
  compileTs,
  retrieveMfTypesPath,
  retrieveOriginalOutDir,
} from './typeScriptCompiler';

describe('typeScriptCompiler', () => {
  const tmpDir = join(os.tmpdir(), 'typeScriptCompiler');

  const basicConfig = readJSONSync(
    join(__dirname, '../../..', './tsconfig.spec.json'),
  );
  const projectRoot = join(__dirname, '../../..');

  const tsConfig: TsConfigJson = {
    ...basicConfig,
    extends: resolve(projectRoot, basicConfig.extends),
    compilerOptions: {
      ...basicConfig.compilerOptions,
      outDir: join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
      rootDir: projectRoot,
      emitDeclarationOnly: true,
      noEmit: false,
      declaration: true,
    },
  };

  ensureDirSync(join(tmpDir, 'typesRemoteFolder'));

  const remoteOptions: Required<RemoteOptions> = {
    additionalFilesToCompile: [],
    compiledTypesFolder: 'compiledTypesFolder',
    typesFolder: 'typesRemoteFolder',
    moduleFederationConfig: {},
    tsConfigPath: './tsconfig.spec.json',
    deleteTypesFolder: false,
    compilerInstance: 'tsc',
    compileInChildProcess: false,
    generateAPITypes: false,
    extractThirdParty: false,
    extractRemoteTypes: false,
    implementation: '',
    context: projectRoot,
    hostRemoteTypesFolder: '@mf-types',
    abortOnError: true,
    outputDir: 'outputDir',
  };

  it('retrieveMfTypesPath correctly calculate path', () => {
    const expectedPath = join(tmpDir, 'typesRemoteFolder') + sep;
    const retrievedMfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);

    expect(retrievedMfTypesPath).toBe(expectedPath);
  });

  it('retrieveOriginalOutDir correctly calculate path', () => {
    const expectedPath = tmpDir + sep;
    const retrievedOriginalOutDir = retrieveOriginalOutDir(
      tsConfig,
      remoteOptions,
    );

    expect(retrievedOriginalOutDir).toBe(expectedPath);
  });

  describe('compileTs', () => {
    afterEach(() => {
      rmSync(tmpDir, { recursive: true, force: true });
      ensureDirSync(join(tmpDir, 'typesRemoteFolder'));
    });

    it('empty mapToExpose', () => {
      const compile = () => compileTs({}, tsConfig, remoteOptions);
      expect(compile).not.toThrow();
      // no files generate if empty mapToExpose
    });

    it('empty mapToExpose for vue-tsc', () => {
      const compile = () =>
        compileTs(
          {},
          {
            ...tsConfig,
            compilerOptions: {
              ...tsConfig.compilerOptions,
              emitDeclarationOnly: true,
            },
          },
          { ...remoteOptions, compilerInstance: 'vue-tsc' },
        );
      expect(compile).not.toThrow();
      // no files generate if empty mapToExpose
    });

    it('filled mapToExpose', async () => {
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };
      await compileTs(
        mapToExpose,
        { ...tsConfig, files: [filepath] },
        remoteOptions,
      );
      const directoryStructure = dirTree(
        join(tsConfig.compilerOptions.outDir, '..'),
        {
          exclude: [/node_modules/, /dev-worker/, /plugins/, /server/],
        },
      );
      const expectedStructure = {
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
                            name: 'typeScriptCompiler.d.ts',
                          },
                        ],
                        name: 'lib',
                      },
                    ],
                    name: 'core',
                  },
                ],
                name: 'src',
              },
            ],
            name: 'compiledTypesFolder',
          },
          {
            name: 'tsCompiler.d.ts',
          },
        ],
        name: 'typesRemoteFolder',
      };

      expect(directoryStructure).toMatchObject(expectedStructure);
    });

    it('with additionalFilesToCompile', async () => {
      const filepath = join(__dirname, './typeScriptCompiler.ts');

      const mapToExpose = {
        tsCompiler: filepath,
      };
      const additionalFilesToCompile = [
        join(__dirname, '../../plugins/DtsPlugin.ts'),
      ];

      await compileTs(
        mapToExpose,
        { ...tsConfig, files: [filepath, ...additionalFilesToCompile] },
        {
          ...remoteOptions,
        },
      );
      const directoryStructure = dirTree(
        join(tsConfig.compilerOptions.outDir, '..'),
        {
          exclude: /node_modules/,
        },
      );
      const expectedStructure = {
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
                  {
                    children: [
                      {
                        name: 'DevWorker.d.ts',
                      },
                      {
                        name: 'createDevWorker.d.ts',
                      },
                      {
                        name: 'index.d.ts',
                      },
                    ],
                    name: 'dev-worker',
                  },
                  {
                    children: [
                      {
                        name: 'ConsumeTypesPlugin.d.ts',
                      },
                      {
                        name: 'DevPlugin.d.ts',
                      },
                      {
                        name: 'DtsPlugin.d.ts',
                      },
                      {
                        name: 'GenerateTypesPlugin.d.ts',
                      },
                      {
                        name: 'utils.d.ts',
                      },
                    ],
                    name: 'plugins',
                  },
                  {
                    children: [
                      {
                        name: 'DevServer.d.ts',
                      },
                      {
                        name: 'Publisher.d.ts',
                      },
                      {
                        name: 'WebClient.d.ts',
                      },
                      {
                        children: [
                          {
                            name: 'Broker.d.ts',
                          },
                          {
                            name: 'createBroker.d.ts',
                          },
                        ],
                        name: 'broker',
                      },
                      {
                        name: 'constant.d.ts',
                      },
                      {
                        name: 'createKoaServer.d.ts',
                      },
                      {
                        name: 'createWebsocket.d.ts',
                      },
                      {
                        name: 'index.d.ts',
                      },
                      {
                        children: [
                          {
                            children: [
                              {
                                name: 'API.d.ts',
                              },
                              {
                                name: 'FetchTypes.d.ts',
                              },
                              {
                                name: 'ReloadWebClient.d.ts',
                              },
                              {
                                name: 'UpdateSubscriber.d.ts',
                              },
                              {
                                name: 'index.d.ts',
                              },
                            ],
                            name: 'API',
                          },
                          {
                            children: [
                              {
                                name: 'Action.d.ts',
                              },
                              {
                                name: 'AddDynamicRemote.d.ts',
                              },
                              {
                                name: 'AddPublisher.d.ts',
                              },
                              {
                                name: 'AddSubscriber.d.ts',
                              },
                              {
                                name: 'AddWebClient.d.ts',
                              },
                              {
                                name: 'ExitPublisher.d.ts',
                              },
                              {
                                name: 'ExitSubscriber.d.ts',
                              },
                              {
                                name: 'FetchTypes.d.ts',
                              },
                              {
                                name: 'NotifyWebClient.d.ts',
                              },
                              {
                                name: 'Update.d.ts',
                              },
                              {
                                name: 'UpdatePublisher.d.ts',
                              },
                              {
                                name: 'index.d.ts',
                              },
                            ],
                            name: 'Action',
                          },
                          {
                            children: [
                              {
                                name: 'BrokerExitLog.d.ts',
                              },
                              {
                                name: 'Log.d.ts',
                              },
                              {
                                name: 'PublisherRegisteredLog.d.ts',
                              },
                              {
                                name: 'index.d.ts',
                              },
                            ],
                            name: 'Log',
                          },
                          {
                            name: 'Message.d.ts',
                          },
                        ],
                        name: 'message',
                      },
                      {
                        children: [
                          {
                            name: 'broker.d.ts',
                          },
                          {
                            name: 'index.d.ts',
                          },
                          {
                            name: 'message.d.ts',
                          },
                        ],
                        name: 'types',
                      },
                      {
                        children: [
                          {
                            name: 'getIPV4.d.ts',
                          },
                          {
                            name: 'index.d.ts',
                          },
                          {
                            name: 'log.d.ts',
                          },
                          {
                            name: 'logTransform.d.ts',
                          },
                        ],
                        name: 'utils',
                      },
                    ],
                    name: 'server',
                  },
                ],
                name: 'src',
              },
            ],
            name: 'compiledTypesFolder',
          },
          {
            name: 'tsCompiler.d.ts',
          },
        ],
        name: 'typesRemoteFolder',
      };

      expect(directoryStructure).toMatchObject(expectedStructure);
    });
  });
});
