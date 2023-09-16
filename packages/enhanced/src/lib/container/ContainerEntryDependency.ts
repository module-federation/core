/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import { Dependency, ExposeOptions } from "webpack";
import { makeSerializable } from "webpack/lib/util";

/** @typedef {import("webpack/lib/container/ContainerEntryModule").ExposeOptions} ExposeOptions */

class ContainerEntryDependency extends Dependency {
	private name: string;
	private exposes: Array<[string, ExposeOptions]>;
	private shareScope: string;

	/**
	 * @param {string} name entry name
	 * @param {[string, ExposeOptions][]} exposes list of exposed modules
	 * @param {string} shareScope name of the share scope
	 */
	constructor(name: string, exposes: Array<[string, ExposeOptions]>, shareScope: string) {
		super();
		this.name = name;
		this.exposes = exposes;
		this.shareScope = shareScope;
	}

	/**
	 * @returns {string | null} an identifier to merge equal requests
	 */
	override getResourceIdentifier(): string | null {
		return `container-entry-${this.name}`;
	}

	override get type(): string {
		return "container entry";
	}

	override get category(): string {
		return "esm";
	}
}

makeSerializable(
	ContainerEntryDependency,
	"webpack/lib/container/ContainerEntryDependency"
);

export = ContainerEntryDependency;


