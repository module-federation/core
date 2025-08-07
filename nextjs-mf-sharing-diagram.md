# Next.js Module Federation Sharing Layers and Configuration

## Overview

This document provides a comprehensive mapping of the Next.js Module Federation sharing mechanism, focusing on layers, share scopes, and module configurations across Next.js 14 and 15. Next.js 15+ introduces a sophisticated layer-based sharing system that isolates different rendering contexts.

## Webpack Layers in Next.js 15+

| Layer Name | Constant | Purpose | Share Scope |
|------------|----------|---------|-------------|
| `shared` | WEBPACK_LAYERS.shared | Shared utilities | N/A |
| `rsc` | WEBPACK_LAYERS.reactServerComponents | React Server Components | `reactServerComponents` |
| `ssr` | WEBPACK_LAYERS.serverSideRendering | Server-side rendering | `serverSideRendering` |
| `action-browser` | WEBPACK_LAYERS.actionBrowser | Server actions browser | N/A |
| `api` | WEBPACK_LAYERS.api | API routes | N/A |
| `middleware` | WEBPACK_LAYERS.middleware | Middleware | N/A |
| `instrument` | WEBPACK_LAYERS.instrument | Instrumentation | N/A |
| `edge-asset` | WEBPACK_LAYERS.edgeAsset | Edge assets | N/A |
| `app-pages-browser` | WEBPACK_LAYERS_NAMES.appPagesBrowser | App directory client | `app-pages-browser` |
| `pages-dir-browser` | WEBPACK_LAYERS_NAMES.pagesDirBrowser | Pages directory client | `default` |
| `pages-dir-node` | WEBPACK_LAYERS_NAMES.pagesDirNode | Pages directory server | `default` |

## Share Scopes by Environment

| Environment | Next.js Version | Share Scope | Used By |
|-------------|----------------|-------------|---------|
| Client | 14 | `default` | All client modules |
| Server | 14 | `default` | All server modules (external) |
| Pages Dir Client | 15+ | `default` | pagesDirBrowser layer |
| Pages Dir Server | 15+ | `default` | pagesDirNode layer |
| App Dir Client | 15+ | `app-pages-browser` | appPagesBrowser layer |
| App Dir RSC | 15+ | `reactServerComponents` | rsc layer |
| App Dir SSR | 15+ | `serverSideRendering` | ssr layer |

## Complete Client-Side Module Sharing Comparison

| Module | Next.js 14 Client | Next.js 15 Pages Dir Client | Next.js 15 App Dir Client |
|--------|-------------------|------------------------------|---------------------------|
| **React Core** |
| react | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dist/compiled/react<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react/ | shareScope: default<br/>import: undefined | shareScope: default<br/>import: next/dist/compiled/react/<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser | shareScope: app-pages-browser<br/>import: next/dist/compiled/react/<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser |
| next/dist/compiled/react | Not shared | shareScope: default<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react-dom | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react-dom<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dist/compiled/react-dom<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react-dom/ | shareScope: default<br/>import: undefined | shareScope: default<br/>import: next/dist/compiled/react-dom/<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser | shareScope: app-pages-browser<br/>import: next/dist/compiled/react-dom/<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser |
| next/dist/compiled/react-dom | Not shared | shareScope: default<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dist/compiled/react-dom/ | Not shared | Not shared | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react-dom/client | shareScope: default<br/>import: undefined | shareScope: default<br/>import: next/dist/compiled/react-dom/client<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined | shareScope: app-pages-browser<br/>import: next/dist/compiled/react-dom/client<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser |
| next/dist/compiled/react-dom/client | Not shared | shareScope: default<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| **React JSX** |
| react/jsx-runtime | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react/jsx-runtime<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dist/compiled/react/jsx-runtime<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dist/compiled/react/jsx-runtime | Not shared | shareScope: default<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react/jsx-dev-runtime | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react/jsx-dev-runtime<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dist/compiled/react/jsx-dev-runtime<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dist/compiled/react/jsx-dev-runtime | Not shared | shareScope: default<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| **React Server Components** |
| react-server-dom-webpack/client | Not supported | Not used | shareScope: app-pages-browser<br/>import: next/dist/compiled/react-server-dom-webpack/client<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dist/compiled/react-server-dom-webpack/client | Not supported | Not used | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| react-refresh/runtime | Not supported | Not used | shareScope: app-pages-browser<br/>import: next/dist/compiled/react-refresh/runtime<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dist/compiled/react-refresh/runtime | Not supported | Not used | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| **Next.js Core** |
| next/router | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dist/client/router<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | Not available (use next/navigation) |
| next/compat/router | shareScope: default<br/>import: undefined | shareScope: default<br/>import: next/dist/client/compat/router<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | Not available |
| next/head | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/head<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | Not recommended (use metadata) |
| next/image | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/image<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/image<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/script | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/script<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/script<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/dynamic | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/dynamic<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser/undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dynamic<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true |
| next/link | shareScope: default<br/>import: undefined<br/>singleton: true | shareScope: default<br/>import: next/link<br/>layer: pagesDirBrowser<br/>issuerLayer: undefined<br/>singleton: true | shareScope: app-pages-browser<br/>import: next/dist/client/app-dir/link<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| next/dist/client/app-dir/link | Not shared | Not shared | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| next/dist/client/app-dir/link.js | Not shared | Not shared | shareScope: app-pages-browser<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| **Next.js Internals** |
| next/dist/shared/ | Not shared | shareScope: default<br/>import: next/dist/shared/<br/>layer: pagesDirBrowser<br/>issuerLayer: pagesDirBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true<br/>include: { request: /shared-runtime/ } | shareScope: app-pages-browser<br/>import: next/dist/shared/<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true<br/>include: { request: /shared-runtime/ } |
| next/dist/client/ | Not shared | Not shared | shareScope: app-pages-browser<br/>import: next/dist/client/<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true<br/>include: { request: /request\|bfcache\|head-manager\|use-action-queue/ } |
| next/dist/compiled/ | Not shared | Not shared | shareScope: app-pages-browser<br/>import: next/dist/compiled/<br/>layer: appPagesBrowser<br/>issuerLayer: appPagesBrowser<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |

