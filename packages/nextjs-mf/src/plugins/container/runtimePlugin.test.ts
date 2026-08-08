import { ModuleFederation } from '@module-federation/runtime-core';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import createRuntimePlugin from './runtimePlugin';

type BeforeRequest = NonNullable<
  ModuleFederationRuntimePlugin['beforeRequest']
>;
type BeforeRequestArgs = Parameters<BeforeRequest>[0];
type Remote = Extract<
  BeforeRequestArgs['options']['remotes'][number],
  { entry: string }
>;
type TestBeforeRequestArgs = BeforeRequestArgs & {
  options: BeforeRequestArgs['options'] & {
    remotes: Array<Remote>;
  };
};

describe('next-internal-plugin beforeRequest', () => {
  const plugin = createRuntimePlugin();
  const beforeRequest = plugin.beforeRequest!;
  const origin = new ModuleFederation({
    name: 'nextjs-mf-test-host',
    remotes: [],
  });

  function makeArgs(id: string, remotes: Array<Remote>): TestBeforeRequestArgs {
    return {
      id,
      options: {
        name: 'nextjs-mf-test-host',
        remotes: remotes.map((r) => ({ ...r })),
        shared: {},
        plugins: [],
        inBrowser: false,
      },
      origin,
    };
  }

  async function runBeforeRequest(args: BeforeRequestArgs): Promise<void> {
    await beforeRequest(args);
  }

  it('appends ?t= when id has no expose path (bare id)', async () => {
    const args = makeArgs('app1', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote name matches id prefix', async () => {
    const args = makeArgs('app1/button', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote alias matches id prefix', async () => {
    const args = makeArgs('my-alias/button', [
      {
        name: 'my-remote-provider',
        alias: 'my-alias',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote has a scoped alias', async () => {
    const args = makeArgs('@scope/my-remote/widget', [
      {
        name: 'my-remote-provider',
        alias: '@scope/my-remote',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote has a scoped name (no alias)', async () => {
    const args = makeArgs('@federation/app1/button', [
      {
        name: '@federation/app1',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('does not double-append ?t= if already present', async () => {
    const args = makeArgs('app1/button', [
      {
        name: 'app1',
        entry: 'https://cdn.example.com/mf-manifest.json?t=1234567890',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toBe(
      'https://cdn.example.com/mf-manifest.json?t=1234567890',
    );
  });

  it('does not double-append &t= if already present after other params', async () => {
    const args = makeArgs('app1/button', [
      {
        name: 'app1',
        entry:
          'https://cdn.example.com/mf-manifest.json?token=abc&t=1234567890',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toBe(
      'https://cdn.example.com/mf-manifest.json?token=abc&t=1234567890',
    );
  });

  it('preserves existing query params when appending t=', async () => {
    const args = makeArgs('app1/button', [
      {
        name: 'app1',
        entry: 'https://cdn.example.com/mf-manifest.json?token=abc',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?token=abc&t=\d+$/,
    );
  });

  it('returns args unchanged when no remote matches', async () => {
    const args = makeArgs('unknown-remote/button', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toBe(
      'https://cdn.example.com/mf-manifest.json',
    );
  });

  it('only modifies the matching remote when multiple remotes exist', async () => {
    const args = makeArgs('app2/button', [
      {
        name: 'app1',
        entry: 'https://cdn.example.com/app1/mf-manifest.json',
      },
      {
        name: 'app2',
        entry: 'https://cdn.example.com/app2/mf-manifest.json',
      },
    ]);

    await runBeforeRequest(args);

    expect(args.options.remotes[0].entry).toBe(
      'https://cdn.example.com/app1/mf-manifest.json',
    );
    expect(args.options.remotes[1].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/app2\/mf-manifest\.json\?t=\d+$/,
    );
  });
});

describe('next-internal-plugin onLoad', () => {
  const plugin = createRuntimePlugin();
  const onLoad = plugin.onLoad!;
  const originalWindow = global.window;

  describe('server', () => {
    beforeEach(() => {
      delete global.window;
      globalThis.usedChunks = new Set();
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('awaits async exposeModuleFactory on server before proxy-wrapping', async () => {
      const moduleExports = { __esModule: true, default: null };
      const asyncFactory = async () => moduleExports;

      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: asyncFactory,
        exposeModule: undefined,
      });

      expect(typeof result).toBe('function');
      expect(result()).toEqual(
        expect.objectContaining({ __esModule: true, default: null }),
      );
    });

    it('returns a wrapper factory for async namespace exports on server', async () => {
      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: async () => ({ __esModule: true, default: null }),
        exposeModule: undefined,
      });

      expect(typeof result).toBe('function');
      expect(result()).toEqual(
        expect.objectContaining({ __esModule: true, default: null }),
      );
    });

    it('does not break Promise.prototype.then when async factory resolves on server', async () => {
      const asyncFactory = async () => ({ __esModule: true, default: null });

      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: asyncFactory,
        exposeModule: undefined,
      });

      expect(typeof result).toBe('function');
      expect(() =>
        Promise.resolve(result()).then(() => undefined),
      ).not.toThrow();
    });

    it('handles sync exposeModuleFactory on server', async () => {
      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: () => ({ __esModule: true, default: null }),
        exposeModule: undefined,
      });

      expect(typeof result).toBe('function');
      expect(result()).toEqual(
        expect.objectContaining({ __esModule: true, default: null }),
      );
    });

    it('propagates rejected async factory on server', async () => {
      await expect(
        onLoad({
          id: 'remote/expose',
          exposeModuleFactory: async () => {
            throw new Error('factory failed');
          },
          exposeModule: undefined,
        }),
      ).rejects.toThrow('factory failed');
    });

    it('keeps class default export constructible after async factory', async () => {
      class RemoteComponent {
        tag = 'remote';
      }

      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: async () => ({
          __esModule: true,
          default: RemoteComponent,
        }),
        exposeModule: undefined,
      });

      const exports = result();
      const instance = new exports.default();

      expect(instance).toBeInstanceOf(RemoteComponent);
      expect(instance.tag).toBe('remote');
    });

    it('records usedChunks when class is constructed', async () => {
      class RemoteComponent {}

      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: async () => ({
          __esModule: true,
          default: RemoteComponent,
        }),
        exposeModule: undefined,
      });

      const exports = result();
      new exports.default();

      expect(globalThis.usedChunks.has('remote/expose')).toBe(true);
    });

    it('preserves static properties on function exports', async () => {
      const fn = Object.assign(() => 'ok', {
        getServerSideProps: () => ({ props: {} }),
      });

      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: async () => ({
          __esModule: true,
          default: fn,
        }),
        exposeModule: undefined,
      });

      const exports = result();
      expect(exports.default()).toBe('ok');
      expect(exports.default.getServerSideProps()).toEqual({ props: {} });
    });

    it('keeps plain function default export callable', async () => {
      const result = await onLoad({
        id: 'remote/expose',
        exposeModuleFactory: async () => ({
          __esModule: true,
          default: () => 'plain-fn',
        }),
        exposeModule: undefined,
      });

      const exports = result();
      expect(exports.default()).toBe('plain-fn');
    });
  });

  describe('client', () => {
    afterEach(() => {
      global.window = originalWindow;
    });

    it('returns args unchanged on the client', async () => {
      global.window = originalWindow ?? ({} as Window & typeof globalThis);

      const input = {
        id: 'remote/expose',
        exposeModuleFactory: async () => ({ __esModule: true, default: null }),
        exposeModule: undefined,
      };

      const result = await onLoad(input);

      expect(result).toBe(input);
    });
  });
});
