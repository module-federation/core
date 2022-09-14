import EventEmitter from 'eventemitter3';
import { pathnameToRoute } from './helpers';
import type PageLoader from 'next/dist/client/page-loader';
import { CombinedPages } from './CombinedPages';
import { RemotePages } from './RemotePages';
import { RemoteContainer } from './RemoteContainer';

type EventTypes = 'loadedRemoteRoute' | 'loadedLocalRoute';

// "beforeHistoryChange",
// "routeChangeStart",
// "routeChangeComplete",
// "routeChangeError",
// "hashChangeStart",
// "hashChangeComplete"

/** Remote Container string eg `home@https://example.com/_next/static/chunks/remoteEntry.js` */
export type RemoteString = string;

export class MFClient {
  /** List of registred remotes */
  remotes: Record<RemoteString, RemoteContainer> = {};
  /** Local & Remote pages sorted in correct order */
  combinedPages: CombinedPages;
  /** Remote pages loader */
  remotePages: RemotePages;
  /** EventEmitter which allows to subscribe on different events */
  events: EventEmitter<EventTypes>;
  /** Original nextjs PageLoader which passed by `patchNextClientPageLoader.js` */
  private _nextPageLoader: PageLoader;

  constructor(nextPageLoader: PageLoader) {
    this._nextPageLoader = nextPageLoader;
    this.events = new EventEmitter<EventTypes>();

    const cfg = (global as any)?.__NEXT_DATA__?.props?.mfRoutes || {};

    this.remotePages = new RemotePages();
    Object.keys(cfg).forEach((remoteStr) => {
      const remote = this.registerRemote(remoteStr);
      this.remotePages.addRoutes(cfg[remoteStr], remote);
    });

    this.combinedPages = new CombinedPages(
      (this._nextPageLoader as any)._getPageListOriginal.bind(
        this._nextPageLoader
      ),
      this.remotePages
    );

    this._wrapLoadRoute(nextPageLoader);
    this._wrapWhenEntrypoint(nextPageLoader);
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

  registerRemote(remoteStr: RemoteString) {
    const remote = RemoteContainer.createSingleton(remoteStr);
    this.remotes[remote.global] = remote;
    return remote;
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
    const routes = await this.getPageList();
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
    routeLoader.loadRoute = async (route, prefetch) => {
      console.log('routeLoader.loadRoute', route);
      let routeInfo;
      if (await this.combinedPages.isLocalRoute(route)) {
        routeInfo = await routeLoader._loadRouteOriginal(route);
        this.events.emit('loadedLocalRoute', routeInfo, prefetch);
      } else {
        routeInfo = await this.remotePages.getRouteInfo(route);
        this.events.emit(
          'loadedRemoteRoute',
          routeInfo,
          prefetch,
          this.remotePages.routeToRemote(route)
        );
      }
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
        let route = await this.pathnameToRoute(window.location.pathname);
        if (!route) {
          // if route not found then try to load all non-downloaded remoteEntries
          // and try to find route again
          const awaitRemotes = [] as Promise<any>[];
          Object.values(this.remotes).forEach((remote) => {
            if (!remote.isLoaded()) {
              awaitRemotes.push(
                remote
                  .getContainer()
                  .then(() => this.remotePages.loadRemotePageMap(remote))
                  .catch(() => null)
              );
            }
          });
          await Promise.all(awaitRemotes);
          route = await this.pathnameToRoute(window.location.pathname);
        }
        if (route) {
          // TODO: fix router properties for the first page load of federated page http://localhost:3000/shop/products/B
          console.log('replace entrypoint /_error by', route);
          const routeInfo = await this.remotePages.getRouteInfo(route);
          this.events.emit(
            'loadedRemoteRoute',
            routeInfo,
            false,
            this.remotePages.routeToRemote(route)
          );
          return routeInfo;
        }
      }
      console.log('whenEntrypoint', route);
      const routeInfo = await routeLoader._whenEntrypointOriginal(route);
      return routeInfo;
    };
  }
}
