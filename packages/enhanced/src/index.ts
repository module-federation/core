import type { moduleFederationPlugin } from '@module-federation/sdk';
import * as ModuleFederationPluginModule from './wrapper/ModuleFederationPlugin';
import * as ContainerReferencePluginModule from './wrapper/ContainerReferencePlugin';
import * as SharePluginModule from './wrapper/SharePlugin';
import * as ContainerPluginModule from './wrapper/ContainerPlugin';
import * as ConsumeSharedPluginModule from './wrapper/ConsumeSharedPlugin';
import * as ProvideSharedPluginModule from './wrapper/ProvideSharedPlugin';
import * as FederationModulesPluginModule from './wrapper/FederationModulesPlugin';
import * as FederationRuntimePluginModule from './wrapper/FederationRuntimePlugin';
import * as AsyncBoundaryPluginModule from './wrapper/AsyncBoundaryPlugin';
import * as HoistContainerReferencesPluginModule from './wrapper/HoistContainerReferencesPlugin';
import * as TreeShakingSharedPluginModule from './wrapper/TreeShakingSharedPlugin';

const pickDefault = <T>(mod: T): T extends { default: infer U } ? U : T =>
  ((mod as { default?: unknown }).default ?? mod) as T extends {
    default: infer U;
  }
    ? U
    : T;

const ModuleFederationPlugin = pickDefault(ModuleFederationPluginModule);
const { PLUGIN_NAME } = ModuleFederationPluginModule;
const ContainerReferencePlugin = pickDefault(ContainerReferencePluginModule);
const SharePlugin = pickDefault(SharePluginModule);
const ContainerPlugin = pickDefault(ContainerPluginModule);
const ConsumeSharedPlugin = pickDefault(ConsumeSharedPluginModule);
const ProvideSharedPlugin = pickDefault(ProvideSharedPluginModule);
const FederationModulesPlugin = pickDefault(FederationModulesPluginModule);
const FederationRuntimePlugin = pickDefault(FederationRuntimePluginModule);
const AsyncBoundaryPlugin = pickDefault(AsyncBoundaryPluginModule);
const HoistContainerReferencesPlugin = pickDefault(
  HoistContainerReferencesPluginModule,
);
const TreeShakingSharedPlugin = pickDefault(TreeShakingSharedPluginModule);

export {
  ModuleFederationPlugin,
  PLUGIN_NAME,
  ContainerReferencePlugin,
  SharePlugin,
  ContainerPlugin,
  ConsumeSharedPlugin,
  ProvideSharedPlugin,
  FederationModulesPlugin,
  FederationRuntimePlugin,
  AsyncBoundaryPlugin,
  HoistContainerReferencesPlugin,
  TreeShakingSharedPlugin,
};

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

export { createModuleFederationConfig } from '@module-federation/sdk';

export type { moduleFederationPlugin };
