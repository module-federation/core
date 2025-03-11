import type { Command } from 'commander';

export const applyCommonOptions = (command: Command) => {
  command.option(
    '-c --config <config>',
    'specify the configuration file, can be a relative or absolute path',
  );
};
