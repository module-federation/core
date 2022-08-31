const TEST_DYNAMIC_ROUTE = /\/\[[^/]+?\](?=\/|$)/;
export function isDynamicRoute(route: string) {
  return TEST_DYNAMIC_ROUTE.test(route);
}

/**
 * Parses a given parameter from a route to a data structure that can be used
 * to generate the parametrized route. Examples:
 *   - `[...slug]` -> `{ name: 'slug', repeat: true, optional: true }`
 *   - `[foo]` -> `{ name: 'foo', repeat: false, optional: true }`
 *   - `bar` -> `{ name: 'bar', repeat: false, optional: false }`
 */
function parseParameter(param: string) {
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

function getParametrizedRoute(route: string) {
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

export function getRouteRegex(normalizedRoute: string) {
  const { parameterizedRoute, groups } = getParametrizedRoute(normalizedRoute);
  return {
    re: new RegExp(`^${parameterizedRoute}(?:/)?$`),
    groups: groups,
  };
}

const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;
function escapeStringRegexp(str: string) {
  // see also: https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escapeRegExp.js#L23
  if (reHasRegExp.test(str)) {
    return str.replace(reReplaceRegExp, '\\$&');
  }
  return str;
}
