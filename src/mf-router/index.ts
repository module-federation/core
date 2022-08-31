import { injectScript, remotes } from '../utils';
import { MFRouter, RouteInfoLoader } from './MFRouter';

declare global {
  interface Window {
    mf_router: MFRouter;
  }
}

if (typeof window !== 'undefined') {
  const mf_router = (window.mf_router = new MFRouter());

  setTimeout(() => {
    mf_router.initWrappers();
    mf_router.addFederatedPages({
      '/shop/nodkz/[...mee]': {
        loadAsyncModule: () => Promise.resolve({ default: () => 'Works!' }),
      },
      '/shop/test/[...mee]': {
        loadAsyncModule: () => Promise.resolve({ default: () => 'Test!' }),
      },
    });

    Object.keys(remotes).forEach((remote) => {
      injectScript(remote).then(async (container: any) => {
        try {
          const pageMap = (await container.get('./pages-map-v2'))().default;
          const pageLoaders = {} as Record<string, RouteInfoLoader>;
          Object.keys(pageMap).forEach((route) => {
            if (route !== '/') {
              pageLoaders[route] = {
                loadAsyncModule: async () =>
                  container.get(pageMap[route]).then((m: any) => m()),
                remote,
              };
            }
          });
          mf_router.addFederatedPages(pageLoaders);
        } catch (e) {
          console.warn(`Remote ${remote} does not have ./pages-map-v2`);
        }
      });
    });
  }, 0);
}

module.exports = {};
