import { execFileSync } from 'node:child_process';

export function runNodeWithConditions(
  cwd: string,
  conditions: string[],
  code: string,
): string {
  // CI sets FORCE_COLOR, which makes console.log color numbers in the child.
  const { FORCE_COLOR: _forceColor, ...env } = process.env;
  return execFileSync(
    process.execPath,
    [...conditions.map((condition) => `--conditions=${condition}`), '-e', code],
    { cwd, encoding: 'utf8', env: { ...env, NO_COLOR: '1' } },
  ).trim();
}
