import dirTree from 'directory-tree';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { createRequire } from 'module';
import os from 'os';
import { dirname, join, resolve, sep } from 'path';
import util from 'util';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import type { TsConfigJson } from '../interfaces/TsConfigJson';

import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import {
  compileTs,
  retrieveMfTypesPath,
  retrieveOriginalOutDir,
} from './typeScriptCompiler';

describe('typeScriptCompiler', () => {
  const requireFromTest = createRequire(__filename);
  const tmpDir = join(os.tmpdir(), 'typeScriptCompiler');
  const linkTypeScriptPackage = (projectDir: string, packageName: string) => {
    const typeScriptRoot = dirname(
      requireFromTest.resolve(`${packageName}/package.json`),
    );
    mkdirSync(join(projectDir, 'node_modules'), { recursive: true });
    symlinkSync(
      typeScriptRoot,
      join(projectDir, 'node_modules/typescript'),
      'junction',
    );
  };

  const readJSONSync = (filePath: string) =>
    JSON.parse(readFileSync(filePath, 'utf-8'));

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

  mkdirSync(join(tmpDir, 'typesRemoteFolder'), { recursive: true });

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
    deleteTsConfig: true,
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
    const withProcessPlatform = (platform: NodeJS.Platform) => {
      const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(
        process,
        'platform',
      );
      Object.defineProperty(process, 'platform', { value: platform });
      return () => {
        if (originalPlatformDescriptor) {
          Object.defineProperty(
            process,
            'platform',
            originalPlatformDescriptor,
          );
        }
      };
    };

    afterEach(() => {
      rs.restoreAllMocks();
      rmSync(tmpDir, { recursive: true, force: true });
      mkdirSync(join(tmpDir, 'typesRemoteFolder'), { recursive: true });
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

    it('does not use shell option on windows when invoking direct TypeScript compiler', async () => {
      const execPromise = rs.fn().mockResolvedValue({});
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('win32');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          remoteOptions,
        );
      } finally {
        restorePlatform();
      }

      expect(execPromise).toHaveBeenCalledWith(
        process.execPath,
        expect.any(Array),
        expect.objectContaining({ cwd: projectRoot, shell: false }),
      );
    });

    it('disable shell option on non-windows platforms', async () => {
      const execPromise = rs.fn().mockResolvedValue({});
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('linux');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          remoteOptions,
        );
      } finally {
        restorePlatform();
      }

      expect(execPromise).toHaveBeenCalledWith(
        process.execPath,
        expect.any(Array),
        expect.objectContaining({ cwd: projectRoot, shell: false }),
      );
    });

    it('splits compilerInstance arguments for execFile', async () => {
      const execPromise = rs.fn().mockResolvedValue({});
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('linux');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          { ...remoteOptions, compilerInstance: 'tsc --pretty false' },
        );
      } finally {
        restorePlatform();
      }

      const args = execPromise.mock.calls[0]?.[1] as string[];
      expect(args[0]).toMatch(/typescript[/\\]bin[/\\]tsc$/);
      expect(args.slice(1, 3)).toEqual(['--pretty', 'false']);
      expect(args[3]).toBe('--project');
      expect(args[4]).toEqual(expect.any(String));
    });

    it('keeps custom compilerInstance invocations through the package manager', async () => {
      const execPromise = rs.fn().mockResolvedValue({});
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('linux');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          {
            ...remoteOptions,
            compilerInstance: 'vue-tsc --declaration false',
          },
        );
      } finally {
        restorePlatform();
      }

      const args = execPromise.mock.calls[0]?.[1] as string[];
      expect(execPromise).toHaveBeenCalledWith(
        'npx',
        expect.any(Array),
        expect.objectContaining({ cwd: projectRoot, shell: false }),
      );
      expect(args.slice(0, 3)).toEqual(['vue-tsc', '--declaration', 'false']);
      expect(args[3]).toBe('--project');
      expect(args[4]).toEqual(expect.any(String));
    });

    it('uses shell option on windows for custom compilerInstance invocations', async () => {
      const execPromise = rs.fn().mockResolvedValue({});
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('win32');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          {
            ...remoteOptions,
            compilerInstance: 'vue-tsc --declaration false',
          },
        );
      } finally {
        restorePlatform();
      }

      expect(execPromise).toHaveBeenCalledWith(
        'npx',
        expect.any(Array),
        expect.objectContaining({ cwd: projectRoot, shell: true }),
      );
    });

    it('does not wrap project path in single quotes on Windows (#4133)', async () => {
      const execPromise = rs.fn().mockRejectedValue(new Error('tsc error'));
      rs.spyOn(util, 'promisify').mockReturnValue(
        execPromise as unknown as ReturnType<typeof util.promisify>,
      );
      const restorePlatform = withProcessPlatform('win32');
      const filepath = join(__dirname, './typeScriptCompiler.ts');
      const mapToExpose = {
        tsCompiler: filepath,
      };

      try {
        await compileTs(
          mapToExpose,
          { ...tsConfig, files: [filepath] },
          remoteOptions,
        );
      } catch {
        // expected to throw because execPromise is rejected
      } finally {
        restorePlatform();
      }

      const args = execPromise.mock.calls[0]?.[1] as string[];
      const projectIndex = args.indexOf('--project');
      expect(projectIndex).toBeGreaterThan(-1);
      const projectPath = args[projectIndex + 1];
      expect(projectPath).toBeDefined();
      expect(projectPath).not.toContain("'");
    });

    it('ignores inherited declarationDir', async () => {
      const projectDir = join(tmpDir, 'declarationDirProject');
      const srcDir = join(projectDir, 'src');
      mkdirSync(srcDir, { recursive: true });
      linkTypeScriptPackage(projectDir, 'typescript');

      const entryFile = join(srcDir, 'hello.ts');
      writeFileSync(entryFile, 'export const hello = 1;\n');

      const baseTsConfigPath = join(projectDir, 'tsconfig.json');
      writeFileSync(
        baseTsConfigPath,
        JSON.stringify(
          {
            compilerOptions: {
              target: 'es2017',
              module: 'esnext',
              moduleResolution: 'node10',
              declaration: true,
              emitDeclarationOnly: true,
              declarationDir: 'decl-dist',
              ignoreDeprecations: '6.0',
            },
            include: ['src'],
          },
          null,
          2,
        ),
      );

      const outDir = join(
        projectDir,
        'typesRemoteFolder',
        'compiledTypesFolder',
      );

      await compileTs(
        { './hello': entryFile },
        {
          extends: baseTsConfigPath,
          compilerOptions: {
            target: 'es2017',
            module: 'esnext',
            moduleResolution: 'node10',
            strict: true,
            esModuleInterop: true,
            emitDeclarationOnly: true,
            noEmit: false,
            declaration: true,
            outDir,
            declarationDir: outDir,
            rootDir: projectDir,
            ignoreDeprecations: '6.0',
          },
          files: [entryFile],
          include: [],
          exclude: [],
        },
        {
          ...remoteOptions,
          context: projectDir,
          tsConfigPath: baseTsConfigPath,
        },
      );

      expect(existsSync(join(projectDir, 'decl-dist'))).toBe(false);
      expect(existsSync(join(outDir, 'src', 'hello.d.ts'))).toBe(true);
      expect(
        existsSync(join(projectDir, 'typesRemoteFolder', 'hello.d.ts')),
      ).toBe(true);
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
                            name: 'typeScriptCompiler.d.ts',
                          },
                          {
                            name: 'typeScriptResolver.d.ts',
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

    it('emits wrapper files for multi-dot expose entries', async () => {
      const projectDir = join(tmpDir, 'multiDotExposeProject');
      const srcDir = join(projectDir, 'src', 'components');
      mkdirSync(srcDir, { recursive: true });
      linkTypeScriptPackage(projectDir, 'typescript');

      const entryFile = join(srcDir, 'foo.generated.ts');
      writeFileSync(entryFile, 'export const foo = 1;\n');

      const baseTsConfigPath = join(projectDir, 'tsconfig.json');
      writeFileSync(
        baseTsConfigPath,
        JSON.stringify(
          {
            compilerOptions: {
              target: 'es2017',
              module: 'esnext',
              moduleResolution: 'node10',
              strict: true,
              esModuleInterop: true,
              declaration: true,
              emitDeclarationOnly: true,
              rootDir: projectDir,
              ignoreDeprecations: '6.0',
            },
            include: ['src'],
          },
          null,
          2,
        ),
      );

      const outDir = join(
        projectDir,
        'typesRemoteFolder',
        'compiledTypesFolder',
      );

      await compileTs(
        { './foo.generated': entryFile },
        {
          extends: baseTsConfigPath,
          compilerOptions: {
            target: 'es2017',
            module: 'esnext',
            moduleResolution: 'node10',
            strict: true,
            esModuleInterop: true,
            emitDeclarationOnly: true,
            noEmit: false,
            declaration: true,
            outDir,
            declarationDir: outDir,
            rootDir: projectDir,
            ignoreDeprecations: '6.0',
          },
          files: [entryFile],
          include: [],
          exclude: [],
        },
        {
          ...remoteOptions,
          context: projectDir,
          tsConfigPath: baseTsConfigPath,
        },
      );

      const wrapperPath = join(
        projectDir,
        'typesRemoteFolder',
        'foo.generated.d.ts',
      );
      const emittedDefinitionPath = join(
        outDir,
        'src',
        'components',
        'foo.generated.d.ts',
      );

      expect(existsSync(emittedDefinitionPath)).toBe(true);
      expect(existsSync(wrapperPath)).toBe(true);
      expect(readFileSync(wrapperPath, 'utf-8')).toContain(
        './compiledTypesFolder/src/components/foo.generated',
      );
    });

    it('generates declarations with TypeScript 7', async () => {
      const projectDir = join(tmpDir, 'typescript7Project');
      const srcDir = join(projectDir, 'src');
      mkdirSync(srcDir, { recursive: true });

      linkTypeScriptPackage(projectDir, 'typescript-7');

      const entryFile = join(srcDir, 'button.ts');
      const dependencyFile = join(srcDir, 'dependency.ts');
      const unusedFile = join(srcDir, 'unused.ts');
      writeFileSync(entryFile, "export { dependency } from './dependency';\n");
      writeFileSync(dependencyFile, 'export const dependency = 1;\n');
      writeFileSync(unusedFile, 'export const unused = 1;\n');

      writeFileSync(
        join(projectDir, 'tsconfig.json'),
        JSON.stringify(
          {
            compilerOptions: {
              target: 'es2017',
              module: 'commonjs',
              moduleResolution: 'node10',
              rootDir: './src',
              outDir: './dist',
              strict: true,
            },
            include: ['src'],
          },
          null,
          2,
        ),
      );

      const { tsConfig, mapComponentsToExpose, remoteOptions } =
        retrieveRemoteConfig({
          context: projectDir,
          tsConfigPath: './tsconfig.json',
          typesFolder: 'typesRemoteFolder',
          compiledTypesFolder: 'compiledTypesFolder',
          moduleFederationConfig: {
            name: 'typescript7Remote',
            filename: 'remoteEntry.js',
            exposes: {
              './button': './src/button.ts',
            },
            dts: {
              cwd: projectDir,
            },
          },
        });

      expect(tsConfig.compilerOptions.moduleResolution).toBe('bundler');

      await compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

      expect(
        existsSync(
          join(
            projectDir,
            'dist/typesRemoteFolder/compiledTypesFolder/button.d.ts',
          ),
        ),
      ).toBe(true);
      expect(
        existsSync(
          join(
            projectDir,
            'dist/typesRemoteFolder/compiledTypesFolder/dependency.d.ts',
          ),
        ),
      ).toBe(true);
      expect(
        existsSync(join(projectDir, 'dist/typesRemoteFolder/button.d.ts')),
      ).toBe(true);
      expect(
        existsSync(
          join(
            projectDir,
            'dist/typesRemoteFolder/compiledTypesFolder/unused.d.ts',
          ),
        ),
      ).toBe(false);
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
                            name: 'typeScriptResolver.d.ts',
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
                        name: 'createHttpServer.d.ts',
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
