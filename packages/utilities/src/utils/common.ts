import type {
  AsyncContainer,
  Remotes,
  RuntimeRemotesMap,
  RuntimeRemote,
} from '../types';

import fs from 'fs';
import fg from 'fast-glob';

// @ts-expect-error - because process.env.REMOTES is not typed
const remoteVars = (process.env.REMOTES || {}) as Record<string,
  Promise<any> | string | (() => Promise<any>)>;

// split the @ syntax into url and global
export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const runtimeRemotes = Object.entries(remoteVars).reduce(function (
    acc,
    item
  ) {
    const [key, value] = item;
    // if its an object with a thennable (eagerly executing function)
    if (typeof value === 'object' && typeof value.then === 'function') {
      acc[key] = {asyncContainer: value};
    }
    // if its a function that must be called (lazily executing function)
    else if (typeof value === 'function') {
      acc[key] = {asyncContainer: value()};
    }
    // if its just a string (global@url)
    else if (typeof value === 'string') {
      const [url, global] = extractUrlAndGlobal(value);
      acc[key] = {global, url};
    }
    // we dont know or currently support this type
    else {
      //@ts-ignore
      console.log('remotes process', process.env.REMOTES);
      throw new Error(`[mf] Invalid value received for runtime_remote "${key}"`);
    }
    return acc;
  },
  {} as RuntimeRemotesMap);

export const remotes = runtimeRemotes;

/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 *
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 */
export const injectScript = (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  // 1) Load remote container if needed
  let asyncContainer: RuntimeRemote['asyncContainer'];
  const reference =
    typeof keyOrRuntimeRemoteItem === 'string'
      ? runtimeRemotes[keyOrRuntimeRemoteItem]
      : keyOrRuntimeRemoteItem;

  if (reference.asyncContainer) {
    asyncContainer = reference.asyncContainer;
  } else {
    // This casting is just to satisfy typescript,
    // In reality remoteGlobal will always be a string;
    const remoteGlobal = reference.global as unknown as number;

    // Check if theres an ovveride for container key if not use remote global
    const containerKey = reference.uniqueKey
      ? (reference.uniqueKey as unknown as number)
      : remoteGlobal;

    const __webpack_error__ = new Error() as Error & {
      type: string;
      request: string | null;
    };

    asyncContainer = new Promise(function (resolve, reject) {
      function resolveRemoteGlobal() {
        const asyncContainer = window[
          remoteGlobal
          ] as unknown as AsyncContainer;
        return resolve(asyncContainer);
      }

      if (typeof window[remoteGlobal] !== 'undefined') {
        return resolveRemoteGlobal();
      }

      (__webpack_require__ as any).l(
        reference.url,
        function (event: Event) {
          if (typeof window[remoteGlobal] !== 'undefined') {
            return resolveRemoteGlobal();
          }

          const errorType =
            event && (event.type === 'load' ? 'missing' : event.type);
          const realSrc =
            event && event.target && (event.target as HTMLScriptElement).src;

          __webpack_error__.message =
            'Loading script failed.\n(' +
            errorType +
            ': ' +
            realSrc +
            ' or global var ' +
            remoteGlobal +
            ')';

          __webpack_error__.name = 'ScriptExternalLoadError';
          __webpack_error__.type = errorType;
          __webpack_error__.request = realSrc;

          reject(__webpack_error__);
        },
        containerKey
      );
    });
  }

  // 2) Initialize remote container
  return asyncContainer
    .then(function (container) {
      if (!__webpack_share_scopes__['default']) {
        // not always a promise, so we wrap it in a resolve
        return Promise.resolve(__webpack_init_sharing__('default')).then(
          function () {
            return container;
          }
        );
      } else {
        return container;
      }
    })
    .then(function (container) {
      try {
        // WARNING: here might be a potential BUG.
        //   `container.init` does not return a Promise, and here we do not call `then` on it.
        // But according to [docs](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers)
        //   it must be async.
        // The problem may be in Proxy in NextFederationPlugin.js.
        //   or maybe a bug in the webpack itself - instead of returning rejected promise it just throws an error.
        // But now everything works properly and we keep this code as is.
        container.init(__webpack_share_scopes__['default'] as any);
      } catch (e) {
        // maybe container already initialized so nothing to throw
      }
      return container;
    });
};

export const createRuntimeVariables = (remotes: Remotes) => {
  if (!remotes) {
    return {};
  }

  return Object.entries(remotes).reduce((acc, remote) => {
    // handle promise new promise and external new promise
    if (remote[1].startsWith('promise ') || remote[1].startsWith('external ')) {
      const promiseCall = remote[1]
        .replace('promise ', '')
        .replace('external ', '');
      acc[remote[0]] = `function() {
        return ${promiseCall}
      }`;
      return acc;
    }
    // if somehow its just the @ syntax or something else, pass it through
    acc[remote[0]] = JSON.stringify(remote[1]);

    return acc;
  }, {} as Record<string, string>);
};

/**
 * From provided ROOT_DIR `scan` pages directory
 * and return list of user defined pages
 * (except special ones, like _app, _document, _error)
 */
export function getNextPages(rootDir: string) {
  const [cwd, pagesDir] = getNextPagesRoot(rootDir);

  // scan all files in pages folder except pages/api
  let pageList = fg.sync('**/*.{ts,tsx,js,jsx}', {
    cwd,
    onlyFiles: true,
    ignore: ['api/**'],
  });

  // remove specific nextjs pages
  const exclude = [
    /^_app\..*/, // _app.tsx
    /^_document\..*/, // _document.tsx
    /^_error\..*/, // _error.tsx
    /^404\..*/, // 404.tsx
    /^500\..*/, // 500.tsx
    /^\[\.\.\..*\]\..*/, // /[...federationPage].tsx
  ];
  pageList = pageList.filter((page) => {
    return !exclude.some((r) => r.test(page));
  });

  pageList = pageList.map((page) => `${pagesDir}${page}`);

  return pageList;
}

export function sanitizePagePath(item: string) {
  return item
    .replace(/^src\/pages\//i, 'pages/')
    .replace(/\.(ts|tsx|js|jsx)$/, '');
}

function getNextPagesRoot(appRoot: string) {
  let pagesDir = 'src/pages/';
  let absPageDir = `${appRoot}/${pagesDir}`;
  if (!fs.existsSync(absPageDir)) {
    pagesDir = 'pages/';
    absPageDir = `${appRoot}/${pagesDir}`;
  }

  return [absPageDir, pagesDir];
}
