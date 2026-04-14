import createRuntimePlugin from './runtimePlugin';

describe('next-internal-plugin beforeRequest', () => {
  const plugin = createRuntimePlugin();
  const beforeRequest = plugin.beforeRequest! as (args: any) => any;

  function makeArgs(
    id: string,
    remotes: Array<{ name: string; alias?: string; entry: string }>,
  ) {
    return {
      id,
      options: {
        remotes: remotes.map((r) => ({ ...r })),
      },
    };
  }

  it('appends ?t= when id has no expose path (bare id)', () => {
    const args = makeArgs('app1', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote name matches id prefix', () => {
    const args = makeArgs('app1/button', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote alias matches id prefix', () => {
    const args = makeArgs('my-alias/button', [
      {
        name: 'my-remote-provider',
        alias: 'my-alias',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote has a scoped alias', () => {
    const args = makeArgs('@scope/my-remote/widget', [
      {
        name: 'my-remote-provider',
        alias: '@scope/my-remote',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('appends ?t= when remote has a scoped name (no alias)', () => {
    const args = makeArgs('@federation/app1/button', [
      {
        name: '@federation/app1',
        entry: 'https://cdn.example.com/mf-manifest.json',
      },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/mf-manifest\.json\?t=\d+$/,
    );
  });

  it('does not double-append ?t= if already present', () => {
    const args = makeArgs('app1/button', [
      {
        name: 'app1',
        entry: 'https://cdn.example.com/mf-manifest.json?t=1234567890',
      },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toBe(
      'https://cdn.example.com/mf-manifest.json?t=1234567890',
    );
  });

  it('returns args unchanged when no remote matches', () => {
    const args = makeArgs('unknown-remote/button', [
      { name: 'app1', entry: 'https://cdn.example.com/mf-manifest.json' },
    ]);

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toBe(
      'https://cdn.example.com/mf-manifest.json',
    );
  });

  it('only modifies the matching remote when multiple remotes exist', () => {
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

    const result = beforeRequest(args);

    expect(result.options.remotes[0].entry).toBe(
      'https://cdn.example.com/app1/mf-manifest.json',
    );
    expect(result.options.remotes[1].entry).toMatch(
      /^https:\/\/cdn\.example\.com\/app2\/mf-manifest\.json\?t=\d+$/,
    );
  });
});
