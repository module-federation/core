export type ReactRouterModule = Record<string, any>;

type RouterPackageName = 'react-router-dom' | 'react-router';
type RouterRequire = ((id: RouterPackageName) => ReactRouterModule) | undefined;
type RouterImporter = (id: RouterPackageName) => Promise<unknown>;

interface RouterRuntimeOptions {
  requireFn?: RouterRequire;
  importRouterPackage?: RouterImporter;
  isServer?: boolean;
}

declare const require: RouterRequire;

let reactRouter: ReactRouterModule | null | undefined;
let reactRouterPromise: Promise<ReactRouterModule | null> | undefined;
let reactRouterImporter: RouterImporter | undefined;

function normalizeRouterModule(module: unknown): ReactRouterModule | null {
  if (!module || typeof module !== 'object') {
    return null;
  }

  const routerModule = module as ReactRouterModule;

  if (
    'default' in routerModule &&
    routerModule.default &&
    typeof routerModule.default === 'object' &&
    !routerModule.useLocation
  ) {
    return routerModule.default;
  }

  return routerModule;
}

function getCommonJsRequire(): RouterRequire {
  return typeof require === 'function' ? require : undefined;
}

function hasRequireFnOption(
  options?: RouterRuntimeOptions,
): options is RouterRuntimeOptions & { requireFn: RouterRequire } {
  return (
    !!options && Object.prototype.hasOwnProperty.call(options, 'requireFn')
  );
}

function getReactRouterFromRequire(options?: RouterRuntimeOptions) {
  if (reactRouter !== undefined) {
    return reactRouter;
  }

  const requireFn = hasRequireFnOption(options)
    ? options.requireFn
    : getCommonJsRequire();

  if (!requireFn) {
    return undefined;
  }

  try {
    reactRouter = normalizeRouterModule(requireFn('react-router-dom'));
  } catch {
    try {
      reactRouter = normalizeRouterModule(requireFn('react-router'));
    } catch {
      reactRouter = null;
    }
  }

  return reactRouter;
}

function isServerRuntime(options?: RouterRuntimeOptions) {
  return options?.isServer ?? typeof window === 'undefined';
}

function resetReactRouterCache() {
  reactRouter = undefined;
  reactRouterPromise = undefined;
}

export function resetReactRouterRuntime() {
  reactRouterImporter = undefined;
  resetReactRouterCache();
}

export function setReactRouterRuntimeImporter(importer?: RouterImporter) {
  reactRouterImporter = importer;
  resetReactRouterCache();
}

export function loadReactRouter(options?: RouterRuntimeOptions) {
  const routerFromRequire = getReactRouterFromRequire(options);

  if (routerFromRequire !== undefined) {
    return Promise.resolve(routerFromRequire);
  }

  if (!isServerRuntime(options)) {
    reactRouter = null;
    return Promise.resolve(reactRouter);
  }

  if (!reactRouterPromise) {
    const importPackage = options?.importRouterPackage || reactRouterImporter;

    if (!importPackage) {
      reactRouter = null;
      return Promise.resolve(reactRouter);
    }

    reactRouterPromise = importPackage('react-router-dom')
      .then(normalizeRouterModule)
      .catch(() => null)
      .then((routerDomModule) => {
        if (routerDomModule) {
          return routerDomModule;
        }

        return importPackage('react-router')
          .then(normalizeRouterModule)
          .catch(() => null);
      })
      .then((routerModule) => {
        reactRouter = routerModule;
        return routerModule;
      });
  }

  return reactRouterPromise;
}

export function readReactRouter(options?: RouterRuntimeOptions) {
  const routerFromRequire = getReactRouterFromRequire(options);

  if (routerFromRequire !== undefined) {
    return routerFromRequire;
  }

  if (!isServerRuntime(options)) {
    return null;
  }

  throw loadReactRouter(options);
}
