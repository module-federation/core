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
  generate() {
    return Template.asString([
      `${RuntimeGlobals.require}.federation = {`,
      Template.indent([`cache: {},`, `remotes: {},`, `moduleInfo: {},`]),
      `};`,
      // `if (!globalThis.__remote_scopes__) {`,
      Template.indent([
        '// backward compatible global proxy',
        `globalThis.__remote_scope__ = new Proxy(globalThis.__remote_scope__ || __webpack_require__.federation, {`,
        Template.indent([
          `get: function(target, prop, receiver) {`,
          Template.indent([
            // `console.log('Reading property:', prop);`,
            `if (prop === '_config') {`,
            Template.indent([` return ${RuntimeGlobals.require}.federation.remotes;`]),
            `} else {`,
            Template.indent([` return ${RuntimeGlobals.require}.federation.cache[prop];`]),
            `}`,
          ]),
          `},`,
          `set: function(target, prop, value) {`,
          Template.indent([
            `console.log('Writing to property:', prop);`,
            `if (prop === '_config') {`,
            Template.indent([`console.log('Writing to remotes', {prop,target,value}); ${RuntimeGlobals.require}.federation.remotes = value;`]),
            `} else {`,
            Template.indent([` ${RuntimeGlobals.require}.federation.cache[prop] = value;`]),
            `}`,
            `return true;`,
          ]),
          `}`,
        ]),
        `});`,
      ]),
      // `}`,
    ]);
  }
}

export default FederationModuleInfoRuntimeModule;

