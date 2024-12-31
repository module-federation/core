import { describe, it } from 'vitest';
import { init } from '../src/index';
import { mockStaticServer } from './mock/utils';
import { Global, addGlobalSnapshot } from '@module-federation/runtime-core';
interface LinkInfo {
  type: string;
  href: string;
  rel: string;
}

interface ScriptInfo {
  src: string;
  crossorigin: string;
}

function getLinkInfos(): Array<LinkInfo> {
  const links = document.querySelectorAll('link');
  return Array.from(links).map((link) => ({
    type: link.getAttribute('as') || '',
    href: link.getAttribute('href') || '',
    rel: link.getAttribute('rel') || '',
  }));
}
function getScriptInfos(): Array<ScriptInfo> {
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).map((script) => ({
    src: script.getAttribute('src') || '',
    crossorigin: script.getAttribute('crossorigin') || '',
  }));
}
function getPreloadElInfos() {
  return {
    links: getLinkInfos(),
    scripts: getScriptInfos(),
  };
}
describe('preload-remote inBrowser', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });
  const mockSnapshot = {
    '@federation/preload-remote': {
      buildVersion: 'custom',
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'federation-remote-entry.js',
      remotesInfo: {
        '@federation/sub1': { matchedVersion: '1.0.2' },
        '@federation/sub2': { matchedVersion: '1.0.3' },
        '@federation/sub3': { matchedVersion: '1.0.3' },
      },
    },
    '@federation/sub1:1.0.2': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: {
              sync: ['button.sync.css', 'ignore.sync.css'],
              async: ['button.async.css'],
            },
            js: {
              sync: ['button.sync.js'],
              async: ['button.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'federation-remote-entry.js',
      remotesInfo: {
        '@federation/sub1-button': { matchedVersion: '1.0.3' },
        '@federation/sub1-add': { matchedVersion: '1.0.3' },
      },
    },
    '@federation/sub1-button:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: { sync: [], async: [] },
            js: {
              sync: ['sub1-button/button.sync.js'],
              async: ['sub1-button/button.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub1-button/federation-remote-entry.js',
    },
    '@federation/sub1-add:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'add',
          assets: {
            css: { sync: [], async: [] },
            js: {
              sync: ['sub1-add/add.sync.js'],
              async: ['sub1-add/add.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub1-button/federation-remote-entry.js',
    },
    '@federation/sub2:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: {
              sync: ['sub2/button.sync.css'],
              async: ['sub2/button.async.css'],
            },
            js: {
              sync: ['sub2/button.sync.js'],
              async: ['sub2/button.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub2/federation-remote-entry.js',
      remotesInfo: {
        '@federation/sub2-button': { matchedVersion: '1.0.3' },
        '@federation/sub2-add': { matchedVersion: '1.0.3' },
      },
    },
    '@federation/sub2-button:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: { sync: [], async: [] },
            js: {
              sync: ['sub2-button/button.sync.js'],
              async: ['sub2-button/button.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub2-button/federation-remote-entry.js',
    },
    '@federation/sub2-add:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'add',
          assets: {
            css: { sync: [], async: [] },
            js: {
              sync: ['sub2-add/add.sync.js'],
              async: ['sub2-add/add.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub2-button/federation-remote-entry.js',
    },
    '@federation/sub3:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: { sync: [], async: [] },
            js: { sync: ['sub3/button.sync.js'], async: [] },
          },
        },
        {
          moduleName: 'add',
          assets: {
            css: { sync: [], async: [] },
            js: { sync: ['sub3/add.sync.js'], async: [] },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub3/federation-remote-entry.js',
    },
  };
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    Global.__FEDERATION__.__PRELOADED_MAP__.clear();
  });
  const FMInstance = init({
    name: '@federation/preload-remote',
    remotes: [
      { name: '@federation/sub1', version: '1.0.2' },
      { name: '@federation/sub2', version: '1.0.3' },
      { name: '@federation/sub3', version: '1.0.3' },
    ],
    plugins: [
      {
        name: 'preload-resource-inbrowser',
        beforeInit(args) {
          args.options.inBrowser = true;
          return args;
        },
      },
    ],
  });
  it('1 preload with default config', async () => {
    const reset = addGlobalSnapshot(mockSnapshot);
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(0);
    await FMInstance.preloadRemote([
      {
        nameOrAlias: '@federation/sub1',
        filter(assetUrl) {
          return assetUrl.indexOf('ignore') === -1;
        },
        depsRemote: [{ nameOrAlias: '@federation/sub1-button' }],
      },
    ]);

    expect(getPreloadElInfos()).toMatchSnapshot();
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(2);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@federation/sub1/button'),
    ).toBe(true);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get(
        '@federation/sub1-button/button',
      ),
    ).toBe(true);
    reset();
  });

  it('2 preload with all config ', async () => {
    const reset = addGlobalSnapshot(mockSnapshot);
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(0);
    await FMInstance.preloadRemote([
      {
        nameOrAlias: '@federation/sub2',
        resourceCategory: 'all',
      },
    ]);

    expect(getPreloadElInfos()).toMatchSnapshot();
    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(3);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@federation/sub2/button'),
    ).toBe(true);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get(
        '@federation/sub2-button/button',
      ),
    ).toBe(true);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@federation/sub2-add/add'),
    ).toBe(true);
    reset();
  });

  it('3 preload with expose config ', async () => {
    const reset = addGlobalSnapshot(mockSnapshot);

    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(0);
    await FMInstance.preloadRemote([
      {
        nameOrAlias: '@federation/sub3',
        resourceCategory: 'all',
        exposes: ['add'],
      },
    ]);
    expect(getPreloadElInfos()).toMatchSnapshot();

    expect(Global.__FEDERATION__.__PRELOADED_MAP__.size).toBe(1);
    expect(
      Global.__FEDERATION__.__PRELOADED_MAP__.get('@federation/sub3/add'),
    ).toBe(true);

    await FMInstance.preloadRemote([
      {
        nameOrAlias: '@federation/sub3',
        resourceCategory: 'all',
        exposes: ['add'],
      },
    ]);
    expect(getPreloadElInfos()).toMatchSnapshot();
    reset();
  });
});
