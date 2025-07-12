import webpack from 'webpack';
import path from 'path';

export function createMockCompiler(): webpack.Compiler {
  const compiler = {
    options: {
      context: path.resolve(__dirname, '../../'),
      mode: 'development',
    },
    hooks: {
      thisCompilation: {
        tap: jest.fn(),
      },
      compilation: {
        tap: jest.fn(),
      },
      afterCompile: {
        tap: jest.fn(),
      },
      finishMake: {
        tapPromise: jest.fn(),
      },
      make: {
        tapAsync: jest.fn(),
      },
    },
    context: path.resolve(__dirname, '../../'),
  } as any;

  return compiler;
}

export function createMockCompilation(
  compiler: webpack.Compiler,
): webpack.Compilation {
  const compilation = {
    hooks: {
      afterOptimizeChunks: {
        tap: jest.fn(),
      },
      processAssets: {
        tap: jest.fn(),
      },
      optimize: {
        tap: jest.fn(),
      },
      finishModules: {
        tap: jest.fn(),
      },
      additionalTreeRuntimeRequirements: {
        tap: jest.fn(),
      },
      runtimeRequirementInTree: {
        for: jest.fn().mockReturnValue({ tap: jest.fn() }),
      },
    },
    compiler,
    options: compiler.options,
    contextDependencies: new Set(),
    fileDependencies: new Set(),
    missingDependencies: new Set(),
    warnings: [],
    errors: [],
    dependencyFactories: new Map(),
    dependencyTemplates: new Map(),
    addRuntimeModule: jest.fn(),
    resolverFactory: {
      get: jest.fn().mockReturnValue({
        resolve: jest.fn(),
      }),
    },
  } as any;

  return compilation;
}
