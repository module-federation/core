import { getFederationGlobalScope } from './utils';
import  {Template} from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';

function getFederationGlobal(
  template: typeof Template,
  runtimeGlobals: typeof RuntimeGlobals,
  initOptionsWithoutShared:NormalizedRuntimeInitOptionsWithOutShared,
) :string{
  const federationGlobal = getFederationGlobalScope(runtimeGlobals);
  // TODO: 获取 shared getter
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
