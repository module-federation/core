import { getModuleBuildInfo } from '../get-module-build-info';
import { stringifyRequest } from '../../stringify-request';
import { WEBPACK_RESOURCE_QUERIES } from '../../../../lib/constants';
import { loadEntrypoint } from '../../../load-entrypoint';
import { isMetadataRoute } from '../../../../lib/metadata/is-metadata-route';
const EdgeAppRouteLoader = async function() {
    const { page, absolutePagePath, preferredRegion, appDirLoader: appDirLoaderBase64 = '', middlewareConfig: middlewareConfigBase64 = '', nextConfig: nextConfigBase64, cacheHandlers: cacheHandlersStringified } = this.getOptions();
    const appDirLoader = Buffer.from(appDirLoaderBase64, 'base64').toString();
    const middlewareConfig = JSON.parse(Buffer.from(middlewareConfigBase64, 'base64').toString());
    const cacheHandlers = JSON.parse(cacheHandlersStringified || '{}');
    if (!cacheHandlers.default) {
        cacheHandlers.default = require.resolve('../../../../server/lib/cache-handlers/default');
    }
    // Ensure we only run this loader for as a module.
    if (!this._module) throw Object.defineProperty(new Error('This loader is only usable as a module'), "__NEXT_ERROR_CODE", {
        value: "E433",
        enumerable: false,
        configurable: true
    });
    const buildInfo = getModuleBuildInfo(this._module);
    buildInfo.nextEdgeSSR = {
        isServerComponent: !isMetadataRoute(page),
        page: page,
        isAppDir: true
    };
    buildInfo.route = {
        page,
        absolutePagePath,
        preferredRegion,
        middlewareConfig
    };
    const stringifiedPagePath = stringifyRequest(this, absolutePagePath);
    const modulePath = `${appDirLoader}${stringifiedPagePath.substring(1, stringifiedPagePath.length - 1)}?${WEBPACK_RESOURCE_QUERIES.edgeSSREntry}`;
    const stringifiedConfig = Buffer.from(nextConfigBase64 || '', 'base64').toString();
    return await loadEntrypoint('edge-app-route', {
        VAR_USERLAND: modulePath,
        VAR_PAGE: page
    }, {
        nextConfig: stringifiedConfig
    });
};
export default EdgeAppRouteLoader;

//# sourceMappingURL=index.js.map