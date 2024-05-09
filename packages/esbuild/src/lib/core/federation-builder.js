'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.federationBuilder = void 0;
const tslib_1 = require('tslib');
const configuration_context_1 = require('../config/configuration-context');
const build_adapter_1 = require('./build-adapter');
const build_for_federation_1 = require('./build-for-federation');
const get_externals_1 = require('./get-externals');
const load_federation_config_1 = require('./load-federation-config');
let externals = [];
let config;
let fedOptions;
let fedInfo;
function init(params) {
  var _a;
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    (0, build_adapter_1.setBuildAdapter)(params.adapter);
    fedOptions = params.options;
    (0, configuration_context_1.useWorkspace)(params.options.workspaceRoot);
    (0, configuration_context_1.usePackageJson)(params.options.packageJson);
    config = yield (0, load_federation_config_1.loadFederationConfig)(
      fedOptions,
    );
    params.options.workspaceRoot =
      (_a = (0, configuration_context_1.getConfigContext)().workspaceRoot) !==
        null && _a !== void 0
        ? _a
        : params.options.workspaceRoot;
    externals = (0, get_externals_1.getExternals)(config);
  });
}
function build(buildParams = build_for_federation_1.defaultBuildParams) {
  return tslib_1.__awaiter(this, void 0, void 0, function* () {
    fedInfo = yield (0, build_for_federation_1.buildForFederation)(
      config,
      fedOptions,
      externals,
      buildParams,
    );
  });
}
exports.federationBuilder = {
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
//# sourceMappingURL=federation-builder.js.map
