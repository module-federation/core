"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "renderCssResource", {
    enumerable: true,
    get: function() {
        return renderCssResource;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _encodeuripath = require("../../shared/lib/encode-uri-path");
const _getassetquerystring = require("./get-asset-query-string");
function renderCssResource(entryCssFiles, ctx, preloadCallbacks) {
    return entryCssFiles.map((entryCssFile, index)=>{
        // `Precedence` is an opt-in signal for React to handle resource
        // loading and deduplication, etc. It's also used as the key to sort
        // resources so they will be injected in the correct order.
        // During HMR, it's critical to use different `precedence` values
        // for different stylesheets, so their order will be kept.
        // https://github.com/facebook/react/pull/25060
        const precedence = process.env.NODE_ENV === 'development' ? 'next_' + entryCssFile.path : 'next';
        // In dev, Safari and Firefox will cache the resource during HMR:
        // - https://github.com/vercel/next.js/issues/5860
        // - https://bugs.webkit.org/show_bug.cgi?id=187726
        // Because of this, we add a `?v=` query to bypass the cache during
        // development. We need to also make sure that the number is always
        // increasing.
        const fullHref = `${ctx.assetPrefix}/_next/${(0, _encodeuripath.encodeURIPath)(entryCssFile.path)}${(0, _getassetquerystring.getAssetQueryString)(ctx, true)}`;
        if (entryCssFile.inlined && !ctx.parsedRequestHeaders.isRSCRequest) {
            return /*#__PURE__*/ (0, _jsxruntime.jsx)("style", {
                nonce: ctx.nonce,
                // @ts-ignore
                precedence: precedence,
                href: fullHref,
                children: entryCssFile.content
            }, index);
        }
        preloadCallbacks == null ? void 0 : preloadCallbacks.push(()=>{
            ctx.componentMod.preloadStyle(fullHref, ctx.renderOpts.crossOrigin, ctx.nonce);
        });
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
            rel: "stylesheet",
            href: fullHref,
            // @ts-ignore
            precedence: precedence,
            crossOrigin: ctx.renderOpts.crossOrigin,
            nonce: ctx.nonce
        }, index);
    });
}

//# sourceMappingURL=render-css-resource.js.map