import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

type DiagnosticStage = 'generate-types' | 'list-files';

const readProcessOutput = (value: unknown) => {
  if (Buffer.isBuffer(value)) {
    return value.toString('utf8');
  }
  return typeof value === 'string' ? value : '';
};

export const formatCompilerOutput = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const processError = error as {
      stderr?: unknown;
      stdout?: unknown;
      message?: unknown;
    };
    const output = [
      readProcessOutput(processError.stderr),
      readProcessOutput(processError.stdout),
    ]
      .map((value) => value.trim())
      .filter(Boolean)
      .join('\n');
    if (output) {
      return output;
    }
    if (typeof processError.message === 'string') {
      return processError.message;
    }
  }

  return String(error);
};

export const formatCommandForDisplay = (executable: string, args: string[]) => {
  const formatArg = (arg: string) => {
    if (/[\s'"]/.test(arg)) {
      return JSON.stringify(arg);
    }
    return arg;
  };
  return [executable, ...args].map(formatArg).join(' ');
};

export const preserveTypeScriptDiagnostic = ({
  command,
  compilerOutput,
  context,
  stage,
  tempTsConfigPath,
  typeScriptVersion,
}: {
  command: {
    executable: string;
    args: string[];
  };
  compilerOutput: string;
  context: string;
  stage: DiagnosticStage;
  tempTsConfigPath: string;
  typeScriptVersion: string;
}) => {
  const diagnosticDir = resolve(context, '.mf', 'diagnostics', 'dts', stage);
  const diagnosticConfigPath = join(diagnosticDir, 'tsconfig.json');
  const diagnosticLogPath = join(diagnosticDir, 'compiler.log');
  const formatCommandWithConfig = (configPath: string) =>
    formatCommandForDisplay(
      command.executable,
      command.args.map((arg) => (arg === tempTsConfigPath ? configPath : arg)),
    );

  try {
    mkdirSync(diagnosticDir, { recursive: true });
    writeFileSync(diagnosticConfigPath, readFileSync(tempTsConfigPath, 'utf8'));
    const diagnosticCommand = formatCommandWithConfig(diagnosticConfigPath);
    writeFileSync(
      diagnosticLogPath,
      [
        `Stage: ${stage}`,
        `TypeScript version: ${typeScriptVersion}`,
        `Command: ${diagnosticCommand}`,
        `Effective temporary config: ${diagnosticConfigPath}`,
        '',
        stage === 'generate-types'
          ? 'Fatal compiler diagnostic:'
          : 'Dependency scan diagnostic (type generation continued with exposed files only):',
        compilerOutput,
        '',
      ].join('\n'),
    );
    return {
      copied: true,
      command: diagnosticCommand,
      diagnosticConfigPath,
      diagnosticLogPath,
    };
  } catch {
    return {
      copied: false,
      command: formatCommandWithConfig(tempTsConfigPath),
      diagnosticConfigPath: tempTsConfigPath,
      diagnosticLogPath: undefined,
    };
  }
};
