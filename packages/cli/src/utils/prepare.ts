import logger from './logger';
import type { CliOptions } from '../types';

export function prepareCli({ welcomeMsg }: Required<CliOptions>): void {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
  // Print a blank line to keep the greet log nice.
  // Some package managers automatically output a blank line, some do not.
  const { npm_execpath } = process.env;
  if (
    !npm_execpath ||
    npm_execpath.includes('npx-cli.js') ||
    npm_execpath.includes('.bun')
  ) {
    console.log();
  }

  logger.info(welcomeMsg);
}
