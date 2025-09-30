import { renderToHTMLOrFlight } from '../../app-render/app-render';
import { RouteModule } from '../route-module';
import * as vendoredContexts from './vendored/contexts/entrypoints';
let vendoredReactRSC;
let vendoredReactSSR;
// the vendored Reacts are loaded from their original source in the edge runtime
if (process.env.NEXT_RUNTIME !== 'edge') {
    vendoredReactRSC = require('./vendored/rsc/entrypoints');
    vendoredReactSSR = require('./vendored/ssr/entrypoints');
}
export class AppPageRouteModule extends RouteModule {
    render(req, res, context) {
        return renderToHTMLOrFlight(req, res, context.page, context.query, context.fallbackRouteParams, context.renderOpts, context.serverComponentsHmrCache, false, context.sharedContext);
    }
    warmup(req, res, context) {
        return renderToHTMLOrFlight(req, res, context.page, context.query, context.fallbackRouteParams, context.renderOpts, context.serverComponentsHmrCache, true, context.sharedContext);
    }
}
const vendored = {
    'react-rsc': vendoredReactRSC,
    'react-ssr': vendoredReactSSR,
    contexts: vendoredContexts
};
export { renderToHTMLOrFlight, vendored };
export default AppPageRouteModule;

//# sourceMappingURL=module.js.map