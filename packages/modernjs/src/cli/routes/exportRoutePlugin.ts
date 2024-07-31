import type { CliPlugin, AppTools } from '@modern-js/app-tools';
import type { InternalRoutesPluginOptions } from '../../types/routes';
import { META_NAME } from '../../constant';
import { addExpose } from './utils';

export const moduleFederationExportRoutePlugin = ({
  userConfig,
  internalOptions,
  entries,
}: InternalRoutesPluginOptions): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation-export-routes',
  pre: ['@modern-js/plugin-module-federation-route'],
  post: ['@modern-js/plugin-router', '@modern-js/plugin-module-federation'],
  setup: async ({ useAppContext }) => {
    if (!userConfig.exportRoutes) {
      return;
    }
    const appContext = useAppContext();

    const { metaName = META_NAME } = internalOptions;
    const internalDirectory = appContext.internalDirectory.replace(
      META_NAME,
      metaName || META_NAME,
    );

    return {
      config: async () => {
        return {
          tools: {
            // bundlerChain can not keep target order
            rspack(_config, { isServer }) {
              addExpose({
                mfConfig: isServer
                  ? internalOptions.ssrConfig!
                  : internalOptions.csrConfig!,
                metaName,
                isServer,
                internalDirectory,
                entries,
              });
            },
            // bundlerChain can not keep target order
            webpack(_config, { isServer }) {
              addExpose({
                mfConfig: isServer
                  ? internalOptions.ssrConfig!
                  : internalOptions.csrConfig!,
                metaName,
                isServer,
                internalDirectory,
                entries,
              });
            },
          },
        };
      },
    };
  },
});

export default moduleFederationExportRoutePlugin;
