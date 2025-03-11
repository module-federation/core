import { program } from 'commander';
import { applyCommonOptions } from './utils/apply-common-options';
import { dts } from './commands/dts';
import { prepareCli } from './utils/prepare';

function cli(): void {
  program.name('mf').usage('<command> [options]').version(__VERSION__);

  const dtsCommand = program.command('dts');

  // dtsCommand.option(
  // )

  applyCommonOptions(dtsCommand);

  program.parse();
}

export function runCli() {
  prepareCli();

  try {
    cli();
  } catch (err) {
    console.error(err);
  }
}
