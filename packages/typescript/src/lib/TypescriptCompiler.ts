/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ts from 'typescript';
import path from 'path';
import fs from 'fs';

import { Logger } from '@module-federation/utilities';

import {
  FederatedTypesPluginOptions,
  ModuleFederationPluginOptions,
} from '../types';

import { NormalizeOptions } from './normalizeOptions';
import { TypesCache } from './Caching';

export class TypescriptCompiler {
  private compilerOptions!: ts.CompilerOptions;
  private tsDefinitionFilesObj: Record<string, string> = {};
  private logger = Logger.getLogger();

  constructor(private options: NormalizeOptions) {
    const tsConfigCompilerOptions = this.getTSConfigCompilerOptions();

    this.compilerOptions = {
      ...tsConfigCompilerOptions,
      ...options.tsCompilerOptions,
    };
  }

  generateDeclarationFiles(
    exposeDest: string,
    exposeSrc: string,
    additionalFilesToCompile: FederatedTypesPluginOptions['additionalFilesToCompile'] = []
  ) {
    const exposeSrcToDestMap: Record<string, string> = {
      [this.getNormalizedPathWithExt(exposeSrc)]: exposeDest,
    };

    const normalizedExposedComponents = this.normalizeFiles(Object.keys(exposeSrcToDestMap), value => value);
    this.compilerOptions.outDir = path.join(this.compilerOptions.outDir, exposeDest)

    const normalizedAdditionalFiles = this.normalizeFiles(
      additionalFilesToCompile,
      this.getNormalizedPathWithExt
    );

    const host = this.createHost(exposeSrcToDestMap);

    const program = ts.createProgram(
      [...normalizedAdditionalFiles, ...normalizedExposedComponents],
      this.compilerOptions,
      host
    );

    const { diagnostics, emitSkipped } = program.emit();

    if (!emitSkipped) {
      return this.tsDefinitionFilesObj;
    }

    diagnostics.forEach(this.reportCompileDiagnostic);

    throw new Error('something went wrong generating declaration files');
  }

  private normalizeFiles<T, U extends string>(
    files: T[],
    mapFn: (value: T, index: number, array: T[]) => U
  ) {
    return files.map(mapFn).filter((entry) => /\.tsx?$/.test(entry));
  }

  private getNormalizedPathWithExt(exposeSrc: string) {
    const cwd = this.options.webpackCompilerOptions.context || process.cwd();

    const [rootDir, entry] = exposeSrc.split(/\/(?=[^/]+$)/);

    const normalizedRootDir = path.resolve(cwd, rootDir);
    const filenameWithExt = this.getFilenameWithExtension(
      normalizedRootDir,
      entry
    );

    const pathWithExt = path.resolve(normalizedRootDir, filenameWithExt);
    return pathWithExt;
  }

  private createHost(exposeSrcToDestMap: Record<string, string>) {
    const host = ts.createCompilerHost(this.compilerOptions);

    const originalWriteFile = host.writeFile;

    const rewritePathsWithExposedFederatedModules = (
      sourceFilename: string
    ) => {
      const destFile = exposeSrcToDestMap[sourceFilename];

      return (
        destFile &&
        path.join(this.compilerOptions.outDir as string, 'index.d.ts')
      );
    };

    host.writeFile = (
      filepath,
      text,
      writeOrderByteMark,
      onError,
      sourceFiles,
      data
    ) => {
      // for exposes: { "./expose/path": "path/to/file" }
      // force typescript to write compiled output to "@mf-typescript/expose/path"
      const sourceFilename = sourceFiles?.[0].fileName || '';

      // Try to rewrite the path with exposed federated modules,
      // failing so, use the default filepath emitted by TS Compiler.
      // This second case is valid for 'additionalFileToCompiler' added through Plugin Options.
      const normalizedFilepath =
        rewritePathsWithExposedFederatedModules(sourceFilename) ?? filepath;

      this.tsDefinitionFilesObj[normalizedFilepath] = text;

      originalWriteFile(
        normalizedFilepath,
        text,
        writeOrderByteMark,
        onError,
        sourceFiles,
        data
      );
    };

    return host;
  }

  private reportCompileDiagnostic(diagnostic: ts.Diagnostic): void {
    const { line } = diagnostic.file!.getLineAndCharacterOfPosition(
      diagnostic.start!
    );

    this.logger.log(
      'TS Error',
      diagnostic.code,
      ':',
      ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine)
    );
    this.logger.log(
      '         at',
      `${diagnostic.file!.fileName}:${line + 1}`,
      ts.sys.newLine // '\n'
    );
  }

  private getTSConfigCompilerOptions(): ts.CompilerOptions {
    const context = this.options.webpackCompilerOptions.context!;

    const tsconfigPath = path.resolve(context, 'tsconfig.json');

    if (!tsconfigPath) {
      this.logger.error('ERROR: Could not find a valid tsconfig.json');
      process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(tsconfigPath).compilerOptions;
  }

  private getFilenameWithExtension(rootDir: string, entry: string) {
    // Check path exists and it's a directory
    if (!fs.existsSync(rootDir) || !fs.lstatSync(rootDir).isDirectory()) {
      throw new Error('rootDir must be a directory');
    }

    let filename;

    try {
      // Try to resolve exposed component using index
      const files = TypesCache.getFsFiles(path.join(rootDir, entry));

      filename = files?.find((file) => file.split('.')[0] === 'index');

      if (!filename) {
        throw new Error(`filename ${filename} not found`);
      }

      return `${entry}/${filename}`;
    } catch (err) {
      const files = TypesCache.getFsFiles(rootDir);

      // Handle case where directory contains similar filenames
      // or where a filename like `Component.base.tsx` is used
      filename = files?.find((file) => {
        const baseFile = path.basename(file, path.extname(file));
        const baseEntry = path.basename(entry, path.extname(entry));

        return baseFile === baseEntry;
      });

      if (!filename) {
        throw new Error(`filename ${filename} not found`);
      }

      return filename as string;
    }
  }
}
