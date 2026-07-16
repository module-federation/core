import { assert, describe, it, expect, rs } from '@rstest/core';
import { ModuleFederation } from '../src/index';

describe('ModuleFederation', () => {
  it('resolves remote entry URL references against the document URL', () => {
    const originalUrl = `${location.pathname}${location.search}${location.hash}`;
    window.history.replaceState({}, '', '/catalog/item/1?tab=details#summary');

    try {
      const FM = new ModuleFederation({
        name: '@federation/relative-entry-instance',
        remotes: [
          { name: 'current', entry: './mf-manifest.json' },
          { name: 'parent', entry: '../mf-manifest.json' },
          { name: 'root', entry: '/mf-manifest.json' },
          { name: 'bare', entry: 'mf-manifest.json' },
          { name: 'protocol-relative', entry: '//cdn.example/remoteEntry.js' },
          {
            name: 'absolute',
            entry: 'https://cdn.example/remoteEntry.js?version=1#entry',
          },
          { name: 'query', entry: '?manifest=1' },
          { name: 'hash', entry: '#manifest' },
        ],
      });

      expect(
        FM.options.remotes.map((remote) =>
          'entry' in remote ? remote.entry : undefined,
        ),
      ).toEqual([
        `${location.origin}/catalog/item/mf-manifest.json`,
        `${location.origin}/catalog/mf-manifest.json`,
        `${location.origin}/mf-manifest.json`,
        `${location.origin}/catalog/item/mf-manifest.json`,
        `${location.protocol}//cdn.example/remoteEntry.js`,
        'https://cdn.example/remoteEntry.js?version=1#entry',
        `${location.origin}/catalog/item/1?manifest=1`,
        `${location.origin}/catalog/item/1?tab=details#manifest`,
      ]);
    } finally {
      window.history.replaceState({}, '', originalUrl);
    }
  });

  it('resolves explicit relative entries against the document base URL', () => {
    const base = document.createElement('base');
    base.href = '/nested/application/';
    document.head.appendChild(base);

    try {
      const FM = new ModuleFederation({
        name: '@federation/document-base-instance',
        remotes: [
          { name: 'current', entry: './mf-manifest.json' },
          { name: 'parent', entry: '../mf-manifest.json' },
          { name: 'bare', entry: 'mf-manifest.json' },
          { name: 'query', entry: '?manifest=1' },
          { name: 'hash', entry: '#manifest' },
        ],
      });

      expect(
        FM.options.remotes.map((remote) =>
          'entry' in remote ? remote.entry : undefined,
        ),
      ).toEqual([
        `${location.origin}/nested/application/mf-manifest.json`,
        `${location.origin}/nested/mf-manifest.json`,
        `${location.origin}/nested/application/mf-manifest.json`,
        `${location.origin}/nested/application/?manifest=1`,
        `${location.origin}/nested/application/#manifest`,
      ]);
    } finally {
      base.remove();
    }
  });

  it('preserves relative entries outside the browser', () => {
    const FM = new ModuleFederation({
      name: '@federation/non-browser-entry-instance',
      remotes: [],
    });

    rs.stubGlobal('window', undefined);
    try {
      FM.registerRemotes([
        { name: 'server-relative', entry: './mf-manifest.json' },
      ]);

      expect(FM.options.remotes[0]).toMatchObject({
        name: 'server-relative',
        entry: './mf-manifest.json',
      });
    } finally {
      rs.unstubAllGlobals();
    }
  });

  it('resolves a forced re-registration against the current document base URL', () => {
    const base = document.createElement('base');
    base.href = '/first/deployment/';
    document.head.appendChild(base);

    try {
      const FM = new ModuleFederation({
        name: '@federation/re-registered-entry-instance',
        remotes: [{ name: 'relative', entry: './mf-manifest.json' }],
      });

      base.href = '/second/deployment/';
      FM.registerRemotes([{ name: 'relative', entry: './mf-manifest.json' }], {
        force: true,
      });

      expect(FM.options.remotes).toHaveLength(1);
      expect(FM.options.remotes[0]).toMatchObject({
        name: 'relative',
        entry: `${location.origin}/second/deployment/mf-manifest.json`,
      });
    } finally {
      base.remove();
    }
  });

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
  it('reloads manifest snapshots when a manifest remote is force registered with the same entry', async () => {
    const manifestUrl =
      'http://localhost:1111/resources/register-remotes/manifest/federation-manifest.json';
    const manifests = [
      {
        id: '@register-remotes/manifest',
        name: '@register-remotes/manifest',
        metaData: {
          name: '@register-remotes/manifest',
          publicPath: 'http://localhost:1111/',
          type: 'app',
          globalName: '@snapshot/remote1',
          buildInfo: {
            buildVersion: 'first',
          },
          remoteEntry: {
            name: 'federation-remote-entry.js',
            path: 'resources/snapshot/remote1',
          },
          types: {
            name: 'index.d.ts',
            path: './',
          },
        },
        remotes: [],
        shared: [],
        exposes: [],
      },
      {
        id: '@register-remotes/manifest',
        name: '@register-remotes/manifest',
        metaData: {
          name: '@register-remotes/manifest',
          publicPath: 'http://localhost:1111/',
          type: 'app',
          globalName: '@snapshot/remote2',
          buildInfo: {
            buildVersion: 'second',
          },
          remoteEntry: {
            name: 'federation-remote-entry.js',
            path: 'resources/snapshot/remote2',
          },
          types: {
            name: 'index.d.ts',
            path: './',
          },
        },
        remotes: [],
        shared: [],
        exposes: [],
      },
    ];
    const manifestFetch = rs.fn((url: string) => {
      if (url === manifestUrl) {
        return Promise.resolve(
          new Response(
            JSON.stringify(manifests[manifestFetch.mock.calls.length - 1]),
            {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }
    });
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/manifest',
          entry: manifestUrl,
        },
      ],
      plugins: [
        {
          name: 'manifest-fetch',
          fetch: manifestFetch,
        },
      ],
    });

    const appModule = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/manifest/say',
    );
    assert(appModule);
    expect(await appModule()).toBe('hello world "@snapshot/remote1"');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/manifest',
          entry: manifestUrl,
        },
      ],
      { force: true },
    );

    const nextAppModule = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/manifest/say',
    );
    assert(nextAppModule);
    expect(await nextAppModule()).toBe('hello world "@snapshot/remote2"');
    expect(manifestFetch).toHaveBeenCalledTimes(2);
  });
});
