import path from 'path';
import { rs } from '@rstest/core';
import type { Compiler, Compilation } from 'webpack';

export function createMockCompiler(): Compiler {
  const compiler = {
    options: {
      context: path.resolve(__dirname, '../../'),
      mode: 'development',
    },
    hooks: {
      thisCompilation: {
        tap: rs.fn(),
      },
      compilation: {
        tap: rs.fn(),
      },
      afterCompile: {
        tap: rs.fn(),
      },
      finishMake: {
        tapPromise: rs.fn(),
      },
      make: {
        tapAsync: rs.fn(),
      },
    },
    context: path.resolve(__dirname, '../../'),
  } as any;

  return compiler;
}

export function createMockCompilation(compiler: Compiler): Compilation {
  const compilation = {
    hooks: {
      afterOptimizeChunks: {
        tap: rs.fn(),
      },
      processAssets: {
        tap: rs.fn(),
      },
      optimize: {
        tap: rs.fn(),
      },
      finishModules: {
        tap: rs.fn(),
      },
      additionalTreeRuntimeRequirements: {
        tap: rs.fn(),
      },
      runtimeRequirementInTree: {
        for: rs.fn().mockReturnValue({ tap: rs.fn() }),
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
    addRuntimeModule: rs.fn(),
    resolverFactory: {
      get: rs.fn().mockReturnValue({
        resolve: rs.fn(),
      }),
    },
  } as any;

  return compilation;
}
