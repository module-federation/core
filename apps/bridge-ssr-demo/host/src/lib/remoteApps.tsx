import { createRemoteAppComponent } from '@module-federation/bridge-react';

export const vueRemoteLoader = () => import('bridge_ssr_vue/export-app');

export const RemoteVueApp = createRemoteAppComponent({
  loader: vueRemoteLoader,
  loading: <div>Loading Vue remote...</div>,
  fallback: ({ error }: { error: Error }) => (
    <div>Vue remote error: {error.message}</div>
  ),
});
