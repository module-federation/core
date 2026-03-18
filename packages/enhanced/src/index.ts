import type { moduleFederationPlugin } from '@module-federation/sdk';
export {
  default as ModuleFederationPlugin,
  PLUGIN_NAME,
} from './wrapper/ModuleFederationPlugin';
export { default as ContainerReferencePlugin } from './wrapper/ContainerReferencePlugin';
export { default as SharePlugin } from './wrapper/SharePlugin';
export { default as ContainerPlugin } from './wrapper/ContainerPlugin';
export { default as ConsumeSharedPlugin } from './wrapper/ConsumeSharedPlugin';
export { default as ProvideSharedPlugin } from './wrapper/ProvideSharedPlugin';
export { default as FederationModulesPlugin } from './wrapper/FederationModulesPlugin';
export { default as FederationRuntimePlugin } from './wrapper/FederationRuntimePlugin';
export { default as AsyncBoundaryPlugin } from './wrapper/AsyncBoundaryPlugin';
export { default as HoistContainerReferencesPlugin } from './wrapper/HoistContainerReferencesPlugin';
export { default as TreeShakingSharedPlugin } from './wrapper/TreeShakingSharedPlugin';

const lazyRequire = (id: string): any => module.require(id);

export const dependencies = {
  get ContainerEntryDependency() {
    return lazyRequire('./lib/container/ContainerEntryDependency').default;
  },
};

export { parseOptions } from './lib/container/options';

export const container = {
  get ContainerEntryModule() {
    return lazyRequire('./lib/container/ContainerEntryModule').default;
  },
};

export { createModuleFederationConfig } from '@module-federation/sdk';

export type { moduleFederationPlugin };
