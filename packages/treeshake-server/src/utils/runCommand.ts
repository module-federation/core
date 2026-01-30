import { spawn } from 'node:child_process';
import { getRuntimeEnv } from './runtimeEnv';

export interface CommandOptions {
  cwd?: string;
  env?: Record<string, string | undefined>;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class CommandExecutionError extends Error {
  public readonly command: string;
  public readonly exitCode: number;
  public readonly stdout: string;
  public readonly stderr: string;

  constructor(
    command: string,
    exitCode: number,
    stdout: string,
    stderr: string,
  ) {
    super(`Command "${command}" exited with code ${exitCode}`);
    this.name = 'CommandExecutionError';
    this.command = command;
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

/**
 * Execute a shell command and collect its output.
 */
export const runCommand = (
  command: string,
  options: CommandOptions = {},
): Promise<CommandResult> =>
  new Promise((resolve, reject) => {
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    const child = spawn(command, {
      cwd: options.cwd,
      env: { ...getRuntimeEnv(), ...options.env },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutChunks.push(chunk.toString());
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderrChunks.push(chunk.toString());
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (exitCode) => {
      const stdout = stdoutChunks.join('');
      const stderr = stderrChunks.join('');

      if (exitCode === 0) {
        resolve({ stdout, stderr, exitCode });
        return;
      }

      reject(
        new CommandExecutionError(command, exitCode ?? -1, stdout, stderr),
      );
    });
  });
