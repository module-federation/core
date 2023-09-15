/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import { Dependency } from "webpack";
import { makeSerializable } from "webpack/util";
import { ExposeOptions } from "./ContainerEntryModule";

/**
 * @class ContainerEntryDependency
 * @extends {Dependency}
 */
export default class ContainerEntryDependency extends Dependency {
	name: string;
	exposes: [string, ExposeOptions][];
	shareScope: string;

	/**
	 * @param name entry name
	 * @param exposes list of exposed modules
	 * @param shareScope name of the share scope
	 */
	constructor(name: string, exposes: [string, ExposeOptions][], shareScope: string) {
		super();
		this.name = name;
		this.exposes = exposes;
		this.shareScope = shareScope;
	}

	/**
	 * @returns an identifier to merge equal requests
	 */
	getResourceIdentifier(): string | null {
		return `container-entry-${this.name}`;
	}

	get type(): string {
		return "container entry";
	}

	get category(): string {
		return "esm";
	}
}

makeSerializable(
	ContainerEntryDependency,
	"webpack/lib/container/ContainerEntryDependency"
);


