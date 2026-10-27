import RemoteApp from './component';
import {
  createLazyRemoteComponentFactory,
  createRemoteAppComponentFactory,
  createDeprecatedRemoteComponentFactory,
  type LazyRemoteComponentInfo,
  type RemoteAppComponentCreator,
  type LazyRemoteComponentCreator,
} from '../createHelpers';

export type { LazyRemoteComponentInfo };

const createLazyRemoteComponent: LazyRemoteComponentCreator =
  createLazyRemoteComponentFactory(RemoteApp);

export const createRemoteAppComponent: RemoteAppComponentCreator =
  createRemoteAppComponentFactory(RemoteApp);

/**
 * @deprecated createRemoteComponent is deprecated, please use createRemoteAppComponent instead!
 */
export const createRemoteComponent = createDeprecatedRemoteComponentFactory(
  createRemoteAppComponent,
);

export { createLazyRemoteComponent };
