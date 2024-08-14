import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import { getFederationGlobalScope } from './utils';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const fs = require('fs');
const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class CustomRuntimeModule extends RuntimeModule {
  private bundledCode: string | null = null;

  constructor(private readonly entryPath: string) {
    super('CustomRuntimeModule');
  }

  override identifier() {
    return 'webpack/runtime/custom/module';
  }

  override generate(): string {
    // module.exports = federation;
    const runtimeModule = fs.readFileSync(
      require.resolve('@module-federation/webpack-bundler-runtime/vendor'),
      'utf-8',
    );

    return Template.asString([
      '// Generated CustomRuntimeModule code',
      runtimeModule.replace('module.exports = federation;', ''),
      `var prevFederation = ${federationGlobal}`,
      `${federationGlobal} = {}`,
      `for(var key in federation){`,
      Template.indent(`${federationGlobal}[key] = federation[key];`),
      `}`,
      `for(var key in prevFederation){`,
      Template.indent(`${federationGlobal}[key] = prevFederation[key];`),
      `}`,
    ]);
  }
}

export default CustomRuntimeModule;
