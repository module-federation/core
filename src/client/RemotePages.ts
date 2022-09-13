import { PageMap, RemoteContainer } from './RemoteContainer';

export type PathPrefix = string;

export type RemoteToRoutes = Map<RemoteContainer, PathPrefix | PathPrefix[]>;

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

export class RemotePages {
  paths: Record<PathPrefix, RemoteContainer> = {};
  pageListCache: string[] | undefined;
  private asyncLoadedPageMaps: Set<RemoteContainer>;

  constructor(remoteToRoutes?: RemoteToRoutes) {
    this.asyncLoadedPageMaps = new Set();
    this.pageListCache = undefined;
    remoteToRoutes?.forEach((routes, remote) => {
      this.addRoutes(routes, remote);
    });
  }

  async loadRemotePageMap(remote: RemoteContainer) {
    return this._processPageMap(remote);
  }

  addRoutes(routes: string | string[], remote: RemoteContainer) {
    if (Array.isArray(routes)) {
      routes.forEach((route) => {
        this.paths[route] = remote;
      });
    } else {
      this.paths[routes] = remote;
    }
    this.pageListCache = Object.keys(this.paths);
  }

  async _processPageMap(remote: RemoteContainer): Promise<PageMap | undefined> {
    const pageMap = await remote.getPageMap();
    if (!pageMap) return undefined;

    // init once page map from remote if it wasn't done before
    // here we updating real routes received from remote app in runtime
    if (!this.asyncLoadedPageMaps.has(remote)) {
      this.asyncLoadedPageMaps.add(remote);
      this.addRoutes(Object.keys(pageMap), remote);
    }

    return pageMap;
  }

  async routeToPageModule(route: string) {
    const remote = this.routeToRemote(route);
    if (!remote) {
      return undefined;
    }

    const pageMap = await this._processPageMap(remote);
    if (!pageMap) {
      return undefined;
    }

    const modulePath = pageMap[route];
    if (!modulePath) {
      return undefined;
    }

    return remote.getModule(modulePath);
  }

  hasRoute(route: string): boolean {
    return !!this.pageListCache?.includes(route);
  }

  /**
   * Find remote according to provided route
   */
  routeToRemote(route: string): RemoteContainer | undefined {
    let bestMatch: string | undefined;

    for (const basepath in this.paths) {
      if (route === basepath) {
        return this.paths[basepath];
      } else if (route.startsWith(`${basepath}/`)) {
        if (!bestMatch) {
          bestMatch = basepath;
        } else if (bestMatch.length < basepath.length) {
          bestMatch = basepath;
        }
      }
    }

    if (bestMatch) {
      return this.paths[bestMatch];
    }

    return undefined;
  }

  getPageList() {
    // it's very important to return the same Array instance
    // because it instance is used in CombinedPages for recalculation of sorted version of all routes
    const pageList = this.pageListCache || Object.keys(this.paths);
    this.pageListCache = pageList;
    return pageList;
  }

  async getRouteInfo(route: string): Promise<undefined | RouteInfo> {
    console.log('--- start getRouteInfo', route);
    let routeInfo;

    try {
      const mod = await this.routeToPageModule(route);
      if (mod) {
        routeInfo = {
          component: mod.default,
          exports: mod,
          styles: [],
        };
      }
    } catch (e) {
      routeInfo = {
        // TODO: provide ability to customize component with Error
        component: () => e.message,
        exports: {},
        styles: [],
      };
      console.warn(e);
    }

    console.log('--- end getRouteInfo', routeInfo);
    return routeInfo;
  }
}
