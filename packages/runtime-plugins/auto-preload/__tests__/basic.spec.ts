import { describe, it, assert } from 'vitest';
import { init } from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import { autoPreload } from '../src/plugin';

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
describe('basic usage', async () => {
  const mockSnapshot = {
    '@federation/host': {
      buildVersion: 'custom',
      publicPath: 'http://localhost:1111/resources/preload/preload-resource/',
      remoteEntry: 'federation-remote-entry.js',
      remotesInfo: {
        '@federation/sub1': {
          matchedVersion: '1.0.2',
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
      globalName: '__FEDERATION_@federation/sub1:custom__',
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
    plugins: [
      {
        name: 'auto-preload-plugin',
        async afterResolve(args) {
          // test will await to validate if preload work, but the real plugin will not await.
          await autoPreload(args, { useLinkPreload: true });
          return args;
        },
      },
    ],
  });

  it('auto preload assets when calling load remote', async () => {
    const reset = helpers.global.addGlobalSnapshot(mockSnapshot);
    await FMInstance.loadRemote('@federation/sub1/button');
    reset();
    expect(getPreloadElInfos().links).toMatchObject([
      {
        href: 'http://localhost:1111/resources/preload/preload-resource/button.sync.css',
        rel: 'preload',
        type: 'style',
      },
      {
        href: 'http://localhost:1111/resources/preload/preload-resource/ignore.sync.css',
        rel: 'preload',
        type: 'style',
      },
      {
        href: 'http://localhost:1111/resources/preload/preload-resource/button.sync.js',
        rel: 'preload',
        type: 'script',
      },
    ]);
  });
});
