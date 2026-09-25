export { BasicPluginOptionsManager } from './BasicPluginOptionsManager';
export { ContainerManager } from './ContainerManager';
export { PKGJsonManager } from './PKGJsonManager';
export { RemoteManager } from './RemoteManager';
export { SharedManager } from './SharedManager';

export { UNKNOWN_MODULE_NAME } from './constant';

export * as utils from './utils';
export * as types from './types';

export { planComposition, ADAPTERS } from './composition/plan';
export type {
  AdapterName,
  CompositionPlan,
  CompositionPlatform,
  Participant,
} from './composition/plan';
export {
  FAMILY_PACKAGES,
  RUNTIME_FAMILY,
  resolveRuntimeFamily,
} from './composition/family';
export type {
  FamilyMember,
  FamilyPackage,
  RuntimeFamily,
} from './composition/family';
export { selectMode } from './composition/selectMode';
export type { ModeInputs, RuntimeMode } from './composition/selectMode';
export { resolveImports } from './composition/resolveImports';
export type { CompositionImports } from './composition/resolveImports';
export { renderComposition } from './composition/renderComposition';
export { checkFederationGraph } from './composition/checkFederationGraph';
export type {
  FederationGraphSummary,
  GraphFindings,
  GraphModule,
} from './composition/checkFederationGraph';
