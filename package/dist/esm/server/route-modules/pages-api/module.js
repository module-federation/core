import { wrapApiHandler } from '../../api-utils';
import { RouteModule } from '../route-module';
import { apiResolver } from '../../api-utils/node/api-resolver';
export class PagesAPIRouteModule extends RouteModule {
    constructor(options){
        super(options);
        if (typeof options.userland.default !== 'function') {
            throw Object.defineProperty(new Error(`Page ${options.definition.page} does not export a default function.`), "__NEXT_ERROR_CODE", {
                value: "E379",
                enumerable: false,
                configurable: true
            });
        }
        this.apiResolverWrapped = wrapApiHandler(options.definition.page, apiResolver);
    }
    /**
   *
   * @param req the incoming server request
   * @param res the outgoing server response
   * @param context the context for the render
   */ async render(req, res, context) {
        const { apiResolverWrapped } = this;
        await apiResolverWrapped(req, res, context.query, this.userland, {
            ...context.previewProps,
            revalidate: context.revalidate,
            trustHostHeader: context.trustHostHeader,
            allowedRevalidateHeaderKeys: context.allowedRevalidateHeaderKeys,
            hostname: context.hostname,
            multiZoneDraftMode: context.multiZoneDraftMode,
            dev: context.dev
        }, context.minimalMode, context.dev, context.page, context.onError);
    }
}
export default PagesAPIRouteModule;

//# sourceMappingURL=module.js.map