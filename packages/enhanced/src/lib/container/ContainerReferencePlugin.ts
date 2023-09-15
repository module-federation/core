/**
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
 */

import ExternalsPlugin from "webpack/lib/ExternalsPlugin";
import RuntimeGlobals from "webpack/lib/RuntimeGlobals";
import createSchemaValidation from "webpack/lib/util/create-schema-validation";
import FallbackDependency from "./FallbackDependency";
import FallbackItemDependency from "./FallbackItemDependency";
import FallbackModuleFactory from "./FallbackModuleFactory";
import RemoteModule from "./RemoteModule";
import RemoteRuntimeModule from "./RemoteRuntimeModule";
import RemoteToExternalDependency from "./RemoteToExternalDependency";
import { parseOptions } from "./options";

import { ContainerReferencePluginOptions, RemotesConfig } from "webpack/declarations/plugins/container/ContainerReferencePlugin";
import { Compiler } from "webpack";

const validate = createSchemaValidation(
	require("webpack/schemas/plugins/container/ContainerReferencePlugin.check.js"),
	() =>
		require("webpack/schemas/plugins/container/ContainerReferencePlugin.json"),
	{
		name: "Container Reference Plugin",
		baseDataPath: "options"
	}
);

const slashCode = "/".charCodeAt(0);

class ContainerReferencePlugin {
	/**
	 * @param {ContainerReferencePluginOptions} options options
	 */
	private _remoteType: any;
	private _remotes: any;

	constructor(options: ContainerReferencePluginOptions) {
		validate(options);

		this._remoteType = options.remoteType;
		this._remotes = parseOptions(
			options.remotes,
			(item: any) => ({
				external: Array.isArray(item) ? item : [item],
				shareScope: options.shareScope || "default"
			}),
			(item: any) => ({
				external: Array.isArray(item.external)
					? item.external
					: [item.external],
				shareScope: item.shareScope || options.shareScope || "default"
			})
		);
	}

	/**
	 * Apply the plugin
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler: Compiler) {
		const { _remotes: remotes, _remoteType: remoteType } = this;

		/** @type {Record<string, string>} */
		const remoteExternals: Record<string, string> = {};
		for (const [key, config] of remotes) {
			let i = 0;
			for (const external of config.external) {
				if (external.startsWith("internal ")) continue;
				remoteExternals[
					`webpack/container/reference/${key}${i ? `/fallback-${i}` : ""}`
				] = external;
				i++;
			}
		}

		new ExternalsPlugin(remoteType, remoteExternals).apply(compiler);

		compiler.hooks.compilation.tap(
			"ContainerReferencePlugin",
			(compilation: any, { normalModuleFactory }: any) => {
				compilation.dependencyFactories.set(
					RemoteToExternalDependency,
					normalModuleFactory
				);

				compilation.dependencyFactories.set(
					FallbackItemDependency,
					normalModuleFactory
				);

				compilation.dependencyFactories.set(
					FallbackDependency,
					new FallbackModuleFactory()
				);

				normalModuleFactory.hooks.factorize.tap(
					"ContainerReferencePlugin",
					(data: any) => {
						if (!data.request.includes("!")) {
							for (const [key, config] of remotes) {
								if (
									data.request.startsWith(`${key}`) &&
									(data.request.length === key.length ||
										data.request.charCodeAt(key.length) === slashCode)
								) {
									return new RemoteModule(
										data.request,
										config.external.map((external: any, i: number) =>
											external.startsWith("internal ")
												? external.slice(9)
												: `webpack/container/reference/${key}${
														i ? `/fallback-${i}` : ""
												  }`
										),
										`.${data.request.slice(key.length)}`,
										config.shareScope
									);
								}
							}
						}
					}
				);

				compilation.hooks.runtimeRequirementInTree
					.for(RuntimeGlobals.ensureChunkHandlers)
					.tap("ContainerReferencePlugin", (chunk: any, set: any) => {
						set.add(RuntimeGlobals.module);
						set.add(RuntimeGlobals.moduleFactoriesAddOnly);
						set.add(RuntimeGlobals.hasOwnProperty);
						set.add(RuntimeGlobals.initializeSharing);
						set.add(RuntimeGlobals.shareScopeMap);
						compilation.addRuntimeModule(chunk, new RemoteRuntimeModule());
					});
			}
		);
	}
}

export default ContainerReferencePlugin;
