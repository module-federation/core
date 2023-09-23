/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

"use strict";

import ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");
import makeSerializable = require("webpack/lib/util/makeSerializable");

class ConsumeSharedFallbackDependency extends ModuleDependency {
	/**
	 * @param {string} request the request
	 */
	constructor(request: string) {
		super(request);
	}

  override get type(): string {
    return 'consume shared fallback';
  }

	override get category(): string {
		return "esm";
	}
}

makeSerializable(
	ConsumeSharedFallbackDependency,
	"enhanced/lib/sharing/ConsumeSharedFallbackDependency"
);

export default ConsumeSharedFallbackDependency;
