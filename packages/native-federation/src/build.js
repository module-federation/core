'use strict';
const build_adapter_1 = require('./lib/core/build-adapter');
const write_import_map_1 = require('./lib/core/write-import-map');
const write_federation_info_1 = require('./lib/core/write-federation-info');
const get_externals_1 = require('./lib/core/get-externals');
const load_federation_config_1 = require('./lib/core/load-federation-config');
const with_native_federation_1 = require('./lib/config/with-native-federation');
const build_for_federation_1 = require('./lib/core/build-for-federation');
const bundle_exposed_and_mappings_1 = require('./lib/core/bundle-exposed-and-mappings');
const share_utils_1 = require('./lib/config/share-utils');
const federation_builder_1 = require('./lib/core/federation-builder');
const logger_1 = require('./lib/utils/logger');
const hash_file_1 = require('./lib/utils/hash-file');
const tslib_1 = require('tslib');

module.exports = {
  setBuildAdapter: build_adapter_1.setBuildAdapter,
  writeImportMap: write_import_map_1.writeImportMap,
  writeFederationInfo: write_federation_info_1.writeFederationInfo,
  getExternals: get_externals_1.getExternals,
  loadFederationConfig: load_federation_config_1.loadFederationConfig,
  withNativeFederation: with_native_federation_1.withNativeFederation,
  buildForFederation: build_for_federation_1.buildForFederation,
  bundleExposedAndMappings:
    bundle_exposed_and_mappings_1.bundleExposedAndMappings,
  share: share_utils_1.share,
  shareAll: share_utils_1.shareAll,
  findRootTsConfigJson: share_utils_1.findRootTsConfigJson,
  federationBuilder: federation_builder_1.federationBuilder,
  logger: logger_1.logger,
  setLogLevel: logger_1.setLogLevel,
  hashFile: hash_file_1.hashFile,
};

tslib_1.__exportStar(require('./lib/utils/build-result-map'), exports);
//# sourceMappingURL=build.js.map
