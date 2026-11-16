import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import { getUnpkgUrl, REACT_19_DEV_VERSION } from '../index';
import { definePropertyGlobalVal } from '../sdk';
import {
  __FEDERATION_DEVTOOLS__,
  __EAGER_SHARE__,
  __ENABLE_FAST_REFRESH__,
} from '../../template/constant';

const SUPPORT_PKGS = ['react', 'react-dom'];
type BeforeRegisterShareArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['beforeRegisterShare']>
>[0];
type SupportPkg = (typeof SUPPORT_PKGS)[number];
type EagerShareInfo = [string, string, Array<string>?];

const DEFAULT_SHARE_SCOPE = 'default';
const DEFAULT_GLOBAL_KEY_MAP: Record<SupportPkg, string> = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

const sanitizeWindowKey = (value: string) =>
  value.replace(/[^a-zA-Z0-9_$]/g, '_');

const getShareScopes = (scope?: Array<string>) =>
  Array.isArray(scope) && scope.length ? scope : [DEFAULT_SHARE_SCOPE];

const getDefaultGlobalKey = (pkgName: SupportPkg) =>
  DEFAULT_GLOBAL_KEY_MAP[pkgName];

const getScopedGlobalKey = (scope: string, pkgName: SupportPkg) =>
  `${sanitizeWindowKey(scope)}_${sanitizeWindowKey(pkgName)}`;

const getWindowValue = (key: string) => (window as Record<string, any>)[key];

const setWindowValue = (key: string, value: unknown) => {
  (window as Record<string, any>)[key] = value;
};

const setScopeGlobals = (
  pkgName: SupportPkg,
  scopes: Array<string>,
  source: unknown,
) => {
  if (!source) {
    return source;
  }

  scopes.forEach((scope) => {
    setWindowValue(getScopedGlobalKey(scope, pkgName), source);
  });

  return source;
};

const getScopeGlobal = (pkgName: SupportPkg, scopes: Array<string>) => {
  for (const scope of scopes) {
    const scopeGlobal = getWindowValue(getScopedGlobalKey(scope, pkgName));
    if (scopeGlobal) {
      return scopeGlobal;
    }
  }
  return undefined;
};

const getEagerShareInfo = (eagerShare: unknown) => {
  if (!Array.isArray(eagerShare) || eagerShare.length < 2) {
    return null;
  }

  const [, version, scopes] = eagerShare as EagerShareInfo;
  if (typeof version !== 'string') {
    return null;
  }

  return {
    version,
    scopes: getShareScopes(scopes),
  };
};

const updateEagerShareInfo = (
  devtoolsMessage: Record<string, unknown>,
  pkgName: string,
  version: string,
  scopes: Array<string>,
) => {
  const existing = getEagerShareInfo(devtoolsMessage[__EAGER_SHARE__]);
  const mergedScopes = Array.from(
    new Set([...(existing?.scopes || []), ...scopes]),
  );

  devtoolsMessage[__EAGER_SHARE__] = [pkgName, version, mergedScopes];

  return {
    shouldReload: !existing || existing.version !== version,
  };
};

const requestUmdSourceSync = (url: string) => {
  try {
    const response = new XMLHttpRequest();
    response.open('GET', url, false);
    response.overrideMimeType('text/plain');
    response.send();

    if (response.status === 200) {
      return response.responseText;
    }

    throw new Error(
      `Failed to load module from ${url}: HTTP ${response.status}`,
    );
  } catch (error: any) {
    throw new Error(`Failed to fetch module from ${url}: ${error.message}`);
  }
};

const requestUmdSource = (url: string) =>
  new Promise<string>((resolve, reject) => {
    try {
      const response = new XMLHttpRequest();
      response.open('GET', url, true);
      response.overrideMimeType('text/plain');
      response.onload = () => {
        if (response.status === 200) {
          resolve(response.responseText);
          return;
        }

        reject(
          new Error(
            `Failed to load module from ${url}: HTTP ${response.status}`,
          ),
        );
      };
      response.onerror = () => {
        reject(new Error(`Failed to fetch module from ${url}`));
      };
      response.send();
    } catch (error: any) {
      reject(new Error(`Failed to fetch module from ${url}: ${error.message}`));
    }
  });

const createUmdSandbox = (pkgName: SupportPkg, scopes: Array<string>) => {
  const sandboxTarget = Object.create(null) as Record<string, any>;

  const sandbox = new Proxy(sandboxTarget, {
    get(target, key) {
      if (typeof key === 'symbol') {
        return Reflect.get(target, key);
      }

      if (key in target) {
        return target[key];
      }

      const value = (window as Record<string, any>)[key];
      return typeof value === 'function' ? value.bind(window) : value;
    },
    set(target, key, value) {
      target[key as string] = value;
      return true;
    },
    has(target, key) {
      return key in target || key in window;
    },
  }) as Record<string, any>;

  sandboxTarget.window = sandbox;
  sandboxTarget.self = sandbox;
  sandboxTarget.globalThis = sandbox;
  sandboxTarget.global = sandbox;
  sandboxTarget.document = window.document;

  if (pkgName === 'react-dom') {
    sandboxTarget.React = getScopeGlobal('react', scopes);
  }

  return sandbox;
};

