import { afterEach, describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation } from '../src/index';

const entry = (name: string, suffix = '') =>
  `http://localhost:1111/resources/register-remotes/${name}/federation-remote-entry${suffix}.js`;
const createHost = () =>
  new ModuleFederation({
    name: '@federation/instance',
    version: '1.0.1',
    remotes: [{ name: '@register-remotes/app1', entry: entry('app1') }],
  });
const load = async (host: ModuleFederation, name = 'app1') => {
  const say = await host.loadRemote<() => string>(
    `@register-remotes/${name}/say`,
  );
  return say!();
};

describe('remote registration without Node plugins', () => {
  afterEach(() => {
    delete (globalThis as any)['@register-remotes/app1'];
    delete (globalThis as any)['@register-remotes/app2'];
  });
  it('registers new remotes and loads them correctly', async () => {
    const host = createHost();
    expect(await load(host)).toBe('hello app1 entry1');
    host.registerRemotes([
      { name: '@register-remotes/app2', entry: entry('app2') },
    ]);
    expect(await load(host, 'app2')).toBe('hello app2');
  });
  it('does not replace registered remotes by default', async () => {
    const host = createHost();
    host.registerRemotes([
      { name: '@register-remotes/app1', entry: entry('app1', '2') },
    ]);
    expect(await load(host)).toBe('hello app1 entry1');
  });
  it('synchronously replaces loaded remotes with force', async () => {
    const host = createHost();
    expect(await load(host)).toBe('hello app1 entry1');
    host.registerRemotes(
      [{ name: '@register-remotes/app1', entry: entry('app1', '2') }],
      { force: true },
    );
    expect(await load(host)).toBe('hello app1 entry2');
  });
  it('reloads a manifest at the same URL after force registration', async () => {
    const url = 'http://localhost:1111/force-manifest.json';
    let version = 1;
    const fetch = rs.fn(async (request: string) => {
      if (request !== url) return;
      return new Response(
        JSON.stringify({
          id: 'remote',
          name: 'remote',
          metaData: {
            name: 'remote',
            publicPath: 'http://localhost:1111/',
            type: 'app',
            globalName: `@snapshot/remote${version}`,
            buildInfo: { buildVersion: String(version) },
            remoteEntry: {
              name: 'federation-remote-entry.js',
              path: `resources/snapshot/remote${version}`,
            },
            types: { name: 'index.d.ts', path: './' },
          },
          remotes: [],
          shared: [],
          exposes: [],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    });
    const remote = { name: 'remote', entry: url };
    const host = new ModuleFederation({
      name: 'force-host',
      remotes: [remote],
      plugins: [{ name: 'manifest-fetch', fetch }],
    });
    expect(await (await host.loadRemote<() => string>('remote/say'))!()).toBe(
      'hello world "@snapshot/remote1"',
    );
    version = 2;
    host.registerRemotes([remote], { force: true });
    expect(await (await host.loadRemote<() => string>('remote/say'))!()).toBe(
      'hello world "@snapshot/remote2"',
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
