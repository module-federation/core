import { assert, describe, it, expect } from 'vitest';
import { ModuleFederation } from '../src/index';

describe('ModuleFederation', () => {
  it('registers new remotes and loads them correctly', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
    // Register new remotes
    FM.registerRemotes([
      {
        name: '@register-remotes/app2',
        entry:
          'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
      },
    ]);
    const app2Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app2Module);
    const res = await app2Module();
    expect(res).toBe('hello app2');
  });
  it('does not merge loaded remote by default', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    FM.registerRemotes([
      {
        name: '@register-remotes/app1',
        // Entry is different from the registered remote
        entry:
          'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
      },
    ]);

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
  });
  it('merges loaded remote by setting "force: true"', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/app1',
          // Entry is different from the registered remote
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
        },
      ],
      { force: true },
    );
    const newApp1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(newApp1Module);
    const newApp1Res = await newApp1Module();
    // Value is different from the registered remote
    expect(newApp1Res).toBe('hello app1 entry2');
  });
  it('merges call-level fetchOptions with each remote (remote wins on conflict)', () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
    });
    const fetchOptions: RequestInit = {
      headers: { Authorization: 'Bearer t' },
    };
    // No own fetchOptions: gets the call-level defaults.
    const r1 = {
      name: '@register-remotes/fetch-a',
      entry: 'http://localhost:1111/resources/register-remotes/app1/a.js',
    };
    // Own header added: merged on top of the call-level Authorization.
    const r2 = {
      name: '@register-remotes/fetch-b',
      entry: 'http://localhost:1111/resources/register-remotes/app1/b.js',
      fetchOptions: { headers: { 'X-B': '1' } } as RequestInit,
    };
    // Own header conflicts with the call-level one: remote wins.
    const r3 = {
      name: '@register-remotes/fetch-c',
      entry: 'http://localhost:1111/resources/register-remotes/app1/c.js',
      fetchOptions: {
        headers: { Authorization: 'Bearer override' },
      } as RequestInit,
    };
    FM.registerRemotes([r1, r2, r3], { fetchOptions });
    const stored = FM.options.remotes;
    expect(
      stored.find((r) => r.name === '@register-remotes/fetch-a')!.fetchOptions,
    ).toEqual({ headers: { Authorization: 'Bearer t' } });
    expect(
      stored.find((r) => r.name === '@register-remotes/fetch-b')!.fetchOptions,
    ).toEqual({ headers: { Authorization: 'Bearer t', 'X-B': '1' } });
    expect(
      stored.find((r) => r.name === '@register-remotes/fetch-c')!.fetchOptions,
    ).toEqual({ headers: { Authorization: 'Bearer override' } });
  });
});
