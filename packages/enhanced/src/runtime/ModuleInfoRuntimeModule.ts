'use strict';

import { RuntimeGlobals, RuntimeModule } from 'webpack';
import { Template } from 'webpack';

/**
 * Class representing a runtime module for federation module info.
 * @extends RuntimeModule
 */
export class ModuleInfoRuntimeModule extends RuntimeModule {
  /**
   * Create a ModuleInfoRuntimeModule.
   */
  constructor() {
    super('federation module info runtime', RuntimeModule.STAGE_BASIC);
  }

  /**
   * Generate runtime code.
   * @returns {string} The generated runtime code.
   */
  override generate(): string {
    return Template.asString([
      `${RuntimeGlobals.require}.federation = {`,
      Template.indent([`cache: {},`, `remotes: {},`, `moduleInfo: {},`]),
      `};`,
      Template.indent([
        '// backward compatible global proxy',
        `let oldScope = globalThis.__remote_scope__ || {};`,
        `if (!globalThis.__remote_scope__ || !globalThis.__remote_scope__.moduleInfo) {
         console.log("create proxy",!globalThis.__remote_scope__, globalThis.__remote_scope__ && !globalThis.__remote_scope__.moduleInfo);
         `,
        `globalThis.__remote_scope__ = new Proxy(${RuntimeGlobals.require}.federation, {`,
        Template.indent([
          `get: function(target, prop, receiver) {`,
          'var result;',
          Template.indent([
            `if (prop === '_config') {`,
            Template.indent([
              `result = ${RuntimeGlobals.require}.federation.remotes;`,
            ]),
            `} else if(prop === 'moduleInfo') {`,
            Template.indent([
              `result = ${RuntimeGlobals.require}.federation[prop];`,
            ]),
            `} else {`,
            Template.indent([
              `result = ${RuntimeGlobals.require}.federation.cache[prop];`,
            ]),
            `}`,
            'return result;',
          ]),
          `},`,
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

        Template.indent([
          `for (let key in oldScope._config) {`,
          Template.indent([
            `globalThis.__remote_scope__._config[key] = oldScope[key];`,
          ]),
          `}`,
          `for (let key in oldScope) {`,
          Template.indent([
            'if(key === "_config") continue;',
            `globalThis.__remote_scope__[key] = oldScope[key];`,
          ]),
          `}`,
        ]),
        `}`,
      ]),
    ]);
  }
}

