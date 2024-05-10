const { setBuildAdapter } = require('./build-adapter');
const {
  buildForFederation,
  defaultBuildParams,
} = require('./build-for-federation');
const { getExternals } = require('./get-externals');
const { loadFederationConfig } = require('./load-federation-config');
const {
  useWorkspace,
  usePackageJson,
  getConfigContext,
} = require('../config/configuration-context');

let externals = [];
let config;
let fedOptions;
let fedInfo;

async function init(params) {
  setBuildAdapter(params.adapter);
  fedOptions = params.options;
  useWorkspace(params.options.workspaceRoot);
  usePackageJson(params.options.packageJson);
  config = await loadFederationConfig(fedOptions);
  params.options.workspaceRoot =
    getConfigContext().workspaceRoot ?? params.options.workspaceRoot;
  externals = getExternals(config);
}

async function build(buildParams = defaultBuildParams) {
  fedInfo = await buildForFederation(
    config,
    fedOptions,
    externals,
    buildParams,
  );
}

const federationBuilder = {
  init,
  build,
  get federationInfo() {
    return fedInfo;
  },
  get externals() {
    return externals;
  },
  get config() {
    return config;
  },
};

module.exports = { federationBuilder };
//# sourceMappingURL=federation-builder.js.map
