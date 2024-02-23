import { getAllKnownRemotes } from './flush-chunks';

const hashmap = {} as Record<string, string>;
import crypto from 'crypto';

const requireCacheRegex =
  /(remote|server|hot-reload|react-loadable-manifest|runtime|styled-jsx)/;

export const performReload = (shouldReload: any) => {
  if (!shouldReload) {
    return false;
  }
  const remotesFromAPI = getAllKnownRemotes();

  let req: NodeRequire;
  //@ts-ignore
  if (typeof __non_webpack_require__ === 'undefined') {
    req = require;
  } else {
    //@ts-ignore
    req = __non_webpack_require__ as NodeRequire;
  }

  const gs = new Function('return globalThis')();
  // no need to clear whole cache
  // Object.keys(req.cache).forEach((key) => {
  //   //delete req.cache[key];
  //   if (requireCacheRegex.test(key)) {
  //     delete req.cache[key];
  //   }
  // });

  //@ts-ignore
  __webpack_require__.federation.instance.moduleCache.clear();
  gs.__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
  //@ts-ignore
  gs.__FEDERATION__.__INSTANCES__.map((i) => {
    i.moduleCache.clear();
    if (gs[i.name]) {
      delete gs[i.name];
    }
  });
  gs.__FEDERATION__.__INSTANCES__ = [];

  // reinit the runtime here
  //@ts-ignore
  __webpack_require__.federation.instance =
    //@ts-ignore
    __webpack_require__.federation.runtime.init(
      //@ts-ignore
      __webpack_require__.federation.initOptions,
    );
  //@ts-ignore
  if (__webpack_require__.federation.attachShareScopeMap) {
    //@ts-ignore
    __webpack_require__.federation.attachShareScopeMap(__webpack_require__);
  }
  //@ts-ignore
  if (__webpack_require__.federation.installInitialConsumes) {
    //@ts-ignore
    __webpack_require__.federation.installInitialConsumes();
  }
  return true;
};

export const checkUnreachableRemote = (remoteScope: any) => {
  for (const property in remoteScope.remotes) {
    if (!remoteScope[property]) {
      console.error(
        'unreachable remote found',
        property,
        'hot reloading to refetch',
      );
      return true;
    }
  }
  return false;
};

export const checkMedusaConfigChange = (remoteScope: any, fetchModule: any) => {
  //@ts-ignore
  if (remoteScope._medusa) {
    //@ts-ignore
    for (const property in remoteScope._medusa) {
      fetchModule(property)
        .then((res: Response) => res.json())
        .then((medusaResponse: any): void | boolean => {
          if (
            medusaResponse.version !==
            //@ts-ignore
            remoteScope?._medusa[property].version
          ) {
            console.log(
              'medusa config changed',
              property,
              'hot reloading to refetch',
            );
            performReload(true);
            return true;
          }
        });
    }
  }
  return false;
};

export const checkFakeRemote = (remoteScope: any) => {
  for (const property in remoteScope._config) {
    let remote = remoteScope._config[property];

    const resolveRemote = async () => {
      remote = await remote();
    };

    if (typeof remote === 'function') {
      resolveRemote();
    }

    if (remote.fake) {
      console.log('fake remote found', property, 'hot reloading to refetch');
      return true;
    }
  }
  return false;
};

export const fetchRemote = (remoteScope: any, fetchModule: any) => {
  const fetches = [];
  let needReload = false;
  for (const property in remoteScope) {
    const name = property;
    const container = remoteScope[property];
    const url = container.entry;
    const fetcher = fetchModule(url)
      .then((re: Response) => {
        if (!re.ok) {
          throw new Error(
            `Error loading remote: status: ${
              re.status
            }, content-type: ${re.headers.get('content-type')}`,
          );
        }
        return re.text();
      })
      .then((contents: string): void | boolean => {
        const hash = crypto.createHash('md5').update(contents).digest('hex');
        if (hashmap[name]) {
          if (hashmap[name] !== hash) {
            hashmap[name] = hash;
            needReload = true;
            console.log(name, 'hash is different - must hot reload server');
            return true;
          }
        } else {
          hashmap[name] = hash;
        }
      })
      .catch((e: Error) => {
        console.error(
          'Remote',
          name,
          url,
          'Failed to load or is not online',
          e,
        );
      });

    fetches.push(fetcher);
  }
  return Promise.all(fetches).then(() => {
    return needReload;
  });
};
//@ts-ignore
export const revalidate = (
  fetchModule: any = getFetchModule() || (() => {}),
  force: boolean = false,
) => {
  const gs = new Function('return globalThis')();
  for (const entry of gs.nextEntryCache) {
    //@ts-ignore
    delete __non_webpack_require__.cache[entry];
  }
  gs.nextEntryCache.clear();

  const remotesFromAPI = getAllKnownRemotes();
  //@ts-ignore
  return new Promise((res) => {
    if (force) {
      res(true);
      return;
    }
    if (checkMedusaConfigChange(remotesFromAPI, fetchModule)) {
      res(true);
    }

    if (checkFakeRemote(remotesFromAPI)) {
      res(true);
    }

    fetchRemote(remotesFromAPI, fetchModule).then((val) => {
      res(val);
    });
  }).then((shouldReload) => {
    return performReload(force || shouldReload);
  });
};

export function getFetchModule() {
  //@ts-ignore
  const loadedModule =
    //@ts-ignore
    globalThis.webpackChunkLoad || global.webpackChunkLoad || global.fetch;
  if (loadedModule) {
    return loadedModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch');
  return nodeFetch.default || nodeFetch;
}
