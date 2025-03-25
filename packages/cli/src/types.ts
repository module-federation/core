import type { Command } from 'commander';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export type CommonOptions = {
  config?: string;
  mode?: string;
};

export type DtsOptions = {
  fetch?: boolean;
  generate?: boolean;
  root?: string;
  output?: string;
} & CommonOptions;

export type CliOptions = {
  welcomeMsg?: string;
  loggerPrefix?: string;
  name?: string;
  version?: string;
  readConfig?: (
    userConfigPath?: string,
  ) => Promise<moduleFederationPlugin.ModuleFederationPluginOptions>;
  applyCommands?: (
    command: Command,
    applyCommonOptions: (command: Command) => void,
  ) => void;
};
