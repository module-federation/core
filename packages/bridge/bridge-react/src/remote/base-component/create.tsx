/**
 * Base version of create functions without react-router-dom dependencies
 * This file is used by the /base entry point to avoid bundling router code
 */
import RemoteApp from './component';
import {
  createLazyRemoteComponentFactory,
  createRemoteAppComponentFactory,
  createDeprecatedRemoteComponentFactory,
  type LazyRemoteComponentInfo,
} from '../createHelpers';

export type { LazyRemoteComponentInfo };

const createLazyRemoteComponent = createLazyRemoteComponentFactory(RemoteApp);

export const createRemoteAppComponent =
  createRemoteAppComponentFactory(RemoteApp);

/**
 * @deprecated createRemoteComponent is deprecated, please use createRemoteAppComponent instead!
 */
export const createRemoteComponent = createDeprecatedRemoteComponentFactory(
  createRemoteAppComponent,
);

export { createLazyRemoteComponent };
