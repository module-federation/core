const { writeImportMap } = require('./write-import-map');
const { writeFederationInfo } = require('./write-federation-info');
const { bundleShared } = require('./bundle-shared');
const {
  bundleExposedAndMappings,
  describeExposed,
  describeSharedMappings,
} = require('./bundle-exposed-and-mappings');

exports.defaultBuildParams = {
  skipMappingsAndExposed: false,
};

exports.buildForFederation = async function buildForFederation(
  config,
  fedOptions,
  externals,
  buildParams = exports.defaultBuildParams,
) {
  let artefactInfo;
  if (!buildParams.skipMappingsAndExposed) {
    artefactInfo = await bundleExposedAndMappings(
      config,
      fedOptions,
      externals,
    );
  }
  const exposedInfo = !artefactInfo
    ? describeExposed(config, fedOptions)
    : artefactInfo.exposes;
  const sharedPackageInfo = await bundleShared(config, fedOptions, externals);
  const sharedMappingInfo = !artefactInfo
    ? describeSharedMappings(config, fedOptions)
    : artefactInfo.mappings;
  const sharedInfo = [...sharedPackageInfo, ...sharedMappingInfo];
  const federationInfo = {
    name: config.name,
    shared: sharedInfo,
    exposes: exposedInfo,
  };
  writeFederationInfo(federationInfo, fedOptions);
  writeImportMap(sharedInfo, fedOptions);
  return federationInfo;
};
//# sourceMappingURL=build-for-federation.js.map
