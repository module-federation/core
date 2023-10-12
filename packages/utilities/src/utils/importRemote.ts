import type {
  WebpackRemoteContainer,
  WebpackRequire,
  WebpackShareScopes,
  RemoteData,
  ImportRemoteOptions,
} from '../types/index';

/**
 * Constant for remote entry file
 * @constant {string}
 */
const REMOTE_ENTRY_FILE = 'remoteEntry.js';

/**
 * Function to load remote
 * @function
 * @param {ImportRemoteOptions['url']} url - The url of the remote module
 * @param {ImportRemoteOptions['scope']} scope - The scope of the remote module
 * @param {ImportRemoteOptions['bustRemoteEntryCache']} bustRemoteEntryCache - Flag to bust the remote entry cache
 * @returns {Promise<void>} A promise that resolves when the remote is loaded
 */
const loadRemote = (
  url: RemoteData['url'],
  scope: ImportRemoteOptions['scope'],
  bustRemoteEntryCache: ImportRemoteOptions['bustRemoteEntryCache'],
) =>
  new Promise<void>((resolve, reject) => {
    const timestamp = bustRemoteEntryCache ? `?t=${new Date().getTime()}` : '';
    const webpackRequire = __webpack_require__ as unknown as WebpackRequire;
    webpackRequire.l(
      `${url}${timestamp}`,
      (event) => {
        if (event?.type === 'load') {
          // Script loaded successfully:
          return resolve();
        }
        const realSrc = event?.target?.src;
        const error = new Error();
        error.message = 'Loading script failed.\n(missing: ' + realSrc + ')';
        error.name = 'ScriptExternalLoadError';
        reject(error);
      },
      scope,
    );
  });

const loadEsmRemote = async (
  url: RemoteData['url'],
  scope: ImportRemoteOptions['scope'],
) => {
  const module = await import(/* webpackIgnore: true */ url);

  if (!module) {
    throw new Error(
      `Unable to load requested remote from ${url} with scope ${scope}`,
    );
  }

  (window as any)[scope] = {
    ...module,
    __initializing: false,
    __initialized: false,
  } satisfies WebpackRemoteContainer;
};

/**
 * Function to initialize sharing
 * @async
 * @function
 */
const initSharing = async () => {
  const webpackShareScopes =
    __webpack_share_scopes__ as unknown as WebpackShareScopes;
  if (!webpackShareScopes?.default) {
    await __webpack_init_sharing__('default');
  }
};

/**
 * Function to initialize container
 * @async
 * @function
 * @param {WebpackRemoteContainer} containerScope - The container scope
 */
const initContainer = async (containerScope: any) => {
  try {
    const webpackShareScopes =
      __webpack_share_scopes__ as unknown as WebpackShareScopes;
    if (!containerScope.__initialized && !containerScope.__initializing) {
      containerScope.__initializing = true;
      await containerScope.init(webpackShareScopes.default as any);
      containerScope.__initialized = true;
      delete containerScope.__initializing;
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * Function to import remote
 * @async
 * @function
 * @param {ImportRemoteOptions} options - The options for importing the remote
 * @returns {Promise<T>} A promise that resolves with the imported module
 */
export const importRemote = async <T>({
  url,
  scope,
  module,
  remoteEntryFileName = REMOTE_ENTRY_FILE,
  bustRemoteEntryCache = true,
  esm = false,
  remoteEvents,
}: ImportRemoteOptions): Promise<T> => {
  const remoteScope = scope as unknown as number;
  if (!window[remoteScope]) {
    let remoteUrl: RemoteData['url'] = '';

    if (typeof url === 'string') {
      remoteUrl = url;
    } else {
      remoteUrl = await url();
    }

    const remoteUrlWithEntryFile = `${remoteUrl}/${remoteEntryFileName}`;

    if (remoteEvents?.beforePreloadRemote) {
      await remoteEvents.beforePreloadRemote({ scope });
    }

    const asyncContainer = !esm
      ? loadRemote(remoteUrlWithEntryFile, scope, bustRemoteEntryCache)
      : loadEsmRemote(remoteUrlWithEntryFile, scope);

    if (remoteEvents?.beforeLoadRemote) {
      await remoteEvents.beforeLoadRemote({ scope, module });
    }

    // Load the remote and initialize the share scope if it's empty
    await Promise.all([asyncContainer, initSharing()]);
    if (!window[remoteScope]) {
      throw new Error(
        `Remote loaded successfully but ${scope} could not be found! Verify that the name is correct in the Webpack configuration!`,
      );
    }

    const remoteContainer = window[
      remoteScope
    ] as unknown as WebpackRemoteContainer;

    // Initialize the container to get shared modules and get the module factory:
    const [, moduleFactory] = await Promise.all([
      initContainer(remoteContainer),
      remoteContainer.get(
        module === '.' || module.startsWith('./') ? module : `./${module}`,
      ),
    ]);

    if (remoteEvents?.remoteLoaded) {
      await remoteEvents.remoteLoaded({ scope, module, remoteContainer });
    }

    return moduleFactory();
  } else {
    const moduleFactory = await (
      window[remoteScope] as unknown as WebpackRemoteContainer
    ).get(module === '.' || module.startsWith('./') ? module : `./${module}`);
    return moduleFactory();
  }
};
