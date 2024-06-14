import ansiColors from 'ansi-colors';
import { dirname, join, normalize, relative, resolve, sep } from 'path';
import typescript from 'typescript';
import { Extractor, IExtractorInvokeOptions } from '@microsoft/api-extractor';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { retrieveExtractorConfig } from '../configurations/thirdPartyExtractor';

const STARTS_WITH_SLASH = /^\//;

const DEFINITION_FILE_EXTENSION = '.d.ts';

const reportCompileDiagnostic = (diagnostic: typescript.Diagnostic): void => {
  const { line } = diagnostic.file!.getLineAndCharacterOfPosition(
    diagnostic.start!,
  );

  console.error(
    ansiColors.red(
      `TS Error ${diagnostic.code}':' ${typescript.flattenDiagnosticMessageText(
        diagnostic.messageText,
        typescript.sys.newLine,
      )}`,
    ),
  );
  console.error(
    ansiColors.red(
      `         at ${diagnostic.file!.fileName}:${
        line + 1
      } typescript.sys.newLine`,
    ),
  );
};

export const retrieveMfTypesPath = (
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
) => normalize(tsConfig.outDir!.replace(remoteOptions.compiledTypesFolder, ''));

export const retrieveOriginalOutDir = (
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
) =>
  normalize(
    tsConfig
      .outDir!.replace(remoteOptions.compiledTypesFolder, '')
      .replace(remoteOptions.typesFolder, ''),
  );

export const retrieveMfAPITypesPath = (
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
) =>
  join(
    retrieveOriginalOutDir(tsConfig, remoteOptions),
    `${remoteOptions.typesFolder}.d.ts`,
  );

const createHost = (
  mapComponentsToExpose: Record<string, string>,
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
  cb: (compiledTypeEntry: string, typeEntry: string, content: string) => void,
) => {
  const host = typescript.createCompilerHost(tsConfig);
  const originalWriteFile = host.writeFile;
  const mapExposeToEntry = Object.fromEntries(
    Object.entries(mapComponentsToExpose).map(([exposed, filename]) => [
      normalize(filename),
      exposed,
    ]),
  );
  const mfTypePath = retrieveMfTypesPath(tsConfig, remoteOptions);

  host.writeFile = (
    filepath,
    text,
    writeOrderByteMark,
    onError,
    sourceFiles,
    data,
  ) => {
    originalWriteFile(
      filepath,
      text,
      writeOrderByteMark,
      onError,
      sourceFiles,
      data,
    );

    for (const sourceFile of sourceFiles || []) {
      const sourceEntry = mapExposeToEntry[normalize(sourceFile.fileName)];
      if (sourceEntry) {
        const mfeTypeEntry = join(
          mfTypePath,
          `${sourceEntry}${DEFINITION_FILE_EXTENSION}`,
        );
        const mfeTypeEntryDirectory = dirname(mfeTypeEntry);
        const relativePathToOutput = relative(mfeTypeEntryDirectory, filepath)
          .replace(DEFINITION_FILE_EXTENSION, '')
          .replace(STARTS_WITH_SLASH, '')
          .split(sep) // Windows platform-specific file system path fix
          .join('/');
        originalWriteFile(
          mfeTypeEntry,
          `export * from './${relativePathToOutput}';\nexport { default } from './${relativePathToOutput}';`,
          writeOrderByteMark,
        );
        cb(filepath, mfeTypeEntry, text);
      }
    }
  };

  return host;
};

const createVueTscProgram = (
  programOptions: typescript.CreateProgramOptions,
) => {
  const vueTypescript = require('vue-tsc');
  return vueTypescript.createProgram(programOptions);
};

const createProgram = (
  remoteOptions: Required<RemoteOptions>,
  programOptions: typescript.CreateProgramOptions,
) => {
  switch (remoteOptions.compilerInstance) {
    case 'vue-tsc':
      return createVueTscProgram(programOptions);
    case 'tsc':
    default:
      return typescript.createProgram(programOptions);
  }
};

export const compileTs = (
  mapComponentsToExpose: Record<string, string>,
  tsConfig: typescript.CompilerOptions,
  remoteOptions: Required<RemoteOptions>,
) => {
  const cb = remoteOptions.extractThirdParty
    ? (compiledTypeEntry: string, typeEntry: string, content: string) => {
        const extractorConfig = retrieveExtractorConfig(
          remoteOptions,
          tsConfig,
          compiledTypeEntry,
        );
        Extractor.invoke(extractorConfig, {
          // 设置 localBuild 为 true 可以使构建更宽容，适合本地开发
          localBuild: false,
          showVerboseMessages: false,
          showDiagnostics: false,
          typescriptCompilerFolder: require.resolve('typescript'),
          // ...rollupOptions as IExtractorInvokeOptions
        });
      }
    : () => {};

  const tsHost = createHost(mapComponentsToExpose, tsConfig, remoteOptions, cb);
  const filesToCompile = [
    ...Object.values(mapComponentsToExpose),
    ...remoteOptions.additionalFilesToCompile,
  ];

  const programOptions: typescript.CreateProgramOptions = {
    rootNames: filesToCompile,
    host: tsHost,
    options: tsConfig,
  };
  const tsProgram = createProgram(remoteOptions, programOptions);

  const { diagnostics = [] } = tsProgram.emit();
  diagnostics.forEach(reportCompileDiagnostic);
};
