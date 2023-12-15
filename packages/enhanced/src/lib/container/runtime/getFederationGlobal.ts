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
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
): string {
  const federationGlobal = getFederationGlobalScope(runtimeGlobals);
  // TODO: get shared getter
  const initOptionsStrWithoutShared = JSON.stringify(initOptionsWithoutShared);
  // return Template.asString([
  // 	`if(!${federationGlobal}){`,
  // 	"// inject vmok runtime",
  // 	getRuntimeCode(),
  // 	`${federationGlobal} = ${RuntimeGlobals.compatGetDefaultExport}(VmokBundlerRuntime)();`,
  // 	`${federationGlobal}.initOptions = ${initOptionsStrWithoutShared};`,
  // 	"}"
  // ]);
  return template.asString([
    `if(!${federationGlobal}){`,
    template.indent([
      `${federationGlobal} = {`,
      template.indent([
        // "runtime: undefined,",
        // "instance: undefined,",
        `initOptions: ${initOptionsStrWithoutShared},`,
        `initialConsumes: undefined,`,
        'bundlerRuntimeOptions: {}',
      ]),
      '};',
    ]),
    '}',
    // "// inject vmok runtime",
    // getRuntimeCode(),
    // `${federationGlobal}.runtime = VmokRuntime;`
  ]);
}

export default getFederationGlobal;
