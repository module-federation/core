import { SyncHook, AsyncSeriesHook, HookMap } from 'tapable';

export type BasicCompiler = {
  hooks: {
    thisCompilation: SyncHook<any> & { taps?: any[] };
    compilation: SyncHook<any> & { taps?: any[] };
    finishMake: AsyncSeriesHook<any> & { taps?: any[] };
    make: AsyncSeriesHook<any> & { taps?: any[] };
    environment: SyncHook<any> & { taps?: any[] };
    afterEnvironment: SyncHook<any> & { taps?: any[] };
    afterPlugins: SyncHook<any> & { taps?: any[] };
    afterResolvers: SyncHook<any> & { taps?: any[] };
  };
  context: string;
  options: any;
};

export function createTapTrackedHook<
  T extends SyncHook<any> | AsyncSeriesHook<any>,
>(hook: T): T {
  const tracked = hook as any;
  const wrap = (method: 'tap' | 'tapAsync' | 'tapPromise') => {
    if (typeof tracked[method] === 'function') {
      const original = tracked[method].bind(tracked);
      tracked.__tapCalls = tracked.__tapCalls || [];
      tracked[method] = (name: string, fn: any) => {
        tracked.__tapCalls.push({ name, fn, method });
        return original(name, fn);
      };
    }
  };
  wrap('tap');
  wrap('tapAsync');
  wrap('tapPromise');
  return tracked as T;
}

export function createRealCompiler(context = '/test-project'): BasicCompiler {
  return {
    hooks: {
      thisCompilation: createTapTrackedHook(
        new SyncHook<[unknown, unknown]>(['compilation', 'params']),
      ) as any,
      compilation: createTapTrackedHook(
        new SyncHook<[unknown, unknown]>(['compilation', 'params']),
      ) as any,
      finishMake: createTapTrackedHook(
        new AsyncSeriesHook<[unknown]>(['compilation']),
      ) as any,
      make: createTapTrackedHook(
        new AsyncSeriesHook<[unknown]>(['compilation']),
      ) as any,
      environment: createTapTrackedHook(new SyncHook<[]>([])) as any,
      afterEnvironment: createTapTrackedHook(new SyncHook<[]>([])) as any,
      afterPlugins: createTapTrackedHook(
        new SyncHook<[unknown]>(['compiler']),
      ) as any,
      afterResolvers: createTapTrackedHook(
        new SyncHook<[unknown]>(['compiler']),
      ) as any,
    },
    context,
    options: {
      plugins: [],
      resolve: { alias: {} },
      context,
    },
  } as any;
}

export function createMemfsCompilation(compiler: BasicCompiler) {
  return {
    dependencyFactories: new Map(),
    hooks: {
      additionalTreeRuntimeRequirements: { tap: jest.fn() },
      finishModules: { tap: jest.fn(), tapAsync: jest.fn() },
      seal: { tap: jest.fn() },
      runtimeRequirementInTree: new HookMap<
        SyncHook<[unknown, unknown, unknown]>
      >(
        () =>
          new SyncHook<[unknown, unknown, unknown]>([
            'chunk',
            'set',
            'context',
          ]),
      ),
      processAssets: { tap: jest.fn() },
    },
    addRuntimeModule: jest.fn(),
    contextDependencies: { addAll: jest.fn() },
    fileDependencies: { addAll: jest.fn() },
    missingDependencies: { addAll: jest.fn() },
    warnings: [],
    errors: [],
    resolverFactory: {
      get: jest.fn(() => ({
        resolve: jest.fn(
          (
            _context: unknown,
            lookupStartPath: string,
            request: string,
            _resolveContext: unknown,
            callback: (err: any, result?: string) => void,
          ) => callback(null, `${lookupStartPath}/${request}`),
        ),
      })),
    },
    compiler,
    options: compiler.options,
  } as any;
}

export function createNormalModuleFactory() {
  return {
    hooks: {
      module: { tap: jest.fn() },
      factorize: { tapPromise: jest.fn(), tapAsync: jest.fn(), tap: jest.fn() },
      createModule: { tapPromise: jest.fn() },
    },
  };
}