## Complete Server-Side Module Sharing Comparison

| Module | Next.js 14 Server | Next.js 15 Pages Dir Server | Next.js 15 App Dir RSC | Next.js 15 App Dir SSR |
|--------|-------------------|------------------------------|------------------------|------------------------|
| **React Core** |
| react | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/rsc/react | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/ssr/react | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| react-dom | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react-dom<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react-dom<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react-dom<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/rsc/react-dom | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/ssr/react-dom | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| **React JSX** |
| react/jsx-runtime | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react/jsx-runtime<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react/jsx-runtime<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react/jsx-runtime<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| react/jsx-dev-runtime | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/dist/compiled/react/jsx-dev-runtime<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react/jsx-dev-runtime<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react/jsx-dev-runtime<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| **React Server Components** |
| react-server-dom-webpack/server.edge | Not supported | Not used | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack/server.edge<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| react-server-dom-webpack/server.node | Not supported | Not used | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack/server.node<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| react-server-dom-webpack/client.edge | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack/client.edge<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| react-server-dom-webpack/static.edge | Not supported | Not used | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack/static.edge<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-static-edge | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| react/compiler-runtime | Not supported | Not used | shareScope: reactServerComponents<br/>import: next/dist/server/route-modules/app-page/vendored/rsc/react/compiler-runtime<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/server/route-modules/app-page/vendored/ssr/react/compiler-runtime<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/rsc/react-compiler-runtime | Not supported | Not used | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | Not used |
| next/dist/server/route-modules/app-page/vendored/ssr/react-compiler-runtime | Not supported | Not used | Not used | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| **Next.js Core** |
| next/router | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/dist/client/router<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true<br/>nodeModulesReconstructedLookup: true | Not available | Not available |
| next/compat/router | Not shared | shareScope: default<br/>import: next/dist/client/compat/router<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true<br/>nodeModulesReconstructedLookup: true | Not available | Not available |
| next/head | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/head<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | Not available | Not available |
| next/document | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/document<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | Not available | Not available |
| next/app | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/app<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | Not available | Not available |
| next/server | shareScope: default<br/>import: false<br/>singleton: true | shareScope: default<br/>import: next/server<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/server<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/server<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/image | Not shared | shareScope: default<br/>import: next/image<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/image<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/image<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/script | Not shared | shareScope: default<br/>import: next/script<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/script<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/script<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dynamic | Not shared | shareScope: default<br/>import: next/dynamic<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode/undefined<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dynamic<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dynamic<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/link | Not shared | Not shared | shareScope: reactServerComponents<br/>import: next/dist/client/app-dir/link<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true<br/>nodeModulesReconstructedLookup: true | shareScope: serverSideRendering<br/>import: next/dist/client/app-dir/link<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| next/dist/client/app-dir/link | Not shared | Not shared | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true<br/>nodeModulesReconstructedLookup: true | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| next/dist/client/app-dir/link.js | Not shared | Not shared | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true<br/>nodeModulesReconstructedLookup: true | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true<br/>nodeModulesReconstructedLookup: true |
| **Next.js Internals** |
| next/dist/compiled/next-server/* | Not shared | shareScope: default<br/>import: next/dist/compiled/next-server/*<br/>layer: pagesDirNode<br/>issuerLayer: pagesDirNode<br/>singleton: true | shareScope: reactServerComponents<br/>import: next/dist/compiled/next-server/*<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>import: next/dist/compiled/next-server/*<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |
| next/dist/server/route-modules/app-page/vendored/contexts/ | Not shared | Not shared | shareScope: reactServerComponents<br/>layer: rsc<br/>issuerLayer: rsc<br/>singleton: true | shareScope: serverSideRendering<br/>layer: ssr<br/>issuerLayer: ssr<br/>singleton: true |

## Layer Mapping Between Next.js 14 and 15

| Next.js 14 Context | Next.js 14 ShareScope | Next.js 15 Layer | Next.js 15 ShareScope | Notes |
|-------------------|----------------------|------------------|----------------------|-------|
| Client (any) | default | pagesDirBrowser | default | Pages directory client-side |
| Client (any) | default | appPagesBrowser | app-pages-browser | App directory client-side |
| Server (any) | default | pagesDirNode | default | Pages directory server-side |
| Server (any) | default | rsc | reactServerComponents | React Server Components |
| Server (any) | default | ssr | serverSideRendering | Server-side rendering |
| N/A | N/A | shared | N/A | Shared utilities layer |
| N/A | N/A | api | N/A | API routes layer |
| N/A | N/A | middleware | N/A | Middleware layer |
| N/A | N/A | instrument | N/A | Instrumentation layer |
| N/A | N/A | edge-asset | N/A | Edge assets layer |
| N/A | N/A | action-browser | N/A | Server actions browser layer |

## Module Equivalency Mapping

| Next.js 14 Module | Next.js 15 Pages Dir | Next.js 15 App Dir | Migration Notes |
|-------------------|---------------------|-------------------|-----------------|
| react (client) | react with layer: pagesDirBrowser | react with layer: appPagesBrowser | Different share scopes |
| react (server) | react with layer: pagesDirNode | react with layer: rsc/ssr | Vendored versions in app dir |
| next/router | next/router | next/navigation | API change required |
| next/head | next/head | Metadata API | Complete API change |
| next/link | next/link | next/link (app variant) | Different import path |
| next/dynamic | next/dynamic | next/dynamic | Works in both |
| getServerSideProps | Supported | Not supported | Use server components |
| getStaticProps | Supported | Not supported | Use server components |
| _app.js | Supported | layout.js | Different file structure |
| _document.js | Supported | Not needed | Built-in to app dir |

## Key Configuration Examples

### Next.js 14 Client React Share
```javascript
{
  react: {
    shareScope: 'default',
    import: undefined,
    singleton: true
  }
}
```

### Next.js 15 App Dir Client React Share
```javascript
{
  request: 'react',
  singleton: true,
  shareKey: 'react',
  packageName: 'react',
  import: 'next/dist/compiled/react',
  layer: 'app-pages-browser',
  issuerLayer: 'app-pages-browser',
  shareScope: 'app-pages-browser',
  version: '18.2.0',
  requiredVersion: '^18.2.0'
}
```

### Next.js 15 RSC React Share
```javascript
{
  request: 'react',
  singleton: true,
  shareKey: 'react',
  import: 'next/dist/server/route-modules/app-page/vendored/rsc/react',
  layer: 'rsc',
  issuerLayer: 'rsc',
  shareScope: 'reactServerComponents',
  version: '18.2.0',
  requiredVersion: '^18.2.0'
}
```

## IssuerLayer Logic

The `issuerLayer` field determines which modules can import a shared module:

1. **Undefined issuerLayer**: Module can be imported from any layer (fallback behavior)
2. **Specific issuerLayer**: Module can only be imported from the specified layer
3. **Array issuerLayer**: Module can be imported from any of the specified layers

Example issuerLayer matching:
- `issuerLayer: 'appPagesBrowser'` - Only app directory client code can import
- `issuerLayer: undefined` - Any layer can import (unlayered)
- `issuerLayer: ['rsc', 'ssr']` - Only RSC or SSR layers can import

## Additional Server-Side Default Fallback Shares (Next.js 15+)

These shares exist in the default shareScope without layers, providing fallback behavior for server-side code:

| Module | shareScope | Notes |
|--------|------------|-------|
| react | default | Import: next/dist/compiled/react |
| react-dom | default | Import: next/dist/compiled/react-dom |
| react/jsx-runtime | default | Import: next/dist/compiled/react/jsx-runtime |
| react/jsx-dev-runtime | default | Import: next/dist/compiled/react/jsx-dev-runtime |
| react/compiler-runtime | default | Import: next/dist/compiled/react/compiler-runtime |
| react-server-dom-webpack/client.edge | default | Import: next/dist/compiled/react-server-dom-webpack/client.edge |
| react-server-dom-webpack/server.edge | default | Import: next/dist/compiled/react-server-dom-webpack/server.edge |
| react-server-dom-webpack/server.node | default | Import: next/dist/compiled/react-server-dom-webpack/server.node |
| react-server-dom-webpack/static.edge | default | Import: next/dist/compiled/react-server-dom-webpack/static.edge |

## Summary of Key Differences

### Next.js 14
- Single share scope: `default`
- Server modules are external (`import: false`)
- Client modules bundle everything (`import: undefined`)
- No layer isolation

### Next.js 15+
- Multiple share scopes: `default`, `app-pages-browser`, `reactServerComponents`, `serverSideRendering`
- All modules have explicit import paths
- Complete layer isolation between Pages and App directories
- Vendored React versions for different server contexts (RSC/SSR)
- IssuerLayer controls which code can import which modules
- Support for prefixed shares with `nodeModulesReconstructedLookup`
- Default fallback shares for server-side modules