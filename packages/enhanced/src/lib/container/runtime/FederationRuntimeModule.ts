import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
// inspired by react-refresh-webpack-plugin
import getFederationGlobal from './getFederationGlobal';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';

const { RuntimeModule, RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationRuntimeModule extends RuntimeModule {
  runtimeRequirements: Set<string>;
  containerName: string;
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared;

  constructor(
    runtimeRequirements: Set<string>,
    containerName: string,
    initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
  ) {
    super('federation runtime', RuntimeModule.STAGE_NORMAL - 1);
    this.runtimeRequirements = runtimeRequirements;
    this.containerName = containerName;
    this.initOptionsWithoutShared = initOptionsWithoutShared;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    return Template.asString([
      getFederationGlobal(
        Template,
        RuntimeGlobals,
        this.initOptionsWithoutShared,
      ),
    ]);
  }
}
export default FederationRuntimeModule;
