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

export const dependencies = {
  get ContainerEntryDependency() {
    return require('./lib/container/ContainerEntryDependency').default;
  },
};

export { parseOptions } from './lib/container/options';

export const container = {
  get ContainerEntryModule() {
    return require('./lib/container/ContainerEntryModule').default;
  },
};

export const createModuleFederationConfig = (
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): moduleFederationPlugin.ModuleFederationPluginOptions => {
  return options;
};
