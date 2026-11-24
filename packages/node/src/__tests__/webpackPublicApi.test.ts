import CommonJsChunkLoadingPlugin from '../plugins/CommonJsChunkLoadingPlugin';
import { getChunkRootOutputDir } from '../plugins/webpackChunkUtilities';

describe('node plugins webpack public API support', () => {
  it('prefers compiler.webpack.runtime.StartupChunkDependenciesPlugin when exposed', () => {
    const applySpy = jest.fn();
    const ctorSpy = jest.fn(() => ({ apply: applySpy }));
    const compiler: any = {
      webpack: {
        RuntimeGlobals: {
          ensureChunkHandlers: 'f',
          hmrDownloadUpdateHandlers: 'hmr',
          hmrDownloadManifest: 'hmrM',
          baseURI: 'b',
          externalInstallChunk: 'C',
          onChunksLoaded: 'O',
          publicPath: 'p',
          moduleFactoriesAddOnly: 'm',
          hasOwnProperty: 'o',
          getChunkScriptFilename: 'u',
          getChunkUpdateScriptFilename: 'hu',
          moduleCache: 'c',
          hmrModuleData: 'hmrD',
          getUpdateManifestFilename: 'hmrF',
          global: 'g',
        },
        runtime: {
          StartupChunkDependenciesPlugin: ctorSpy,
        },
      },
      hooks: {
        thisCompilation: { tap: jest.fn() },
      },
    };

    new CommonJsChunkLoadingPlugin({
      asyncChunkLoading: true,
      baseURI: '/',
      remotes: {},
    }).apply(compiler);

    expect(ctorSpy).toHaveBeenCalledWith({
      chunkLoading: 'async-node',
      asyncChunkLoading: true,
    });
    expect(applySpy).toHaveBeenCalledWith(compiler);
  });

  it('uses compiler.webpack.runtime.StartupEntrypointRuntimeModule without requiring webpack/lib/* when StartupChunkDependenciesPlugin is absent', () => {
    const startupEntrypointSpy = jest.fn();
    const additionalTreeTaps: Array<
      (chunk: any, set: Set<string>, ctx: any) => void
    > = [];
    const startupEntrypointTaps: Array<(chunk: any, set: Set<string>) => void> =
      [];
    const thisCompilationTaps: Array<(compilation: any) => void> = [];

    class MockRuntimeModule {
      static STAGE_TRIGGER = 30;
      name: string;
      stage: number;
      constructor(name: string, stage: number) {
        this.name = name;
        this.stage = stage;
      }
    }

    const compiler: any = {
      webpack: {
        Template: {
          asString: (arr: string[]) => arr.join('\n'),
          indent: (s: string) => s,
        },
        runtime: {
          RuntimeGlobals: {
            startup: '__webpack_require__.x',
            require: '__webpack_require__',
            ensureChunk: '__webpack_require__.e',
            ensureChunkIncludeEntries: '__webpack_require__.e_entries',
            startupEntrypoint: '__webpack_require__.X',
            ensureChunkHandlers: 'f',
            hmrDownloadUpdateHandlers: 'hmr',
            hmrDownloadManifest: 'hmrM',
            baseURI: 'b',
            externalInstallChunk: 'C',
            onChunksLoaded: 'O',
            publicPath: 'p',
            moduleFactoriesAddOnly: 'm',
            hasOwnProperty: 'o',
            getChunkScriptFilename: 'u',
            getChunkUpdateScriptFilename: 'hu',
            moduleCache: 'c',
            hmrModuleData: 'hmrD',
            getUpdateManifestFilename: 'hmrF',
            global: 'g',
          },
          RuntimeModule: MockRuntimeModule,
          StartupEntrypointRuntimeModule: startupEntrypointSpy,
        },
      },
      hooks: {
        thisCompilation: {
          tap: (_name: string, fn: (compilation: any) => void) => {
            thisCompilationTaps.push(fn);
          },
        },
      },
    };

    new CommonJsChunkLoadingPlugin({
      asyncChunkLoading: true,
      baseURI: '/',
      remotes: {},
    }).apply(compiler);

    const addRuntimeModule = jest.fn();
    const compilation: any = {
      outputOptions: { chunkLoading: 'async-node' },
      addRuntimeModule,
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: (_name: string, fn: any) => additionalTreeTaps.push(fn),
        },
        runtimeRequirementInTree: {
          for: (req: string) => ({
            tap: (_name: string, fn: any) => {
              if (req === '__webpack_require__.X') {
                startupEntrypointTaps.push(fn);
              }
            },
          }),
        },
      },
    };

    for (const tap of thisCompilationTaps) {
      tap(compilation);
    }

    const chunk: any = { getEntryOptions: () => undefined };
    const reqSet = new Set<string>();
    additionalTreeTaps[0](chunk, reqSet, {
      chunkGraph: { hasChunkEntryDependentChunks: () => true },
    });
    expect(reqSet.has('__webpack_require__.x')).toBe(true);
    expect(addRuntimeModule).toHaveBeenCalledTimes(1);

    const entryReqSet = new Set<string>();
    startupEntrypointTaps[0](chunk, entryReqSet);
    expect(startupEntrypointSpy).toHaveBeenCalledWith(true);
    expect(addRuntimeModule).toHaveBeenCalledTimes(2);
  });

  it('prefers compiler.webpack.util.getUndoPath in getChunkRootOutputDir when chunkRootOutputDir is unavailable', () => {
    const getUndoPath = jest.fn(() => '../../');
    const compilation: any = {
      compiler: {
        webpack: {
          util: { getUndoPath },
        },
      },
      runtimeTemplate: {},
      outputOptions: { path: '/out' },
      getPath: jest.fn(() => 'static/js/chunk.js'),
    };

    const result = getChunkRootOutputDir(
      compilation,
      {} as any,
      'static/js/[name].js',
    );
    expect(result).toBe('../../');
    expect(getUndoPath).toHaveBeenCalledWith(
      'static/js/chunk.js',
      '/out',
      false,
    );
  });
});
