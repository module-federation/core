import { injectScript, remotes } from '../utils';
import { MFRouter, RouteInfoLoader } from './MFRouter';

declare global {
  interface Window {
    mf_router: MFRouter;
  }
}

if (typeof window !== 'undefined') {
  const mf_router = (window.mf_router = new MFRouter());

  mf_router.addFederatedPages({
    '/shop/nodkz/[...mee]': {
      loadAsyncModule: () => ({ default: () => 'Works!' }),
      remote: 'shop',
    },
    '/shop/test/[...mee]': {
      loadAsyncModule: () => ({ default: () => 'Test!' }),
      remote: 'shop',
    },
  });

  Object.keys(remotes).forEach((remote) => {
    mf_router.loadFederatedPages(remote);
  });
}

module.exports = {};
