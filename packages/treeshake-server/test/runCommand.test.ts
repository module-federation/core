import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import { runCommand, CommandExecutionError } from '../src/utils/runCommand';
import { setRuntimeEnv } from '../src/utils/runtimeEnv';

describe('runCommand', () => {
  setRuntimeEnv(process.env);

  it('resolves with stdout and stderr when command succeeds', async () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'run-command-success-'),
    );
    const scriptPath = path.join(tempDir, 'script.js');
    fs.writeFileSync(
      scriptPath,
      "process.stdout.write('ok'); process.stderr.write('warn');",
    );

    const result = await runCommand(`node "${scriptPath}"`);

    assert.equal(result.stdout, 'ok');
    assert.equal(result.stderr, 'warn');
    assert.equal(result.exitCode, 0);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('rejects with CommandExecutionError when command exits non-zero', async () => {
    const failingCommand =
      'node -e "process.stderr.write(\'boom\'); process.exit(2);"';

    await assert.rejects(
      () => runCommand(failingCommand),
      (error: unknown) => {
        assert(error instanceof CommandExecutionError);
        assert.equal(error.exitCode, 2);
        assert.equal(error.stderr, 'boom');
        assert.equal(error.command, failingCommand);
        return true;
      },
    );
  });
});
