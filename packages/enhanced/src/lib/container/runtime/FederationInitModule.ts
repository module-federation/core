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
    super('federation runtime init', RuntimeModule.STAGE_ATTACH - 1);
    this.runtimeRequirements = runtimeRequirements;
    this.containerName = containerName;
    this.initOptionsWithoutShared = initOptionsWithoutShared;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    return Template.asString([
      'if(__webpack_require__.m) {',
      'console.log("init runtime")',
      'const mfRuntimeModuleID = Object.keys(__webpack_require__.m).find(e=>e.includes(".federation"));',
      '__webpack_require__(mfRuntimeModuleID);}',
    ]);
  }
}
export default FederationRuntimeModule;
