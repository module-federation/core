import {
  createModuleFederationRuntime,
  getContainerKey,
  getScope,
  getSharingScope,
  initContainer,
} from '../lib';
import {
  GetModuleOptions,
  GetModulesOptions,
  RemoteContainer,
  RemoteOptions,
} from '../types';

/**
 * Return initialized remote container
 *
 *  @returns remote container
 */
export const loadAndInitializeRemote = async (
  remoteOptions: RemoteOptions
): Promise<RemoteContainer> => {
  const scope = getScope();

  // TODO: Create this during build?
  if (!scope._runtime) {
    scope._runtime = createModuleFederationRuntime();
  }

  const containerKey = getContainerKey(remoteOptions);

  const asyncContainer = scope._runtime.scriptFactory.loadScript(
    scope,
    containerKey,
    remoteOptions
  );

  if (!asyncContainer) {
    throw new Error('Unable to load remote container');
  }

  // TODO: look at init tokens, pass to getSharingScope
  // init method on remote entry

  scope.__sharing_scope__ = getSharingScope();

  console.log('scope.__sharing_scope__', scope.__sharing_scope__);

  if (!scope.__sharing_scope__) {
    scope.__sharing_scope__ =
      await scope._runtime.sharingScopeFactory.initializeSharingScope();
  }

  return initContainer(asyncContainer, scope.__sharing_scope__);
};

/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 * @param param0
 * @returns
 */
export const getModule = async <T>({
  remoteContainer,
  modulePath,
  exportName,
}: GetModuleOptions): Promise<T | undefined> => {
  if (!remoteContainer) return undefined;

  try {
    const modFactory = await remoteContainer?.get(modulePath);
    if (!modFactory) return undefined;
    const mod = modFactory() as Record<string, T>;
    if (exportName) {
      return mod && typeof mod === 'object'
        ? (mod[exportName] as T)
        : undefined;
    } else {
      return mod as T;
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

/**
 * Return remote modules from container (assumes default exports).
 * @param param0
 * @returns
 */
export const getModules = async ({
  remoteContainer,
  modulePaths,
}: GetModulesOptions) => {
  if (!remoteContainer) return undefined;

  try {
    const moduleFactories = await Promise.all(
      modulePaths.map((modulePath) => remoteContainer?.get(modulePath))
    );

    const modules = moduleFactories.map((modFactory) => {
      if (!modFactory) return undefined;
      return modFactory();
    });

    return modules;
  } catch (error) {
    console.error('[mf] - Unable to getModules', error);
    return undefined;
  }
};
