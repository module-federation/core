import download from 'download';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Compiler } from 'webpack';

import { TypescriptCompiler } from '../lib/TypescriptCompiler';
import { normalizeOptions } from '../lib/normalizeOptions';
import { generateTypesStats } from '../lib/generateTypesStats';
import {
  CompilationParams,
  FederatedTypesPluginOptions,
  TypesStatsJson,
} from '../types';

import { FederatedTypesStatsPlugin } from './FederatedTypesStatsPlugin';
import { TypesCache } from '../lib/Caching';
import { Logger, LoggerInstance } from '@module-federation/utilities';

const PLUGIN_NAME = 'FederatedTypesPlugin';

export class FederatedTypesPlugin {
  private options: FederatedTypesPluginOptions;
  private normalizeOptions!: ReturnType<typeof normalizeOptions>;
  private webpackCompilerOptions!: Compiler['options'];
  private logger!: LoggerInstance;

  constructor(options: FederatedTypesPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    let recompileInterval: NodeJS.Timer;
    const { webpack } = compiler;

    this.logger = Logger.setLogger(
      compiler.getInfrastructureLogger(PLUGIN_NAME)
    );

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

    compiler.hooks.beforeRun.tap(PLUGIN_NAME, () => {
      // download remotes here
      // this.importRemoteTypes();
    });

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (_, params) => {
      const filesMap = this.compileTypes();

      const statsJson = {
        publicPath: this.normalizeOptions.publicPath,
        files: generateTypesStats(filesMap, this.normalizeOptions),
      };

      (params as CompilationParams).federated_types_stats = statsJson;
    });

    new FederatedTypesStatsPlugin({
      filename: this.normalizeOptions.typesStatsFileName,
    }).apply(compiler);

    new webpack.container.ModuleFederationPlugin(
      this.options.federationConfig
    ).apply(compiler);
  }

  private compileTypes() {
    const exposedComponents = this.options.federationConfig.exposes;

    if (!exposedComponents) {
      return {};
    }

    // './Component': 'path/to/component' -> ['./Component', 'path/to/component']
    const compiler = new TypescriptCompiler(this.normalizeOptions);

    try {
      const filesMap = compiler.generateDeclarationFiles(exposedComponents);
      return filesMap;
    } catch (error) {
      this.logger.error(error);
      throw new Error();
    }
  }

  private importRemoteTypes() {
    const remoteComponents = this.options.federationConfig.remotes;

    if (!remoteComponents) {
      return;
    }

    const remoteUrls = Object.entries(remoteComponents).map(
      ([remote, entry]) => {
        const remoteUrl = entry.substring(0, entry.lastIndexOf('/'));
        const [, url] = remoteUrl.split('@');

        return {
          origin: url ?? remoteUrl,
          remote,
        };
      }
    );

    remoteUrls.forEach(({ origin, remote }) => {
      const { typescriptFolderName } = this.normalizeOptions;

      axios
        .get<TypesStatsJson>(
          `${origin}/${this.normalizeOptions.typesStatsFileName}`
        )
        .then((resp) => {
          const statsJson = resp.data;

          const { filesToCacheBust, filesToDelete } =
            TypesCache.getCacheBustedFiles(remote, statsJson);

          filesToCacheBust.forEach((file) =>
            download(
              `${origin}/${typescriptFolderName}/${file}`,
              `${typescriptFolderName}/${remote}`,
              {
                filename: file,
              }
            )
          );

          if (filesToDelete.length > 0) {
            filesToDelete.forEach((file) => {
              fs.unlinkSync(path.resolve(typescriptFolderName, remote, file));
            });
          }
        })
        .catch((e) => console.log('ERROR fetching/writing types', e));
    });
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
