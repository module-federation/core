import { normalizeLocalePath } from '../../shared/lib/i18n/normalize-locale-path';
import { parseStaticPathsResult } from '../../lib/fallback';
import escapePathDelimiters from '../../shared/lib/router/utils/escape-path-delimiters';
import { removeTrailingSlash } from '../../shared/lib/router/utils/remove-trailing-slash';
import { getRouteMatcher } from '../../shared/lib/router/utils/route-matcher';
import { getRouteRegex } from '../../shared/lib/router/utils/route-regex';
import { encodeParam, normalizePathname } from './utils';
export async function buildPagesStaticPaths({ page, getStaticPaths, configFileName, locales, defaultLocale }) {
    const prerenderedRoutes = [];
    const _routeRegex = getRouteRegex(page);
    const _routeMatcher = getRouteMatcher(_routeRegex);
    // Get the default list of allowed params.
    const routeParameterKeys = Object.keys(_routeMatcher(page));
    const staticPathsResult = await getStaticPaths({
        // We create a copy here to avoid having the types of `getStaticPaths`
        // change. This ensures that users can't mutate this array and have it
        // poison the reference.
        locales: [
            ...locales ?? []
        ],
        defaultLocale
    });
    const expectedReturnVal = `Expected: { paths: [], fallback: boolean }\n` + `See here for more info: https://nextjs.org/docs/messages/invalid-getstaticpaths-value`;
    if (!staticPathsResult || typeof staticPathsResult !== 'object' || Array.isArray(staticPathsResult)) {
        throw Object.defineProperty(new Error(`Invalid value returned from getStaticPaths in ${page}. Received ${typeof staticPathsResult} ${expectedReturnVal}`), "__NEXT_ERROR_CODE", {
            value: "E241",
            enumerable: false,
            configurable: true
        });
    }
    const invalidStaticPathKeys = Object.keys(staticPathsResult).filter((key)=>!(key === 'paths' || key === 'fallback'));
    if (invalidStaticPathKeys.length > 0) {
        throw Object.defineProperty(new Error(`Extra keys returned from getStaticPaths in ${page} (${invalidStaticPathKeys.join(', ')}) ${expectedReturnVal}`), "__NEXT_ERROR_CODE", {
            value: "E38",
            enumerable: false,
            configurable: true
        });
    }
    if (!(typeof staticPathsResult.fallback === 'boolean' || staticPathsResult.fallback === 'blocking')) {
        throw Object.defineProperty(new Error(`The \`fallback\` key must be returned from getStaticPaths in ${page}.\n` + expectedReturnVal), "__NEXT_ERROR_CODE", {
            value: "E243",
            enumerable: false,
            configurable: true
        });
    }
    const toPrerender = staticPathsResult.paths;
    if (!Array.isArray(toPrerender)) {
        throw Object.defineProperty(new Error(`Invalid \`paths\` value returned from getStaticPaths in ${page}.\n` + `\`paths\` must be an array of strings or objects of shape { params: [key: string]: string }`), "__NEXT_ERROR_CODE", {
            value: "E83",
            enumerable: false,
            configurable: true
        });
    }
    toPrerender.forEach((entry)=>{
        // For a string-provided path, we must make sure it matches the dynamic
        // route.
        if (typeof entry === 'string') {
            entry = removeTrailingSlash(entry);
            const localePathResult = normalizeLocalePath(entry, locales);
            let cleanedEntry = entry;
            if (localePathResult.detectedLocale) {
                cleanedEntry = entry.slice(localePathResult.detectedLocale.length + 1);
            } else if (defaultLocale) {
                entry = `/${defaultLocale}${entry}`;
            }
            const result = _routeMatcher(cleanedEntry);
            if (!result) {
                throw Object.defineProperty(new Error(`The provided path \`${cleanedEntry}\` does not match the page: \`${page}\`.`), "__NEXT_ERROR_CODE", {
                    value: "E481",
                    enumerable: false,
                    configurable: true
                });
            }
            // If leveraging the string paths variant the entry should already be
            // encoded so we decode the segments ensuring we only escape path
            // delimiters
            prerenderedRoutes.push({
                pathname: entry.split('/').map((segment)=>escapePathDelimiters(decodeURIComponent(segment), true)).join('/'),
                encodedPathname: entry,
                fallbackRouteParams: undefined,
                fallbackMode: parseStaticPathsResult(staticPathsResult.fallback),
                fallbackRootParams: undefined
            });
        } else {
            const invalidKeys = Object.keys(entry).filter((key)=>key !== 'params' && key !== 'locale');
            if (invalidKeys.length) {
                throw Object.defineProperty(new Error(`Additional keys were returned from \`getStaticPaths\` in page "${page}". ` + `URL Parameters intended for this dynamic route must be nested under the \`params\` key, i.e.:` + `\n\n\treturn { params: { ${routeParameterKeys.map((k)=>`${k}: ...`).join(', ')} } }` + `\n\nKeys that need to be moved: ${invalidKeys.join(', ')}.\n`), "__NEXT_ERROR_CODE", {
                    value: "E322",
                    enumerable: false,
                    configurable: true
                });
            }
            const { params = {} } = entry;
            let builtPage = page;
            let encodedBuiltPage = page;
            routeParameterKeys.forEach((validParamKey)=>{
                const { repeat, optional } = _routeRegex.groups[validParamKey];
                let paramValue = params[validParamKey];
                if (optional && params.hasOwnProperty(validParamKey) && (paramValue === null || paramValue === undefined || paramValue === false)) {
                    paramValue = [];
                }
                if (repeat && !Array.isArray(paramValue) || !repeat && typeof paramValue !== 'string' || typeof paramValue === 'undefined') {
                    throw Object.defineProperty(new Error(`A required parameter (${validParamKey}) was not provided as ${repeat ? 'an array' : 'a string'} received ${typeof paramValue} in getStaticPaths for ${page}`), "__NEXT_ERROR_CODE", {
                        value: "E620",
                        enumerable: false,
                        configurable: true
                    });
                }
                let replaced = `[${repeat ? '...' : ''}${validParamKey}]`;
                if (optional) {
                    replaced = `[${replaced}]`;
                }
                builtPage = builtPage.replace(replaced, encodeParam(paramValue, (value)=>escapePathDelimiters(value, true)));
                encodedBuiltPage = encodedBuiltPage.replace(replaced, encodeParam(paramValue, encodeURIComponent));
            });
            if (!builtPage && !encodedBuiltPage) {
                return;
            }
            if (entry.locale && !(locales == null ? void 0 : locales.includes(entry.locale))) {
                throw Object.defineProperty(new Error(`Invalid locale returned from getStaticPaths for ${page}, the locale ${entry.locale} is not specified in ${configFileName}`), "__NEXT_ERROR_CODE", {
                    value: "E358",
                    enumerable: false,
                    configurable: true
                });
            }
            const curLocale = entry.locale || defaultLocale || '';
            prerenderedRoutes.push({
                pathname: normalizePathname(`${curLocale ? `/${curLocale}` : ''}${curLocale && builtPage === '/' ? '' : builtPage}`),
                encodedPathname: normalizePathname(`${curLocale ? `/${curLocale}` : ''}${curLocale && encodedBuiltPage === '/' ? '' : encodedBuiltPage}`),
                fallbackRouteParams: undefined,
                fallbackMode: parseStaticPathsResult(staticPathsResult.fallback),
                fallbackRootParams: undefined
            });
        }
    });
    const seen = new Set();
    return {
        fallbackMode: parseStaticPathsResult(staticPathsResult.fallback),
        prerenderedRoutes: prerenderedRoutes.filter((route)=>{
            if (seen.has(route.pathname)) return false;
            // Filter out duplicate paths.
            seen.add(route.pathname);
            return true;
        })
    };
}

//# sourceMappingURL=pages.js.map