import router from 'next/router';
import { UrlNode } from './UrlNode';
import { isDynamicRoute, getRouteRegex } from './helpers';
import { injectScript, remotes } from '../utils';
import type PageLoader from 'next/dist/client/page-loader';

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

export type RouteInfoLoader = {
  loadAsyncModule?: () => { default: any } | Promise<{ default: any }>;
  remote?: string;
} & Partial<RouteInfo>;

export class MFPageLoader {
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

  private _nextPageLoader: PageLoader;
  private _isLoaded: Promise<any>;

  constructor(nextPageLoader: PageLoader) {
    this._nextPageLoader = nextPageLoader;

    this._isLoaded = new Promise(async (resolve) => {
      this.wrapLoadRoute(nextPageLoader);
      this.wrapWhenEntrypoint(nextPageLoader);

      this.pageListLocal = await (
        this._nextPageLoader as any
      )._getPageListOriginal();

      this.addFederatedPages({
        '/shop/nodkz/[...mee]': {
          loadAsyncModule: () => ({ default: () => 'Works!' }),
          remote: 'shop',
        },
        '/shop/test/[...mee]': {
          loadAsyncModule: () => ({ default: () => 'Test!' }),
          remote: 'shop',
        },
      });

      await Promise.all(
        Object.keys(remotes).map((remote) => {
          return this.loadFederatedPages(remote);
        })
      );

      resolve(true);
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
   * This method returns sorted list of local and federated pages.
   *
   * `patchNextClientPageLoader` change vanilla PageLoader.getPageList() method:
   *   - exposes vanilla implementation as _getPageListOriginal()
   *   - and PageLoader.getPageList() starting call this method under the hood
   */
  async getPageList() {
    // `_getPageListOriginal` was added by `patchNextClientPageLoader`
    this.pageListLocal = await (
      this._nextPageLoader as any
    )._getPageListOriginal();
    const combinedPageList = this.prepareCombinedPageList(
      this.pageListLocal || []
    );
    return combinedPageList;
  }

  async loadRoute(route: string) {}

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
   *    window.mf_loader.addFederatedPages({
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
    console.log('addFederatedPages', routeLoaders);
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
    if (this._pathnameToRoute(pathname, newFederatedRoutes)) {
      router.replace(window.location);
      console.log('router.replace(window.location);');
    }
  }

  /**
   * Load federated pages from remote
   */
  async loadFederatedPages(remote: string) {
    const container = await injectScript(remote);
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
  }

  /**
   * List of pages that belongs to the current host application
   */
  getLocalPages(): string[] {
    return this.pageListLocal || [];
  }

  private wrapLoadRoute(nextPageLoader: PageLoader) {
    if (!nextPageLoader?.routeLoader?.loadRoute) {
      throw new Error(
        '[nextjs-mf] Cannot wrap `pageLoader.routeLoader.loadRoute()` with custom logic.'
      );
    }

    const routeLoader =
      nextPageLoader.routeLoader as PageLoader['routeLoader'] & {
        _loadRouteOriginal: Function;
      };

    // if _loadRouteOriginal does not initialized then take original loadRoute method
    if (!routeLoader._loadRouteOriginal) {
      routeLoader._loadRouteOriginal = routeLoader.loadRoute.bind(routeLoader);
    }

    // replace loadRoute logic
    routeLoader.loadRoute = async (route: string) => {
      const routeInfo =
        (await this.getRouteInfo(route)) ||
        (await routeLoader._loadRouteOriginal(route));
      return routeInfo;
    };
  }

  private wrapWhenEntrypoint(nextPageLoader: PageLoader) {
    if (!nextPageLoader.routeLoader?.whenEntrypoint) {
      throw new Error(
        '[nextjs-mf] Cannot wrap `pageLoader.routeLoader.whenEntrypoint()` with custom logic.'
      );
    }

    const routeLoader =
      nextPageLoader.routeLoader as PageLoader['routeLoader'] & {
        _whenEntrypointOriginal: Function;
      };

    // if _whenEntrypointOriginal does not initialized then take original loadRoute method
    if (!routeLoader._whenEntrypointOriginal) {
      routeLoader._whenEntrypointOriginal =
        routeLoader.whenEntrypoint.bind(routeLoader);
    }

    // replace routeLoader.whenEntrypoint logic
    routeLoader.whenEntrypoint = async (route: string) => {
      if (route === '/_error') {
        await this._isLoaded;

        const federatedRoute = this._pathnameToRoute(
          window.location.pathname,
          this.prepareCombinedPageList(this.pageListLocal || [])
        );
        if (federatedRoute) {
          // TODO: fix router properties
          // it still shows wrong data
          console.log('replace entrypoint /_error by', federatedRoute);
          return this.getRouteInfo(federatedRoute);
        }
      }
      console.log('whenEntrypoint', route);
      const routeInfo = await routeLoader._whenEntrypointOriginal(route);
      return routeInfo;
    };
  }
}
