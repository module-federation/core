import { initializeSharingScope, loadScript } from '../integrations/webpack';
import { getContainerKey, initContainer } from '../lib';
import { getScope } from '../lib/scopes';
import type {
  GetModuleOptions,
  GetModulesOptions,
  RemoteContainer,
  RemoteOptions,
} from '../types';

/**
 * Return initialized remote container
 *
 * @returns remote container
 */
export async function loadAndInitializeRemote(
  remoteOptions: RemoteOptions,
): Promise<RemoteContainer> {
  const globalScope = getScope();
  const containerKey = getContainerKey(remoteOptions);

  // TODO: Make this generic, possibly the runtime?
  const asyncContainer = loadScript(containerKey, remoteOptions);

  if (!asyncContainer) {
    throw new Error('Unable to load remote container');
  }

  // TODO: look at init tokens, pass to getSharingScope

  if (!globalScope.__sharing_scope__) {
    // TODO: Make this generic, possibly the runtime?
    globalScope.__sharing_scope__ = await initializeSharingScope();
  }

  return initContainer(asyncContainer, globalScope.__sharing_scope__);
}

/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 */
export async function getModule<T>({
  remoteContainer,
  modulePath,
  exportName,
}: GetModuleOptions): Promise<T | void> {
  if (!remoteContainer) {
    return;
  }

  try {
    const modFactory = await remoteContainer?.get(modulePath);

    if (!modFactory) {
      return undefined;
    }

    const mod = modFactory() as Record<string, T>;

    if (!exportName) {
      return mod as T;
    }

    if (mod && typeof mod === 'object') {
      return mod[exportName] as T;
    }
  } catch (error) {
    console.log('[mf] - Unable to getModule', error);
  }
}

/**
 * Return remote modules from container (assumes default exports).
 */
export async function getModules({
  remoteContainer,
  modulePaths,
}: GetModulesOptions): Promise<unknown[] | void> {
  if (!remoteContainer) {
    return;
  }

  try {
    const moduleFactories = await Promise.all(
      modulePaths.map(remoteContainer.get, remoteContainer),
    );

    return moduleFactories.filter(Boolean).map((modFactory) => modFactory());
  } catch (error) {
    console.error('[mf] - Unable to getModules', error);
  }
}
