import { getAllKnownRemotes } from './flush-chunks';
import crypto from 'crypto';
import helpers from '@module-federation/runtime/helpers';
import path from 'path';

declare global {
  var mfHashMap: Record<string, string> | undefined;
  var moduleGraphDirty: boolean;
}

const getRequire = (): NodeRequire => {
  //@ts-ignore
  return typeof __non_webpack_require__ !== 'undefined'
    ? __non_webpack_require__
    : eval('require');
};

function callsites(): any[] {
  const _prepareStackTrace = Error.prepareStackTrace;
  try {
    let result: any[] = [];
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1);
      result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
    };

    new Error().stack;
    return result;
  } finally {
    Error.prepareStackTrace = _prepareStackTrace;
  }
}

const find = function (moduleName: string): string | undefined {
  if (moduleName[0] === '.') {
    // Use custom callsites function
    const stack = callsites();
    for (const frame of stack) {
      const filename = frame.getFileName();
      if (filename && filename !== module.filename) {
        moduleName = path.resolve(path.dirname(filename), moduleName);
        break;
      }
    }
  }
  try {
    return getRequire().resolve(moduleName);
  } catch (e) {
    return;
  }
};

/**
 * Removes a module from the cache. We need this to re-load our http_request !
 * see: https://stackoverflow.com/a/14801711/1148249
 */
const decache = async function (moduleName: string) {
  //@ts-ignore
  moduleName = find(moduleName);

  if (!moduleName) {
    return;
  }

  const currentChunk = getRequire().cache[__filename];

  // Run over the cache looking for the files
  // loaded by the specified module name
  searchCache(moduleName, function (mod: NodeModule) {
    delete getRequire().cache[mod.id];
  });
  try {
    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    //@ts-ignore
    Object.keys((currentChunk.constructor as any)._pathCache).forEach(
      function (cacheKey) {
        if (cacheKey.indexOf(moduleName) > -1) {
          //@ts-ignore
          delete (currentChunk.constructor as any)._pathCache[cacheKey];
        }
      },
    );
  } catch (error) {
    //null
  }
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
const searchCache = function (
  moduleName: string,
  callback: (mod: NodeModule) => void,
) {
  // Resolve the module identified by the specified name
  let mod = getRequire().resolve(moduleName);
  const visited: Record<string, boolean> = {};

  // Check if the module has been resolved and found within
  // the cache no else so #ignore else https://git.io/vtgMI
  /* istanbul ignore else */
  //@ts-ignore
  if (mod && (mod = getRequire().cache[mod]) !== undefined) {
    // Recursively go over the results
    (function run(current: NodeModule) {
      visited[current.id] = true;
      // Go over each of the module's children and
      // run over it
      current.children.forEach(function (child: NodeModule) {
        // ignore .node files, decaching native modules throws a
        // "module did not self-register" error on second require
        if (path.extname(child.filename) !== '.node' && !visited[child.id]) {
          run(child);
        }
      });

      // Call the specified callback providing the
      // found module
      callback(current);
      //@ts-ignore
    })(mod);
  }
};

const hashmap = globalThis.mfHashMap || ({} as Record<string, string>);
globalThis.moduleGraphDirty = false;

const requireCacheRegex =
  /(remote|server|hot-reload|react-loadable-manifest|runtime|styled-jsx)/;

export const performReload = async (
  shouldReload: boolean,
): Promise<boolean> => {
  if (!shouldReload) {
    return false;
  }

  const req = getRequire();

  const gs = new Function('return globalThis')();
  const entries: string[] = gs.entryChunkCache || [];

  if (!gs.entryChunkCache) {
    Object.keys(req.cache).forEach((key) => {
      if (requireCacheRegex.test(key)) {
        decache(key); // Use decache here
      }
    });
  } else {
    gs.entryChunkCache.clear();
  }

  //@ts-ignore
  gs.__FEDERATION__.__INSTANCES__.map((i: any) => {
    //@ts-ignore
    i.moduleCache.forEach((mc: any) => {
      if (mc.remoteInfo && mc.remoteInfo.entryGlobalName) {
        delete gs[mc.remoteInfo.entryGlobalName];
      }
    });
    i.moduleCache.clear();
    if (gs[i.name]) {
      delete gs[i.name];
    }
  });
  //@ts-ignore
  __webpack_require__?.federation?.instance?.moduleCache?.clear();
  helpers.global.resetFederationGlobalInfo();
  globalThis.moduleGraphDirty = false;
  globalThis.mfHashMap = {};

  for (const entry of entries) {
    decache(entry);
  }

  //reload entries again
  for (const entry of entries) {
    await getRequire()(entry);
  }

  return true;
};

export const checkUnreachableRemote = (remoteScope: any): boolean => {
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

export const checkMedusaConfigChange = (
  remoteScope: any,
  fetchModule: any,
): boolean => {
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

export const checkFakeRemote = (remoteScope: any): boolean => {
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

export const createFetcher = (
  url: string,
  fetchModule: any,
  name: string,
  cb: (hash: string) => void,
): Promise<void | boolean> => {
  return fetchModule(url)
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
      cb(hash);
    })
    .catch((e: Error) => {
      console.error('Remote', name, url, 'Failed to load or is not online', e);
    });
};

export const fetchRemote = (
  remoteScope: any,
  fetchModule: any,
): Promise<boolean> => {
  const fetches: Promise<void | boolean>[] = [];
  let needReload = false;
  for (const property in remoteScope) {
    const name = property;
    const container = remoteScope[property];
    const url = container.entry;
    const fetcher = createFetcher(url, fetchModule, name, (hash) => {
      if (hashmap[name]) {
        if (hashmap[name] !== hash) {
          hashmap[name] = hash;
          needReload = true;
          console.log(name, 'hash is different - must hot reload server');
        }
      } else {
        hashmap[name] = hash;
      }
    });

    fetches.push(fetcher);
  }
  return Promise.all(fetches).then(() => {
    return needReload;
  });
};
//@ts-ignore
export const revalidate = async (
  fetchModule: any = getFetchModule() || (() => {}),
  force: boolean = false,
): Promise<boolean> => {
  if (globalThis.moduleGraphDirty) {
    force = true;
  }
  const remotesFromAPI = getAllKnownRemotes();
  //@ts-ignore
  return new Promise((res) => {
    if (force) {
      if (Object.keys(hashmap).length !== 0) {
        res(true);
        return;
      }
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
  }).then((shouldReload: unknown) => {
    return performReload(shouldReload as boolean);
  });
};

export function getFetchModule(): any {
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
