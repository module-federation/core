const hashmap = {} as Record<string, string>;
import crypto from 'crypto';
const requireCacheRegex =
  /(remote|runtime|server|hot-reload|react-loadable-manifest)/;

const performReload = (shouldReload: any) => {
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
  // globalThis.__remote_scope__ = {
  //   _config: {},
  //   _medusa: {},
  // };
  //@ts-ignore
  globalThis.backupScope = {};
  //@ts-ignore
  globalThis.factoryTracker = {};

  // Object.keys(req.cache).forEach((key) => {
  //   if (requireCacheRegex.test(key)) {
  //     delete req.cache[key];
  //   }
  // });

  return true;
};
/*
 This code is doing two things First it checks if there are any fake remotes in the
 global scope If so then we need to reload the server because a remote has changed
 and needs to be fetched again Second it checks for each remote that was loaded by
 webpack whether its hash has changed since last time or not
  */
export const revalidate = () => {
  //@ts-ignore
  if (globalThis.__remote_scope__) {
    //@ts-ignore
    const remoteScope = globalThis.__remote_scope__;

    return new Promise((res) => {
      const fetches = [];
      for (const property in remoteScope) {
        if (!remoteScope[property]) {
          console.error(
            'unreachable remote found',
            property,
            'hot reloading to refetch',
          );
          res(true);
          break;
        }
      }

      const fetchModule = getFetchModule();

      if (remoteScope._medusa) {
        for (const property in remoteScope._medusa) {
          fetchModule(property)
            .then((res: Response) => res.json())
            .then((medusaResponse: any) => {
              //@ts-ignore
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
                return res(true);
              }
            });
        }
      }

      for (const property in remoteScope._config) {
        let remote = remoteScope._config[property];

        const resolveRemote = async () => {
          remote = await remote();
        };

        if (typeof remote === 'function') {
          resolveRemote();
        }

        if (remote.fake) {
          console.log(
            'fake remote found',
            property,
            'hot reloading to refetch',
          );
          res(true);
        }

        const name = property;
        const url = remote;

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
          .then((contents: string) => {
            const hash = crypto
              .createHash('md5')
              .update(contents)
              .digest('hex');

            if (hashmap[name]) {
              if (hashmap[name] !== hash) {
                hashmap[name] = hash;
                console.log(name, 'hash is different - must hot reload server');
                res(true);
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
      Promise.all(fetches).then(() => res(false));
    }).then((shouldReload) => {
      return performReload(shouldReload);
    });
  }

  return Promise.resolve(false);
};

/*
 This code is importing the nodefetch module and assigning it to a variable named
 node Fetch The code then checks if there\'s an existing global object called webpack
 Chunk Load which is used by webpack If so we use that instead of nodefetch This
 allows us to use fetch in our tests without having to mock out nodefetch
  */
function getFetchModule() {
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
