/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import createSchemaValidation from 'webpack/lib/util/create-schema-validation';
import ContainerEntryDependency from './ContainerEntryDependency';
import ContainerEntryModuleFactory from './ContainerEntryModuleFactory';
import ContainerExposedDependency from './ContainerExposedDependency';
import { parseOptions } from './options';
import Compiler from 'webpack/lib/Compiler';
import type {ContainerPluginOptions} from '../../declarations/plugins/container/ContainerPlugin'
import { WebpackError } from 'webpack/lib/Module';

/** @typedef {import("./ContainerPluginTypes").ContainerPluginOptions} ContainerPluginOptions */
/** @typedef {import("webpack/lib/Compiler")} Compiler */

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('webpack/schemas/plugins/container/ContainerPlugin.check.js'),
  () => require('webpack/schemas/plugins/container/ContainerPlugin.json'),
  {
    name: 'Container Plugin',
    baseDataPath: 'options',
  },
);

const PLUGIN_NAME = 'ContainerPlugin';

class ContainerPlugin {
  _options: ContainerPluginOptions;
  /**
   * @param {ContainerPluginOptions} options options
   */
  constructor(options: ContainerPluginOptions) {
    validate(options);
    this._options = {
      name: options.name,
      shareScope: options.shareScope || 'default',
      library: options.library || {
        type: 'var',
        name: options.name,
      },
      runtime: options.runtime,
      filename: options.filename || undefined,
	//@ts-ignore
      exposes: parseOptions(
        options.exposes,
        (item) => ({
          import: Array.isArray(item) ? item : [item],
          name: undefined,
        }),
        (item) => ({
          import: Array.isArray(item.import) ? item.import : [item.import],
          name: item.name || undefined,
        }),
      ),
    };
  }

  apply(compiler: Compiler): void {
    const { name, exposes, shareScope, filename, library, runtime } =
      this._options;

    if (
      library &&
      compiler.options.output &&
      compiler.options.output.enabledLibraryTypes &&
      !compiler.options.output.enabledLibraryTypes.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes.push(library.type);
    }

    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      //@ts-ignore
      const dep = new ContainerEntryDependency(name, exposes, shareScope);
      dep.loc = { name };
      compilation.addEntry(
        compilation.options.context || '',
        dep,
        {
          name,
          filename,
          runtime,
          library,
        },
        (error: WebpackError | null | undefined) => {
          if (error) {
            return callback(error);
          }
          callback();
        },
      );
    });

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ContainerEntryDependency,
          new ContainerEntryModuleFactory(),
        );

        compilation.dependencyFactories.set(
          ContainerExposedDependency,
          normalModuleFactory,
        );
      },
    );
  }
}

export default ContainerPlugin;
