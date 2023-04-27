import type { Compiler, Compilation } from 'webpack';
import InvertedContainerPlugin from './InvertedContainerPlugin';

describe('InvertedContainerPlugin', () => {
  let compiler: Compiler;
  let plugin: InvertedContainerPlugin;
  let compilation: Compilation;

  beforeEach(() => {
    // Create a mock compiler object
    compiler = {
      hooks: {
        thisCompilation: { tap: jest.fn() },
      },
    } as unknown as Compiler;

    // Create a mock compilation object
    compilation = {
      hooks: {
        additionalChunkRuntimeRequirements: { tap: jest.fn() },
        optimizeChunks: { tap: jest.fn() },
      },
      entrypoints: new Map(),
      addRuntimeModule: jest.fn(),
      chunkGraph: {
        isModuleInChunk: jest.fn(),
        connectChunkAndModule: jest.fn(),
      },
    } as unknown as Compilation;

    // Initialize the plugin with some options
    plugin = new InvertedContainerPlugin({
      container: 'testContainer',
      runtime: 'testRuntime',
      remotes: { testRemote: 'http://localhost/testRemote' },
      debug: false,
    });
  });

  it('should be defined', () => {
    expect(plugin).toBeDefined();
  });

  it('should call the thisCompilation hook', () => {
    plugin.apply(compiler);
    expect(compiler.hooks.thisCompilation.tap).toHaveBeenCalled();
  });

  it('should call the additionalChunkRuntimeRequirements hook', () => {
    (compiler.hooks.thisCompilation.tap as jest.Mock).mockImplementation(
      (pluginName: string, callback: (compilation: Compilation) => void) => {
        callback(compilation);
      }
    );

    plugin.apply(compiler);

    expect(
      compilation.hooks.additionalChunkRuntimeRequirements.tap
    ).toHaveBeenCalled();
  });

  it('should call the optimizeChunks hook', () => {
    (compiler.hooks.thisCompilation.tap as jest.Mock).mockImplementation(
      (pluginName: string, callback: (compilation: Compilation) => void) => {
        callback(compilation);
      }
    );

    plugin.apply(compiler);

    expect(compilation.hooks.optimizeChunks.tap).toHaveBeenCalled();
  });

  it('should add the container entry module to the runtime chunk if it exists', () => {
    (compiler.hooks.thisCompilation.tap as jest.Mock).mockImplementation(
      (pluginName: string, callback: (compilation: Compilation) => void) => {
        callback(compilation);
      }
    );

    const containerChunk = {
      hasRuntime: () => true,
      name: 'testContainer',
    };

    const containerEntryModule = {
      _name: 'testEntryModule',
    };

    compilation.entrypoints.set('testContainer', {
      //@ts-ignore
      getRuntimeChunk: () => containerChunk,
    });
    //@ts-ignore
    containerChunk.entryModule = containerEntryModule;

    const chunks = [containerChunk];

    (compilation.hooks.optimizeChunks.tap as jest.Mock).mockImplementation(
      (pluginName: string, callback: (chunks: any[]) => void) => {
        callback(chunks);
      }
    );

    plugin.apply(compiler);

    expect(compilation.chunkGraph.connectChunkAndModule).toHaveBeenCalledWith(
      containerChunk,
      containerEntryModule
    );
  });
});
