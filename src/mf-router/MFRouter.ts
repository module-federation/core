import singletonRouter from 'next/dist/client/router';
import { UrlNode } from './UrlNode';
import { isDynamicRoute, getRouteRegex } from './helpers';

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

export type RouteInfoLoader = {
  loadAsyncModule?: () => Promise<{ default: any }>;
  remote?: string;
} & Partial<RouteInfo>;

export class MFRouter {
  /**
   * This map is filled by nextjs-mf module
   */
  federatedPages = {
    '/shop/nodkz/[...mee]': {
      loadAsyncModule: () => Promise.resolve({ default: () => 'Works!' }),
    },
  };

  /**
   * Computable list of available local & remote pages in proper sorted order.
   */
  _sortedPageList: string[] | undefined;

  private prepareSortedPageList(pagesList: string[]): string[] {
    if (!this._sortedPageList) {
      // getSortedRoutes @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
      const root = new UrlNode();
      pagesList.forEach((pagePath) => root.insert(pagePath));
      Object.keys(this.federatedPages).forEach((pagePath) =>
        root.insert(pagePath)
      );
      // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
      this._sortedPageList = root.smoosh();
    }
    return this._sortedPageList;
  }

  private async getRouteInfo(route: string): Promise<undefined | RouteInfo> {
    const fedInfo = this.federatedPages[route];
    if (fedInfo) {
      if (!fedInfo.component && fedInfo.loadAsyncModule) {
        fedInfo.exports = await fedInfo.loadAsyncModule();
        fedInfo.component = (fedInfo.exports || {}).default;
      }
      return {
        component: fedInfo.component,
        exports: fedInfo.exports, // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
        styles: fedInfo.styles || [],
      };
    }
    return;
  }

  /**
   * Check that current browser pathname is served by federated remotes.
   *
   * Eg. if cleanPathname `/shop/nodkz/product123` and federatedPages is ['/shop/nodkz/[...mee]']
   *     then this method will match federated dynamic route and return true.
   *
   * This method widely is used by
   *   - DevHmrFixInvalidPongPlugin (fix HMR in dev mode)
   *   - TODO: add more
   */
  isFederatedPathname(cleanPathname: string): boolean {
    return !!this.pathnameToRoute(cleanPathname);
  }

  pathnameToRoute(cleanPathname: string): string | undefined {
    const routes = Object.keys(this.federatedPages);
    if (routes.includes(cleanPathname)) {
      return cleanPathname;
    }

    for (const route in routes) {
      if (
        isDynamicRoute(route) &&
        getRouteRegex(route).re.test(cleanPathname)
      ) {
        return route;
      }
    }

    return undefined;
  }

  /**
   * Add federated routes/pages
   *
   *   @example
   *    window.mf_router.addFederatedPages({
   *      '/shop/nodkz/[...mee]': {
   *        loadAsyncModule: () => Promise.resolve({ default: () => 'Works!' }),
   *      },
   *      '/shop/test/[mee]': {
   *        loadAsyncModule: () => Promise.resolve({ default: () => 'Test!' }),
   *      },
   *    })
   *
   * @param routeLoaders
   */
  addFederatedPages(routeLoaders: Record<string, RouteInfoLoader>) {
    this._sortedPageList = undefined;
    Object.keys(routeLoaders).forEach((route) => {
      this.federatedPages[route] = routeLoaders[route];
    });
  }

  initWrappers() {
    this.wrapGetPageList();
    this.wrapLoadRoute();
  }

  private wrapGetPageList() {
    if (singletonRouter?.router?.pageLoader?.getPageList) {
      const getPageListOrig =
        singletonRouter.router.pageLoader.getPageList.bind(
          singletonRouter.router.pageLoader
        );

      singletonRouter.router.pageLoader.getPageList = async (...args: any) => {
        const pageListOrig = await getPageListOrig(...args);
        const pageList = this.prepareSortedPageList(pageListOrig);
        return pageList;
      };
    } else {
      throw new Error(
        '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.getPageList()` logic.'
      );
    }
  }

  private wrapLoadRoute() {
    if (singletonRouter?.router?.pageLoader?.routeLoader?.loadRoute) {
      const loadRouteOrig =
        singletonRouter.router.pageLoader.routeLoader.loadRoute.bind(
          singletonRouter.router.pageLoader.routeLoader
        );

      singletonRouter.router.pageLoader.routeLoader.loadRoute = async (
        route: string
      ) => {
        const routeInfo =
          (await this.getRouteInfo(route)) || (await loadRouteOrig(route));
        return routeInfo;
      };
    } else {
      throw new Error(
        '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `singletonRouter.router.pageLoader.routeLoader` logic.'
      );
    }
  }
}
