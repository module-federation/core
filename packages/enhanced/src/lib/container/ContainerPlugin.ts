/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import createSchemaValidation from "webpack/lib/util/create-schema-validation";
import ContainerEntryDependency from "./ContainerEntryDependency";
import ContainerEntryModuleFactory from "./ContainerEntryModuleFactory";
import ContainerExposedDependency from "./ContainerExposedDependency";
import { parseOptions } from "./options";
import ContainerPluginCheck from "webpack/schemas/plugins/container/ContainerPlugin.check.js";
import ContainerPluginJson from "webpack/schemas/plugins/container/ContainerPlugin.json";

/** @typedef {import("webpack/declarations/plugins/container/ContainerPlugin").ContainerPluginOptions} ContainerPluginOptions */
/** @typedef {import("webpack/lib/Compiler")} Compiler */

const validate = createSchemaValidation(
	ContainerPluginCheck,
	() => ContainerPluginJson,
	{
		name: "Container Plugin",
		baseDataPath: "options"
	}
);

const PLUGIN_NAME = "ContainerPlugin";

class ContainerPlugin {
	/**
	 * @param {ContainerPluginOptions} options options
	 */
	constructor(options: ContainerPluginOptions) {
		validate(options);

		this._options = {
			name: options.name,
			shareScope: options.shareScope || "default",
			library: options.library || {
				type: "var",
				name: options.name
			},
			runtime: options.runtime,
			filename: options.filename || undefined,
			exposes: parseOptions(
				options.exposes,
				item => ({
					import: Array.isArray(item) ? item : [item],
					name: undefined
				}),
				item => ({
					import: Array.isArray(item.import) ? item.import : [item.import],
					name: item.name || undefined
				})
			)
		};
	}

	/**
	 * Apply the plugin
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler: Compiler): void {
		const { name, exposes, shareScope, filename, library, runtime } =
			this._options;

		if (!compiler.options.output.enabledLibraryTypes.includes(library.type)) {
			compiler.options.output.enabledLibraryTypes.push(library.type);
		}

		compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
			const dep = new ContainerEntryDependency(name, exposes, shareScope);
			dep.loc = { name };
			compilation.addEntry(
				compilation.options.context,
				dep,
				{
					name,
					filename,
					runtime,
					library
				},
				error => {
					if (error) return callback(error);
					callback();
				}
			);
		});

		compiler.hooks.thisCompilation.tap(
			PLUGIN_NAME,
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					ContainerEntryDependency,
					new ContainerEntryModuleFactory()
				);

				compilation.dependencyFactories.set(
					ContainerExposedDependency,
					normalModuleFactory
				);
			}
		);
	}
}

export default ContainerPlugin;

