const hashmap = {} as Record<string, string>;
import crypto from 'crypto';

export const revalidate = () => {
  if (globalThis.__remote_scope__) {
    const remoteScope = globalThis.__remote_scope__;

    return new Promise((res) => {
      const fetches = [];
      for (const property in remoteScope) {
        if (remoteScope[property].fake) {
          console.log(
            'unreachable remote found',
            property,
            'hot reloading to refetch'
          );
          res(true);
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
            'hot reloading to refetch'
          );
          res(true);
        }

        const name = property;
        const url = remote;
        const fetchModule = getFetchModule()

        const fetcher = fetchModule(url)
          .then((re: Response) => {
            if (!re.ok) {
              throw new Error(
                `Error loading remote: status: ${
                  re.status
                }, content-type: ${re.headers.get('content-type')}`
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
              e
            );
          });

        fetches.push(fetcher);
      }
      Promise.all(fetches).then(() => res(false));
    }).then((shouldReload) => {
      if (!shouldReload) {
        return false;
      }
      let req: NodeRequire;
      if (typeof __non_webpack_require__ === 'undefined') {
        req = require;
      } else {
        req = __non_webpack_require__ as NodeRequire;
      }

      globalThis.__remote_scope__ = {
        _config: {},
      };

      Object.keys(req.cache).forEach((k) => {
        if (
          k.includes('remote') ||
          k.includes('runtime') ||
          k.includes('server') ||
          k.includes('hot-reload') ||
          k.includes('react-loadable-manifest')
        ) {
          delete req.cache[k];
        }
      });

      return true;
    });
  }

  return Promise.resolve(false);
};

function getFetchModule() {
  const loadedModule = globalThis.webpackChunkLoad || globalThis.fetch
  if (loadedModule) {
    return loadedModule
  }
  const nodeFetch = require('node-fetch')
  return nodeFetch.default || nodeFetch
}
