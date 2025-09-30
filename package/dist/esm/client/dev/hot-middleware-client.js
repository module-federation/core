import connect from '../components/react-dev-overlay/pages/hot-reloader-client';
import { sendMessage } from '../components/react-dev-overlay/pages/websocket';
let reloading = false;
export default (()=>{
    const devClient = connect();
    devClient.subscribeToHmrEvent((obj)=>{
        var _window_next;
        if (reloading) return;
        // Retrieve the router if it's available
        const router = (_window_next = window.next) == null ? void 0 : _window_next.router;
        // Determine if we're on an error page or the router is not initialized
        const isOnErrorPage = !router || router.pathname === '/404' || router.pathname === '/_error';
        switch(obj.action){
            case 'reloadPage':
                {
                    sendMessage(JSON.stringify({
                        event: 'client-reload-page',
                        clientId: window.__nextDevClientId
                    }));
                    reloading = true;
                    return window.location.reload();
                }
            case 'removedPage':
                {
                    const [page] = obj.data;
                    // Check if the removed page is the current page
                    const isCurrentPage = page === (router == null ? void 0 : router.pathname);
                    // We enter here if the removed page is currently being viewed
                    // or if we happen to be on an error page.
                    if (isCurrentPage || isOnErrorPage) {
                        sendMessage(JSON.stringify({
                            event: 'client-removed-page',
                            clientId: window.__nextDevClientId,
                            page
                        }));
                        return window.location.reload();
                    }
                    return;
                }
            case 'addedPage':
                {
                    var _router_components;
                    const [page] = obj.data;
                    // Check if the added page is the current page
                    const isCurrentPage = page === (router == null ? void 0 : router.pathname);
                    // Check if the page component is not yet loaded
                    const isPageNotLoaded = typeof (router == null ? void 0 : (_router_components = router.components) == null ? void 0 : _router_components[page]) === 'undefined';
                    // We enter this block if the newly added page is the one currently being viewed
                    // but hasn't been loaded yet, or if we're on an error page.
                    if (isCurrentPage && isPageNotLoaded || isOnErrorPage) {
                        sendMessage(JSON.stringify({
                            event: 'client-added-page',
                            clientId: window.__nextDevClientId,
                            page
                        }));
                        return window.location.reload();
                    }
                    return;
                }
            case 'serverError':
            case 'devPagesManifestUpdate':
            case 'isrManifest':
            case 'building':
            case 'finishBuilding':
                {
                    return;
                }
            default:
                {
                    throw Object.defineProperty(new Error('Unexpected action ' + obj.action), "__NEXT_ERROR_CODE", {
                        value: "E59",
                        enumerable: false,
                        configurable: true
                    });
                }
        }
    });
    return devClient;
});

//# sourceMappingURL=hot-middleware-client.js.map