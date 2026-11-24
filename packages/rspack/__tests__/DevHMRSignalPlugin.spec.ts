import { DevHMRSignalPlugin } from '../src/DevHMRSignalPlugin';

describe('document-local federation HMR signal', () => {
  it('emits one hint per check from a remote runtime without controlling the browser update', () => {
    let compilationHook: any;
    let requirementHook: any;
    let runtime: any;
    class RuntimeModule {
      static STAGE_TRIGGER = 20;
      constructor(_name: string, _stage: number) {}
    }
    new DevHMRSignalPlugin().apply({
      options: { mode: 'development' },
      webpack: {
        RuntimeModule,
        RuntimeGlobals: {
          hmrDownloadUpdateHandlers: 'hmr',
          interceptModuleExecution: '__webpack_require__.i',
        },
      },
      hooks: {
        thisCompilation: {
          tap: (_name: string, callback: any) => {
            compilationHook = callback;
          },
        },
      },
    } as any);
    compilationHook({
      hooks: {
        runtimeRequirementInTree: {
          for: () => ({
            tap: (_name: string, callback: any) => {
              requirementHook = callback;
            },
          }),
        },
      },
      addRuntimeModule(_chunk: unknown, module: unknown) {
        runtime = module;
      },
    });
    requirementHook({});
    const events: string[] = [];
    const require = { i: [] as ((options: unknown) => void)[] };
    new Function('__webpack_require__', 'window', 'Event', runtime.generate())(
      require,
      { dispatchEvent: (event: { type: string }) => events.push(event.type) },
      class {
        constructor(public type: string) {}
      },
    );
    const handlers: ((status: string) => void)[] = [];
    const module = {
      hot: {
        addStatusHandler: (handler: (status: string) => void) =>
          handlers.push(handler),
      },
    };
    for (const intercept of require.i) {
      intercept({ module });
      intercept({ module });
    }
    expect(handlers).toHaveLength(1);
    expect(handlers[0]('check')).toBeUndefined();
    handlers[0]('prepare');
    handlers[0]('idle');
    expect(events).toEqual(['mf:hmr-check']);
  });
  it('does not install runtime hooks in production', () => {
    const tap = jest.fn();
    new DevHMRSignalPlugin().apply({
      options: { mode: 'production' },
      hooks: { thisCompilation: { tap } },
    } as any);
    expect(tap).not.toHaveBeenCalled();
  });
});
