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
