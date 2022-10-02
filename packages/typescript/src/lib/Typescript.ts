import type { ModuleFederationPluginOptions } from '@module-federation/utilities';

import ts from 'typescript';
import download from 'download';
import fs from 'fs';
import path from 'path';
import get from 'lodash.get';
import axios from 'axios';
import { Compilation, Compiler } from 'webpack';

export class FederatedTypesPlugin {
  private options: ModuleFederationPluginOptions;
  private exposedComponents!: ModuleFederationPluginOptions['exposes'];
  private remoteComponents!: ModuleFederationPluginOptions['remotes'];
  private distDir!: string;
  private typesIndexJsonFilePath!: string;
  private tsCompilerOptions!: ts.CompilerOptions;
  private webpackCompilerOptions!: Compiler['options'];

  private tsDefinitionFilesObj: Record<string, string> = {};
  private typescriptFolderName = '@mf-typescript';
  private typesIndexJsonFileName = '__types_index.json';

  constructor(options: ModuleFederationPluginOptions) {
    this.options = options;

    this.tsCompilerOptions = {
      declaration: true,
      emitDeclarationOnly: true,
    };
  }

  apply(compiler: Compiler) {
    let recompileInterval: NodeJS.Timer;
    this.webpackCompilerOptions = compiler.options;

    const distPath =
      get(this.webpackCompilerOptions, 'devServer.static.directory') ||
      get(this.webpackCompilerOptions, 'output.path') ||
      'dist';

    this.distDir = path.join(distPath, this.typescriptFolderName);

    this.typesIndexJsonFilePath = path.join(
      this.distDir,
      this.typesIndexJsonFileName
    );

    // The '/' at the end is necessary for TS Compiler to emit files to the output dir.
    this.tsCompilerOptions.outDir = path.join(this.distDir, '/');

    const federationOptions = this.webpackCompilerOptions.plugins.find(
      (plugin) => {
        return plugin.constructor.name === 'ModuleFederationPlugin';
      }
    );
    const inheritedPluginOptions = get(federationOptions, '_options') || null;

    this.exposedComponents =
      this.options?.exposes || inheritedPluginOptions.exposes;
    this.remoteComponents =
      this.options?.remotes || inheritedPluginOptions.remotes;

    compiler.hooks.afterCompile.tap('FederatedTypes', (compilation) => {
      // Reset and create an Interval to refetch types every 60 seconds
      clearInterval(recompileInterval);
      if (compiler.options.mode === 'development') {
        recompileInterval = setInterval(() => {
          this.run(compilation);
        }, 1000 * 60);
      }

      // Runs a compilation immediately
      this.run(compilation);
    });
  }

  private run(compilation: Compilation) {
    if (this.exposedComponents) {
      this.extractTypes();
    }

    // Time to import the remote types
    if (this.remoteComponents) {
      // Get the remote URL origin
      this.importRemoteTypes();
    }
  }

  private importRemoteTypes() {
    if (this.remoteComponents) {
      const remoteUrls = Object.entries(this.remoteComponents).map(
        ([remote, entry]) => {
          const [, url] = entry.split('@');

          return {
            origin: new URL(url ?? entry).origin,
            remote,
          };
        }
      );

      remoteUrls.forEach(({ origin, remote }) => {
        axios
          .get<string[]>(
            `${origin}/${this.typescriptFolderName}/${this.typesIndexJsonFileName}`
          )
          .then((indexFileResp) => {
            // Download all the d.ts files mentioned in the index file
            indexFileResp.data?.forEach((file) =>
              download(
                `${origin}/${this.typescriptFolderName}/${file}`,
                `${this.typescriptFolderName}/${remote}`, {
                  filename: file
                }
              )
            );
          })
          .catch((e) => console.log('ERROR fetching/writing types', e));
      });
    }
  }

  private extractTypes() {
    if (this.exposedComponents) {
      const exposeSrcToDestMap: Record<string, string> = {};
      const normalizedFileNames = Object.entries(this.exposedComponents)
        // './Component': 'path/to/component' -> ['./Component', 'path/to/component']
        .map(([exposeDest, exposeSrc]) => {
          const [rootDir, entry] = exposeSrc.split(/\/(?=[^/]+$)/);
          const cwd = this.webpackCompilerOptions.context || process.cwd();
          const normalizedRootDir = path.resolve(cwd, rootDir);
          const filenameWithExt = this.resolveFilenameWithExtension(
            normalizedRootDir,
            entry
          );
          const pathWithExt = path.resolve(cwd, rootDir, filenameWithExt);
          exposeSrcToDestMap[pathWithExt] = exposeDest;
          return pathWithExt;
        })
        .filter((entry) => /\.tsx?$/.test(entry));

      const host = ts.createCompilerHost(this.tsCompilerOptions);
      const originalWriteFileFn = host.writeFile;

      host.writeFile = (
        filename,
        text,
        writeOrderByteMark,
        onError,
        sourceFiles,
        data
      ) => {
        // for exposes: { "./expose/path": "path/to/file" }
        // force typescript to write compiled output to "@mf-typescript/expose/path"
        const newFileName = `${
          exposeSrcToDestMap[sourceFiles?.[0].fileName || '']
        }.d.ts`;
        const newFilePath = path.join(
          this.tsCompilerOptions.outDir!, // we define it in #apply
          newFileName
        );

        this.tsDefinitionFilesObj[newFilePath] = text;

        originalWriteFileFn(
          newFilePath,
          text,
          writeOrderByteMark,
          onError,
          sourceFiles,
          data
        );
      };

      const program = ts.createProgram(
        normalizedFileNames,
        this.tsCompilerOptions,
        host
      );

      const emitResult = program.emit();

      if (!emitResult.emitSkipped) {
        const files = Object.keys(this.tsDefinitionFilesObj).map((file) =>
          file.slice(`${this.distDir}/`.length)
        );

        fs.writeFile(
          this.typesIndexJsonFilePath,
          JSON.stringify(files),
          (e) => {
            if (e) {
              console.log('Error saving the types index', e);
            }
          }
        );
      }
    }
  }

  // TODO: this method can be improved for performance
  // For every exposedComponents this method traverse through the directories
  // to automatically resolve the extension.
  // We can cache the already traversed directories which can be used to resolve
  // other 'exposedComponents' falling in the same directory that's already have been traversed.
  private resolveFilenameWithExtension(rootDir: string, entry: string) {
    // Check path exists and it's a directory
    if (!fs.existsSync(rootDir) || !fs.lstatSync(rootDir).isDirectory()) {
      throw new Error('rootDir must be a directory');
    }

    let filename;

    try {
      // Try to resolve exposed component using index
      const files = fs.readdirSync(path.join(rootDir, entry));

      filename = files.find((file) => file.split('.')[0] === 'index');

      return `${entry}/${filename}`;
    } catch (err) {
      const files = fs.readdirSync(rootDir);

      // Handle case where directory contains similar filenames
      // or where a filename like `Component.base.tsx` is used
      filename = files.find((file) => {
        const baseFile = path.basename(file, path.extname(file));
        const baseEntry = path.basename(entry, path.extname(entry));

        return baseFile === baseEntry;
      });

      return filename as string;
    }
  }
}
