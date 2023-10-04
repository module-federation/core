import type { PageMap } from '@module-federation/utilities';

import * as React from 'react';

import { RemoteContainer } from './RemoteContainer';

export type PathPrefix = string;

export type RemoteToRoutes = Map<RemoteContainer, PathPrefix | PathPrefix[]>;

export type RouteInfo = {
  component: any;
  exports: any; // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
  styles: string[];
};

/**
 * A class which prepares/loads a list of remotes pages and knows how
 * to prepare NextJS pseudo-module of route data.
 */
export class RemotePages {
  paths: Record<PathPrefix, RemoteContainer> = {};
  pageListCache: string[] | undefined;
  private asyncLoadedPageMaps: Set<RemoteContainer>;
  private mode?: 'production' | 'development';

  constructor(mode?: 'production' | 'development') {
    this.asyncLoadedPageMaps = new Set();
    this.pageListCache = undefined;
    this.mode = mode;
  }

  /**
   * Add remote routes for specific RemoteContainer which serves them.
   */
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

  /**
   * Load a remote page map and add its routes to registry.
   */
  async loadRemotePageMap(
    remote: RemoteContainer,
  ): Promise<PageMap | undefined> {
    const pageMap = await remote.getPageMap();
    if (!pageMap) {
      return undefined;
    }

    // init once page map from remote if it wasn't done before
    // here we updating real routes received from remote app in runtime
    if (!this.asyncLoadedPageMaps.has(remote)) {
      this.asyncLoadedPageMaps.add(remote);
      this.addRoutes(Object.keys(pageMap), remote);
    }

    return pageMap;
  }

  /**
   * Get remote module according to provided next route.
   * Under the hood it automatically determines which remote need to be used.
   */
  async routeToPageModule(route: string) {
    const remote = this.routeToRemote(route);
    if (!remote) {
      return undefined;
    }

    const pageMap = await this.loadRemotePageMap(remote);
    if (!pageMap) {
      return undefined;
    }

    const modulePath = pageMap[route];
    if (!modulePath) {
      return undefined;
    }

    return remote.getModule(modulePath);
  }

  /**
   * Check that provided route present in registry.
   */
  hasRoute(route: string): boolean {
    return !!this.pageListCache?.includes(route);
  }

  /**
   * Find remote according to provided route.
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

  /**
   * Get cached unsorted list of remote routes.
   */
  getPageList() {
    // it's very important to return the same Array instance
    // because it instance is used in CombinedPages for recalculation of sorted version of all routes
    const pageList = this.pageListCache || Object.keys(this.paths);
    this.pageListCache = pageList;
    return pageList;
  }

  /**
   * Get prepared pseudo-module which is consumed by Nextjs' router.
   */
  async getRouteInfo(route: string): Promise<undefined | RouteInfo> {
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
      if (this.mode !== 'development') {
        // in PROD throw error, nextjs will reload the page according to its internal logic
        throw e;
      } else {
        // in DEV mod show error in browser
        console.warn(e);
        routeInfo = {
          component: () =>
            React.createElement(
              'div',
              null,
              React.createElement(
                'div',
                null,
                'This page is shown only in DEVELOPMENT mode. In PRODUCTION NextJS will reload this page trying to obtain it again from the server.',
              ),
              React.createElement(
                'div',
                null,
                'Federated page ',
                route,
                ' load error:',
              ),
              React.createElement(
                'div',
                null,
                React.createElement('b', null, (e as Error).message),
              ),
            ),
          exports: {},
          styles: [],
        };
      }
    }
    return routeInfo;
  }
}
