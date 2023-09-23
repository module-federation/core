import type { Compiler, Compilation } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';

describe('InvertedContainerRuntimeModule', () => {
  let compiler: Compiler;
  let compilation: Compilation;
  let runtimeModule: InvertedContainerRuntimeModule;

  beforeEach(() => {
    // Create a mock compiler object
    compiler = {
      webpack: {
        RuntimeGlobals: {
          global: 'global',
        },
        javascript: {
          JavascriptModulesPlugin: {
            chunkHasJs: jest.fn(),
          },
        },
      },
    } as unknown as Compiler;

    // Rest of the setup...
    // Create a mock compilation object
    compilation = {
      entrypoints: new Map(),
      options: {
        node: {
          global: true,
        },
      },
    } as unknown as Compilation;

    // Initialize the runtime module with some options
    runtimeModule = new InvertedContainerRuntimeModule(
      new Set(),
      {
        container: 'testContainer',
        runtime: 'testRuntime',
        remotes: { testRemote: 'http://localhost/testRemote' },
      },
      {
        webpack: compiler.webpack,
      },
    );

    // Assign compilation and chunkGraph to runtimeModule for testing purposes
    runtimeModule.compilation = compilation;
    runtimeModule.chunkGraph = {
      getChunkConditionMap: jest.fn(),
    } as unknown as any;
    runtimeModule.chunk = {} as any;
  });

  it('should be defined', () => {
    expect(runtimeModule).toBeDefined();
  });
  //TODO: fix this test
  xit('should generate runtime code for container module', () => {
    const containerChunk = {
      name: 'testContainer',
    };

    const containerEntryModule = {
      _name: 'testEntryModule',
      id: 123,
    };

    compilation.entrypoints.set('testContainer', {
      //@ts-ignore
      getRuntimeChunk: () => containerChunk,
    });
    //@ts-ignore
    containerChunk.entryModule = containerEntryModule;
    //@ts-ignore
    runtimeModule.options.runtime = 'testContainer';

    const generatedCode = runtimeModule.generate();

    expect(generatedCode).toContain('__remote_scope__');
    expect(generatedCode).toContain('testEntryModule');
    expect(generatedCode).toContain('123');
  });
});
