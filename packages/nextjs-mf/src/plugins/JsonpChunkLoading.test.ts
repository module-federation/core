// JsonpChunkLoading.test.ts
import JsonpChunkLoading from './JsonpChunkLoading';
import { Compiler } from 'webpack';

// Create a mock for the Compilation class
class MockCompilation {
  hooks = {
    optimizeChunks: { tap: jest.fn() },
    runtimeModule: { tap: jest.fn() },
  };
}

// Create a mock for the Compiler class
class MockCompiler {
  hooks = {
    compilation: { tap: jest.fn() },
  };
  options = {
    output: { uniqueName: 'test-app' },
  };
  webpack = {
    RuntimeGlobals: {},
  };
}

describe('JsonpChunkLoading', () => {
  let plugin: JsonpChunkLoading;
  let compiler: Compiler;

  beforeEach(() => {
    plugin = new JsonpChunkLoading();
    compiler = new MockCompiler() as unknown as Compiler;
  });

  it('should call compiler hooks', () => {
    plugin.apply(compiler);

    expect(compiler.hooks.compilation.tap).toHaveBeenCalled();
  });

  it('should call compilation hooks', () => {
    plugin.apply(compiler);

    const mockCompilation = new MockCompilation();
    (compiler.hooks.compilation.tap as jest.Mock).mock.calls[0][1](
      mockCompilation
    );

    expect(mockCompilation.hooks.optimizeChunks.tap).toHaveBeenCalled();
    expect(mockCompilation.hooks.runtimeModule.tap).toHaveBeenCalled();
  });

  // Add more tests for different scenarios and cases
});
