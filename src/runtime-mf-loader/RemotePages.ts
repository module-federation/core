import { RemoteContainer } from './RemoteContainer';

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

  constructor(remoteToRoutes?: RemoteToRoutes) {
    const cfg = remoteToRoutes || {
      'home@http://localhost:3000/_next/static/chunks/remoteEntry.js': [
        '/',
        '/home',
      ],
      'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js': [
        '/shop',
      ],
      'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js': [
        '/checkout',
      ],
    };

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
      this.paths[pathPrefixes] = remote;
    } else if (Array.isArray(pathPrefixes)) {
      pathPrefixes.forEach((pathPrefix) => {
        this.paths[pathPrefix] = remote;
      });
    }
  }

  async addRemote(remoteStr: RemoteString) {
    return this.loadRemotePageMap(remoteStr);
  }

  async loadRemotePageMap(remoteStr: RemoteString) {
    this.pageListCache = undefined;
    const remote = RemoteContainer.createSingleton(remoteStr);
    this.remotes[remoteStr] = remote;

    const pageMap = await remote.getPageMap();
    if (pageMap) {
      Object.keys(pageMap).forEach((route) => {
        this.paths[route] = remote;
      });
    }

    return pageMap;
  }

  async routeToPageModule(route: string) {
    const remote = this.routeToRemote(route);
    if (!remote) {
      return undefined;
    }

    const pageMap = await remote.getPageMap();
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
        component: exports.default,
        exports,
        styles: [],
      };
    }

    console.log('--- end getRouteInfo', routeInfo);
    return routeInfo;
  }
}
