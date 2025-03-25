import { program } from 'commander';
import { applyCommonOptions } from './utils/apply-common-options';
import { dts } from './commands/dts';
import { prepareCli } from './utils/prepare';
import logger, { PREFIX } from './utils/logger';
import { readConfig } from './utils/readConfig';

import type { DtsOptions, CliOptions } from './types';

function cli(cliOptions: Required<CliOptions>): void {
  const { name, version, applyCommands } = cliOptions;
  program.name(name).usage('<command> [options]').version(version);

  const dtsCommand = program.command('dts');

  dtsCommand
    .option('--root <root>', 'specify the project root directory')
    .option('--output <output>', 'specify the generated dts output directory')
    .option(
      '--fetch <boolean>',
      'fetch types from remote, default is true',
      (value) => value === 'true',
      true,
    )
    .option(
      '--generate <boolean>',
      'generate types, default is true',
      (value) => value === 'true',
      true,
    );

  applyCommonOptions(dtsCommand);

  dtsCommand
    .description('generate or fetch the mf types')
    .action(async (options: DtsOptions) => {
      try {
        await dts(options, cliOptions);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });

  if (typeof applyCommands === 'function') {
    applyCommands(program, applyCommonOptions);
  }

  program.parse();
}

export function runCli(options: CliOptions) {
  const normalizedOptions: Required<CliOptions> = {
    loggerPrefix: PREFIX,
    welcomeMsg: `${`Module Federation v${__VERSION__}`}\n`,
    name: 'mf',
    readConfig,
    version: __VERSION__,
    applyCommands: () => {},
    ...options,
  };

  logger.setPrefix(normalizedOptions.loggerPrefix);

  prepareCli(normalizedOptions);

  try {
    cli(normalizedOptions);
  } catch (err) {
    console.error(err);
  }
}
