import { describe, it, assert } from 'vitest';
import { init } from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import autoPreloadPlugin from '../src';
import { mockStaticServer } from './mock/utils';

interface LinkInfo {
  type: string;
  href: string;
}

interface ScriptInfo {
  src: string;
  crossorigin: string;
}

function getLinkInfos(): Array<LinkInfo> {
  const links = document.querySelectorAll('link');
  const linkInfos: Array<LinkInfo> = Array.from(links).map((link) => ({
    type: link.getAttribute('as') || '',
    href: link.getAttribute('href') || '',
    rel: link.getAttribute('rel') || '',
  }));
  return linkInfos;
}
function getScriptInfos(): Array<ScriptInfo> {
  const scripts = document.querySelectorAll('script');
  const scriptInfos: Array<ScriptInfo> = Array.from(scripts).map((script) => ({
    src: script.getAttribute('src') || '',
    crossorigin: script.getAttribute('crossorigin') || '',
  }));

  return scriptInfos;
}

function getPreloadElInfos(): {
  links: LinkInfo[];
  scripts: ScriptInfo[];
} {
  return {
    links: getLinkInfos(),
    scripts: getScriptInfos(),
  };
}

// eslint-disable-next-line max-lines-per-function
describe('basic usage', () => {
  const mockSnapshot = {
    '@federation/host': {
      buildVersion: 'custom',
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'federation-remote-entry.js',
      remotesInfo: {
        '@federation/sub1': {
          matchedVersion: '1.0.2',
        },
        '@federation/sub2': {
          matchedVersion: '1.0.3',
        },
        '@federation/sub3': {
          matchedVersion: '1.0.3',
        },
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
        '@federation/sub1-button': {
          matchedVersion: '1.0.3',
        },
        '@federation/sub1-add': {
          matchedVersion: '1.0.3',
        },
      },
    },
    '@federation/sub1-button:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: {
              sync: [],
              async: [],
            },
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
            css: {
              sync: [],
              async: [],
            },
            js: {
              sync: ['sub1-add/add.sync.js'],
              async: ['sub1-add/add.async.js'],
            },
          },
        },
      ],
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'sub1-add/federation-remote-entry.js',
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
        '@federation/sub2-button': {
          matchedVersion: '1.0.3',
        },
        '@federation/sub2-add': {
          matchedVersion: '1.0.3',
        },
      },
    },
    '@federation/sub2-button:1.0.3': {
      buildVersion: 'custom',
      modules: [
        {
          moduleName: 'button',
          assets: {
            css: {
              sync: [],
              async: [],
            },
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
            css: {
              sync: [],
              async: [],
            },
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
            css: {
              sync: [],
              async: [],
            },
            js: {
              sync: ['sub3/button.sync.js'],
              async: [],
            },
          },
        },
        {
          moduleName: 'add',
          assets: {
            css: {
              sync: [],
              async: [],
            },
            js: {
              sync: ['sub3/add.sync.js'],
              async: [],
            },
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
    helpers.global.Global.__FEDERATION__.__PRELOADED_MAP__.clear();
  });
  const FMInstance = init({
    name: '@federation/host',
    remotes: [
      {
        name: '@federation/sub1',
        version: '1.0.2',
      },
      {
        name: '@federation/sub2',
        version: '1.0.3',
      },
      {
        name: '@federation/sub3',
        version: '1.0.3',
      },
    ],
    plugins: [autoPreloadPlugin()],
  });

  it('auto preload assets when calling load remote', async () => {
    const reset = helpers.global.addGlobalSnapshot(mockSnapshot);
    await FMInstance.loadRemote('@federation/sub1/say');
    reset();
    expect(getPreloadElInfos()).toEqual({});
  });
});
