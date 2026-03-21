import EntryStartupPlugin from './entry-startup-plugin';

class MockRuntimeModule {
  static STAGE_TRIGGER = 0;

  constructor(..._args: unknown[]) {}
}

type MockChunk = {
  hasRuntime(): boolean;
  id?: number | string | null;
  getAllReferencedChunks: () => Iterable<MockChunk>;
  getEntryOptions?: () => Record<string, unknown> | undefined;
};

describe('EntryStartupPlugin runtime patch', () => {
  const createCompiler = () => {
    let thisCompilationCallback:
      | ((compilation: Record<string, unknown>) => void)
      | undefined;
    let additionalTreeRuntimeRequirementsCallback:
      | ((chunk: MockChunk, set: Set<string>) => void)
      | undefined;

    let mockCompilation: any;

    const addRuntimeModule = jest.fn((chunk: MockChunk, module: any) => {
      module.chunk = chunk;
      module.compilation = mockCompilation;
    });

    const compiler = {
      hooks: {
        thisCompilation: {
          tap: jest.fn((_name, callback) => {
            thisCompilationCallback = callback;
          }),
        },
      },
      webpack: {
        RuntimeGlobals: {
          startup: '__webpack_require__.startup',
          startupEntrypoint: '__webpack_require__.X',
          ensureChunkHandlers: '__webpack_require__.f',
        },
        RuntimeModule: MockRuntimeModule,
        Template: {
          asString: (value: string[] | string) =>
            Array.isArray(value) ? value.join('\n') : String(value),
        },
      },
    } as never;

    mockCompilation = {
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: jest.fn((_name, callback) => {
            additionalTreeRuntimeRequirementsCallback = callback;
          }),
        },
      },
      addRuntimeModule,
    };

    return {
      compiler,
      addRuntimeModule,
      invokeThisCompilation(compilation: Record<string, unknown>) {
        thisCompilationCallback?.(compilation);
      },
      invokeAdditionalTreeRuntimeRequirements(
        chunk: MockChunk,
        set: Set<string>,
      ) {
        additionalTreeRuntimeRequirementsCallback?.(chunk, set);
      },
      setAdditionalTreeRuntimeRequirementsCallback(
        callback: ((chunk: MockChunk, set: Set<string>) => void) | undefined,
      ) {
        additionalTreeRuntimeRequirementsCallback = callback;
      },
    };
  };

  it('adds a runtime module for entry chunks and warms only referenced chunk ids', () => {
    const {
      compiler,
      addRuntimeModule,
      invokeThisCompilation,
      invokeAdditionalTreeRuntimeRequirements,
      setAdditionalTreeRuntimeRequirementsCallback,
    } = createCompiler();

    const compilation = {
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: jest.fn((_name, callback) => {
            setAdditionalTreeRuntimeRequirementsCallback(callback);
          }),
        },
      },
      addRuntimeModule,
    };

    const getAllReferencedChunks = jest.fn();
    const runtimeChunk = {
      hasRuntime: () => true,
      id: 404,
      getAllReferencedChunks,
    } as MockChunk;

    getAllReferencedChunks.mockReturnValue([
      runtimeChunk,
      { hasRuntime: () => false, id: 189, getAllReferencedChunks: jest.fn() },
      { hasRuntime: () => false, id: 67, getAllReferencedChunks: jest.fn() },
      { hasRuntime: () => false, id: null, getAllReferencedChunks: jest.fn() },
      {
        hasRuntime: () => false,
        id: undefined,
        getAllReferencedChunks: jest.fn(),
      },
    ]);

    new EntryStartupPlugin().apply(compiler);
    invokeThisCompilation(compilation);

    const treeRequirements = new Set<string>();
    invokeAdditionalTreeRuntimeRequirements(runtimeChunk, treeRequirements);

    expect(treeRequirements).toEqual(
      new Set([
        '__webpack_require__.startup',
        '__webpack_require__.X',
        '__webpack_require__.f',
      ]),
    );

    expect(addRuntimeModule).toHaveBeenCalledTimes(1);

    const runtimeModule = addRuntimeModule.mock.calls[0][1] as {
      generate(): string;
    };
    const output = runtimeModule.generate();

    expect(getAllReferencedChunks).toHaveBeenCalledTimes(1);
    expect(output).toContain('var nextjsMfEntryDependentChunkIds = [189,67];');
    expect(output).toContain(
      'nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.remotes, promises);',
    );
    expect(output).toContain(
      'nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.consumes, promises);',
    );
    expect(output).toContain(
      'var nextjsMfInvokePrevStartupEntrypoint = function(result, chunkIds, fn) {',
    );
    expect(output).toContain(
      '__webpack_require__.X = function(result, chunkIds, fn) {',
    );
    expect(output).not.toContain('Object.keys(mapping)');
    expect(output).not.toContain('nextjsMfCurrentChunkId');
  });

  it('preserves the original startup entrypoint result after wrapping __webpack_require__.X', async () => {
    const {
      compiler,
      addRuntimeModule,
      invokeThisCompilation,
      invokeAdditionalTreeRuntimeRequirements,
      setAdditionalTreeRuntimeRequirementsCallback,
    } = createCompiler();

    const compilation = {
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: jest.fn((_name, callback) => {
            setAdditionalTreeRuntimeRequirementsCallback(callback);
          }),
        },
      },
      addRuntimeModule,
    };

    const getAllReferencedChunks = jest.fn();
    const runtimeChunk = {
      hasRuntime: () => true,
      id: 404,
      getAllReferencedChunks,
    } as MockChunk;

    getAllReferencedChunks.mockReturnValue([
      runtimeChunk,
      { hasRuntime: () => false, id: 189, getAllReferencedChunks: jest.fn() },
      { hasRuntime: () => false, id: 67, getAllReferencedChunks: jest.fn() },
    ]);

    new EntryStartupPlugin().apply(compiler);
    invokeThisCompilation(compilation);

    invokeAdditionalTreeRuntimeRequirements(runtimeChunk, new Set<string>());

    const runtimeModule = addRuntimeModule.mock.calls[0][1] as {
      generate(): string;
    };
    const output = runtimeModule.generate();

    const warmupCalls: string[] = [];
    const remotesHandler = (
      chunkId: string | number,
      promises: Promise<unknown>[],
    ) => {
      warmupCalls.push(`remote:${chunkId}`);
      promises.push(Promise.resolve(`remote:${chunkId}`));
    };
    const consumesHandler = (
      chunkId: string | number,
      promises: Promise<unknown>[],
    ) => {
      warmupCalls.push(`consume:${chunkId}`);
      promises.push(Promise.resolve(`consume:${chunkId}`));
    };
    const originalStartup = jest.fn(() => 'startup-result');
    const originalStartupEntrypoint = jest.fn(
      (
        result: string,
        chunkIds: Array<string | number>,
        fn: () => unknown,
      ) => ({
        marker: 'original',
        result,
        chunkIds,
        fnResult: fn(),
      }),
    );

    const webpackRequire = {
      startup: originalStartup,
      X: originalStartupEntrypoint,
      f: {
        remotes: remotesHandler,
        consumes: consumesHandler,
      },
    } as never;

    new Function(
      '__webpack_require__',
      `${output}\nreturn __webpack_require__;`,
    )(webpackRequire);

    expect((webpackRequire as { startup: () => string }).startup()).toBe(
      'startup-result',
    );

    const wrappedResult = await (
      webpackRequire as {
        X: (
          result: string,
          chunkIds: Array<string | number>,
          fn: () => unknown,
        ) => Promise<{
          marker: string;
          result: string;
          chunkIds: Array<string | number>;
          fnResult: unknown;
        }>;
      }
    ).X('entry-result', ['246'], () => 'original-result');

    expect(wrappedResult).toEqual({
      marker: 'original',
      result: 'entry-result',
      chunkIds: ['246'],
      fnResult: 'original-result',
    });
    expect(warmupCalls).toEqual([
      'remote:189',
      'remote:67',
      'consume:189',
      'consume:67',
    ]);
    expect(originalStartupEntrypoint).toHaveBeenCalledWith(
      'entry-result',
      ['246'],
      expect.any(Function),
    );
  });

  it('skips runtime module generation for chunks without runtime', () => {
    const {
      compiler,
      addRuntimeModule,
      invokeThisCompilation,
      invokeAdditionalTreeRuntimeRequirements,
      setAdditionalTreeRuntimeRequirementsCallback,
    } = createCompiler();

    const compilation = {
      hooks: {
        additionalTreeRuntimeRequirements: {
          tap: jest.fn((_name, callback) => {
            setAdditionalTreeRuntimeRequirementsCallback(callback);
          }),
        },
      },
      addRuntimeModule,
    };

    new EntryStartupPlugin().apply(compiler);
    invokeThisCompilation(compilation);

    invokeAdditionalTreeRuntimeRequirements(
      {
        hasRuntime: () => false,
        id: 404,
        getAllReferencedChunks: jest.fn(),
      },
      new Set<string>(),
    );

    expect(addRuntimeModule).not.toHaveBeenCalled();
  });
});
