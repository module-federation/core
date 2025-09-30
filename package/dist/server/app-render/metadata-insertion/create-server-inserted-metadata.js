"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createServerInsertedMetadata", {
    enumerable: true,
    get: function() {
        return createServerInsertedMetadata;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _serveredge = require("react-dom/server.edge");
const _serverinsertedmetadatasharedruntime = require("../../../shared/lib/server-inserted-metadata.shared-runtime");
const _rendertostring = require("../render-to-string");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * For chromium based browsers (Chrome, Edge, etc.) and Safari,
 * icons need to stay under <head> to be picked up by the browser.
 *
 */ const REINSERT_ICON_SCRIPT = `\
document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))`;
function createServerInsertedMetadata(nonce) {
    let metadataResolver = null;
    let metadataToFlush = null;
    const setMetadataResolver = (resolver)=>{
        metadataResolver = resolver;
    };
    return {
        ServerInsertedMetadataProvider: ({ children })=>{
            return /*#__PURE__*/ (0, _jsxruntime.jsx)(_serverinsertedmetadatasharedruntime.ServerInsertedMetadataContext.Provider, {
                value: setMetadataResolver,
                children: children
            });
        },
        async getServerInsertedMetadata () {
            if (!metadataResolver || metadataToFlush) {
                return '';
            }
            metadataToFlush = metadataResolver();
            const html = await (0, _rendertostring.renderToString)({
                renderToReadableStream: _serveredge.renderToReadableStream,
                element: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                    children: [
                        metadataToFlush,
                        /*#__PURE__*/ (0, _jsxruntime.jsx)("script", {
                            nonce: nonce,
                            children: REINSERT_ICON_SCRIPT
                        })
                    ]
                })
            });
            return html;
        }
    };
}

//# sourceMappingURL=create-server-inserted-metadata.js.map