import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';

const { Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

function getFederationGlobal(
  template: typeof Template,
  runtimeGlobals: typeof RuntimeGlobals,
  matcher: string | boolean,
  rootOutputDir: string | undefined,
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
): string {
  const federationGlobal = getFederationGlobalScope(runtimeGlobals);
  const initOptionsStrWithoutShared = JSON.stringify(initOptionsWithoutShared);

  return template.asString([
    `if(!${federationGlobal}){`,
    template.indent([
      `${federationGlobal} = {`,
      template.indent([
        `initOptions: ${initOptionsStrWithoutShared},`,
        `chunkMatcher: function(chunkId) {return ${matcher}},`,
        `rootOutputDir: ${JSON.stringify(rootOutputDir || '')},`,
        `initialConsumes: undefined,`,
        'bundlerRuntimeOptions: {}',
      ]),
      '};',
    ]),
    '}',
  ]);
}

export default getFederationGlobal;
