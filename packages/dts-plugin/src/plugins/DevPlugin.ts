import fs from 'fs-extra';
import chalk from 'chalk';
import { type DevWorker, createDevWorker } from '../dev-worker';
import {
  moduleFederationPlugin,
  normalizeOptions,
} from '@module-federation/sdk';
import {
  WEB_CLIENT_OPTIONS_IDENTIFIER,
  WebClientOptions,
  getIPV4,
} from '../server';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import path from 'path';
import { isDev } from './utils';
import { isTSProject } from '../core/lib/utils';

enum PROCESS_EXIT_CODE {
  SUCCESS = 0,
  FAILURE = 1,
}

function ensureTempDir(filePath: string): void {
  try {
    const dir = path.dirname(filePath);
    fs.ensureDirSync(dir);
  } catch (_err) {
    // noop
  }
}

export class DevPlugin implements WebpackPluginInstance {
  readonly name = 'MFDevPlugin';
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
      .readFileSync(path.join(__dirname, './iife/launch-web-client.js'))
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
    this._devWorker?.exit();
    process.exit(exitCode);
  }

  private _afterEmit(): void {
    this._devWorker?.update();
  }

  apply(compiler: Compiler): void {
    const {
      _options: { name, dev, dts },
    } = this;
    new compiler.webpack.DefinePlugin({
      FEDERATION_IPV4: JSON.stringify(getIPV4()),
    }).apply(compiler);
    const normalizedDev =
      normalizeOptions<moduleFederationPlugin.PluginDevOptions>(
        true,
        {
          disableLiveReload: true,
          disableHotTypesReload: false,
        },
        'mfOptions.dev',
      )(dev);

    if (!isDev() || normalizedDev === false) {
      return;
    }

    if (
      normalizedDev.disableHotTypesReload &&
      normalizedDev.disableLiveReload
    ) {
      return;
    }
    if (!name) {
      throw new Error('name is required if you want to enable dev server!');
    }

    if (!normalizedDev.disableLiveReload) {
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

    const defaultGenerateTypes = { compileInChildProcess: true };
    const defaultConsumeTypes = { consumeAPITypes: true };
    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        isTSProject(dts, compiler.context),
        {
          //  remote types dist(.dev-server) not be used currently, so no need to set extractThirdParty etc
          generateTypes: defaultGenerateTypes,
          consumeTypes: defaultConsumeTypes,
          extraOptions: {},
        },
        'mfOptions.dts',
      )(dts);

    const normalizedGenerateTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        Boolean(normalizedDtsOptions),
        defaultGenerateTypes,
        'mfOptions.dts.generateTypes',
      )(
        normalizedDtsOptions === false
          ? undefined
          : normalizedDtsOptions.generateTypes,
      );

    const remote =
      normalizedGenerateTypes === false
        ? undefined
        : {
            implementation:
              normalizedDtsOptions === false
                ? undefined
                : normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: {
              ...this._options,
            },
            hostRemoteTypesFolder:
              normalizedGenerateTypes.typesFolder || '@mf-types',
            ...normalizedGenerateTypes,
            typesFolder: `.dev-server`,
          };

    const normalizedConsumeTypes =
      normalizeOptions<moduleFederationPlugin.DtsHostOptions>(
        Boolean(normalizedDtsOptions),
        defaultConsumeTypes,
        'mfOptions.dts.consumeTypes',
      )(
        normalizedDtsOptions === false
          ? undefined
          : normalizedDtsOptions.consumeTypes,
      );

    const host =
      normalizedConsumeTypes === false
        ? undefined
        : {
            implementation:
              normalizedDtsOptions === false
                ? undefined
                : normalizedDtsOptions.implementation,
            context: compiler.context,
            moduleFederationConfig: this._options,
            typesFolder: '@mf-types',
            abortOnError: false,
            ...normalizedConsumeTypes,
          };

    const extraOptions = normalizedDtsOptions
      ? normalizedDtsOptions.extraOptions || {}
      : {};

    if (!remote && !host && normalizedDev.disableLiveReload) {
      return;
    }

    if (
      remote &&
      !remote?.tsConfigPath &&
      typeof normalizedDtsOptions === 'object' &&
      normalizedDtsOptions.tsConfigPath
    ) {
      remote.tsConfigPath = normalizedDtsOptions.tsConfigPath;
    }

    this._devWorker = createDevWorker({
      name,
      remote: remote,
      host: host,
      extraOptions: extraOptions,
      disableLiveReload: normalizedDev.disableHotTypesReload,
      disableHotTypesReload: normalizedDev.disableHotTypesReload,
    });

    this._stopWhenSIGTERMOrSIGINT();
    this._handleUnexpectedExit();

    compiler.hooks.afterEmit.tap(this.name, this._afterEmit.bind(this));
  }
}
