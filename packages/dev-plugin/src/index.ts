import fs from 'fs';
// import os from 'os';
// import shorthash from 'shorthash';
import chalk from 'chalk';
import { ensureTempDir, isDev } from './utils';
import { type DevWorker, createDevWorker } from '@module-federation/dev-kit';
import {
  moduleFederationPlugin,
  normalizeOptions,
} from '@module-federation/sdk';
import {
  WEB_CLIENT_OPTIONS_IDENTIFIER,
  WebClientOptions,
} from '@module-federation/dev-server';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import path from 'path';

const MF_DEV_PLUGIN = 'MFDevPlugin';

enum PROCESS_EXIT_CODE {
  SUCCESS = 0,
  FAILURE = 1,
}

export class DevPlugin implements WebpackPluginInstance {
  readonly name = MF_DEV_PLUGIN;
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _devWorker?: DevWorker;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  static ensureLiveReloadEntry(
    options: WebClientOptions,
    filePath: string,
  ): void {
    ensureTempDir(filePath);
    const liveReloadEntry = fs
      .readFileSync(
        require.resolve('@module-federation/dev-server/launch-web-client'),
      )
      .toString('utf-8');
    const liveReloadEntryWithOptions = liveReloadEntry.replace(
      WEB_CLIENT_OPTIONS_IDENTIFIER,
      JSON.stringify(options),
    );
    fs.writeFileSync(filePath, liveReloadEntryWithOptions);
  }

  private _stopWhenSIGTERMOrSIGINT(): void {
    process.on('SIGTERM', () => {
      console.log(
        chalk`{cyan ${this._options.name} Process(${process.pid}) SIGTERM, mf server will exit...}`,
      );
      this._exit(PROCESS_EXIT_CODE.SUCCESS);
    });

    process.on('SIGINT', () => {
      console.log(
        chalk`{cyan ${this._options.name} Process(${process.pid}) SIGINT, mf server will exit...}`,
      );
      this._exit(PROCESS_EXIT_CODE.SUCCESS);
    });
  }

  private _handleUnexpectedExit(): void {
    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Rejection Error: ', error);
      console.log(
        chalk`{cyan ${this._options.name} Process(${process.pid}) unhandledRejection, mf server will exit...}`,
      );
      this._exit(PROCESS_EXIT_CODE.FAILURE);
    });
    process.on('uncaughtException', (error) => {
      console.error('Unhandled Rejection Error: ', error);
      console.log(
        chalk`{cyan ${this._options.name} Process(${process.pid}) uncaughtException, mf server will exit...}`,
      );
      this._exit(PROCESS_EXIT_CODE.FAILURE);
    });
  }

  private _exit(exitCode = 0): void {
    if (this._devWorker) {
      this._devWorker.exit();
      process.exit(exitCode);
    }
    process.exit(exitCode);
  }

  private _afterEmit(): void {
    if (this._devWorker) {
      this._devWorker.update();
    }
  }

  apply(compiler: Compiler): void {
    const {
      _options: { name, dev, dts },
    } = this;

    const normalizedDev =
      normalizeOptions<moduleFederationPlugin.PluginDevOptions>(
        true,
        {
          devServer: {
            disableLiveReload: true,
            disableHotTypesReload: false,
          },
        },
        'mfOptions.dev',
      )(dev);

    if (!isDev() || normalizedDev === false) {
      return;
    }

    const normalizedDevServer =
      normalizeOptions<moduleFederationPlugin.PluginDevServerOptions>(
        true,
        {
          disableLiveReload: true,
          disableHotTypesReload: false,
        },
        'mfOptions.dev.devServer',
      )(normalizedDev.devServer);

    if (
      !normalizedDevServer ||
      (normalizedDevServer.disableHotTypesReload &&
        normalizedDevServer.disableLiveReload)
    ) {
      return;
    }
    if (!name) {
      throw new Error('name is required if you want to enable dev server!');
    }

    if (!normalizedDevServer.disableLiveReload) {
      const TEMP_DIR = path.join(
        `${process.cwd()}/node_modules`,
        `.federation`,
      );
      const filepath = path.join(TEMP_DIR, `live-reload.js`);

      DevPlugin.ensureLiveReloadEntry({ name }, filepath);
      compiler.hooks.afterPlugins.tap('MFDevPlugin', () => {
        new compiler.webpack.EntryPlugin(compiler.context, filepath, {
          name,
        }).apply(compiler);
      });
    }
    const isTSProject = (tsConfigPath?: string, context = process.cwd()) => {
      try {
        let filepath = tsConfigPath
          ? tsConfigPath
          : path.resolve(context, './tsconfig.json');
        if (!path.isAbsolute(filepath)) {
          filepath = path.resolve(context, filepath);
        }
        return fs.existsSync(filepath);
      } catch (err) {
        return false;
      }
    };
    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        isTSProject(undefined, compiler.context),
        {
          disableGenerateTypes: false,
          remote: { compileInChildProcess: true },
          host: {},
          extraOptions: {},
        },
        'mfOptions.dts',
      )(dts);
    const remote =
      normalizedDtsOptions === false
        ? { moduleFederationConfig: this._options }
        : {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: {
              ...this._options,
            },
            hostRemoteTypesFolder:
              normalizedDtsOptions.remote.typesFolder || '@mf-types',
            ...normalizedDtsOptions.remote,
            typesFolder: `.dev-server`,
          };
    const host =
      normalizedDtsOptions === false
        ? { moduleFederationConfig: this._options }
        : {
            implementation: normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: this._options,
            typesFolder: '@mf-types',
            abortOnError: false,
            ...normalizedDtsOptions.host,
          };
    const extraOptions = normalizedDtsOptions
      ? normalizedDtsOptions.extraOptions || {}
      : {};
    this._devWorker = createDevWorker({
      name,
      remote: remote,
      host: host,
      extraOptions: extraOptions,
      disableLiveReload: normalizedDevServer.disableHotTypesReload,
      disableGenerateTypes: !normalizedDtsOptions,
    });

    this._stopWhenSIGTERMOrSIGINT();
    this._handleUnexpectedExit();

    compiler.hooks.afterEmit.tap(MF_DEV_PLUGIN, this._afterEmit.bind(this));
  }
}
