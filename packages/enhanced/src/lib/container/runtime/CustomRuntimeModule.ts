import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import { getFederationGlobalScope } from './utils';
import { transformSync } from '@swc/core';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class CustomRuntimeModule extends RuntimeModule {
  private entryModuleId: string | number | undefined;

  constructor(
    private readonly bundledCode: string | null,
    entryModuleId: string | number | undefined,
  ) {
    super('CustomRuntimeModule', RuntimeModule.STAGE_BASIC);
    this.bundledCode = bundledCode;
    this.entryModuleId = entryModuleId;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    if (!this.bundledCode) return null;
    const { code: transformedCode } = transformSync(this.bundledCode, {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: false,
        },
        target: 'es2022',
        minify: {
          compress: {
            unused: false,
            dead_code: false,
          },
          mangle: false,
          format: {
            // strip comments that webpack wraps it in,
            // they interfere with the parent comment prefixing and seem hard coded into webpack
            comments: false,
          },
        },
      },
    });

    return Template.asString([
      transformedCode,
      `var federation = federation.default || federation;`,
      `var prevFederation = ${federationGlobal}`,
      `${federationGlobal} = {}`,
      `for (var key in federation) {`,
      Template.indent(`${federationGlobal}[key] = federation[key];`),
      `}`,
      `for (var key in prevFederation) {`,
      Template.indent(`${federationGlobal}[key] = prevFederation[key];`),
      `}`,
      'debugger;',
      // 'federation = undefined;',
    ]);
  }
}

export default CustomRuntimeModule;
