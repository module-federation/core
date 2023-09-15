/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import Dependency from "webpack/lib/Dependency";
import makeSerializable from "webpack/lib/util/makeSerializable";
import { ObjectDeserializerContext, ObjectSerializerContext } from "./types";

class FallbackDependency extends Dependency {
	/**
	 * @param {string[]} requests requests
	 */
	constructor(public requests: string[]) {
		super();
	}

	/**
	 * @returns {string | null} an identifier to merge equal requests
	 */
	getResourceIdentifier(): string | null {
		return `fallback ${this.requests.join(" ")}`;
	}

	get type(): string {
		return "fallback";
	}

	get category(): string {
		return "esm";
	}

	/**
	 * @param {ObjectSerializerContext} context context
	 */
	serialize(context: ObjectSerializerContext): void {
		const { write } = context;
		write(this.requests);
		super.serialize(context);
	}

	/**
	 * @param {ObjectDeserializerContext} context context
	 * @returns {FallbackDependency} deserialize fallback dependency
	 */
	static deserialize(context: ObjectDeserializerContext): FallbackDependency {
		const { read } = context;
		const obj = new FallbackDependency(read());
		obj['deserialize'](context);
		return obj;
	}
}

makeSerializable(
	FallbackDependency,
	"webpack/lib/container/FallbackDependency"
);

export default FallbackDependency;

