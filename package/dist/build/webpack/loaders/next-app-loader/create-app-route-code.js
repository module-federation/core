"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createAppRouteCode", {
    enumerable: true,
    get: function() {
        return createAppRouteCode;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _querystring = require("querystring");
const _constants = require("../../../../lib/constants");
const _ismetadataroute = require("../../../../lib/metadata/is-metadata-route");
const _appbundlepathnormalizer = require("../../../../server/normalizers/built/app/app-bundle-path-normalizer");
const _apppathnamenormalizer = require("../../../../server/normalizers/built/app/app-pathname-normalizer");
const _loadentrypoint = require("../../../load-entrypoint");
const _nextmetadatarouteloader = require("../next-metadata-route-loader");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function createAppRouteCode({ appDir, name, page, pagePath, resolveAppRoute, pageExtensions, nextConfigOutput }) {
    // routePath is the path to the route handler file,
    // but could be aliased e.g. private-next-app-dir/favicon.ico
    const routePath = pagePath.replace(/[\\/]/, '/');
    // This, when used with the resolver will give us the pathname to the built
    // route handler file.
    let resolvedPagePath = await resolveAppRoute(routePath);
    if (!resolvedPagePath) {
        throw Object.defineProperty(new Error(`Invariant: could not resolve page path for ${name} at ${routePath}`), "__NEXT_ERROR_CODE", {
            value: "E281",
            enumerable: false,
            configurable: true
        });
    }
    // If this is a metadata route file, then we need to use the metadata-loader
    // for the route to ensure that the route is generated.
    const fileBaseName = _path.default.parse(resolvedPagePath).name;
    const appDirRelativePath = resolvedPagePath.slice(appDir.length);
    const isMetadataEntryFile = (0, _ismetadataroute.isMetadataRouteFile)(appDirRelativePath, _ismetadataroute.DEFAULT_METADATA_ROUTE_EXTENSIONS, true);
    if (isMetadataEntryFile) {
        const { ext } = (0, _nextmetadatarouteloader.getFilenameAndExtension)(resolvedPagePath);
        const isDynamicRouteExtension = pageExtensions.includes(ext);
        resolvedPagePath = `next-metadata-route-loader?${(0, _querystring.stringify)({
            filePath: resolvedPagePath,
            isDynamicRouteExtension: isDynamicRouteExtension ? '1' : '0'
        })}!?${_constants.WEBPACK_RESOURCE_QUERIES.metadataRoute}`;
    }
    const pathname = new _apppathnamenormalizer.AppPathnameNormalizer().normalize(page);
    const bundlePath = new _appbundlepathnormalizer.AppBundlePathNormalizer().normalize(page);
    return await (0, _loadentrypoint.loadEntrypoint)('app-route', {
        VAR_USERLAND: resolvedPagePath,
        VAR_DEFINITION_PAGE: page,
        VAR_DEFINITION_PATHNAME: pathname,
        VAR_DEFINITION_FILENAME: fileBaseName,
        VAR_DEFINITION_BUNDLE_PATH: bundlePath,
        VAR_RESOLVED_PAGE_PATH: resolvedPagePath
    }, {
        nextConfigOutput: JSON.stringify(nextConfigOutput)
    });
}

//# sourceMappingURL=create-app-route-code.js.map