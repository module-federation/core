'use strict';

const { RuntimeGlobals } = require('webpack');
const { RuntimeModule } = require('webpack')
const { Template } = require('webpack')

class FederationModuleInfoRuntimeModule extends RuntimeModule {
  constructor() {
    super('add publicpath runtime', RuntimeModule.STAGE_BASIC + 1);
  }

  /**
   * @returns {string} runtime code
   */
  // eslint-disable-next-line max-lines-per-function
  generate() {
    return Template.asString([
      `${RuntimeGlobals.require}.federation = {
        cache: {},
        remotes: {},
        moduleInfo: {},
      }`
    ]);
  }
}

export default FederationModuleInfoRuntimeModule;
