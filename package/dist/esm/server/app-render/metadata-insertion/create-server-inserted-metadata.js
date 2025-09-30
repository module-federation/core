import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { renderToReadableStream } from 'react-dom/server.edge';
import { ServerInsertedMetadataContext } from '../../../shared/lib/server-inserted-metadata.shared-runtime';
import { renderToString } from '../render-to-string';
/**
 * For chromium based browsers (Chrome, Edge, etc.) and Safari,
 * icons need to stay under <head> to be picked up by the browser.
 *
 */ const REINSERT_ICON_SCRIPT = `\
document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))`;
export function createServerInsertedMetadata(nonce) {
    let metadataResolver = null;
    let metadataToFlush = null;
    const setMetadataResolver = (resolver)=>{
        metadataResolver = resolver;
    };
    return {
        ServerInsertedMetadataProvider: ({ children })=>{
            return /*#__PURE__*/ _jsx(ServerInsertedMetadataContext.Provider, {
                value: setMetadataResolver,
                children: children
            });
        },
        async getServerInsertedMetadata () {
            if (!metadataResolver || metadataToFlush) {
                return '';
            }
            metadataToFlush = metadataResolver();
            const html = await renderToString({
                renderToReadableStream,
                element: /*#__PURE__*/ _jsxs(_Fragment, {
                    children: [
                        metadataToFlush,
                        /*#__PURE__*/ _jsx("script", {
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