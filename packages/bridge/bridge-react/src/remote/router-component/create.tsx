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

import {
  createReactRemoteConsumers,
  type createReactRemote as BaseCreateReactRemote,
  type ReactRemote as BaseReactRemote,
} from '../../reactRemote';
const unifiedConsumers = createReactRemoteConsumers(RemoteApp);
export const createReactRemote: typeof BaseCreateReactRemote =
  unifiedConsumers.createReactRemote;
export const ReactRemote: typeof BaseReactRemote = unifiedConsumers.ReactRemote;
