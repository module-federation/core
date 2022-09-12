import { pathnameToRoute } from './helpers';
import type PageLoader from 'next/dist/client/page-loader';
import { CombinedPages } from './CombinedPages';
import { RemotePages } from './RemotePages';

export class MFLoader {
  /** Local & Remote pages sorted in correct order */
  combinedPages: CombinedPages;
  /** Remote pages loader */
  remotePages: RemotePages;
  /** Original nextjs PageLoader which passed by `patchNextClientPageLoader.js` */
  private _nextPageLoader: PageLoader;
  private _isLoaded: Promise<any>;

  constructor(nextPageLoader: PageLoader) {
    this._nextPageLoader = nextPageLoader;

    this.remotePages = new RemotePages();
    this.combinedPages = new CombinedPages(
      (this._nextPageLoader as any)._getPageListOriginal.bind(
        this._nextPageLoader
      ),
      this.remotePages
    );

    this._isLoaded = new Promise(async (resolve) => {
      this._wrapLoadRoute(nextPageLoader);
      this._wrapWhenEntrypoint(nextPageLoader);
      resolve(true);
    });
  }

  /**
   * This method returns sorted list of local and federated pages.
   *
   * `patchNextClientPageLoader` change vanilla PageLoader.getPageList() method:
   *   - exposes vanilla implementation as _getPageListOriginal()
   *   - and PageLoader.getPageList() starting call this method under the hood
   */
  async getPageList() {
    return this.combinedPages.getPageList();
  }

  /**
   * Check that current browser pathname is served by federated remotes.
   *
   * Eg. if cleanPathname `/shop/nodkz/product123` and pageListFederated is ['/shop/nodkz/[...mee]']
   *     then this method will match federated dynamic route and return true.
   *
   * PS. This method is used by DevHmrFixInvalidPongPlugin (fix HMR page reloads in dev mode)
   */
  isFederatedPathname(cleanPathname: string): boolean {
    return !!this.remotePages.routeToRemote(cleanPathname);
  }

  async pathnameToRoute(cleanPathname: string): Promise<string | undefined> {
    const routes = await this.combinedPages.getPageList();
    return pathnameToRoute(cleanPathname, routes);
  }

  private _wrapLoadRoute(nextPageLoader: PageLoader) {
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
      console.log('routeLoader.loadRoute', route);
      const routeInfo = this.remotePages.hasRoute(route)
        ? await this.remotePages.getRouteInfo(route)
        : await routeLoader._loadRouteOriginal(route);
      return routeInfo;
    };
  }

  private _wrapWhenEntrypoint(nextPageLoader: PageLoader) {
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
      console.log('routeLoader.whenEntrypoint', route);
      if (route === '/_error') {
        await this._isLoaded;
        const route = await this.pathnameToRoute(window.location.pathname);
        if (route) {
          // TODO: fix router properties for the first page load of federated page http://localhost:3000/shop/products/B
          console.log('replace entrypoint /_error by', route);
          return this.remotePages.getRouteInfo(route);
        }
      }
      console.log('whenEntrypoint', route);
      const routeInfo = await routeLoader._whenEntrypointOriginal(route);
      return routeInfo;
    };
  }
}
