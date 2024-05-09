'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.buildForFederation = exports.defaultBuildParams = void 0;
const tslib_1 = require('tslib');
const write_import_map_1 = require('./write-import-map');
const write_federation_info_1 = require('./write-federation-info');
const bundle_shared_1 = require('./bundle-shared');
const bundle_exposed_and_mappings_1 = require('./bundle-exposed-and-mappings');
exports.defaultBuildParams = {
  skipMappingsAndExposed: false,
};
function buildForFederation(
  config,
  fedOptions,
  externals,
  buildParams = exports.defaultBuildParams,
) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    let artefactInfo;
    if (!buildParams.skipMappingsAndExposed) {
      artefactInfo = yield (0,
      bundle_exposed_and_mappings_1.bundleExposedAndMappings)(
        config,
        fedOptions,
        externals,
      );
    }
    const exposedInfo = !artefactInfo
      ? (0, bundle_exposed_and_mappings_1.describeExposed)(config, fedOptions)
      : artefactInfo.exposes;
    const sharedPackageInfo = yield (0, bundle_shared_1.bundleShared)(
      config,
      fedOptions,
      externals,
    );
    const sharedMappingInfo = !artefactInfo
      ? (0, bundle_exposed_and_mappings_1.describeSharedMappings)(
          config,
          fedOptions,
        )
      : artefactInfo.mappings;
    const sharedInfo = [...sharedPackageInfo, ...sharedMappingInfo];
    const federationInfo = {
      name: config.name,
      shared: sharedInfo,
      exposes: exposedInfo,
    };
    (0, write_federation_info_1.writeFederationInfo)(
      federationInfo,
      fedOptions,
    );
    (0, write_import_map_1.writeImportMap)(sharedInfo, fedOptions);
    return federationInfo;
  });
}
exports.buildForFederation = buildForFederation;
//# sourceMappingURL=build-for-federation.js.map
