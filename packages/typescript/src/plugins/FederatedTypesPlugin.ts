import { isObjectEmpty } from '@module-federation/utilities';

import ts from 'typescript';
import download from 'download';
import fs from 'fs';
import path from 'path';
import get from 'lodash.get';
import axios from 'axios';
import { Compilation, Compiler } from 'webpack';
import crypto from 'crypto';

import { FederatedTypesPluginOptions } from '../types';
import { TypescriptCompiler } from '../lib/Typescript';
import { normalizeOptions } from '../lib/normalizeOptions';
import { FederatedTypesStatsPlugin } from './FederatedTypesStatsPlugin';
import { generateTypesStats } from '../lib/generateTypesStats';

const PLUGIN_NAME = 'FederatedTypesPlugin';

export class FederatedTypesPlugin {
  private options: FederatedTypesPluginOptions;
  private normalizeOptions!: ReturnType<typeof normalizeOptions>;
  private webpackCompilerOptions!: Compiler['options'];

  private fsCache: Map<string, string[]> = new Map();

  constructor(options: FederatedTypesPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    let recompileInterval: NodeJS.Timer;

    const { webpack } = compiler;
    this.webpackCompilerOptions = compiler.options;

    this.normalizeOptions = normalizeOptions(this.options, compiler);

    const isMFPluginExists = this.webpackCompilerOptions.plugins.some(
      (plugin) => plugin.constructor.name === 'ModuleFederationPlugin'
    );

    if (isMFPluginExists) {
      throw new Error(
        `${PLUGIN_NAME} by default packs 'ModuleFederationPlugin' under the hood. Please remove 'ModuleFederation' Plugin from your configuration`
      );
    }

    // compiler.hooks.thisCompilation.tap('FederatedTypes', () => {
    //   console.log('thisCompilation');
    // });

    // compiler.hooks.compile.tap('FederatedTypes', () => {
    //   console.log('compilation');
    // });

    // compiler.hooks.afterCompile.tap('FederatedTypes', (compilation) => {
    //   console.log('afterCompile');
    // });

    const stats = this.extractTypes();

    new webpack.container.ModuleFederationPlugin(
      this.options.federationConfig
    ).apply(compiler);

    new FederatedTypesStatsPlugin({
      filename: this.normalizeOptions.typesIndexJsonFileName,
      statsResult: stats,
    }).apply(compiler);
  }

  private extractTypes() {
    const exposedComponents = this.options.federationConfig.exposes;

    if (!exposedComponents) {
      return {};
    }

    const exposeSrcToDestMap: Record<string, string> = {};

    // './Component': 'path/to/component' -> ['./Component', 'path/to/component']
    const normalizedFileNames = Object.entries(exposedComponents)
      .map(([exposeDest, exposeSrc]) => {
        const cwd = this.webpackCompilerOptions.context || process.cwd();

        const [rootDir, entry] = exposeSrc.split(/\/(?=[^/]+$)/);

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

    // const host = ts.createCompilerHost(this.tsCompilerOptions);
    // const originalWriteFileFn = host.writeFile;

    // host.writeFile = (
    //   filename,
    //   text,
    //   writeOrderByteMark,
    //   onError,
    //   sourceFiles,
    //   data
    // ) => {
    //   // for exposes: { "./expose/path": "path/to/file" }
    //   // force typescript to write compiled output to "@mf-typescript/expose/path"
    //   const newFileName = `${
    //     exposeSrcToDestMap[sourceFiles?.[0].fileName || '']
    //   }.d.ts`;

    //   const newFilePath = path.join(
    //     this.tsCompilerOptions.outDir as string,
    //     newFileName
    //   );

    //   this.tsDefinitionFilesObj[newFilePath] = text;

    //   originalWriteFileFn(
    //     newFilePath,
    //     text,
    //     writeOrderByteMark,
    //     onError,
    //     sourceFiles,
    //     data
    //   );
    // };

    // const program = ts.createProgram(
    //   normalizedFileNames,
    //   this.tsCompilerOptions,
    //   host
    // );

    // const emitResult = program.emit();

    // if (!emitResult.emitSkipped) {
    //   const files = Object.keys(this.tsDefinitionFilesObj).map((file) =>
    //     file.slice(`${this.distDir}/`.length)
    //   );

    //   console.log({
    //     path: '',
    //     files,
    //   });

    //   fs.writeFile(
    //     this.typesIndexJsonFilePath,
    //     JSON.stringify(files),
    //     (e) => {
    //       if (e) {
    //         console.log('Error saving the types index', e);
    //       }
    //     }
    //   );
    // }

    const program = new TypescriptCompiler(
      this.normalizeOptions.tsCompilerOptions,
      (filename) => `${exposeSrcToDestMap[filename]}.d.ts`
    );

    const filesMap = program.generateDeclarationFiles(normalizedFileNames);

    const statsJson = {
      publicPath: this.normalizeOptions.publicPath,
      files: generateTypesStats(filesMap, this.normalizeOptions),
    };

    return statsJson;
  }

  // private importRemoteTypes() {
  //   const remoteComponents = this.federationConfig.remotes;

  //   if (remoteComponents) {
  //     const remoteUrls = Object.entries(remoteComponents).map(
  //       ([remote, entry]) => {
  //         const remoteUrl = entry.substring(0, entry.lastIndexOf('/'));
  //         const [, url] = remoteUrl.split('@');

  //         return {
  //           origin: url ?? remoteUrl,
  //           remote,
  //         };
  //       }
  //     );

  //     remoteUrls.forEach(({ origin, remote }) => {
  //       axios
  //         .get<string[]>(
  //           `${origin}/${this.typescriptFolderName}/${this.typesIndexJsonFileName}`
  //         )
  //         .then((indexFileResp) => {
  //           // Download all the d.ts files mentioned in the index file
  //           indexFileResp.data?.forEach((file) =>
  //             download(
  //               `${origin}/${this.typescriptFolderName}/${file}`,
  //               `${this.typescriptFolderName}/${remote}`,
  //               {
  //                 filename: file,
  //               }
  //             )
  //           );
  //         })
  //         .catch((e) => console.log('ERROR fetching/writing types', e));
  //     });
  //   }
  // }

  private resolveFilenameWithExtension(rootDir: string, entry: string) {
    // Check path exists and it's a directory
    if (!fs.existsSync(rootDir) || !fs.lstatSync(rootDir).isDirectory()) {
      throw new Error('rootDir must be a directory');
    }

    let filename;

    try {
      // Try to resolve exposed component using index
      const files = this.getFiles(path.join(rootDir, entry));

      filename = files?.find((file) => file.split('.')[0] === 'index');

      if (!filename) {
        throw new Error(`filename ${filename} not found`);
      }

      return `${entry}/${filename}`;
    } catch (err) {
      const files = this.getFiles(rootDir);

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

  private getFiles(dir: string) {
    // Simple caching mechanism to improve performance reading the file system
    if (this.fsCache.has(dir)) {
      return this.fsCache.get(dir);
    }

    const files = fs.readdirSync(dir);
    this.fsCache.set(dir, files);

    return files;
  }
}
