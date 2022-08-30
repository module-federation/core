const singletonRouter = require('next/dist/client/router').default;
const {
  injectScript,
  remotes,
} = require('@module-federation/nextjs-mf/lib/utils');

/**
 * This class copied from
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
 */
class UrlNode {
  placeholder = true;
  children = new Map();
  slugName = null;
  restSlugName = null;
  optionalRestSlugName = null;

  insert(urlPath) {
    this._insert(urlPath.split('/').filter(Boolean), [], false);
  }

  smoosh() {
    return this._smoosh();
  }

  _smoosh(prefix = '/') {
    const childrenPaths = [...this.children.keys()].sort();
    if (this.slugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[]'), 1);
    }
    if (this.restSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[...]'), 1);
    }
    if (this.optionalRestSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[[...]]'), 1);
    }

    const routes = childrenPaths
      .map((c) => this.children.get(c)._smoosh(`${prefix}${c}/`))
      .reduce((prev, curr) => [...prev, ...curr], []);

    if (this.slugName !== null) {
      routes.push(
        ...this.children.get('[]')._smoosh(`${prefix}[${this.slugName}]/`)
      );
    }

    if (!this.placeholder) {
      const r = prefix === '/' ? '/' : prefix.slice(0, -1);
      if (this.optionalRestSlugName != null) {
        throw new Error(
          `You cannot define a route with the same specificity as a optional catch-all route ("${r}" and "${r}[[...${this.optionalRestSlugName}]]").`
        );
      }

      routes.unshift(r);
    }

    if (this.restSlugName !== null) {
      routes.push(
        ...this.children
          .get('[...]')
          ._smoosh(`${prefix}[...${this.restSlugName}]/`)
      );
    }

    if (this.optionalRestSlugName !== null) {
      routes.push(
        ...this.children
          .get('[[...]]')
          ._smoosh(`${prefix}[[...${this.optionalRestSlugName}]]/`)
      );
    }

    return routes;
  }

  _insert(urlPaths, slugNames, isCatchAll) {
    if (urlPaths.length === 0) {
      this.placeholder = false;
      return;
    }

    if (isCatchAll) {
      throw new Error(`Catch-all must be the last part of the URL.`);
    }

    // The next segment in the urlPaths list
    let nextSegment = urlPaths[0];

    // Check if the segment matches `[something]`
    if (nextSegment.startsWith('[') && nextSegment.endsWith(']')) {
      // Strip `[` and `]`, leaving only `something`
      let segmentName = nextSegment.slice(1, -1);

      let isOptional = false;
      if (segmentName.startsWith('[') && segmentName.endsWith(']')) {
        // Strip optional `[` and `]`, leaving only `something`
        segmentName = segmentName.slice(1, -1);
        isOptional = true;
      }

      if (segmentName.startsWith('...')) {
        // Strip `...`, leaving only `something`
        segmentName = segmentName.substring(3);
        isCatchAll = true;
      }

      if (segmentName.startsWith('[') || segmentName.endsWith(']')) {
        throw new Error(
          `Segment names may not start or end with extra brackets ('${segmentName}').`
        );
      }

      if (segmentName.startsWith('.')) {
        throw new Error(
          `Segment names may not start with erroneous periods ('${segmentName}').`
        );
      }

      function handleSlug(previousSlug, nextSlug) {
        if (previousSlug !== null) {
          // If the specific segment already has a slug but the slug is not `something`
          // This prevents collisions like:
          // pages/[post]/index.js
          // pages/[id]/index.js
          // Because currently multiple dynamic params on the same segment level are not supported
          if (previousSlug !== nextSlug) {
            // TODO: This error seems to be confusing for users, needs an error link, the description can be based on above comment.
            throw new Error(
              `You cannot use different slug names for the same dynamic path ('${previousSlug}' !== '${nextSlug}').`
            );
          }
        }

        slugNames.forEach((slug) => {
          if (slug === nextSlug) {
            throw new Error(
              `You cannot have the same slug name "${nextSlug}" repeat within a single dynamic path`
            );
          }

          if (slug.replace(/\W/g, '') === nextSegment.replace(/\W/g, '')) {
            throw new Error(
              `You cannot have the slug names "${slug}" and "${nextSlug}" differ only by non-word symbols within a single dynamic path`
            );
          }
        });

        slugNames.push(nextSlug);
      }

      if (isCatchAll) {
        if (isOptional) {
          if (this.restSlugName != null) {
            throw new Error(
              `You cannot use both an required and optional catch-all route at the same level ("[...${this.restSlugName}]" and "${urlPaths[0]}" ).`
            );
          }

          handleSlug(this.optionalRestSlugName, segmentName);
          // slugName is kept as it can only be one particular slugName
          this.optionalRestSlugName = segmentName;
          // nextSegment is overwritten to [[...]] so that it can later be sorted specifically
          nextSegment = '[[...]]';
        } else {
          if (this.optionalRestSlugName != null) {
            throw new Error(
              `You cannot use both an optional and required catch-all route at the same level ("[[...${this.optionalRestSlugName}]]" and "${urlPaths[0]}").`
            );
          }

          handleSlug(this.restSlugName, segmentName);
          // slugName is kept as it can only be one particular slugName
          this.restSlugName = segmentName;
          // nextSegment is overwritten to [...] so that it can later be sorted specifically
          nextSegment = '[...]';
        }
      } else {
        if (isOptional) {
          throw new Error(
            `Optional route parameters are not yet supported ("${urlPaths[0]}").`
          );
        }
        handleSlug(this.slugName, segmentName);
        // slugName is kept as it can only be one particular slugName
        this.slugName = segmentName;
        // nextSegment is overwritten to [] so that it can later be sorted specifically
        nextSegment = '[]';
      }
    }

    // If this UrlNode doesn't have the nextSegment yet we create a new child UrlNode
    if (!this.children.has(nextSegment)) {
      this.children.set(nextSegment, new UrlNode());
    }

    this.children
      .get(nextSegment)
      ._insert(urlPaths.slice(1), slugNames, isCatchAll);
  }
}