const executeUmdModule = (
  scriptContent: string,
  pkgName: SupportPkg,
  scopes: Array<string>,
) => {
  const sandbox = createUmdSandbox(pkgName, scopes);

  const moduleFunction = new Function(
    'window',
    'self',
    'globalThis',
    'global',
    'document',
    'exports',
    'module',
    'define',
    'require',
    scriptContent,
  );

  moduleFunction.call(
    sandbox,
    sandbox,
    sandbox,
    sandbox,
    sandbox,
    sandbox.document,
    undefined,
    undefined,
    undefined,
    undefined,
  );

  return sandbox[getDefaultGlobalKey(pkgName)];
};

const loadUmdModuleSync = (
  pkgName: SupportPkg,
  version: string,
  scopes: Array<string>,
) =>
  executeUmdModule(
    requestUmdSourceSync(getUnpkgUrl(pkgName, version) as string),
    pkgName,
    scopes,
  );

const loadUmdModule = async (
  pkgName: SupportPkg,
  version: string,
  scopes: Array<string>,
) =>
  executeUmdModule(
    await requestUmdSource(getUnpkgUrl(pkgName, version) as string),
    pkgName,
    scopes,
  );

const getDevtoolsMessage = () => {
  const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
  if (devtoolsMessageStr) {
    try {
      return JSON.parse(devtoolsMessageStr);
    } catch (e) {
      console.debug('Fast Refresh Plugin Error: ', e);
    }
  }
  return null;
};

const devtoolsMessage = getDevtoolsMessage();
// ReactDOM registers its renderer before the remote's Refresh runtime arrives.
// Preserve a real DevTools hook; otherwise retain renderers for Refresh to find.
if (
  devtoolsMessage?.[__ENABLE_FAST_REFRESH__] &&
  !(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
) {
  let nextId = 0;
  const renderers = new Map<number, unknown>();
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    renderers,
    inject(renderer: unknown) {
      const id = nextId++;
      renderers.set(id, renderer);
      return id;
    },
    onScheduleFiberRoot() {},
    onCommitFiberRoot() {},
    onCommitFiberUnmount() {},
  };
}
const eagerShareInfo = getEagerShareInfo(devtoolsMessage?.[__EAGER_SHARE__]);
if (devtoolsMessage?.[__ENABLE_FAST_REFRESH__] && eagerShareInfo) {
  const { version, scopes } = eagerShareInfo;
  setScopeGlobals('react', scopes, loadUmdModuleSync('react', version, scopes));
  setScopeGlobals(
    'react-dom',
    scopes,
    loadUmdModuleSync('react-dom', version, scopes),
  );
}

