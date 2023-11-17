const hashmap = {} as Record<string, string>;
import crypto from 'crypto';

const requireCacheRegex =
  /(remote|runtime|server|hot-reload|react-loadable-manifest)/;

export const performReload = (shouldReload: any) => {
  if (!shouldReload) {
    return false;
  }
  let req: NodeRequire;
  if (typeof __non_webpack_require__ === 'undefined') {
    req = require;
  } else {
    req = __non_webpack_require__ as NodeRequire;
  }

  //@ts-ignore
  globalThis.__remote_scope__ = {};

  Object.keys(req.cache).forEach((key) => {
    if (requireCacheRegex.test(key)) {
      delete req.cache[key];
    }
  });

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
  for (const property in remoteScope._config) {
    const name = property;
    const url = remoteScope._config[property];

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
  return Promise.all(fetches);
};
//@ts-ignore
export const revalidate = (
  remoteScope: any = globalThis.__remote_scope__ || {},
  fetchModule: any = getFetchModule() || (() => {}),
) => {
  return new Promise((res) => {
    if (checkUnreachableRemote(remoteScope)) {
      res(true);
    }
    // @ts-ignore
    if (checkMedusaConfigChange(remoteScope, fetchModule)) {
      res(true);
    }

    if (checkFakeRemote(remoteScope)) {
      res(true);
    }

    fetchRemote(remoteScope, fetchModule).then(() => res(false));
  }).then((shouldReload) => {
    return performReload(shouldReload);
  });
};

export function getFetchModule() {
  //@ts-ignore
  const loadedModule =
    globalThis.webpackChunkLoad || global.webpackChunkLoad || global.fetch;
  if (loadedModule) {
    return loadedModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch');
  return nodeFetch.default || nodeFetch;
}
