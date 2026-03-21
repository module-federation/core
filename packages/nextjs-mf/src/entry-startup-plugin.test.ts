import EntryStartupPlugin from './entry-startup-plugin';

class MockRuntimeModule {
  static STAGE_TRIGGER = 0;

  constructor(..._args: unknown[]) {}
}

type MockChunk = {
  hasRuntime(): boolean;
  id?: number | string | null;
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

    const mockChunkGraph: any = {
      getChunkEntryDependentChunksIterable: jest.fn(),
    };

    let mockCompilation: any;

    const addRuntimeModule = jest.fn((chunk: MockChunk, module: any) => {
      module.chunk = chunk;
      module.chunkGraph = mockChunkGraph;
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
      chunkGraph: mockChunkGraph,
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
      mockChunkGraph,
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

  it('adds a runtime module for entry chunks and warms only dependent chunk ids', () => {
    const {
      compiler,
      addRuntimeModule,
      mockChunkGraph,
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

    mockChunkGraph.getChunkEntryDependentChunksIterable.mockReturnValue([
      { hasRuntime: () => false, id: 189 },
      { hasRuntime: () => false, id: 67 },
      { hasRuntime: () => false, id: null },
    ]);

    new EntryStartupPlugin().apply(compiler);
    invokeThisCompilation(compilation);

    const treeRequirements = new Set<string>();
    invokeAdditionalTreeRuntimeRequirements(
      {
        hasRuntime: () => true,
        id: 404,
      },
      treeRequirements,
    );

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

    expect(
      mockChunkGraph.getChunkEntryDependentChunksIterable,
    ).toHaveBeenCalledWith(expect.objectContaining({ id: 404 }));
    expect(output).toContain('var nextjsMfEntryDependentChunkIds = [189,67];');
    expect(output).toContain(
      'nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.remotes, promises);',
    );
    expect(output).toContain(
      'nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.consumes, promises);',
    );
    expect(output).toContain(
      '__webpack_require__.X = function(result, chunkIds, fn) {',
    );
    expect(output).not.toContain('Object.keys(mapping)');
    expect(output).not.toContain('nextjsMfCurrentChunkId');
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
      },
      new Set<string>(),
    );

    expect(addRuntimeModule).not.toHaveBeenCalled();
  });
});
