/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import ModuleFactory from "webpack/lib/ModuleFactory";
import FallbackModule from "./FallbackModule";
import FallbackDependency from "./FallbackDependency";

export default class FallbackModuleFactory extends ModuleFactory {
	/**
	 * @param {ModuleFactoryCreateData} data data object
	 * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
	 * @returns {void}
	 */
	create({ dependencies: [dependency] }: { dependencies: FallbackDependency[] }, callback: (error: Error | null, result?: ModuleFactoryResult) => void): void {
		const dep = /** @type {FallbackDependency} */ (dependency);
		callback(null, {
			module: new FallbackModule(dep.requests)
		});
	}
};
