import type {
  WebpackRemoteContainer,
  WebpackRequire,
  WebpackShareScopes,
} from '../types';

type RemoteUrl = string | (() => Promise<string>);

export interface ImportRemoteOptions {
  url: RemoteUrl;
  scope: string;
  module: string;
  remoteEntryFileName?: string;
  bustRemoteEntryCache?: boolean;
}

const REMOTE_ENTRY_FILE = 'remoteEntry.js';

const loadRemote = (
  url: ImportRemoteOptions['url'],
  scope: ImportRemoteOptions['scope'],
  bustRemoteEntryCache: ImportRemoteOptions['bustRemoteEntryCache']
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
      scope
    );
  });

const initSharing = async () => {
  const webpackShareScopes =
    __webpack_share_scopes__ as unknown as WebpackShareScopes;
  if (!webpackShareScopes?.default) {
    await __webpack_init_sharing__('default');
  }
};

// __initialized and __initializing flags prevent some concurrent re-initialization corner cases
const initContainer = async (containerScope: any) => {
  try {
    const webpackShareScopes =
      __webpack_share_scopes__ as unknown as WebpackShareScopes;
    if (!containerScope.__initialized && !containerScope.__initializing) {
      containerScope.__initializing = true;
      await containerScope.init(webpackShareScopes.default);
      containerScope.__initialized = true;
      delete containerScope.__initializing;
    }
  } catch (error) {
    console.error(error);
  }
};

/*
    Dynamically import a remote module using Webpack's loading mechanism:
    https://webpack.js.org/concepts/module-federation/
  */
export const importRemote = async <T>({
  url,
  scope,
  module,
  remoteEntryFileName = REMOTE_ENTRY_FILE,
  bustRemoteEntryCache = true,
}: ImportRemoteOptions): Promise<T> => {
  const remoteScope = scope as unknown as number;
  if (!window[remoteScope]) {
    let remoteUrl = '';

    if (typeof url === 'string') {
      remoteUrl = url;
    } else {
      remoteUrl = await url();
    }

    // Load the remote and initialize the share scope if it's empty
    await Promise.all([
      loadRemote(
        `${remoteUrl}/${remoteEntryFileName}`,
        scope,
        bustRemoteEntryCache
      ),
      initSharing(),
    ]);
    if (!window[remoteScope]) {
      throw new Error(
        `Remote loaded successfully but ${scope} could not be found! Verify that the name is correct in the Webpack configuration!`
      );
    }
    // Initialize the container to get shared modules and get the module factory:
    const [, moduleFactory] = await Promise.all([
      initContainer(window[remoteScope]),
      (window[remoteScope] as unknown as WebpackRemoteContainer).get(
        module === '.' || module.startsWith('./') ? module : `./${module}`
      ),
    ]);
    return moduleFactory();
  } else {
    const moduleFactory = await (
      window[remoteScope] as unknown as WebpackRemoteContainer
    ).get(module === '.' || module.startsWith('./') ? module : `./${module}`);
    return moduleFactory();
  }
};
