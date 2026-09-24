import { execFileSync } from 'node:child_process';

export function runNodeWithConditions(
  cwd: string,
  conditions: string[],
  code: string,
): string {
  return execFileSync(
    process.execPath,
    [...conditions.map((condition) => `--conditions=${condition}`), '-e', code],
    { cwd, encoding: 'utf8' },
  ).trim();
}
