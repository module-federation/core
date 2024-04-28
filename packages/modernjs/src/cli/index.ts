import path from 'path';
import { fs } from '@modern-js/utils';
import type { CliPlugin, AppTools } from '@modern-js/app-tools';

export const moduleFederationPlugin = (): CliPlugin<AppTools> => ({
  name: '@modern-js/plugin-module-federation',
  setup: async ({ useConfigContext }) => {
    return {
      config: () => {
        const userModernjsConfig = useConfigContext();
        const enableSSR = Boolean(userModernjsConfig?.server?.ssr);

        return {
          tools: {
            devServer: {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                  'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers':
                  'X-Requested-With, content-type, Authorization',
              },
              before: [
                (req, res, next) => {
                  if (!enableSSR) {
                    next();
                    return;
                  }
                  try {
                    const SERVER_PREFIX = '/bundles';
                    console.log(222, req.url);
                    if (
                      req.url?.startsWith(SERVER_PREFIX) ||
                      req.url?.includes('remoteEntry.js')
                    ) {
                      const filepath = path.join(
                        process.cwd(),
                        `dist${req.url}`,
                      );
                      console.log('filepath: ', filepath);
                      fs.statSync(filepath);
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.setHeader(
                        'Access-Control-Allow-Methods',
                        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                      );
                      res.setHeader(
                        'Access-Control-Allow-Headers',
                        'X-Requested-With, content-type, Authorization',
                      );
                      fs.createReadStream(filepath).pipe(res);
                    } else {
                      next();
                    }
                  } catch (err) {
                    console.error(err);
                    next();
                  }
                },
              ],
            },
          },
        };
      },
    };
  },
});

export default moduleFederationPlugin;
