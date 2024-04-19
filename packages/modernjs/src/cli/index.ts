import { createRuntimeExportsUtils } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';

export const moduleFederationPlugin = (): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation',
  setup: ({ useAppContext, useResolvedConfigContext, useConfigContext }) => {
    return {};
  },
});

export default moduleFederationPlugin;
