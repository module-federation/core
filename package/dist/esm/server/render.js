import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { setLazyProp } from './api-utils';
import { getCookieParser } from './api-utils/get-cookie-parser';
import React from 'react';
import ReactDOMServerPages from 'next/dist/server/ReactDOMServerPages';
import { StyleRegistry, createStyleRegistry } from 'styled-jsx';
import { GSP_NO_RETURNED_VALUE, GSSP_COMPONENT_MEMBER_ERROR, GSSP_NO_RETURNED_VALUE, STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR, SERVER_PROPS_GET_INIT_PROPS_CONFLICT, SERVER_PROPS_SSG_CONFLICT, SSG_GET_INITIAL_PROPS_CONFLICT, UNSTABLE_REVALIDATE_RENAME_ERROR } from '../lib/constants';
import { NEXT_BUILTIN_DOCUMENT, SERVER_PROPS_ID, STATIC_PROPS_ID, STATIC_STATUS_PAGES } from '../shared/lib/constants';
import { isSerializableProps } from '../lib/is-serializable-props';
import { isInAmpMode } from '../shared/lib/amp-mode';
import { AmpStateContext } from '../shared/lib/amp-context.shared-runtime';
import { defaultHead } from '../shared/lib/head';
import { HeadManagerContext } from '../shared/lib/head-manager-context.shared-runtime';
import Loadable from '../shared/lib/loadable.shared-runtime';
import { LoadableContext } from '../shared/lib/loadable-context.shared-runtime';
import { RouterContext } from '../shared/lib/router-context.shared-runtime';
import { isDynamicRoute } from '../shared/lib/router/utils/is-dynamic';
import { getDisplayName, isResSent, loadGetInitialProps } from '../shared/lib/utils';
import { HtmlContext } from '../shared/lib/html-context.shared-runtime';
import { normalizePagePath } from '../shared/lib/page-path/normalize-page-path';
import { denormalizePagePath } from '../shared/lib/page-path/denormalize-page-path';
import { getRequestMeta } from './request-meta';
import { allowedStatusCodes, getRedirectStatus } from '../lib/redirect-status';
import RenderResult from './render-result';
import isError from '../lib/is-error';
import { streamToString, renderToInitialFizzStream } from './stream-utils/node-web-streams-helper';
import { ImageConfigContext } from '../shared/lib/image-config-context.shared-runtime';
import stripAnsi from 'next/dist/compiled/strip-ansi';
import { stripInternalQueries } from './internal-utils';
import { adaptForAppRouterInstance, adaptForPathParams, adaptForSearchParams, PathnameContextProviderAdapter } from '../shared/lib/router/adapters';
import { AppRouterContext } from '../shared/lib/app-router-context.shared-runtime';
import { SearchParamsContext, PathParamsContext } from '../shared/lib/hooks-client-context.shared-runtime';
import { getTracer } from './lib/trace/tracer';
import { RenderSpan } from './lib/trace/constants';
import { ReflectAdapter } from './web/spec-extension/adapters/reflect';
import { getCacheControlHeader } from './lib/cache-control';
import { getErrorSource } from '../shared/lib/error-source';
let tryGetPreviewData;
let warn;
let postProcessHTML;
const DOCTYPE = '<!DOCTYPE html>';
if (process.env.NEXT_RUNTIME !== 'edge') {
    tryGetPreviewData = require('./api-utils/node/try-get-preview-data').tryGetPreviewData;
    warn = require('../build/output/log').warn;
    postProcessHTML = require('./post-process').postProcessHTML;
} else {
    warn = console.warn.bind(console);
    postProcessHTML = async (_pathname, html)=>html;
}
function noRouter() {
    const message = 'No router instance found. you should only use "next/router" inside the client side of your app. https://nextjs.org/docs/messages/no-router-instance';
    throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
}
async function renderToString(element) {
    const renderStream = await ReactDOMServerPages.renderToReadableStream(element);
    await renderStream.allReady;
    return streamToString(renderStream);
}
class ServerRouter {
    constructor(pathname, query, as, { isFallback }, isReady, basePath, locale, locales, defaultLocale, domainLocales, isPreview, isLocaleDomain){
        this.route = pathname.replace(/\/$/, '') || '/';
        this.pathname = pathname;
        this.query = query;
        this.asPath = as;
        this.isFallback = isFallback;
        this.basePath = basePath;
        this.locale = locale;
        this.locales = locales;
        this.defaultLocale = defaultLocale;
        this.isReady = isReady;
        this.domainLocales = domainLocales;
        this.isPreview = !!isPreview;
        this.isLocaleDomain = !!isLocaleDomain;
    }
    push() {
        noRouter();
    }
    replace() {
        noRouter();
    }
    reload() {
        noRouter();
    }
    back() {
        noRouter();
    }
    forward() {
        noRouter();
    }
    prefetch() {
        noRouter();
    }
    beforePopState() {
        noRouter();
    }
}
function enhanceComponents(options, App, Component) {
    // For backwards compatibility
    if (typeof options === 'function') {
        return {
            App,
            Component: options(Component)
        };
    }
    return {
        App: options.enhanceApp ? options.enhanceApp(App) : App,
        Component: options.enhanceComponent ? options.enhanceComponent(Component) : Component
    };
}
function renderPageTree(App, Component, props) {
    return /*#__PURE__*/ _jsx(App, {
        Component: Component,
        ...props
    });
}
const invalidKeysMsg = (methodName, invalidKeys)=>{
    const docsPathname = `invalid-${methodName.toLocaleLowerCase()}-value`;
    return `Additional keys were returned from \`${methodName}\`. Properties intended for your component must be nested under the \`props\` key, e.g.:` + `\n\n\treturn { props: { title: 'My Title', content: '...' } }` + `\n\nKeys that need to be moved: ${invalidKeys.join(', ')}.` + `\nRead more: https://nextjs.org/docs/messages/${docsPathname}`;
};
function checkRedirectValues(redirect, req, method) {
    const { destination, permanent, statusCode, basePath } = redirect;
    let errors = [];
    const hasStatusCode = typeof statusCode !== 'undefined';
    const hasPermanent = typeof permanent !== 'undefined';
    if (hasPermanent && hasStatusCode) {
        errors.push(`\`permanent\` and \`statusCode\` can not both be provided`);
    } else if (hasPermanent && typeof permanent !== 'boolean') {
        errors.push(`\`permanent\` must be \`true\` or \`false\``);
    } else if (hasStatusCode && !allowedStatusCodes.has(statusCode)) {
        errors.push(`\`statusCode\` must undefined or one of ${[
            ...allowedStatusCodes
        ].join(', ')}`);
    }
    const destinationType = typeof destination;
    if (destinationType !== 'string') {
        errors.push(`\`destination\` should be string but received ${destinationType}`);
    }
    const basePathType = typeof basePath;
    if (basePathType !== 'undefined' && basePathType !== 'boolean') {
        errors.push(`\`basePath\` should be undefined or a false, received ${basePathType}`);
    }
    if (errors.length > 0) {
        throw Object.defineProperty(new Error(`Invalid redirect object returned from ${method} for ${req.url}\n` + errors.join(' and ') + '\n' + `See more info here: https://nextjs.org/docs/messages/invalid-redirect-gssp`), "__NEXT_ERROR_CODE", {
            value: "E185",
            enumerable: false,
            configurable: true
        });
    }
}
export function errorToJSON(err) {
    let source = 'server';
    if (process.env.NEXT_RUNTIME !== 'edge') {
        source = getErrorSource(err) || 'server';
    }
    return {
        name: err.name,
        source,
        message: stripAnsi(err.message),
        stack: err.stack,
        digest: err.digest
    };
}
function serializeError(dev, err) {
    if (dev) {
        return errorToJSON(err);
    }
    return {
        name: 'Internal Server Error.',
        message: '500 - Internal Server Error.',
        statusCode: 500
    };
}
export async function renderToHTMLImpl(req, res, pathname, query, renderOpts, extra, sharedContext, renderContext) {
    // Adds support for reading `cookies` in `getServerSideProps` when SSR.
    setLazyProp({
        req: req
    }, 'cookies', getCookieParser(req.headers));
    const metadata = {};
    metadata.assetQueryString = renderOpts.dev && renderOpts.assetQueryString || '';
    if (renderOpts.dev && !metadata.assetQueryString) {
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            // In dev we invalidate the cache by appending a timestamp to the resource URL.
            // This is a workaround to fix https://github.com/vercel/next.js/issues/5860
            // TODO: remove this workaround when https://bugs.webkit.org/show_bug.cgi?id=187726 is fixed.
            // Note: The workaround breaks breakpoints on reload since the script url always changes,
            // so we only apply it to Safari.
            metadata.assetQueryString = `?ts=${Date.now()}`;
        }
    }
    // if deploymentId is provided we append it to all asset requests
    if (sharedContext.deploymentId) {
        metadata.assetQueryString += `${metadata.assetQueryString ? '&' : '?'}dpl=${sharedContext.deploymentId}`;
    }
    // don't modify original query object
    query = Object.assign({}, query);
    const { err, dev = false, ampPath = '', pageConfig = {}, buildManifest, reactLoadableManifest, ErrorDebug, getStaticProps, getStaticPaths, getServerSideProps, isNextDataRequest, params, previewProps, basePath, images, runtime: globalRuntime, isExperimentalCompile, expireTime } = renderOpts;
    const { App } = extra;
    const assetQueryString = metadata.assetQueryString;
    let Document = extra.Document;
    let Component = renderOpts.Component;
    const OriginComponent = Component;
    const isFallback = renderContext.isFallback ?? false;
    const notFoundSrcPage = renderContext.developmentNotFoundSourcePage;
    // next internal queries should be stripped out
    stripInternalQueries(query);
    const isSSG = !!getStaticProps;
    const isBuildTimeSSG = isSSG && renderOpts.nextExport;
    const defaultAppGetInitialProps = App.getInitialProps === App.origGetInitialProps;
    const hasPageGetInitialProps = !!(Component == null ? void 0 : Component.getInitialProps);
    const hasPageScripts = Component == null ? void 0 : Component.unstable_scriptLoader;
    const pageIsDynamic = isDynamicRoute(pathname);
    const defaultErrorGetInitialProps = pathname === '/_error' && Component.getInitialProps === Component.origGetInitialProps;
    if (renderOpts.nextExport && hasPageGetInitialProps && !defaultErrorGetInitialProps) {
        warn(`Detected getInitialProps on page '${pathname}'` + ` while running export. It's recommended to use getStaticProps` + ` which has a more correct behavior for static exporting.` + `\nRead more: https://nextjs.org/docs/messages/get-initial-props-export`);
    }
    let isAutoExport = !hasPageGetInitialProps && defaultAppGetInitialProps && !isSSG && !getServerSideProps;
    // if we are running from experimental compile and the page
    // would normally be automatically statically optimized
    // ensure we set cache header so it's not rendered on-demand
    // every request
    if (isAutoExport && !dev && isExperimentalCompile) {
        res.setHeader('Cache-Control', getCacheControlHeader({
            revalidate: false,
            expire: expireTime
        }));
        isAutoExport = false;
    }
    if (hasPageGetInitialProps && isSSG) {
        throw Object.defineProperty(new Error(SSG_GET_INITIAL_PROPS_CONFLICT + ` ${pathname}`), "__NEXT_ERROR_CODE", {
            value: "E262",
            enumerable: false,
            configurable: true
        });
    }
    if (hasPageGetInitialProps && getServerSideProps) {
        throw Object.defineProperty(new Error(SERVER_PROPS_GET_INIT_PROPS_CONFLICT + ` ${pathname}`), "__NEXT_ERROR_CODE", {
            value: "E262",
            enumerable: false,
            configurable: true
        });
    }
    if (getServerSideProps && isSSG) {
        throw Object.defineProperty(new Error(SERVER_PROPS_SSG_CONFLICT + ` ${pathname}`), "__NEXT_ERROR_CODE", {
            value: "E262",
            enumerable: false,
            configurable: true
        });
    }
    if (getServerSideProps && renderOpts.nextConfigOutput === 'export') {
        throw Object.defineProperty(new Error('getServerSideProps cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export'), "__NEXT_ERROR_CODE", {
            value: "E369",
            enumerable: false,
            configurable: true
        });
    }
    if (getStaticPaths && !pageIsDynamic) {
        throw Object.defineProperty(new Error(`getStaticPaths is only allowed for dynamic SSG pages and was found on '${pathname}'.` + `\nRead more: https://nextjs.org/docs/messages/non-dynamic-getstaticpaths-usage`), "__NEXT_ERROR_CODE", {
            value: "E187",
            enumerable: false,
            configurable: true
        });
    }
    if (!!getStaticPaths && !isSSG) {
        throw Object.defineProperty(new Error(`getStaticPaths was added without a getStaticProps in ${pathname}. Without getStaticProps, getStaticPaths does nothing`), "__NEXT_ERROR_CODE", {
            value: "E447",
            enumerable: false,
            configurable: true
        });
    }
    if (isSSG && pageIsDynamic && !getStaticPaths) {
        throw Object.defineProperty(new Error(`getStaticPaths is required for dynamic SSG pages and is missing for '${pathname}'.` + `\nRead more: https://nextjs.org/docs/messages/invalid-getstaticpaths-value`), "__NEXT_ERROR_CODE", {
            value: "E255",
            enumerable: false,
            configurable: true
        });
    }
    let asPath = renderOpts.resolvedAsPath || req.url;
    if (dev) {
        const { isValidElementType } = require('next/dist/compiled/react-is');
        if (!isValidElementType(Component)) {
            throw Object.defineProperty(new Error(`The default export is not a React Component in page: "${pathname}"`), "__NEXT_ERROR_CODE", {
                value: "E286",
                enumerable: false,
                configurable: true
            });
        }
        if (!isValidElementType(App)) {
            throw Object.defineProperty(new Error(`The default export is not a React Component in page: "/_app"`), "__NEXT_ERROR_CODE", {
                value: "E464",
                enumerable: false,
                configurable: true
            });
        }
        if (!isValidElementType(Document)) {
            throw Object.defineProperty(new Error(`The default export is not a React Component in page: "/_document"`), "__NEXT_ERROR_CODE", {
                value: "E511",
                enumerable: false,
                configurable: true
            });
        }
        if (isAutoExport || isFallback) {
            // remove query values except ones that will be set during export
            query = {
                ...query.amp ? {
                    amp: query.amp
                } : {}
            };
            asPath = `${pathname}${// ensure trailing slash is present for non-dynamic auto-export pages
            req.url.endsWith('/') && pathname !== '/' && !pageIsDynamic ? '/' : ''}`;
            req.url = pathname;
        }
        if (pathname === '/404' && (hasPageGetInitialProps || getServerSideProps)) {
            throw Object.defineProperty(new Error(`\`pages/404\` ${STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR}`), "__NEXT_ERROR_CODE", {
                value: "E134",
                enumerable: false,
                configurable: true
            });
        }
        if (STATIC_STATUS_PAGES.includes(pathname) && (hasPageGetInitialProps || getServerSideProps)) {
            throw Object.defineProperty(new Error(`\`pages${pathname}\` ${STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR}`), "__NEXT_ERROR_CODE", {
                value: "E125",
                enumerable: false,
                configurable: true
            });
        }
        if (renderOpts == null ? void 0 : renderOpts.setIsrStatus) {
            renderOpts.setIsrStatus(asPath, isSSG || isAutoExport ? true : null);
        }
    }
    for (const methodName of [
        'getStaticProps',
        'getServerSideProps',
        'getStaticPaths'
    ]){
        if (Component == null ? void 0 : Component[methodName]) {
            throw Object.defineProperty(new Error(`page ${pathname} ${methodName} ${GSSP_COMPONENT_MEMBER_ERROR}`), "__NEXT_ERROR_CODE", {
                value: "E417",
                enumerable: false,
                configurable: true
            });
        }
    }
    await Loadable.preloadAll() // Make sure all dynamic imports are loaded
    ;
    let isPreview = undefined;
    let previewData;
    if ((isSSG || getServerSideProps) && !isFallback && process.env.NEXT_RUNTIME !== 'edge' && previewProps) {
        // Reads of this are cached on the `req` object, so this should resolve
        // instantly. There's no need to pass this data down from a previous
        // invoke.
        previewData = tryGetPreviewData(req, res, previewProps, !!renderOpts.multiZoneDraftMode);
        isPreview = previewData !== false;
    }
    // url will always be set
    const routerIsReady = !!(getServerSideProps || hasPageGetInitialProps || !defaultAppGetInitialProps && !isSSG || isExperimentalCompile);
    const router = new ServerRouter(pathname, query, asPath, {
        isFallback: isFallback
    }, routerIsReady, basePath, renderOpts.locale, renderOpts.locales, renderOpts.defaultLocale, renderOpts.domainLocales, isPreview, getRequestMeta(req, 'isLocaleDomain'));
    const appRouter = adaptForAppRouterInstance(router);
    let scriptLoader = {};
    const jsxStyleRegistry = createStyleRegistry();
    const ampState = {
        ampFirst: pageConfig.amp === true,
        hasQuery: Boolean(query.amp),
        hybrid: pageConfig.amp === 'hybrid'
    };
    // Disable AMP under the web environment
    const inAmpMode = process.env.NEXT_RUNTIME !== 'edge' && isInAmpMode(ampState);
    let head = defaultHead(inAmpMode);
    const reactLoadableModules = [];
    let initialScripts = {};
    if (hasPageScripts) {
        initialScripts.beforeInteractive = [].concat(hasPageScripts()).filter((script)=>script.props.strategy === 'beforeInteractive').map((script)=>script.props);
    }
    const AppContainer = ({ children })=>/*#__PURE__*/ _jsx(AppRouterContext.Provider, {
            value: appRouter,
            children: /*#__PURE__*/ _jsx(SearchParamsContext.Provider, {
                value: adaptForSearchParams(router),
                children: /*#__PURE__*/ _jsx(PathnameContextProviderAdapter, {
                    router: router,
                    isAutoExport: isAutoExport,
                    children: /*#__PURE__*/ _jsx(PathParamsContext.Provider, {
                        value: adaptForPathParams(router),
                        children: /*#__PURE__*/ _jsx(RouterContext.Provider, {
                            value: router,
                            children: /*#__PURE__*/ _jsx(AmpStateContext.Provider, {
                                value: ampState,
                                children: /*#__PURE__*/ _jsx(HeadManagerContext.Provider, {
                                    value: {
                                        updateHead: (state)=>{
                                            head = state;
                                        },
                                        updateScripts: (scripts)=>{
                                            scriptLoader = scripts;
                                        },
                                        scripts: initialScripts,
                                        mountedInstances: new Set()
                                    },
                                    children: /*#__PURE__*/ _jsx(LoadableContext.Provider, {
                                        value: (moduleName)=>reactLoadableModules.push(moduleName),
                                        children: /*#__PURE__*/ _jsx(StyleRegistry, {
                                            registry: jsxStyleRegistry,
                                            children: /*#__PURE__*/ _jsx(ImageConfigContext.Provider, {
                                                value: images,
                                                children: children
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
    // The `useId` API uses the path indexes to generate an ID for each node.
    // To guarantee the match of hydration, we need to ensure that the structure
    // of wrapper nodes is isomorphic in server and client.
    // TODO: With `enhanceApp` and `enhanceComponents` options, this approach may
    // not be useful.
    // https://github.com/facebook/react/pull/22644
    const Noop = ()=>null;
    const AppContainerWithIsomorphicFiberStructure = ({ children })=>{
        return /*#__PURE__*/ _jsxs(_Fragment, {
            children: [
                /*#__PURE__*/ _jsx(Noop, {}),
                /*#__PURE__*/ _jsx(AppContainer, {
                    children: /*#__PURE__*/ _jsxs(_Fragment, {
                        children: [
                            dev ? /*#__PURE__*/ _jsxs(_Fragment, {
                                children: [
                                    children,
                                    /*#__PURE__*/ _jsx(Noop, {})
                                ]
                            }) : children,
                            /*#__PURE__*/ _jsx(Noop, {})
                        ]
                    })
                })
            ]
        });
    };
    const ctx = {
        err,
        req: isAutoExport ? undefined : req,
        res: isAutoExport ? undefined : res,
        pathname,
        query,
        asPath,
        locale: renderOpts.locale,
        locales: renderOpts.locales,
        defaultLocale: renderOpts.defaultLocale,
        AppTree: (props)=>{
            return /*#__PURE__*/ _jsx(AppContainerWithIsomorphicFiberStructure, {
                children: renderPageTree(App, OriginComponent, {
                    ...props,
                    router
                })
            });
        },
        defaultGetInitialProps: async (docCtx, options = {})=>{
            const enhanceApp = (AppComp)=>{
                return (props)=>/*#__PURE__*/ _jsx(AppComp, {
                        ...props
                    });
            };
            const { html, head: renderPageHead } = await docCtx.renderPage({
                enhanceApp
            });
            const styles = jsxStyleRegistry.styles({
                nonce: options.nonce
            });
            jsxStyleRegistry.flush();
            return {
                html,
                head: renderPageHead,
                styles
            };
        }
    };
    let props;
    const nextExport = !isSSG && (renderOpts.nextExport || dev && (isAutoExport || isFallback));
    const styledJsxInsertedHTML = ()=>{
        const styles = jsxStyleRegistry.styles();
        jsxStyleRegistry.flush();
        return /*#__PURE__*/ _jsx(_Fragment, {
            children: styles
        });
    };
    props = await loadGetInitialProps(App, {
        AppTree: ctx.AppTree,
        Component,
        router,
        ctx
    });
    if ((isSSG || getServerSideProps) && isPreview) {
        props.__N_PREVIEW = true;
    }
    if (isSSG) {
        props[STATIC_PROPS_ID] = true;
    }
    if (isSSG && !isFallback) {
        let data;
        try {
            data = await getTracer().trace(RenderSpan.getStaticProps, {
                spanName: `getStaticProps ${pathname}`,
                attributes: {
                    'next.route': pathname
                }
            }, ()=>getStaticProps({
                    ...pageIsDynamic ? {
                        params
                    } : undefined,
                    ...isPreview ? {
                        draftMode: true,
                        preview: true,
                        previewData: previewData
                    } : undefined,
                    locales: [
                        ...renderOpts.locales ?? []
                    ],
                    locale: renderOpts.locale,
                    defaultLocale: renderOpts.defaultLocale,
                    revalidateReason: renderOpts.isOnDemandRevalidate ? 'on-demand' : isBuildTimeSSG ? 'build' : 'stale'
                }));
        } catch (staticPropsError) {
            // remove not found error code to prevent triggering legacy
            // 404 rendering
            if (staticPropsError && staticPropsError.code === 'ENOENT') {
                delete staticPropsError.code;
            }
            throw staticPropsError;
        }
        if (data == null) {
            throw Object.defineProperty(new Error(GSP_NO_RETURNED_VALUE), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        const invalidKeys = Object.keys(data).filter((key)=>key !== 'revalidate' && key !== 'props' && key !== 'redirect' && key !== 'notFound');
        if (invalidKeys.includes('unstable_revalidate')) {
            throw Object.defineProperty(new Error(UNSTABLE_REVALIDATE_RENAME_ERROR), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        if (invalidKeys.length) {
            throw Object.defineProperty(new Error(invalidKeysMsg('getStaticProps', invalidKeys)), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        if (process.env.NODE_ENV !== 'production') {
            if (typeof data.notFound !== 'undefined' && typeof data.redirect !== 'undefined') {
                throw Object.defineProperty(new Error(`\`redirect\` and \`notFound\` can not both be returned from ${isSSG ? 'getStaticProps' : 'getServerSideProps'} at the same time. Page: ${pathname}\nSee more info here: https://nextjs.org/docs/messages/gssp-mixed-not-found-redirect`), "__NEXT_ERROR_CODE", {
                    value: "E454",
                    enumerable: false,
                    configurable: true
                });
            }
        }
        if ('notFound' in data && data.notFound) {
            if (pathname === '/404') {
                throw Object.defineProperty(new Error(`The /404 page can not return notFound in "getStaticProps", please remove it to continue!`), "__NEXT_ERROR_CODE", {
                    value: "E121",
                    enumerable: false,
                    configurable: true
                });
            }
            metadata.isNotFound = true;
        }
        if ('redirect' in data && data.redirect && typeof data.redirect === 'object') {
            checkRedirectValues(data.redirect, req, 'getStaticProps');
            if (isBuildTimeSSG) {
                throw Object.defineProperty(new Error(`\`redirect\` can not be returned from getStaticProps during prerendering (${req.url})\n` + `See more info here: https://nextjs.org/docs/messages/gsp-redirect-during-prerender`), "__NEXT_ERROR_CODE", {
                    value: "E497",
                    enumerable: false,
                    configurable: true
                });
            }
            ;
            data.props = {
                __N_REDIRECT: data.redirect.destination,
                __N_REDIRECT_STATUS: getRedirectStatus(data.redirect)
            };
            if (typeof data.redirect.basePath !== 'undefined') {
                ;
                data.props.__N_REDIRECT_BASE_PATH = data.redirect.basePath;
            }
            metadata.isRedirect = true;
        }
        if ((dev || isBuildTimeSSG) && !metadata.isNotFound && !isSerializableProps(pathname, 'getStaticProps', data.props)) {
            // this fn should throw an error instead of ever returning `false`
            throw Object.defineProperty(new Error('invariant: getStaticProps did not return valid props. Please report this.'), "__NEXT_ERROR_CODE", {
                value: "E129",
                enumerable: false,
                configurable: true
            });
        }
        let revalidate;
        if ('revalidate' in data) {
            if (data.revalidate && renderOpts.nextConfigOutput === 'export') {
                throw Object.defineProperty(new Error('ISR cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export'), "__NEXT_ERROR_CODE", {
                    value: "E201",
                    enumerable: false,
                    configurable: true
                });
            }
            if (typeof data.revalidate === 'number') {
                if (!Number.isInteger(data.revalidate)) {
                    throw Object.defineProperty(new Error(`A page's revalidate option must be seconds expressed as a natural number for ${req.url}. Mixed numbers, such as '${data.revalidate}', cannot be used.` + `\nTry changing the value to '${Math.ceil(data.revalidate)}' or using \`Math.ceil()\` if you're computing the value.`), "__NEXT_ERROR_CODE", {
                        value: "E438",
                        enumerable: false,
                        configurable: true
                    });
                } else if (data.revalidate <= 0) {
                    throw Object.defineProperty(new Error(`A page's revalidate option can not be less than or equal to zero for ${req.url}. A revalidate option of zero means to revalidate after _every_ request, and implies stale data cannot be tolerated.` + `\n\nTo never revalidate, you can set revalidate to \`false\` (only ran once at build-time).` + `\nTo revalidate as soon as possible, you can set the value to \`1\`.`), "__NEXT_ERROR_CODE", {
                        value: "E311",
                        enumerable: false,
                        configurable: true
                    });
                } else {
                    if (data.revalidate > 31536000) {
                        // if it's greater than a year for some reason error
                        console.warn(`Warning: A page's revalidate option was set to more than a year for ${req.url}. This may have been done in error.` + `\nTo only run getStaticProps at build-time and not revalidate at runtime, you can set \`revalidate\` to \`false\`!`);
                    }
                    revalidate = data.revalidate;
                }
            } else if (data.revalidate === true) {
                // When enabled, revalidate after 1 second. This value is optimal for
                // the most up-to-date page possible, but without a 1-to-1
                // request-refresh ratio.
                revalidate = 1;
            } else if (data.revalidate === false || typeof data.revalidate === 'undefined') {
                // By default, we never revalidate.
                revalidate = false;
            } else {
                throw Object.defineProperty(new Error(`A page's revalidate option must be seconds expressed as a natural number. Mixed numbers and strings cannot be used. Received '${JSON.stringify(data.revalidate)}' for ${req.url}`), "__NEXT_ERROR_CODE", {
                    value: "E161",
                    enumerable: false,
                    configurable: true
                });
            }
        } else {
            // By default, we never revalidate.
            revalidate = false;
        }
        props.pageProps = Object.assign({}, props.pageProps, 'props' in data ? data.props : undefined);
        // pass up cache control and props for export
        metadata.cacheControl = {
            revalidate,
            expire: undefined
        };
        metadata.pageData = props;
        // this must come after revalidate is added to renderResultMeta
        if (metadata.isNotFound) {
            return new RenderResult(null, {
                metadata
            });
        }
    }
    if (getServerSideProps) {
        props[SERVER_PROPS_ID] = true;
    }
    if (getServerSideProps && !isFallback) {
        let data;
        let canAccessRes = true;
        let resOrProxy = res;
        let deferredContent = false;
        if (process.env.NODE_ENV !== 'production') {
            resOrProxy = new Proxy(res, {
                get: function(obj, prop) {
                    if (!canAccessRes) {
                        const message = `You should not access 'res' after getServerSideProps resolves.` + `\nRead more: https://nextjs.org/docs/messages/gssp-no-mutating-res`;
                        if (deferredContent) {
                            throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
                                value: "E394",
                                enumerable: false,
                                configurable: true
                            });
                        } else {
                            warn(message);
                        }
                    }
                    if (typeof prop === 'symbol') {
                        return ReflectAdapter.get(obj, prop, res);
                    }
                    return ReflectAdapter.get(obj, prop, res);
                }
            });
        }
        try {
            data = await getTracer().trace(RenderSpan.getServerSideProps, {
                spanName: `getServerSideProps ${pathname}`,
                attributes: {
                    'next.route': pathname
                }
            }, async ()=>getServerSideProps({
                    req: req,
                    res: resOrProxy,
                    query,
                    resolvedUrl: renderOpts.resolvedUrl,
                    ...pageIsDynamic ? {
                        params
                    } : undefined,
                    ...previewData !== false ? {
                        draftMode: true,
                        preview: true,
                        previewData: previewData
                    } : undefined,
                    // We create a copy here to avoid having the types of
                    // `getServerSideProps` change. This ensures that users can't
                    // mutate this array and have it poison the reference.
                    locales: [
                        ...renderOpts.locales ?? []
                    ],
                    locale: renderOpts.locale,
                    defaultLocale: renderOpts.defaultLocale
                }));
            canAccessRes = false;
            metadata.cacheControl = {
                revalidate: 0,
                expire: undefined
            };
        } catch (serverSidePropsError) {
            // remove not found error code to prevent triggering legacy
            // 404 rendering
            if (isError(serverSidePropsError) && serverSidePropsError.code === 'ENOENT') {
                delete serverSidePropsError.code;
            }
            throw serverSidePropsError;
        }
        if (data == null) {
            throw Object.defineProperty(new Error(GSSP_NO_RETURNED_VALUE), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        if (data.props instanceof Promise) {
            deferredContent = true;
        }
        const invalidKeys = Object.keys(data).filter((key)=>key !== 'props' && key !== 'redirect' && key !== 'notFound');
        if (data.unstable_notFound) {
            throw Object.defineProperty(new Error(`unstable_notFound has been renamed to notFound, please update the field to continue. Page: ${pathname}`), "__NEXT_ERROR_CODE", {
                value: "E516",
                enumerable: false,
                configurable: true
            });
        }
        if (data.unstable_redirect) {
            throw Object.defineProperty(new Error(`unstable_redirect has been renamed to redirect, please update the field to continue. Page: ${pathname}`), "__NEXT_ERROR_CODE", {
                value: "E284",
                enumerable: false,
                configurable: true
            });
        }
        if (invalidKeys.length) {
            throw Object.defineProperty(new Error(invalidKeysMsg('getServerSideProps', invalidKeys)), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        if ('notFound' in data && data.notFound) {
            if (pathname === '/404') {
                throw Object.defineProperty(new Error(`The /404 page can not return notFound in "getStaticProps", please remove it to continue!`), "__NEXT_ERROR_CODE", {
                    value: "E121",
                    enumerable: false,
                    configurable: true
                });
            }
            metadata.isNotFound = true;
            return new RenderResult(null, {
                metadata
            });
        }
        if ('redirect' in data && typeof data.redirect === 'object') {
            checkRedirectValues(data.redirect, req, 'getServerSideProps');
            data.props = {
                __N_REDIRECT: data.redirect.destination,
                __N_REDIRECT_STATUS: getRedirectStatus(data.redirect)
            };
            if (typeof data.redirect.basePath !== 'undefined') {
                ;
                data.props.__N_REDIRECT_BASE_PATH = data.redirect.basePath;
            }
            metadata.isRedirect = true;
        }
        if (deferredContent) {
            ;
            data.props = await data.props;
        }
        if ((dev || isBuildTimeSSG) && !isSerializableProps(pathname, 'getServerSideProps', data.props)) {
            // this fn should throw an error instead of ever returning `false`
            throw Object.defineProperty(new Error('invariant: getServerSideProps did not return valid props. Please report this.'), "__NEXT_ERROR_CODE", {
                value: "E31",
                enumerable: false,
                configurable: true
            });
        }
        props.pageProps = Object.assign({}, props.pageProps, data.props);
        metadata.pageData = props;
    }
    if (!isSSG && // we only show this warning for legacy pages
    !getServerSideProps && process.env.NODE_ENV !== 'production' && Object.keys((props == null ? void 0 : props.pageProps) || {}).includes('url')) {
        console.warn(`The prop \`url\` is a reserved prop in Next.js for legacy reasons and will be overridden on page ${pathname}\n` + `See more info here: https://nextjs.org/docs/messages/reserved-page-prop`);
    }
    // Avoid rendering page un-necessarily for getServerSideProps data request
    // and getServerSideProps/getStaticProps redirects
    if (isNextDataRequest && !isSSG || metadata.isRedirect) {
        return new RenderResult(JSON.stringify(props), {
            metadata
        });
    }
    // We don't call getStaticProps or getServerSideProps while generating
    // the fallback so make sure to set pageProps to an empty object
    if (isFallback) {
        props.pageProps = {};
    }
    // the response might be finished on the getInitialProps call
    if (isResSent(res) && !isSSG) return new RenderResult(null, {
        metadata
    });
    // we preload the buildManifest for auto-export dynamic pages
    // to speed up hydrating query values
    let filteredBuildManifest = buildManifest;
    if (isAutoExport && pageIsDynamic) {
        const page = denormalizePagePath(normalizePagePath(pathname));
        // This code would be much cleaner using `immer` and directly pushing into
        // the result from `getPageFiles`, we could maybe consider that in the
        // future.
        if (page in filteredBuildManifest.pages) {
            filteredBuildManifest = {
                ...filteredBuildManifest,
                pages: {
                    ...filteredBuildManifest.pages,
                    [page]: [
                        ...filteredBuildManifest.pages[page],
                        ...filteredBuildManifest.lowPriorityFiles.filter((f)=>f.includes('_buildManifest'))
                    ]
                },
                lowPriorityFiles: filteredBuildManifest.lowPriorityFiles.filter((f)=>!f.includes('_buildManifest'))
            };
        }
    }
    const Body = ({ children })=>{
        return inAmpMode ? children : /*#__PURE__*/ _jsx("div", {
            id: "__next",
            children: children
        });
    };
    const renderDocument = async ()=>{
        // For `Document`, there are two cases that we don't support:
        // 1. Using `Document.getInitialProps` in the Edge runtime.
        // 2. Using the class component `Document` with concurrent features.
        const BuiltinFunctionalDocument = Document[NEXT_BUILTIN_DOCUMENT];
        if (process.env.NEXT_RUNTIME === 'edge' && Document.getInitialProps) {
            // In the Edge runtime, `Document.getInitialProps` isn't supported.
            // We throw an error here if it's customized.
            if (BuiltinFunctionalDocument) {
                Document = BuiltinFunctionalDocument;
            } else {
                throw Object.defineProperty(new Error('`getInitialProps` in Document component is not supported with the Edge Runtime.'), "__NEXT_ERROR_CODE", {
                    value: "E386",
                    enumerable: false,
                    configurable: true
                });
            }
        }
        async function loadDocumentInitialProps(renderShell) {
            const renderPage = async (options = {})=>{
                if (ctx.err && ErrorDebug) {
                    // Always start rendering the shell even if there's an error.
                    if (renderShell) {
                        renderShell(App, Component);
                    }
                    const html = await renderToString(/*#__PURE__*/ _jsx(Body, {
                        children: /*#__PURE__*/ _jsx(ErrorDebug, {})
                    }));
                    return {
                        html,
                        head
                    };
                }
                if (dev && (props.router || props.Component)) {
                    throw Object.defineProperty(new Error(`'router' and 'Component' can not be returned in getInitialProps from _app.js https://nextjs.org/docs/messages/cant-override-next-props`), "__NEXT_ERROR_CODE", {
                        value: "E230",
                        enumerable: false,
                        configurable: true
                    });
                }
                const { App: EnhancedApp, Component: EnhancedComponent } = enhanceComponents(options, App, Component);
                const stream = await renderShell(EnhancedApp, EnhancedComponent);
                await stream.allReady;
                const html = await streamToString(stream);
                return {
                    html,
                    head
                };
            };
            const documentCtx = {
                ...ctx,
                renderPage
            };
            const docProps = await loadGetInitialProps(Document, documentCtx);
            // the response might be finished on the getInitialProps call
            if (isResSent(res) && !isSSG) return null;
            if (!docProps || typeof docProps.html !== 'string') {
                const message = `"${getDisplayName(Document)}.getInitialProps()" should resolve to an object with a "html" prop set with a valid html string`;
                throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
                    value: "E394",
                    enumerable: false,
                    configurable: true
                });
            }
            return {
                docProps,
                documentCtx
            };
        }
        const renderContent = (_App, _Component)=>{
            const EnhancedApp = _App || App;
            const EnhancedComponent = _Component || Component;
            return ctx.err && ErrorDebug ? /*#__PURE__*/ _jsx(Body, {
                children: /*#__PURE__*/ _jsx(ErrorDebug, {})
            }) : /*#__PURE__*/ _jsx(Body, {
                children: /*#__PURE__*/ _jsx(AppContainerWithIsomorphicFiberStructure, {
                    children: renderPageTree(EnhancedApp, EnhancedComponent, {
                        ...props,
                        router
                    })
                })
            });
        };
        // Always using react concurrent rendering mode with required react version 18.x
        const renderShell = async (EnhancedApp, EnhancedComponent)=>{
            const content = renderContent(EnhancedApp, EnhancedComponent);
            return await renderToInitialFizzStream({
                ReactDOMServer: ReactDOMServerPages,
                element: content
            });
        };
        const hasDocumentGetInitialProps = process.env.NEXT_RUNTIME !== 'edge' && !!Document.getInitialProps;
        // If it has getInitialProps, we will render the shell in `renderPage`.
        // Otherwise we do it right now.
        let documentInitialPropsRes;
        const [rawStyledJsxInsertedHTML, content] = await Promise.all([
            renderToString(styledJsxInsertedHTML()),
            (async ()=>{
                if (hasDocumentGetInitialProps) {
                    documentInitialPropsRes = await loadDocumentInitialProps(renderShell);
                    if (documentInitialPropsRes === null) return null;
                    const { docProps } = documentInitialPropsRes;
                    return docProps.html;
                } else {
                    documentInitialPropsRes = {};
                    const stream = await renderShell(App, Component);
                    await stream.allReady;
                    return streamToString(stream);
                }
            })()
        ]);
        if (content === null) {
            return null;
        }
        const contentHTML = rawStyledJsxInsertedHTML + content;
        // @ts-ignore: documentInitialPropsRes is set
        const { docProps } = documentInitialPropsRes || {};
        const documentElement = (htmlProps)=>{
            if (process.env.NEXT_RUNTIME === 'edge') {
                return Document();
            } else {
                return /*#__PURE__*/ _jsx(Document, {
                    ...htmlProps,
                    ...docProps
                });
            }
        };
        let styles;
        if (hasDocumentGetInitialProps) {
            styles = docProps.styles;
            head = docProps.head;
        } else {
            styles = jsxStyleRegistry.styles();
            jsxStyleRegistry.flush();
        }
        return {
            contentHTML,
            documentElement,
            head,
            headTags: [],
            styles
        };
    };
    getTracer().setRootSpanAttribute('next.route', renderOpts.page);
    const documentResult = await getTracer().trace(RenderSpan.renderDocument, {
        spanName: `render route (pages) ${renderOpts.page}`,
        attributes: {
            'next.route': renderOpts.page
        }
    }, async ()=>renderDocument());
    if (!documentResult) {
        return new RenderResult(null, {
            metadata
        });
    }
    const dynamicImportsIds = new Set();
    const dynamicImports = new Set();
    for (const mod of reactLoadableModules){
        const manifestItem = reactLoadableManifest[mod];
        if (manifestItem) {
            dynamicImportsIds.add(manifestItem.id);
            manifestItem.files.forEach((item)=>{
                dynamicImports.add(item);
            });
        }
    }
    const hybridAmp = ampState.hybrid;
    const docComponentsRendered = {};
    const { assetPrefix, defaultLocale, disableOptimizedLoading, domainLocales, locale, locales, runtimeConfig } = renderOpts;
    const htmlProps = {
        __NEXT_DATA__: {
            props,
            page: pathname,
            query,
            buildId: sharedContext.buildId,
            assetPrefix: assetPrefix === '' ? undefined : assetPrefix,
            runtimeConfig,
            nextExport: nextExport === true ? true : undefined,
            autoExport: isAutoExport === true ? true : undefined,
            isFallback,
            isExperimentalCompile,
            dynamicIds: dynamicImportsIds.size === 0 ? undefined : Array.from(dynamicImportsIds),
            err: renderOpts.err ? serializeError(dev, renderOpts.err) : undefined,
            gsp: !!getStaticProps ? true : undefined,
            gssp: !!getServerSideProps ? true : undefined,
            customServer: sharedContext.customServer,
            gip: hasPageGetInitialProps ? true : undefined,
            appGip: !defaultAppGetInitialProps ? true : undefined,
            locale,
            locales,
            defaultLocale,
            domainLocales,
            isPreview: isPreview === true ? true : undefined,
            notFoundSrcPage: notFoundSrcPage && dev ? notFoundSrcPage : undefined
        },
        strictNextHead: renderOpts.strictNextHead,
        buildManifest: filteredBuildManifest,
        docComponentsRendered,
        dangerousAsPath: router.asPath,
        canonicalBase: !renderOpts.ampPath && getRequestMeta(req, 'didStripLocale') ? `${renderOpts.canonicalBase || ''}/${renderOpts.locale}` : renderOpts.canonicalBase,
        ampPath,
        inAmpMode,
        isDevelopment: !!dev,
        hybridAmp,
        dynamicImports: Array.from(dynamicImports),
        dynamicCssManifest: new Set(renderOpts.dynamicCssManifest || []),
        assetPrefix,
        // Only enabled in production as development mode has features relying on HMR (style injection for example)
        unstable_runtimeJS: process.env.NODE_ENV === 'production' ? pageConfig.unstable_runtimeJS : undefined,
        unstable_JsPreload: pageConfig.unstable_JsPreload,
        assetQueryString,
        scriptLoader,
        locale,
        disableOptimizedLoading,
        head: documentResult.head,
        headTags: documentResult.headTags,
        styles: documentResult.styles,
        crossOrigin: renderOpts.crossOrigin,
        optimizeCss: renderOpts.optimizeCss,
        nextConfigOutput: renderOpts.nextConfigOutput,
        nextScriptWorkers: renderOpts.nextScriptWorkers,
        runtime: globalRuntime,
        largePageDataBytes: renderOpts.largePageDataBytes,
        nextFontManifest: renderOpts.nextFontManifest,
        experimentalClientTraceMetadata: renderOpts.experimental.clientTraceMetadata
    };
    const document = /*#__PURE__*/ _jsx(AmpStateContext.Provider, {
        value: ampState,
        children: /*#__PURE__*/ _jsx(HtmlContext.Provider, {
            value: htmlProps,
            children: documentResult.documentElement(htmlProps)
        })
    });
    const documentHTML = await getTracer().trace(RenderSpan.renderToString, async ()=>renderToString(document));
    if (process.env.NODE_ENV !== 'production') {
        const nonRenderedComponents = [];
        const expectedDocComponents = [
            'Main',
            'Head',
            'NextScript',
            'Html'
        ];
        for (const comp of expectedDocComponents){
            if (!docComponentsRendered[comp]) {
                nonRenderedComponents.push(comp);
            }
        }
        if (nonRenderedComponents.length) {
            const missingComponentList = nonRenderedComponents.map((e)=>`<${e} />`).join(', ');
            const plural = nonRenderedComponents.length !== 1 ? 's' : '';
            console.warn(`Your custom Document (pages/_document) did not render all the required subcomponent${plural}.\n` + `Missing component${plural}: ${missingComponentList}\n` + 'Read how to fix here: https://nextjs.org/docs/messages/missing-document-component');
        }
    }
    const [renderTargetPrefix, renderTargetSuffix] = documentHTML.split('<next-js-internal-body-render-target></next-js-internal-body-render-target>', 2);
    let prefix = '';
    if (!documentHTML.startsWith(DOCTYPE)) {
        prefix += DOCTYPE;
    }
    prefix += renderTargetPrefix;
    if (inAmpMode) {
        prefix += '<!-- __NEXT_DATA__ -->';
    }
    const content = prefix + documentResult.contentHTML + renderTargetSuffix;
    const optimizedHtml = await postProcessHTML(pathname, content, renderOpts, {
        inAmpMode,
        hybridAmp
    });
    return new RenderResult(optimizedHtml, {
        metadata
    });
}
export const renderToHTML = (req, res, pathname, query, renderOpts, sharedContext, renderContext)=>{
    return renderToHTMLImpl(req, res, pathname, query, renderOpts, renderOpts, sharedContext, renderContext);
};

//# sourceMappingURL=render.js.map