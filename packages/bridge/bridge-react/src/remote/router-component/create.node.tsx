import { RemoteAppWrapper } from '../RemoteAppWrapper.server';
import { createRouterMount } from './router-mount';
const RemoteApp = /* @__PURE__ */ createRouterMount(RemoteAppWrapper);
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

import {
  createReactRemoteFactory,
  createReactRemoteComponentFactory,
} from '../../reactRemote.shared';
import { useServerEnvironment } from '../environment.server';

export const createReactRemote = /* @__PURE__ */ createReactRemoteFactory(
  RemoteApp,
  useServerEnvironment,
);
export const ReactRemote = /* @__PURE__ */ createReactRemoteComponentFactory(
  RemoteApp,
  useServerEnvironment,
);
