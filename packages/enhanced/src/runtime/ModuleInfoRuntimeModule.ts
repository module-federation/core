'use strict';

import { RuntimeGlobals, RuntimeModule } from 'webpack';
import { Template } from 'webpack';

/**
 * This class extends the RuntimeModule to provide functionality
 * for the federation module in the runtime.
 */
class FederationModuleInfoRuntimeModule extends RuntimeModule {
  /**
   * Constructor for the FederationModuleInfoRuntimeModule class.
   * Initializes the module with the name and stage.
   */
  constructor() {
    super('federation module info runtime', RuntimeModule.STAGE_BASIC);
  }

  /**
   * Generates runtime code
   * @returns {string} runtime code
   */
  override generate(): string {
    return Template.asString([
      `${RuntimeGlobals.require}.federation = {`,
      Template.indent([`cache: {},`, `remotes: {},`, `moduleInfo: { },`]),
      `};`,
      // `if (!globalThis.__remote_scopes__) {`,
      Template.indent([
        '// backward compatible global proxy',
        `globalThis.__remote_scope__ = globalThis.__remote_scope__ || new Proxy(${RuntimeGlobals.require}.federation, {`,
        Template.indent([
          /**
           * Getter function for the Proxy.
           * @param {any} target - The target object.
           * @param {string} prop - The property to get.
           * @param {any} receiver - The Proxy or an object that inherits from the Proxy.
           * @returns {any} The value to return.
           */
          `get: function(target, prop, receiver) {`,
          'var result;',
          Template.indent([
            `if (prop === '_config') {`,
            Template.indent([
              `result = ${RuntimeGlobals.require}.federation.remotes;`,
            ]),
            `} else {`,
            Template.indent([
              `result = ${RuntimeGlobals.require}.federation.cache[prop];`,
            ]),
            `}`,
            'return result;',
          ]),
          `},`,
          /**
           * Setter function for the Proxy.
           * @param {any} target - The target object.
           * @param {string} prop - The property to set.
           * @param {any} value - The value to set.
           * @returns {boolean} Returns true.
           */
          `set: function(target, prop, value) {`,
          Template.indent([
            `if (prop === '_config') {`,
            Template.indent([
              `${RuntimeGlobals.require}.federation.remotes = value;`,
            ]),
            `} else {`,
            Template.indent([
              `${RuntimeGlobals.require}.federation.cache[prop] = value;`,
            ]),
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
