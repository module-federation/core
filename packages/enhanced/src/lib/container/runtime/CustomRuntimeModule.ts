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
    this.entryPath = entryPath;
  }

  override identifier() {
    return 'webpack/runtime/custom/module';
  }

  override generate(): string {
    const runtimeModule = this.entryPath;
    return Template.asString([
      runtimeModule,
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
