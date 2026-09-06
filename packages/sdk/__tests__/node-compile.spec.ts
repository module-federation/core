import { jest } from '@jest/globals';

type NodeModule = typeof import('../src/node');

const loadNode = async (): Promise<NodeModule> => {
  jest.resetModules();
  return import('../src/node');
};

const withoutProcessVm = async (
  run: (node: NodeModule) => void | Promise<void>,
) => {
  // capability detection tries `require('vm')` then process.getBuiltinModule;
  // block both so the `new Function` backend is selected
  const getBuiltinModule = (process as any).getBuiltinModule;
  (process as any).getBuiltinModule = undefined;
  jest.doMock('vm', () => {
    throw new Error('vm unavailable');
  });
  try {
    await run(await loadNode());
  } finally {
    jest.dontMock('vm');
    (process as any).getBuiltinModule = getBuiltinModule;
  }
};

describe('buildCommonJsWrapper', () => {
  it('produces the shared wrapper shape', async () => {
    const { buildCommonJsWrapper } = await loadNode();
    expect(buildCommonJsWrapper(['exports', 'require'], 'body();')).toBe(
      '(function(exports, require) {body();\n})',
    );
  });
});

describe('compileCommonJsModule', () => {
  it('compiles through vm.Script with the given filename', async () => {
    const { compileCommonJsModule } = await loadNode();
    const run = compileCommonJsModule({
      source: 'exports.value = __filename; throw new Error("boom");',
      filename: 'remote-entry-under-test.js',
      parameters: ['exports', '__filename'],
    });
    const exports: Record<string, string> = {};
    let error: Error | undefined;
    try {
      run(exports, 'passed-filename');
    } catch (e) {
      error = e as Error;
    }
    expect(exports.value).toBe('passed-filename');
    expect(error?.stack).toContain('remote-entry-under-test.js');
    expect(run.name).toBe('');
  });

  it('falls back to new Function when vm is unavailable', async () => {
    await withoutProcessVm(({ compileCommonJsModule }) => {
      const run = compileCommonJsModule({
        source: 'exports.value = __filename;',
        filename: 'remote-entry-under-test.js',
        parameters: ['exports', '__filename'],
      });
      const exports: Record<string, string> = {};
      run(exports, 'passed-filename');
      expect(exports.value).toBe('passed-filename');
      expect(run.name).toBe('anonymous');
    });
  });

  it('propagates a syntax error instead of retrying on the other backend', async () => {
    const { compileCommonJsModule } = await loadNode();
    // the jsdom test realm has its own SyntaxError, so match by name
    expect(() =>
      compileCommonJsModule({
        source: 'const broken = { foo: };',
        filename: 'broken.js',
        parameters: ['exports'],
      }),
    ).toThrow(expect.objectContaining({ name: 'SyntaxError' }));

    jest.doMock('vm', () => ({
      Script: class {
        constructor() {
          throw new Error('vm backend failed');
        }
      },
    }));
    try {
      const node = await loadNode();
      expect(() =>
        node.compileCommonJsModule({
          source: 'exports.ok = true;',
          filename: 'fine.js',
          parameters: ['exports'],
        }),
      ).toThrow('vm backend failed');
    } finally {
      jest.dontMock('vm');
    }
  });
});

describe('withRemoteCompilationPolicy', () => {
  const v8 = jest.requireActual<{
    setFlagsFromString: (flags: string) => void;
  }>('v8');
  let events: string[];
  let setFlags: jest.SpiedFunction<typeof v8.setFlagsFromString>;
  const originalExecArgv = process.execArgv;
  const originalEnv = process.env['FEDERATION_REMOTE_COMPILATION_CACHE'];

  beforeEach(() => {
    events = [];
    setFlags = jest
      .spyOn(v8, 'setFlagsFromString')
      .mockImplementation((flags) => {
        events.push(flags);
      });
    process.execArgv = [];
    delete process.env['FEDERATION_REMOTE_COMPILATION_CACHE'];
  });

  afterEach(() => {
    setFlags.mockRestore();
    process.execArgv = originalExecArgv;
    if (originalEnv === undefined) {
      delete process.env['FEDERATION_REMOTE_COMPILATION_CACHE'];
    } else {
      process.env['FEDERATION_REMOTE_COMPILATION_CACHE'] = originalEnv;
    }
  });

  it('switches the cache off around the compile and back on after it', async () => {
    const { withRemoteCompilationPolicy } = await loadNode();
    const result = withRemoteCompilationPolicy(() => {
      events.push('compile');
      return 42;
    });
    expect(result).toBe(42);
    expect(events).toEqual([
      '--no-compilation-cache',
      'compile',
      '--compilation-cache',
    ]);
  });

  it('leaves the flag alone when the process already runs without the cache', async () => {
    process.execArgv = ['--no-compilation-cache'];
    const { withRemoteCompilationPolicy } = await loadNode();
    expect(withRemoteCompilationPolicy(() => 'ok')).toBe('ok');
    expect(setFlags).not.toHaveBeenCalled();
  });

  it('toggles exactly once for nested calls', async () => {
    const { withRemoteCompilationPolicy } = await loadNode();
    withRemoteCompilationPolicy(() =>
      withRemoteCompilationPolicy(() => events.push('inner')),
    );
    expect(events).toEqual([
      '--no-compilation-cache',
      'inner',
      '--compilation-cache',
    ]);
  });

  it('restores the flag and rethrows when the compile throws', async () => {
    const { withRemoteCompilationPolicy } = await loadNode();
    expect(() =>
      withRemoteCompilationPolicy(() => {
        throw new Error('compile failed');
      }),
    ).toThrow('compile failed');
    expect(events).toEqual(['--no-compilation-cache', '--compilation-cache']);
  });

  it('compiles normally when setFlagsFromString is missing', async () => {
    jest.doMock('v8', () => ({}));
    try {
      const { withRemoteCompilationPolicy } = await loadNode();
      expect(withRemoteCompilationPolicy(() => 'ok')).toBe('ok');
      expect(setFlags).not.toHaveBeenCalled();
    } finally {
      jest.dontMock('v8');
    }
  });

  it('does nothing when FEDERATION_REMOTE_COMPILATION_CACHE=default', async () => {
    process.env['FEDERATION_REMOTE_COMPILATION_CACHE'] = 'default';
    const { withRemoteCompilationPolicy } = await loadNode();
    expect(withRemoteCompilationPolicy(() => 'ok')).toBe('ok');
    expect(setFlags).not.toHaveBeenCalled();
  });
});
