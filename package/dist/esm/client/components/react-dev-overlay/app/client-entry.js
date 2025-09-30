import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { getSocketUrl } from '../utils/get-socket-url';
import { HMR_ACTIONS_SENT_TO_BROWSER } from '../../../../server/dev/hot-reloader-types';
import GlobalError from '../../error-boundary';
import { AppDevOverlayErrorBoundary } from './app-dev-overlay-error-boundary';
const noop = ()=>{};
// if an error is thrown while rendering an RSC stream, this will catch it in dev
// and show the error overlay
export function createRootLevelDevOverlayElement(reactEl) {
    const socketUrl = getSocketUrl(process.env.__NEXT_ASSET_PREFIX || '');
    const socket = new window.WebSocket("" + socketUrl + "/_next/webpack-hmr");
    // add minimal "hot reload" support for RSC errors
    const handler = (event)=>{
        let obj;
        try {
            obj = JSON.parse(event.data);
        } catch (e) {}
        if (!obj || !('action' in obj)) {
            return;
        }
        if (obj.action === HMR_ACTIONS_SENT_TO_BROWSER.SERVER_COMPONENT_CHANGES) {
            window.location.reload();
        }
    };
    socket.addEventListener('message', handler);
    return /*#__PURE__*/ _jsx(AppDevOverlayErrorBoundary, {
        globalError: [
            GlobalError,
            null
        ],
        onError: noop,
        children: reactEl
    });
}

//# sourceMappingURL=client-entry.js.map