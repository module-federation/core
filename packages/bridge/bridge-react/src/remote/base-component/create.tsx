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
  /* @__PURE__ */ createLazyRemoteComponentFactory(RemoteApp);

export const createRemoteAppComponent: RemoteAppComponentCreator =
  /* @__PURE__ */ createRemoteAppComponentFactory(RemoteApp);

/**
 * @deprecated createRemoteComponent is deprecated, please use createRemoteAppComponent instead!
 */
export const createRemoteComponent =
  /* @__PURE__ */ createDeprecatedRemoteComponentFactory(
    createRemoteAppComponent,
  );

export { createLazyRemoteComponent };
