'use strict';

import { RuntimeGlobals, RuntimeModule, Template } from 'webpack';

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
      Template.indent([`cache: {},`, `remotes: {},`, `moduleInfo: {}, `]),
      `};`,
      'var createProxyGetter = function() {',
      Template.indent([
        'return function(target, prop, receiver) {',
        Template.indent([
          "if (prop === '_config') {",
            Template.indent('return target.remotes;'),
          "}",
          "if (prop === 'moduleInfo') {",
            Template.indent('return target[prop];'),
          '}',
          'return target.cache[prop];',
        ]),
        '};',
      ]),
      '};',
      'var createProxySetter = function() {',
      Template.indent([
        'return function(target, prop, value) {',
        Template.indent([
          "if (prop === '_config') {",
          Template.indent(['target.remotes = value;']),
          '} else {',
          Template.indent(['target.cache[prop] = value;']),
          '}',
          'return true;',
        ]),
        '};',
      ]),
      '};',
      'let oldScope = globalThis.__remote_scope__ || {};',
      `if(${RuntimeGlobals.runtimeId} === 'webpack-runtime' && globalThis.__remote_scope__) {`,
      'globalThis.__remote_scope__ = {}',
      `}`,
      'if (!globalThis.__remote_scope__ || !globalThis.__remote_scope__.moduleInfo) {',
      `globalThis.__remote_scope__ = new Proxy(${RuntimeGlobals.require}.federation, {`,
      'get: createProxyGetter(),',
      'set: createProxySetter()',
      `});`,
      'if(!oldScope.moduleInfo) {',
      'for (let key in oldScope._config) {',
      'globalThis.__remote_scope__._config[key] = oldScope[key];',
      '}',
      'for (let key in oldScope) {',
      "if(key === '_config' || !oldScope[key]) continue;",
      'globalThis.__remote_scope__[key] = oldScope[key];',
      '}',
      '}',
      '}',
    ]);
  }
}
