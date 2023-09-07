/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
  AsyncContainer,
  GetModuleOptions,
  RemoteData,
  Remotes,
  RuntimeRemote,
  WebpackRemoteContainer,
  WebpackShareScopes
} from '../types';
import { loadScript } from './pure';

/**
 * Creates a module that can be shared across different builds.
 * @param {string} delegate - The delegate string.
 * @param {Object} params - The parameters for the module.
 * @returns {string} - The created module.
 * @throws Will throw an error if the params are an array or object.
 */
export const createDelegatedModule = (
  delegate: string,
  params: { [key: string]: any }
) => {
  const queries: string[] = [];
  const processParam = (key: string, value: any) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => processParam(`${key}[${i}]`, v));
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => processParam(`${key}.${k}`, v));
    } else {
      queries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  };
  Object.entries(params).forEach(([key, value]) => processParam(key, value));
  return queries.length === 0 ? `internal ${delegate}` : `internal ${delegate}?${queries.join('&')}`;
};


/**
 * Initializes the sharing scope for the webpack module federation.
 * @param {string} scopeName - The name of the scope to initialize. Defaults to 'default'.
 * @returns {Promise<WebpackShareScopes>} - A promise that resolves to the initialized sharing scope.
 * @throws Will throw an error if the webpack initialization fails.
 */
export async function createContainerSharingScope(
  scopeName = 'default'
): Promise<WebpackShareScopes> {
  await __webpack_init_sharing__(scopeName);
  return (__webpack_require__ as unknown as any)
    .S as unknown as WebpackShareScopes;
}

/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 * @param {string | RuntimeRemote} keyOrRuntimeRemoteItem - The key or runtime remote item.
 * @returns {Promise} - The initialized remote container.
 */
export const injectScript = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  const asyncContainer = await loadScript(keyOrRuntimeRemoteItem);
  return createContainerSharingScope(asyncContainer);
}
/**
 * Creates runtime variables from the provided remotes.
 * If the value of a remote starts with 'promise ' or 'external ', it is transformed into a function that returns the promise call.
 * Otherwise, the value is stringified.
 * @param {Remotes} remotes - The remotes to create runtime variables from.
 * @returns {Record<string, string>} - The created runtime variables.
 */
export const createRuntimeVariables = (remotes: Remotes): Record<string, string> => {
  if (!remotes) {
    return {};
  }

  return Object.entries(remotes).reduce((acc, [key, value]) => {
    if (value.startsWith('promise ') || value.startsWith('external ')) {
      const promiseCall = value.split(' ')[1];
      acc[key] = `function() {
        return ${promiseCall}
      }`;
    } else {
      acc[key] = JSON.stringify(value);
    }

    return acc;
  }, {} as Record<string, string>);
};
export const getContainer = async (
  remoteContainer: string | RemoteData
): Promise<WebpackRemoteContainer | undefined> => {
  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }
  const containerScope = typeof window !== 'undefined' ? window : globalThis.__remote_scope__;
  let containerKey: string;

  if (typeof remoteContainer === 'string') {
    containerKey = remoteContainer;
  } else {
    containerKey = remoteContainer.uniqueKey as string;
    if (!containerScope[containerKey]) {
      const container = await injectScript({
        global: remoteContainer.global,
        url: remoteContainer.url,
      });
      if (!container) {
        throw Error(`Remote container ${remoteContainer.url} is empty`);
      }
    }
  }

  return containerScope[containerKey];
};
/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 *
 * @example
 *   remote.getModule('./pages/index', 'default')
 */
export const getModule = async ({
  remoteContainer,
  modulePath,
  exportName,
}: GetModuleOptions) => {
  const container = await getContainer(remoteContainer);
  try {
    const modFactory = await container?.get(modulePath);
    if (!modFactory) {
      return undefined;
    }
    const mod = modFactory();
    if (exportName) {
      return mod && typeof mod === 'object' ? mod[exportName] : undefined;
    } else {
      return mod;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

