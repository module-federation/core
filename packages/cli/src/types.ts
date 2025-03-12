import type { Command } from 'commander';

export type CommonOptions = {
  config?: string;
};

export type DtsOptions = {
  fetch?: boolean;
  generate?: boolean;
  root?: string;
  output?: string;
} & CommonOptions;

export type CliOptions = {
  welcomeMsg?: string;
  name?: string;
  version?: string;
  config?: string;
  applyCommands?: (
    command: Command,
    applyCommonOptions: (command: Command) => void,
  ) => void;
};
