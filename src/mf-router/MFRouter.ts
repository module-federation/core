import singletonRouter from 'next/dist/client/router';
import { UrlNode } from './UrlNode';
import { isDynamicRoute, getRouteRegex } from './helpers';
import { injectScript } from '../utils';

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

export type RouteInfoLoader = {
  loadAsyncModule?: () => { default: any } | Promise<{ default: any }>;
  remote?: string;
} & Partial<RouteInfo>;

export class MFRouter {
  /**
   * List of pages that belongs to the current host application
   */
  pageListLocal: string[] | undefined;

  /**
   * List of registered federated pages/routes
   */
  pageListFederated: Record<string, RouteInfoLoader> = {};

  /**
   * Computable list of available local & remote pages in proper sorted order.
   */
  pageListCombinedCache: string[] | undefined;

  private _getPageListOriginal: Function;
  private _loadRouteOriginal: Function;

  private _isLoaded: Promise<any>;

  constructor() {
    this._isLoaded = new Promise((resolve) => {
      // ready() callback is called when next router initialized but before page rendering
      singletonRouter.ready(async () => {
        this.wrapGetPageList();
        this.wrapLoadRoute();
        this.pageListLocal = await this._getPageListOriginal();
        resolve(true);
      });
    });
  }

  private prepareCombinedPageList(pagesList: string[]): string[] {
    if (!this.pageListCombinedCache) {
      // getSortedRoutes @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
      const root = new UrlNode();
      pagesList.forEach((pagePath) => root.insert(pagePath));
      Object.keys(this.pageListFederated).forEach((pagePath) =>
        root.insert(pagePath)
      );
      // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
      this.pageListCombinedCache = root.smoosh();
    }
    return this.pageListCombinedCache;
  }

  private async getRouteInfo(route: string): Promise<undefined | RouteInfo> {
    const fedInfo = this.pageListFederated[route];
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
   * Eg. if cleanPathname `/shop/nodkz/product123` and pageListFederated is ['/shop/nodkz/[...mee]']
   *     then this method will match federated dynamic route and return true.
   *
   * This method widely is used by
   *   - DevHmrFixInvalidPongPlugin (fix HMR in dev mode)
   *   - TODO: add more
   */
  isFederatedPathname(cleanPathname: string): boolean {
    return !!this.pathnameToRoute(cleanPathname);
  }

  _pathnameToRoute(
    cleanPathname: string,
    routes: string[]
  ): string | undefined {
    if (routes.includes(cleanPathname)) {
      return cleanPathname;
    }

    for (const route of routes) {
      if (
        isDynamicRoute(route) &&
        getRouteRegex(route).re.test(cleanPathname)
      ) {
        return route;
      }
    }

    return undefined;
  }

  pathnameToRoute(cleanPathname: string): string | undefined {
    const routes = Object.keys(this.pageListFederated);
    return this._pathnameToRoute(cleanPathname, routes);
  }

  /**
   * Add federated routes/pages.
   *   remote pages cannot override host app pages
   *   but previously added remote pages are able for replacement by new ones
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
    this.pageListCombinedCache = undefined;
    const hostPages = this.getLocalPages();
    const newFederatedRoutes = Object.keys(routeLoaders);
    newFederatedRoutes.forEach((route) => {
      if (!hostPages.includes(route)) {
        this.pageListFederated[route] = routeLoaders[route];
      }
    });

    // if router initialized and just added federated pages matches current pathname
    // then kick route to rerender page with new federated page
    const pathname = window.location.pathname;
    if (
      singletonRouter.router &&
      this._pathnameToRoute(pathname, newFederatedRoutes)
    ) {
      singletonRouter.replace(window.location);
    }
  }

  /**
   * Load federated pages from remote
   */
  async loadFederatedPages(remote: string) {
    await this._isLoaded;
    injectScript(remote).then(async (container: any) => {
      try {
        const pageMap = (await container.get('./pages-map-v2'))().default;
        const pageLoaders = {} as Record<string, RouteInfoLoader>;
        Object.keys(pageMap).forEach((route) => {
          pageLoaders[route] = {
            loadAsyncModule: async () =>
              container.get(pageMap[route]).then((m: any) => m()),
            remote,
          };
        });
        this.addFederatedPages(pageLoaders);
      } catch (e) {
        console.warn(`Remote ${remote} does not have ./pages-map-v2`);
      }
    });
  }

  /**
   * List of pages that belongs to the current host application
   */
  getLocalPages(): string[] {
    return this.pageListLocal || [];
  }

  private wrapGetPageList() {
    if (singletonRouter?.router?.pageLoader?.getPageList) {
      if (!this._getPageListOriginal) {
        this._getPageListOriginal =
          singletonRouter.router.pageLoader.getPageList.bind(
            singletonRouter.router.pageLoader
          );
      }

      singletonRouter.router.pageLoader.getPageList = async () => {
        this.pageListLocal = await this._getPageListOriginal();
        const combinedPageList = this.prepareCombinedPageList(
          this.pageListLocal || []
        );
        return combinedPageList;
      };
    } else {
      throw new Error(
        '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.getPageList()` logic.'
      );
    }
  }

  private wrapLoadRoute() {
    if (singletonRouter?.router?.pageLoader?.routeLoader?.loadRoute) {
      if (!this._loadRouteOriginal) {
        this._loadRouteOriginal =
          singletonRouter.router.pageLoader.routeLoader.loadRoute.bind(
            singletonRouter.router.pageLoader.routeLoader
          );
      }

      singletonRouter.router.pageLoader.routeLoader.loadRoute = async (
        route: string
      ) => {
        const routeInfo =
          (await this.getRouteInfo(route)) ||
          (await this._loadRouteOriginal(route));
        return routeInfo;
      };
    } else {
      throw new Error(
        '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `singletonRouter.router.pageLoader.routeLoader.loadRoute()` logic.'
      );
    }
  }
}
