import * as ModuleFederationPluginModule from './wrapper/ModuleFederationPlugin';

const pickDefault = <T>(mod: T): T extends { default: infer U } ? U : T =>
  ((mod as { default?: unknown }).default ?? mod) as T extends {
    default: infer U;
  }
    ? U
    : T;

const ModuleFederationPlugin = pickDefault(ModuleFederationPluginModule);
const { PLUGIN_NAME } = ModuleFederationPluginModule;

export { ModuleFederationPlugin, PLUGIN_NAME };
