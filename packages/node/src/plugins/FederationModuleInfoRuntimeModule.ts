'use strict';

const { RuntimeGlobals } = require('webpack');
const { RuntimeModule } = require('webpack');
const { Template } = require('webpack');

class FederationModuleInfoRuntimeModule extends RuntimeModule {
  constructor() {
    super('federation module info runtime', RuntimeModule.STAGE_BASIC );
  }

  /**
   * @returns {string} runtime code
   */
  // eslint-disable-next-line max-lines-per-function
  generate() {
    return Template.asString([
      `${RuntimeGlobals.require}.federation = {`,
      Template.indent([`cache: {},`, `remotes: {},`, `moduleInfo: {},`]),
      `}`,
    ]);
  }
}

export default FederationModuleInfoRuntimeModule;