if (typeof window !== 'undefined') {
  const TEST_DYNAMIC_ROUTE = /\/\[[^/]+?\](?=\/|$)/;
  function isDynamicRoute(route) {
    return TEST_DYNAMIC_ROUTE.test(route);
  }
  /**
   * Parses a given parameter from a route to a data structure that can be used
   * to generate the parametrized route. Examples:
   *   - `[...slug]` -> `{ name: 'slug', repeat: true, optional: true }`
   *   - `[foo]` -> `{ name: 'foo', repeat: false, optional: true }`
   *   - `bar` -> `{ name: 'bar', repeat: false, optional: false }`
   */
  function parseParameter(param) {
    const optional = param.startsWith('[') && param.endsWith(']');
    if (optional) {
      param = param.slice(1, -1);
    }
    const repeat = param.startsWith('...');
    if (repeat) {
      param = param.slice(3);
    }
    return { key: param, repeat, optional };
  }

  function getParametrizedRoute(route) {
    // const segments = removeTrailingSlash(route).slice(1).split('/')
    const segments = route.slice(1).split('/');
    const groups = {};
    let groupIndex = 1;
    return {
      parameterizedRoute: segments
        .map((segment) => {
          if (segment.startsWith('[') && segment.endsWith(']')) {
            const { key, optional, repeat } = parseParameter(
              segment.slice(1, -1)
            );
            groups[key] = { pos: groupIndex++, repeat, optional };
            return repeat ? (optional ? '(?:/(.+?))?' : '/(.+?)') : '/([^/]+?)';
          } else {
            return `/${escapeStringRegexp(segment)}`;
          }
        })
        .join(''),
      groups,
    };
  }
  function getRouteRegex(normalizedRoute) {
    const { parameterizedRoute, groups } =
      getParametrizedRoute(normalizedRoute);
    return {
      re: new RegExp(`^${parameterizedRoute}(?:/)?$`),
      groups: groups,
    };
  }

  const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
  const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;
  function escapeStringRegexp(str) {
    // see also: https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escapeRegExp.js#L23
    if (reHasRegExp.test(str)) {
      return str.replace(reReplaceRegExp, '\\$&');
    }
    return str;
  }

  window.mf_nextjs = {
    /**
     * This map is filled by nextjs-mf module
     */
    federatedPageMap: {
      '/shop/nodkz/[...mee]': {
        loadAsyncModule: () => Promise.resolve({ default: () => 'Works!' }),
      },
    },

    /**
     * This is computable list of pages in proper sorted order.
     */
    _sortedPageList: undefined,

    _prepareSortedPageList(pagesList) {
      if (!this._sortedPageList) {
        // getSortedRoutes @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
        const root = new UrlNode();
        pagesList.forEach((pagePath) => root.insert(pagePath));
        Object.keys(this.federatedPageMap).forEach((pagePath) =>
          root.insert(pagePath)
        );
        // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
        this._sortedPageList = root.smoosh();
      }
      return this._sortedPageList;
    },

    async _getRouteInfo(route) {
      const routeInfo = this.federatedPageMap[route];
      if (routeInfo) {
        if (!routeInfo.component && routeInfo.loadAsyncModule) {
          routeInfo.exports = await routeInfo.loadAsyncModule();
          routeInfo.component = (routeInfo.exports || {}).default;
        }
        const result = {
          component: routeInfo.component,
          exports: routeInfo.exports, // in code it reads __N_SSG, __N_SSP, __next_rsc__ properties
          styles: routeInfo.styles || [],
        };
        return result;
      }
    },

    /**
     * Check that current browser pathname is served by federated remotes.
     *
     * Eg. if cleanPathname `/shop/nodkz/product123` and federatedPages is ['/shop/nodkz/[...mee]']
     *     then this method will match federated dynamic route and return true.
     *
     * This method widely is used by
     *   - DevHmrFixInvalidPongPlugin (fix HMR in dev mode)
     *   - TODO: add more
     *
     * @param string cleanPathname
     * @returns boolean
     */
    isFederatedPathname(cleanPathname) {
      const federatedPages = Object.keys(this.federatedPageMap);
      if (federatedPages.includes(cleanPathname)) return true;
      return federatedPages.some((page) => {
        if (
          isDynamicRoute(page) &&
          getRouteRegex(page).re.test(cleanPathname)
        ) {
          return true;
        }
      });
    },

    addFederatedPages(routeLoaders) {
      this._sortedPageList = undefined;
      const federatedPageMap = this.federatedPageMap;
      Object.keys(routeLoaders).forEach((route) => {
        federatedPageMap[route] = routeLoaders[route];
      });
    },

    wrapGetPageList() {
      if (singletonRouter?.router?.pageLoader?.getPageList) {
        const getPageListOrig =
          singletonRouter.router.pageLoader.getPageList.bind(
            singletonRouter.router.pageLoader
          );

        const _prepareSortedPageList = this._prepareSortedPageList.bind(this);
        singletonRouter.router.pageLoader.getPageList = async (...args) => {
          const pageListOrig = await getPageListOrig(...args);
          const pageList = _prepareSortedPageList(pageListOrig);
          return pageList;
        };
      } else {
        throw new Error(
          '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.getPageList()` logic.'
        );
      }
    },

    wrapLoadRoute() {
      if (singletonRouter?.router?.pageLoader?.routeLoader?.loadRoute) {
        const loadRouteOrig =
          singletonRouter.router.pageLoader.routeLoader.loadRoute.bind(
            singletonRouter.router.pageLoader.routeLoader
          );

        const _getRouteInfo = this._getRouteInfo.bind(this);
        singletonRouter.router.pageLoader.routeLoader.loadRoute = async (
          route
        ) => {
          const routeInfo =
            (await _getRouteInfo(route)) || (await loadRouteOrig(route));
          return routeInfo;
        };
      } else {
        throw new Error(
          '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `singletonRouter.router.pageLoader.routeLoader` logic.'
        );
      }
    },
  };

  setTimeout(() => {
    window.mf_nextjs.wrapGetPageList();
    window.mf_nextjs.wrapLoadRoute();
    window.mf_nextjs.addFederatedPages({
      '/shop/nodkz/[...mee]': {
        loadAsyncModule: async () => ({ default: () => 'Works!' }),
      },
      '/shop/test/[...mee]': {
        loadAsyncModule: async () => ({ default: () => 'Works test!' }),
      },
    });

    Object.keys(remotes).forEach((remote) => {
      injectScript(remote).then(async (container) => {
        try {
          const pageMap = (await container.get('./pages-map-v2'))().default;
          const pageLoaders = {};
          Object.keys(pageMap).forEach((route) => {
            const pageModule = pageMap[route];
            pageLoaders[route] = {
              loadAsyncModule: async () => {
                // TODO: somehow rewrite with custom options for changing menu
                // TODO: OR wrap useRouter() for adding additional property `remote`
                window.dispatchEvent(
                  new CustomEvent('federated-menu', {
                    detail: (await container.get('./pages/_menu'))().default,
                  })
                );

                return container.get(pageModule).then((m) => m());
              },
              remote: remote,
            };
          });
          window.mf_nextjs.addFederatedPages(pageLoaders);
        } catch (e) {
          console.warn(`Remote ${remote} does not have ./pages-map-v2`);
        }
      });
    });
  }, 0);
}

module.exports = {};
