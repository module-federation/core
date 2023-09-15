/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import ModuleFactory from "webpack/lib/ModuleFactory";
import ContainerEntryModule from "./ContainerEntryModule";
import type {ContainerEntryDependency} from './types'


/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("webpack/lib/ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */
/** @typedef {import("webpack/lib/container/ContainerEntryDependency")} ContainerEntryDependency */

export default class ContainerEntryModuleFactory extends ModuleFactory {
	/**
	 * @param {ModuleFactoryCreateData} data data object
	 * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
	 * @returns {void}
	 */
	create({ dependencies: [dependency] }: { dependencies: ContainerEntryDependency[] }, callback: (error: Error | null, result?: ModuleFactoryResult) => void): void {
		const dep = /** @type {ContainerEntryDependency} */ (dependency);
		callback(null, {
			module: new ContainerEntryModule(dep.name, dep.exposes, dep.shareScope)
		});
	}
};

