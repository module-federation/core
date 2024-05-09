import { setBuildAdapter } from './build-adapter';
import { buildForFederation, defaultBuildParams } from './build-for-federation';
import { getExternals } from './get-externals';
import { loadFederationConfig } from './load-federation-config';
import {
  useWorkspace,
  usePackageJson,
  getConfigContext,
} from '../config/configuration-context';

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
    getConfigContext()?.workspaceRoot ?? params.options.workspaceRoot;
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

export const federationBuilder = {
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
