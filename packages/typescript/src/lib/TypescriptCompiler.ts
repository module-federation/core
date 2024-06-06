/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type VueTs from 'vue-tsc';
import type { _Program } from 'vue-tsc';

import ts from 'typescript';
import path from 'path';
import fs from 'fs';

import {
  FederatedTypesPluginOptions,
  ModuleFederationPluginOptions,
} from '../types';

import { NormalizeOptions } from './normalizeOptions';
import { TypesCache } from './Caching';
import { Logger } from '../Logger';

let vueTs: typeof VueTs;
try {
  vueTs = require('vue-tsc');
} catch {
  // vue-tsc is an optional dependency.
}

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
    exposedComponents: ModuleFederationPluginOptions['exposes'],
    additionalFilesToCompile: FederatedTypesPluginOptions['additionalFilesToCompile'] = [],
  ) {
    const exposeSrcToDestMap: Record<string, string> = {};

    const normalizedExposedComponents = this.normalizeFiles(
      Object.entries(exposedComponents!),
      ([exposeDest, exposeSrc]) => {
        const pathWithExt = this.getNormalizedPathWithExt(exposeSrc);
        exposeSrcToDestMap[pathWithExt] = exposeDest;
        return pathWithExt;
      },
    );

    const normalizedAdditionalFiles = this.normalizeFiles(
      additionalFilesToCompile,
      this.getNormalizedPathWithExt.bind(this),
    );

    const host = this.createHost(exposeSrcToDestMap);

    const rootNames = [
      ...normalizedAdditionalFiles,
      ...normalizedExposedComponents,
    ];

    const program = this.getCompilerProgram({
      rootNames,
      options: this.compilerOptions,
      host,
    });

    const { diagnostics, emitSkipped } = program.emit();

    if (!emitSkipped) {
      return this.tsDefinitionFilesObj;
    }

    diagnostics.forEach(this.reportCompileDiagnostic.bind(this));

    throw new Error('something went wrong generating declaration files');
  }

  private getCompilerProgram(programOptions: ts.CreateProgramOptions) {
    const { compiler } = this.options;

    switch (compiler) {
      case 'vue-tsc':
        if (!vueTs) {
          throw new Error(
            'vue-tsc must be installed when using the vue-tsc compiler option',
          );
        }
        return vueTs.createProgram(programOptions) as _Program;
      case 'tsc':
      default:
        return ts.createProgram(programOptions);
    }
  }

  private normalizeFiles<T, U extends string>(
    files: T[],
    mapFn: (value: T, index: number, array: T[]) => U,
  ) {
    return files.map(mapFn).filter((entry) => /\.tsx?$/.test(entry));
  }

  private getNormalizedPathWithExt(exposeSrc: string) {
    const cwd = this.options.webpackCompilerOptions.context || process.cwd();

    const [rootDir, entry] = exposeSrc.split(/\/(?=[^/]+$)/);

    const normalizedRootDir = path.resolve(cwd, rootDir);
    const filenameWithExt = this.getFilenameWithExtension(
      normalizedRootDir,
      entry,
    );

    const pathWithExt = path.resolve(normalizedRootDir, filenameWithExt);
    return path.normalize(pathWithExt);
  }

  private createHost(exposeSrcToDestMap: Record<string, string>) {
    const host = ts.createCompilerHost(this.compilerOptions);

    const originalWriteFile = host.writeFile;

    host.writeFile = (
      filepath,
      text,
      writeOrderByteMark,
      onError,
      sourceFiles,
      data,
    ) => {
      this.tsDefinitionFilesObj[filepath] = text;
      originalWriteFile(
        filepath,
        text,
        writeOrderByteMark,
        onError,
        sourceFiles,
        data,
      );

      // create exports matching the `exposes` config
      const sourceFilename = path.normalize(sourceFiles?.[0].fileName || '');
      const exposedDestFilePath = exposeSrcToDestMap[sourceFilename];

      // create reexport file only if the file was marked for exposing
      if (exposedDestFilePath) {
        const normalizedExposedDestFilePath = path.resolve(
          this.options.distDir,
          `${exposedDestFilePath}.d.ts`,
        );

        const relativePathToCompiledFile = path.relative(
          path.dirname(normalizedExposedDestFilePath),
          filepath,
        );
        // add ./ so it's always relative, remove d.ts because it's not needed and can throw warnings
        const importPath =
          './' +
          relativePathToCompiledFile
            .replace(/\.d\.ts$/, '')
            .split(path.sep) // Windows platform-specific file system path fix
            .join('/');

        const reexport = `export * from '${importPath}';\nexport { default } from '${importPath}';`;

        this.tsDefinitionFilesObj[normalizedExposedDestFilePath] = reexport;

        // reuse originalWriteFile as it creates folders if they don't exist
        originalWriteFile(
          normalizedExposedDestFilePath,
          reexport,
          writeOrderByteMark,
        );
      }
    };

    return host;
  }

  private reportCompileDiagnostic(diagnostic: ts.Diagnostic): void {
    const { line } = diagnostic.file!.getLineAndCharacterOfPosition(
      diagnostic.start!,
    );

    this.logger.log(
      'TS Error',
      diagnostic.code,
      ':',
      ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine),
    );
    this.logger.log(
      '         at',
      `${diagnostic.file!.fileName}:${line + 1}`,
      ts.sys.newLine, // '\n'
    );
  }

  private getTSConfigCompilerOptions(): ts.CompilerOptions {
    const context = this.options.webpackCompilerOptions.context!;

    const tsconfigPath = ts.findConfigFile(
      context,
      ts.sys.fileExists,
      'tsconfig.json',
    );

    if (!tsconfigPath) {
      this.logger.error('ERROR: Could not find a valid tsconfig.json');
      process.exit(1);
    }

    const readResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const configContent = ts.parseJsonConfigFileContent(
      readResult.config,
      ts.sys,
      context,
    );

    return configContent.options;
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