const fastRefreshPlugin = (): ModuleFederationRuntimePlugin => {
  // One pair per share scope, including react-dom/client. ReactDOM must be able
  // to load React itself when the client entry is requested before React.get().
  const react19Pending = new Map<string, Promise<any>>();
  const loadReact19 = (
    pkg: SupportPkg,
    scopes: string[],
    sync = false,
  ): any => {
    const existing = getScopeGlobal(pkg, scopes);
    if (existing?.version === REACT_19_DEV_VERSION) {
      return setScopeGlobals(pkg, scopes, existing);
    }
    const save = (library: any) => {
      // A synchronous eager load can win while an async request is in flight.
      const cached = getScopeGlobal(pkg, scopes);
      if (cached?.version === REACT_19_DEV_VERSION)
        return setScopeGlobals(pkg, scopes, cached);
      if (library?.version !== REACT_19_DEV_VERSION)
        throw new Error(`Expected development ${pkg}@${REACT_19_DEV_VERSION}.`);
      if (
        pkg === 'react' &&
        (typeof library.createElement !== 'function' ||
          !Object.isFrozen(library.createElement('div')))
      )
        throw new Error('React provider is not a development build.');
      return setScopeGlobals(pkg, scopes, library);
    };
    if (sync) {
      if (pkg === 'react-dom') loadReact19('react', scopes, true);
      return save(loadUmdModuleSync(pkg, REACT_19_DEV_VERSION, scopes));
    }
    const key = `${pkg}:${JSON.stringify([...scopes].sort())}`;
    let pending = react19Pending.get(key);
    if (!pending) {
      pending = (async () => {
        if (pkg === 'react-dom') await loadReact19('react', scopes);
        // Recheck after awaiting React: another request may have filled this scope.
        const cached = getScopeGlobal(pkg, scopes);
        if (cached?.version === REACT_19_DEV_VERSION)
          return setScopeGlobals(pkg, scopes, cached);
        return save(await loadUmdModule(pkg, REACT_19_DEV_VERSION, scopes));
      })();
      react19Pending.set(key, pending);
      void pending.catch(() => react19Pending.delete(key));
    }
    return pending;
  };
  let orderResolve: (value?: unknown) => void;
  const orderPromise = new Promise((resolve) => {
    orderResolve = resolve;
  });

  return {
    name: 'mf-fast-refresh-plugin',
    beforeRegisterShare(args: BeforeRegisterShareArgs) {
      const { pkgName, shared } = args;
      const isReact19 = /^19\./.test(shared.version);
      if (
        !SUPPORT_PKGS.includes(pkgName) &&
        !(isReact19 && pkgName === 'react-dom/client')
      ) {
        return args;
      }
      const supportPkgName = (
        pkgName === 'react-dom/client' ? 'react-dom' : pkgName
      ) as SupportPkg;
      const shareScopes = getShareScopes(shared.scope);

      let enableFastRefresh = false;
      let devtoolsMessage: Record<string, unknown> = {};

      const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
      if (devtoolsMessageStr) {
        try {
          devtoolsMessage = JSON.parse(devtoolsMessageStr);
          enableFastRefresh = devtoolsMessage?.[
            __ENABLE_FAST_REFRESH__
          ] as boolean;
        } catch (e) {
          console.debug('Fast Refresh Plugin Error: ', e);
        }
      }

      if (!enableFastRefresh) {
        return args;
      }

      if (isReact19) {
        shared.version = REACT_19_DEV_VERSION;
        shared.get = async () => {
          const library = await loadReact19(supportPkgName, shareScopes);
          return () => library;
        };
        if (shared.shareConfig?.eager || shared.lib) {
          const library = loadReact19(supportPkgName, shareScopes, true);
          shared.lib = () => library;
          updateEagerShareInfo(
            devtoolsMessage,
            pkgName,
            REACT_19_DEV_VERSION,
            shareScopes,
          );
          localStorage.setItem(
            __FEDERATION_DEVTOOLS__,
            JSON.stringify(devtoolsMessage),
          );
        }
        return args;
      }

      if (shared.shareConfig?.eager || shared.lib) {
        if (!devtoolsMessage?.[__EAGER_SHARE__]) {
          const eagerShareInfo = updateEagerShareInfo(
            devtoolsMessage,
            pkgName,
            shared.version,
            shareScopes,
          );
          localStorage.setItem(
            __FEDERATION_DEVTOOLS__,
            JSON.stringify(devtoolsMessage),
          );
          if (eagerShareInfo.shouldReload) {
            window.location.reload();
          }
        } else {
          updateEagerShareInfo(
            devtoolsMessage,
            pkgName,
            shared.version,
            shareScopes,
          );
          localStorage.setItem(
            __FEDERATION_DEVTOOLS__,
            JSON.stringify(devtoolsMessage),
          );
        }
        if (pkgName === 'react-dom') {
          shared.lib = () => getScopeGlobal(supportPkgName, shareScopes);
        }
        if (pkgName === 'react') {
          shared.lib = () => getScopeGlobal(supportPkgName, shareScopes);
        }
        return args;
      }

      let get: (() => any) | undefined;
      if (pkgName === 'react') {
        get = () =>
          loadUmdModule(supportPkgName, shared.version, shareScopes)
            .then((moduleValue) => {
              setScopeGlobals(supportPkgName, shareScopes, moduleValue);
              return moduleValue;
            })
            .then(() => {
              orderResolve();
            });
      }
      if (pkgName === 'react-dom') {
        get = () =>
          orderPromise
            .then(() =>
              loadUmdModule(supportPkgName, shared.version, shareScopes),
            )
            .then((result) => {
              setScopeGlobals(supportPkgName, shareScopes, result);
              return result;
            });
      }

      if (typeof get === 'function') {
        const finalGet = get;
        if (pkgName === 'react') {
          shared.get = async () => {
            if (!getScopeGlobal(supportPkgName, shareScopes)) {
              await finalGet();
              console.warn(
                '[Module Federation HMR]: You are using Module Federation Devtools to debug online host, it will cause your project load Dev mode React and ReactDOM. If not in this mode, please disable it in Module Federation Devtools',
              );
            }
            shared.lib = () => getScopeGlobal(supportPkgName, shareScopes);
            return () => getScopeGlobal(supportPkgName, shareScopes);
          };
        }
        if (pkgName === 'react-dom') {
          shared.get = async () => {
            if (!getScopeGlobal(supportPkgName, shareScopes)) {
              await finalGet();
            }
            shared.lib = () => getScopeGlobal(supportPkgName, shareScopes);
            return () => getScopeGlobal(supportPkgName, shareScopes);
          };
        }
      }

      return args;
    },
  };
};

if (!window?.__FEDERATION__) {
  definePropertyGlobalVal(window, '__FEDERATION__', {});
  definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
}

if (!window?.__FEDERATION__.__GLOBAL_PLUGIN__) {
  window.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
}

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(fastRefreshPlugin());
