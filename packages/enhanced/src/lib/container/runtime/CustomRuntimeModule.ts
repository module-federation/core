import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import { getFederationGlobalScope } from './utils';
import { transformSync } from '@swc/core';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class CustomRuntimeModule extends RuntimeModule {
  private bundledCode: string | null = null;
  private entryModuleId: string | number | undefined;

  constructor(
    private readonly entryPath: string,
    entryModuleId: string | number | undefined,
  ) {
    super('CustomRuntimeModule', RuntimeModule.STAGE_BASIC);
    this.entryPath = entryPath;
    this.entryModuleId = entryModuleId;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string {
    const { code: transformedCode } = transformSync(
      this.entryPath.replace('var federation;', 'var federation = '),
      {
        jsc: {
          parser: {
            syntax: 'ecmascript',
            jsx: false,
          },
          target: 'es2022',
          minify: {
            compress: {
              unused: true,
              dead_code: true,
              drop_debugger: true,
            },
            mangle: false,
            format: {
              // strip comments that webpack wraps it in,
              // they interfere with the parent comment prefixing and seem hard coded into webpack
              comments: false,
            },
          },
        },
      },
    );

    return Template.asString([
      transformedCode,
      `for (var mod in federation) {
        ${Template.indent(`${RuntimeGlobals.moduleFactories}[mod] = federation[mod];`)}
      }`,
      `federation = ${RuntimeGlobals.require}(${JSON.stringify(this.entryModuleId)});`,
      `federation = ${RuntimeGlobals.compatGetDefaultExport}(federation)();`,
      `var prevFederation = ${federationGlobal}`,
      `${federationGlobal} = {}`,
      `for (var key in federation) {`,
      Template.indent(`${federationGlobal}[key] = federation[key];`),
      `}`,
      `for (var key in prevFederation) {`,
      Template.indent(`${federationGlobal}[key] = prevFederation[key];`),
      `}`,
      'federation = undefined;',
    ]);
  }
}

export default CustomRuntimeModule;
