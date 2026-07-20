import { createRemoteAppComponent } from '@module-federation/bridge-vue3';

export const RemoteReactApp = createRemoteAppComponent({
  loader: () => import('bridge_ssr_react/export-app'),
});
