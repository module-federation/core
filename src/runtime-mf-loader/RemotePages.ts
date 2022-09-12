import { PageMap, RemoteContainer } from './RemoteContainer';

export type RemoteString = string;
export type PathPrefix = string;

export type RemoteToRoutes = Record<RemoteString, PathPrefix | PathPrefix[]>;

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

export class RemotePages {
  remotes: Record<RemoteString, RemoteContainer> = {};
  paths: Record<PathPrefix, RemoteContainer> = {};
  pageListCache: string[] | undefined;
  private asyncLoadedPageMaps: Set<RemoteContainer>;

  constructor(remoteToRoutes?: RemoteToRoutes) {
    const cfg = remoteToRoutes || {
      'home@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
        '/',
        '/home',
      ],
      'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
        '/shop',
        '/shop/products/[...slug]',
      ],
      'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
        '/checkout',
        '/checkout/exposed-pages',
      ],
    };

    this.asyncLoadedPageMaps = new Set();
    Object.keys(cfg).forEach((remoteStr) => {
      this.addRemoteSync(remoteStr, cfg[remoteStr]);
    });
  }

  addRemoteSync(
    remoteStr: RemoteString,
    pathPrefixes: PathPrefix | PathPrefix[]
  ) {
    this.pageListCache = undefined;

    const remote = RemoteContainer.createSingleton(remoteStr);
    this.remotes[remoteStr] = remote;

    if (typeof pathPrefixes === 'string') {
      this.registerRoute(pathPrefixes, remote);
    } else if (Array.isArray(pathPrefixes)) {
      pathPrefixes.forEach((pathPrefix) => {
        this.registerRoute(pathPrefix, remote);
      });
    }
  }

  async addRemote(remoteStr: RemoteString) {
    return this.loadRemotePageMap(remoteStr);
  }

  async loadRemotePageMap(remoteStr: RemoteString) {
    const remote = RemoteContainer.createSingleton(remoteStr);
    this.remotes[remoteStr] = remote;
    return this._processPageMap(remote);
  }

  registerRoute(route: string, remote: RemoteContainer) {
    this.paths[route] = remote;
    this.pageListCache = Object.keys(this.paths);
  }

  async _processPageMap(remote: RemoteContainer): Promise<PageMap | undefined> {
    const pageMap = await remote.getPageMap();
    if (!pageMap) return undefined;

    // init once page map from remote if it wasn't done before
    // here we updating real routes received from remote app in runtime
    if (!this.asyncLoadedPageMaps.has(remote)) {
      this.asyncLoadedPageMaps.add(remote);
      Object.keys(pageMap).forEach((route) => {
        this.registerRoute(route, remote);
      });
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

    const mod = await this.routeToPageModule(route);
    if (mod) {
      routeInfo = {
        component: mod.default,
        exports: mod,
        styles: [],
      };
    }

    console.log('--- end getRouteInfo', routeInfo);
    return routeInfo;
  }
}
